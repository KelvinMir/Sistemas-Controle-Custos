import Dexie from "dexie";
import dbFirestore, { authReady } from "./firebase";
import { collection, deleteDoc, getDocs, setDoc, doc, onSnapshot } from "firebase/firestore";

const collections = ["ingredientes", "compras", "receita", "receitas", "vendas", "config"];

const isFirebaseConfigured = () => {
  return dbFirestore && typeof dbFirestore !== 'undefined';
};

const ensureFirebaseReady = async () => {
  if (!isFirebaseConfigured()) return false;
  await authReady;
  return true;
};

const normalizeId = (id) => {
  const numericId = Number(id);
  return Number.isSafeInteger(numericId) && String(numericId) === String(id)
    ? numericId
    : id;
};

const getFirestoreDocumentId = (item) => {
  const id = item.id ?? item.chave;
  return id === undefined || id === null ? null : String(id);
};

const getFirestoreDocumentIdFromItemOrId = (itemOrId) => {
  const documentId = typeof itemOrId === "object" && itemOrId !== null
    ? getFirestoreDocumentId(itemOrId)
    : itemOrId;

  if (documentId === undefined || documentId === null || documentId === "") {
    return null;
  }

  return String(documentId);
};

const getPendingDeleteKey = (coll, documentId) => `${coll}/${String(documentId)}`;

const getPendingDeleteIds = async (coll) => {
  const pendingDeletes = await db.syncDeletes
    .where("coll")
    .equals(coll)
    .toArray();

  return new Set(pendingDeletes.map((item) => String(item.documentId)));
};

const markPendingDelete = async (coll, documentId) => {
  await db.syncDeletes.put({
    id: getPendingDeleteKey(coll, documentId),
    coll,
    documentId: String(documentId),
    deletedAt: new Date().toISOString(),
  });
};

const clearPendingDelete = async (coll, documentId) => {
  await db.syncDeletes.delete(getPendingDeleteKey(coll, documentId));
};

const normalizeFirestoreDoc = (coll, snapshotDoc) => {
  const data = snapshotDoc.data();

  if (coll === "config") {
    return data.chave ? data : { ...data, chave: snapshotDoc.id };
  }

  return {
    ...data,
    id: data.id ?? normalizeId(snapshotDoc.id),
  };
};

const replaceLocalCollection = async (coll, data) => {
  await db[coll].clear();
  if (data.length > 0) {
    await db[coll].bulkPut(data);
  }
};

export const saveToFirestore = async (coll, item) => {
  if (!(await ensureFirebaseReady())) return;

  const documentId = getFirestoreDocumentId(item);

  if (!documentId) {
    throw new Error(`Item sem id/chave não pode ser salvo no Firestore em ${coll}.`);
  }

  await setDoc(doc(dbFirestore, coll, documentId), item, { merge: true });
};

export const deleteFromFirestore = async (coll, itemOrId) => {
  const documentId = getFirestoreDocumentIdFromItemOrId(itemOrId);

  if (!documentId) {
    throw new Error(`Item sem id/chave não pode ser removido do Firestore em ${coll}.`);
  }

  await markPendingDelete(coll, documentId);

  if (!(await ensureFirebaseReady())) return;

  await deleteDoc(doc(dbFirestore, coll, documentId));
  await clearPendingDelete(coll, documentId);
};

const syncCollectionToFirestore = async (coll) => {
  const pendingDeleteIds = await getPendingDeleteIds(coll);
  const data = await db[coll].toArray();
  const activeData = data.filter((item) => {
    const documentId = getFirestoreDocumentId(item);
    return documentId && !pendingDeleteIds.has(String(documentId));
  });

  await Promise.all(activeData.map((item) => saveToFirestore(coll, item)));
};

const applyRemoteCollection = async (coll, data) => {
  const pendingDeleteIds = await getPendingDeleteIds(coll);
  const remoteData = data.filter((item) => {
    const documentId = getFirestoreDocumentId(item);
    return documentId && !pendingDeleteIds.has(String(documentId));
  });
  const localData = await db[coll].toArray();
  const activeLocalCount = localData.filter((item) => {
    const documentId = getFirestoreDocumentId(item);
    return documentId && !pendingDeleteIds.has(String(documentId));
  }).length;

  if (remoteData.length === 0 && activeLocalCount > 0) {
    console.warn(
      `Firestore retornou ${coll} vazio, mas há ${activeLocalCount} registro(s) local(is). Mantendo dados locais.`
    );

    syncCollectionToFirestore(coll).catch((error) => {
      console.error(`Erro ao reenviar dados locais de ${coll} para o Firestore:`, error);
    });

    return;
  }

  await replaceLocalCollection(coll, remoteData);
};

