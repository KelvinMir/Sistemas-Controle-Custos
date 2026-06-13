export interface Venda {
  id?: string | number;
  produto?: string;
  descricaoPeca?: string;
  ingredientes?: string[];
  custoProducao?: number;
  precoVenda?: number;
  valor?: number;
  quantidadeVendida?: number;
  lucroCalculado?: number;
  dataRecebimento: Date | { toDate(): Date };
}

export interface ProdutoFinanceiro {
  id: string | number;
  produto: string;
  descricao?: string;
  ingredientes: string[];
  custoProducao: number;
  precoVenda: number;
  quantidadeVendida: number;
  receitaTotal: number;
  custoTotal: number;
  lucroCalculado: number;
  margemAtual: number;
}

export interface DadosAnaliseFinanceira {
  produtos: ProdutoFinanceiro[];
  resumo: {
    quantidadeProdutos: number;
    totalItensVendidos: number;
    receitaTotal: number;
    custoTotal: number;
    lucroTotal: number;
    margemMedia: number;
    produtosSemCusto: string[];
  };
}

export interface ResultadoAssistenteIA {
  resultado: string;
  sugestoes: string[];
  relatorio: string;
  origem: 'ia' | 'demonstracao';
  modelo?: string;
  avisos?: string[];
  geradoEm: string;
}
