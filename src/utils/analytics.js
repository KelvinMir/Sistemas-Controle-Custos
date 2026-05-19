import { parseNumero } from "./numbers";

export const formatarMoeda = (valor) =>
  parseNumero(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatarQuantidade = (valor) =>
  parseNumero(valor).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });

export const dataItemTime = (item) => {
  const time = new Date(item?.data).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const unidadeParaCompra = (ingrediente) => {
  if (!ingrediente) return "un";
  if (ingrediente.unidade === "g") return "kg";
  return ingrediente.unidade || "un";
};

export const ordenarPorDataRecente = (items) =>
  [...items].sort((itemA, itemB) => dataItemTime(itemB) - dataItemTime(itemA));

export const comprasDoIngrediente = (compras, ingredienteId) =>
  ordenarPorDataRecente(
    compras.filter((compra) => String(compra.ingredienteId) === String(ingredienteId))
  );

export const precoUnitarioCompra = (compra) => {
  const quantidade = parseNumero(compra?.quantidade);
  if (quantidade <= 0) return 0;
  return parseNumero(compra?.preco) / quantidade;
};

export const estatisticasCompras = (compras) => {
  const comprasOrdenadas = ordenarPorDataRecente(compras);
  const totalGasto = comprasOrdenadas.reduce(
    (acc, compra) => acc + parseNumero(compra.preco),
    0
  );
  const quantidadeTotal = comprasOrdenadas.reduce(
    (acc, compra) => acc + parseNumero(compra.quantidade),
    0
  );
  const precosUnitarios = comprasOrdenadas
    .map(precoUnitarioCompra)
    .filter((precoUnitario) => precoUnitario > 0);
  const precoMedio = quantidadeTotal > 0 ? totalGasto / quantidadeTotal : 0;
  const ultimaCompra = comprasOrdenadas[0] || null;

  return {
    comprasOrdenadas,
    totalGasto,
    quantidadeTotal,
    precoMedio,
    ultimaCompra,
    ultimoPrecoUnitario: ultimaCompra ? precoUnitarioCompra(ultimaCompra) : 0,
    menorPrecoUnitario: precosUnitarios.length > 0 ? Math.min(...precosUnitarios) : 0,
    maiorPrecoUnitario: Math.max(...precosUnitarios, 0),
    precosUnitarios,
  };
};

export const periodoPorTipo = (tipo) => {
  const tamanhoPeriodo = tipo === "month" ? 30 : 7;
  const fimAtual = new Date();
  fimAtual.setHours(23, 59, 59, 999);

  const inicioAtual = new Date(fimAtual);
  inicioAtual.setDate(inicioAtual.getDate() - tamanhoPeriodo + 1);
  inicioAtual.setHours(0, 0, 0, 0);

  const fimAnterior = new Date(inicioAtual);
  fimAnterior.setMilliseconds(-1);

  const inicioAnterior = new Date(fimAnterior);
  inicioAnterior.setDate(inicioAnterior.getDate() - tamanhoPeriodo + 1);
  inicioAnterior.setHours(0, 0, 0, 0);

  return {
    tamanhoPeriodo,
    atual: { inicio: inicioAtual, fim: fimAtual },
    anterior: { inicio: inicioAnterior, fim: fimAnterior },
  };
};

export const filtrarPorPeriodo = (items, periodo, dataField = "data") =>
  items.filter((item) => {
    const data = new Date(item?.[dataField]);
    if (!Number.isFinite(data.getTime())) return false;
    return data >= periodo.inicio && data <= periodo.fim;
  });

export const variacaoPercentual = (atual, anterior) => {
  const anteriorNumero = parseNumero(anterior);
  if (anteriorNumero === 0) return null;
  return ((parseNumero(atual) - anteriorNumero) / anteriorNumero) * 100;
};

export const resumirVendas = (vendas) => {
  const total = vendas.reduce((acc, venda) => acc + parseNumero(venda.valor), 0);

  return {
    total,
    quantidade: vendas.length,
    ticketMedio: vendas.length > 0 ? total / vendas.length : 0,
  };
};

export const resumirCompras = (compras) => ({
  total: compras.reduce((acc, compra) => acc + parseNumero(compra.preco), 0),
  quantidade: compras.length,
});
