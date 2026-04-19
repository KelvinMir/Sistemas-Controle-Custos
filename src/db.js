import Dexie from "dexie";
import dbFirestore from "./firebase";
import { collection, deleteDoc, getDocs, setDoc, doc, onSnapshot } from "firebase/firestore";

const collections = ["ingredientes", "compras", "receita", "vendas", "config"];

const isFirebaseConfigured = () => {
  return dbFirestore && typeof dbFirestore !== 'undefined';
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

export const db = new Dexie("ControleCustos");

db.version(1).stores({
  ingredientes: "id, nome, unidade",
  compras: "++id, ingredienteId, data",
  receita: "++id, data",
  vendas: "++id, data",
  config: "chave",
});

export const syncFromFirestore = async () => {
  if (!isFirebaseConfigured()) return;
  try {
    for (const coll of collections) {
      const querySnapshot = await getDocs(collection(dbFirestore, coll));
      const data = querySnapshot.docs.map((snapshotDoc) =>
        normalizeFirestoreDoc(coll, snapshotDoc)
      );
      await replaceLocalCollection(coll, data);
    }
  } catch (error) {
    console.error("Erro ao sincronizar do Firestore:", error);
  }
};

export const migrateToFirestore = async () => {
  if (!isFirebaseConfigured()) return;
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
  if (!isFirebaseConfigured()) return;
  try {
    for (const coll of collections) {
      const data = await db[coll].toArray();
      const localDocumentIds = new Set();

      for (const item of data) {
        const documentId = getFirestoreDocumentId(item);

        if (!documentId) {
          console.warn(`Item sem id/chave ignorado na sincronização de ${coll}:`, item);
          continue;
        }

        localDocumentIds.add(documentId);
        const docRef = doc(dbFirestore, coll, documentId);
        await setDoc(docRef, item);
      }

      const querySnapshot = await getDocs(collection(dbFirestore, coll));
      for (const snapshotDoc of querySnapshot.docs) {
        if (!localDocumentIds.has(snapshotDoc.id)) {
          await deleteDoc(doc(dbFirestore, coll, snapshotDoc.id));
        }
      }
    }
  } catch (error) {
    console.error("Erro ao sincronizar para Firestore:", error);
  }
};

export const setupRealtimeSync = () => {
  if (!isFirebaseConfigured()) return;
  collections.forEach(coll => {
    onSnapshot(
      collection(dbFirestore, coll),
      async (querySnapshot) => {
        const data = querySnapshot.docs.map((snapshotDoc) =>
          normalizeFirestoreDoc(coll, snapshotDoc)
        );
        await replaceLocalCollection(coll, data);
      },
      (error) => {
        console.error(`Erro no listener do Firestore (${coll}):`, error);
      }
    );
  });
};
