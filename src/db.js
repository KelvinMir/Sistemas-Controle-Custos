import dbFirestore, { authReady } from "./firebase";
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";

export const collections = ["ingredientes", "compras", "receita", "receitas", "vendas", "config"];

const isFirebaseConfigured = () => dbFirestore && typeof dbFirestore !== "undefined";

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

export const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  if (!(await ensureFirebaseReady())) return;

  const documentId = getFirestoreDocumentIdFromItemOrId(itemOrId);

  if (!documentId) {
    throw new Error(`Item sem id/chave não pode ser removido do Firestore em ${coll}.`);
  }

  await deleteDoc(doc(dbFirestore, coll, documentId));
};

export const getCollectionFromFirestore = async (coll) => {
  if (!(await ensureFirebaseReady())) return [];

  const querySnapshot = await getDocs(collection(dbFirestore, coll));
  return querySnapshot.docs.map((snapshotDoc) =>
    normalizeFirestoreDoc(coll, snapshotDoc)
  );
};

export const getAllFromFirestore = async () => {
  const entries = await Promise.all(
    collections.map(async (coll) => [coll, await getCollectionFromFirestore(coll)])
  );

  return Object.fromEntries(entries);
};

export const setupRealtimeSync = (onCollectionChange) => {
  if (!isFirebaseConfigured()) return () => {};

  let closed = false;
  const unsubscribes = [];

  authReady
    .then(() => {
      if (closed) return;

      collections.forEach((coll) => {
        const unsubscribe = onSnapshot(
          collection(dbFirestore, coll),
          (querySnapshot) => {
            const data = querySnapshot.docs.map((snapshotDoc) =>
              normalizeFirestoreDoc(coll, snapshotDoc)
            );
            onCollectionChange?.(coll, data);
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
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};