export const db = new Dexie("ControleCustos");

db.version(1).stores({
  ingredientes: "id, nome, unidade",
  compras: "++id, ingredienteId, data",
  receita: "++id, data",
  vendas: "++id, data",
  config: "chave",
});

db.version(2).stores({
  ingredientes: "id, nome, unidade",
  compras: "++id, ingredienteId, data",
  receita: "++id, receitaId, data",
  receitas: "++id, nome, data",
  vendas: "++id, data",
  config: "chave",
}).upgrade(async (tx) => {
  const receitaTable = tx.table("receita");
  const receitasTable = tx.table("receitas");
  const itensReceita = await receitaTable.toArray();

  if (itensReceita.length === 0) return;

  const receitaPadrao = {
    nome: "Receita principal",
    data: new Date().toISOString(),
  };
  const receitaPadraoId = await receitasTable.add(receitaPadrao);

  await Promise.all(
    itensReceita
      .filter((item) => item.receitaId === undefined || item.receitaId === null)
      .map((item) => receitaTable.update(item.id, { receitaId: receitaPadraoId }))
  );
});

db.version(3).stores({
  ingredientes: "id, nome, unidade",
  compras: "++id, ingredienteId, data",
  receita: "++id, receitaId, data",
  receitas: "++id, nome, data",
  vendas: "++id, data",
  config: "chave",
  syncDeletes: "id, coll, documentId, deletedAt",
});

export const syncPendingDeletesToFirestore = async () => {
  const pendingDeletes = await db.syncDeletes.toArray();

  if (pendingDeletes.length === 0) return;
  if (!(await ensureFirebaseReady())) return;

  const results = await Promise.allSettled(
    pendingDeletes.map(async ({ id, coll, documentId }) => {
      await deleteDoc(doc(dbFirestore, coll, String(documentId)));
      await db.syncDeletes.delete(id);
    })
  );

  const failed = results.find((result) => result.status === "rejected");
  if (failed) {
    throw failed.reason;
  }
};

export const syncFromFirestore = async () => {
  if (!(await ensureFirebaseReady())) return;
  try {
    await syncPendingDeletesToFirestore();

    for (const coll of collections) {
      const querySnapshot = await getDocs(collection(dbFirestore, coll));
      const data = querySnapshot.docs.map((snapshotDoc) =>
        normalizeFirestoreDoc(coll, snapshotDoc)
      );
      await applyRemoteCollection(coll, data);
    }
  } catch (error) {
    console.error("Erro ao sincronizar do Firestore:", error);
  }
};

export const migrateToFirestore = async () => {
  if (!(await ensureFirebaseReady())) return;
  try {
    let hasDataInFirestore = false;
    for (const coll of collections) {
      const querySnapshot = await getDocs(collection(dbFirestore, coll));
      if (!querySnapshot.empty) {
        hasDataInFirestore = true;
        break;
      }
    }

    if (!hasDataInFirestore) {
      console.log("Migrando dados locais para Firestore...");
      await syncToFirestore();
      console.log("Migração concluída!");
    }
  } catch (error) {
    console.error("Erro na migração:", error);
  }
};

export const syncToFirestore = async () => {
  if (!(await ensureFirebaseReady())) return;
  try {
    await syncPendingDeletesToFirestore();
    await Promise.all(collections.map((coll) => syncCollectionToFirestore(coll)));
  } catch (error) {
    console.error("Erro ao sincronizar para Firestore:", error);
    throw error;
  }
};

export const setupRealtimeSync = () => {
  if (!isFirebaseConfigured()) return () => {};

  let closed = false;
  const unsubscribes = [];

  authReady
    .then(() => {
      if (closed) return;

      collections.forEach(coll => {
        const unsubscribe = onSnapshot(
          collection(dbFirestore, coll),
          async (querySnapshot) => {
            try {
              const data = querySnapshot.docs.map((snapshotDoc) =>
                normalizeFirestoreDoc(coll, snapshotDoc)
              );
              await applyRemoteCollection(coll, data);
            } catch (error) {
              console.error(`Erro ao aplicar dados em tempo real (${coll}):`, error);
            }
          },
          (error) => {
            console.error(`Erro no listener do Firestore (${coll}):`, error);
          }
        );

        unsubscribes.push(unsubscribe);
      });
    })
    .catch((error) => {
      console.error("Erro ao autenticar no Firebase:", error);
    });

  return () => {
    closed = true;
    unsubscribes.forEach(unsubscribe => unsubscribe());
  };
};
