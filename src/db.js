import Dexie from "dexie";

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
