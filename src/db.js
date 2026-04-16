import Dexie from "dexie";
import dbFirestore from "./firebase";
import { collection, getDocs, setDoc, doc, onSnapshot } from "firebase/firestore";

// Verificar se Firebase está configurado
const isFirebaseConfigured = () => {
  return dbFirestore && typeof dbFirestore !== 'undefined';
};

export const db = new Dexie("ControleCustos");

db.version(1).stores({
  // 'id' = chave primária fornecida pelo app (Date.now())
  ingredientes: "id, nome, unidade",

  // '++id' = auto-incremento; ingredienteId e data são indexados para buscas
  compras: "++id, ingredienteId, data",

  // '++id' = auto-incremento
  receita: "++id, data",

  // '++id' = auto-incremento; data para filtro de período
  vendas: "++id, data",

  // chave = primary key (ex: "precoVenda", "precoBolo", "precoFatia", etc)
  config: "chave",
});

// Função para sincronizar dados do Firestore para IndexedDB
export const syncFromFirestore = async () => {
  if (!isFirebaseConfigured()) return;
  try {
    const collections = ['ingredientes', 'compras', 'receita', 'vendas', 'config'];
    for (const coll of collections) {
      const querySnapshot = await getDocs(collection(dbFirestore, coll));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
      if (data.length > 0) {
        await db[coll].bulkPut(data);
      }
    }
  } catch (error) {
    console.error("Erro ao sincronizar do Firestore:", error);
  }
};

// Função para migrar dados locais para Firestore na primeira vez
export const migrateToFirestore = async () => {
  if (!isFirebaseConfigured()) return;
  try {
    // Verifica se já há dados no Firestore
    const collections = ['ingredientes', 'compras', 'receita', 'vendas', 'config'];
    let hasDataInFirestore = false;
    for (const coll of collections) {
      const querySnapshot = await getDocs(collection(dbFirestore, coll));
      if (!querySnapshot.empty) {
        hasDataInFirestore = true;
        break;
      }
    }

    if (!hasDataInFirestore) {
      // Não há dados no Firestore, migra dos dados locais
      console.log("Migrando dados locais para Firestore...");
      await syncToFirestore();
      console.log("Migração concluída!");
    }
  } catch (error) {
    console.error("Erro na migração:", error);
  }
};

// Função para sincronizar dados do IndexedDB para Firestore
export const syncToFirestore = async () => {
  if (!isFirebaseConfigured()) return;
  try {
    const collections = ['ingredientes', 'compras', 'receita', 'vendas', 'config'];
    for (const coll of collections) {
      const data = await db[coll].toArray();
      for (const item of data) {
        const docRef = doc(dbFirestore, coll, item.id || item.chave);
        await setDoc(docRef, item);
      }
    }
  } catch (error) {
    console.error("Erro ao sincronizar para Firestore:", error);
  }
};

// Configurar listeners em tempo real para sincronização automática
export const setupRealtimeSync = () => {
  if (!isFirebaseConfigured()) return;
  const collections = ['ingredientes', 'compras', 'receita', 'vendas', 'config'];
  collections.forEach(coll => {
    onSnapshot(collection(dbFirestore, coll), (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
      db[coll].bulkPut(data);
    });
  });
};
