import { type DadosAnaliseFinanceira, type ProdutoFinanceiro, type Venda } from './types';

const moedaBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const percentualBR = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const numeroSeguro = (valor: unknown, fallback = 0) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
};

export const formatarMoeda = (valor: number) => moedaBRL.format(numeroSeguro(valor));

export const formatarPercentual = (valor: number) => `${percentualBR.format(numeroSeguro(valor))}%`;

export const calcularLucroVenda = (precoVenda: number, custoProducao: number, quantidadeVendida: number) => {
  return (precoVenda - custoProducao) * quantidadeVendida;
};

export const calcularMargem = (receitaTotal: number, lucroCalculado: number) => {
  if (receitaTotal <= 0) return 0;
  return (lucroCalculado / receitaTotal) * 100;
};

export const normalizarVendasParaAnalise = (vendas: Venda[]): DadosAnaliseFinanceira => {
  const produtos: ProdutoFinanceiro[] = vendas
    .map((venda, indice) => {
      // Registros antigos não possuem os campos financeiros novos, então usamos valores seguros.
      const quantidadeVendida = Math.max(1, numeroSeguro(venda.quantidadeVendida, 1));
      const precoVenda = numeroSeguro(venda.precoVenda ?? venda.valor);
      const custoProducao = Math.max(0, numeroSeguro(venda.custoProducao));
      const receitaTotal = precoVenda * quantidadeVendida;
      const custoTotal = custoProducao * quantidadeVendida;
      const lucroCalculado = Number.isFinite(venda.lucroCalculado)
        ? numeroSeguro(venda.lucroCalculado)
        : calcularLucroVenda(precoVenda, custoProducao, quantidadeVendida);

      return {
        id: venda.id ?? `venda-${indice}`,
        produto: venda.produto?.trim() || venda.descricaoPeca?.trim() || 'Produto sem nome',
        descricao: venda.descricaoPeca,
        ingredientes: venda.ingredientes ?? [],
        custoProducao,
        precoVenda,
        quantidadeVendida,
        receitaTotal,
        custoTotal,
        lucroCalculado,
        margemAtual: calcularMargem(receitaTotal, lucroCalculado),
      };
    })
    .filter((produto) => produto.precoVenda > 0 || produto.custoProducao > 0);

  const receitaTotal = produtos.reduce((total, produto) => total + produto.receitaTotal, 0);
  const custoTotal = produtos.reduce((total, produto) => total + produto.custoTotal, 0);
  const lucroTotal = produtos.reduce((total, produto) => total + produto.lucroCalculado, 0);
  const totalItensVendidos = produtos.reduce((total, produto) => total + produto.quantidadeVendida, 0);

  return {
    produtos,
    resumo: {
      quantidadeProdutos: produtos.length,
      totalItensVendidos,
      receitaTotal,
      custoTotal,
      lucroTotal,
      margemMedia: calcularMargem(receitaTotal, lucroTotal),
      produtosSemCusto: produtos
        .filter((produto) => produto.custoProducao === 0)
        .map((produto) => produto.produto),
    },
  };
};

export const formatarData = (data: Venda['dataRecebimento']) => {
  const dataConvertida = data instanceof Date ? data : data.toDate();
  return dataConvertida.toLocaleDateString('pt-BR');
};