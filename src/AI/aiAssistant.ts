import {
  calcularMargem,
  formatarMoeda,
  formatarPercentual,
} from './finance';
import { type DadosAnaliseFinanceira, type ProdutoFinanceiro, type ResultadoAssistenteIA } from './types';

interface PromptBundle {
  sugestaoPreco: string;
  relatorio: string;
}

interface RegistroIA {
  resultado?: unknown;
  sugestoes?: unknown;
  relatorio?: unknown;
  modelo?: unknown;
  avisos?: unknown;
}

const margemMinimaSaudavel = 35;
const margemOportunidade = 45;

export const gerarPromptSugestaoPreco = (dados: DadosAnaliseFinanceira) => {
  return `
Você é uma consultora financeira especializada em confeitarias artesanais.
Analise os produtos abaixo considerando custo total, margem atual e preço de venda.
Gere recomendações objetivas em português do Brasil com:
- preço sugerido;
- margem estimada;
- risco de subprecificação;
- oportunidade de aumento de lucro.

Dados em JSON:
${JSON.stringify(dados.produtos, null, 2)}
`.trim();
};

export const gerarPromptRelatorioInteligente = (dados: DadosAnaliseFinanceira) => {
  return `
Você é uma assistente de gestão financeira para uma confeitaria.
Crie um relatório em linguagem natural com:
- produto mais lucrativo;
- produto menos lucrativo;
- possíveis desperdícios;
- oportunidades de melhoria;
- recomendações de gestão.

Resumo financeiro em JSON:
${JSON.stringify(dados.resumo, null, 2)}

Produtos em JSON:
${JSON.stringify(dados.produtos, null, 2)}
`.trim();
};

export const analisarDadosComIA = async (dados: DadosAnaliseFinanceira): Promise<ResultadoAssistenteIA> => {
  if (dados.produtos.length === 0) {
    throw new Error('Cadastre pelo menos uma venda com preço de venda ou custo de produção antes da análise.');
  }

  const prompts = {
    sugestaoPreco: gerarPromptSugestaoPreco(dados),
    relatorio: gerarPromptRelatorioInteligente(dados),
  };

  const respostaIA = await chamarIAConfigurada(dados, prompts);

  if (respostaIA) {
    return respostaIA;
  }

  // Mantém a tela funcional sem expor segredos no frontend; em produção, prefira um endpoint backend.
  return gerarAnaliseDemonstrativa(dados);
};

const chamarIAConfigurada = async (
  dados: DadosAnaliseFinanceira,
  prompts: PromptBundle,
): Promise<ResultadoAssistenteIA | null> => {
  const endpoint = import.meta.env.VITE_AI_ASSISTANT_ENDPOINT as string | undefined;
  const provider = (import.meta.env.VITE_AI_PROVIDER as string | undefined)?.toLowerCase();

  if (endpoint) {
    return chamarEndpointSeguro(endpoint, dados, prompts, provider ?? 'backend');
  }

  if (provider === 'openai' && import.meta.env.VITE_OPENAI_API_KEY) {
    return chamarOpenAI(prompts);
  }

  if (provider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY) {
    return chamarGemini(prompts);
  }

  return null;
};

const chamarEndpointSeguro = async (
  endpoint: string,
  dados: DadosAnaliseFinanceira,
  prompts: PromptBundle,
  provider: string,
) => {
  const resposta = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, dados, prompts }),
  });

  if (!resposta.ok) {
    throw new Error('A integração de IA não respondeu corretamente.');
  }

  return normalizarRespostaIA(await resposta.json(), 'ia', provider);
};

const chamarOpenAI = async (prompts: PromptBundle) => {
  const modelo = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4.1-mini';
  const resposta = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelo,
      input: montarPromptRespostaJSON(prompts),
    }),
  });

  if (!resposta.ok) {
    throw new Error('Não foi possível concluir a análise com a OpenAI.');
  }

  const texto = extrairTextoOpenAI(await resposta.json());
  return normalizarRespostaIA(texto, 'ia', modelo);
};

const chamarGemini = async (prompts: PromptBundle) => {
  const modelo = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-1.5-flash';
  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: montarPromptRespostaJSON(prompts) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível concluir a análise com o Gemini.');
  }

  const corpo = await resposta.json();
  const texto = extrairTextoGemini(corpo);
  return normalizarRespostaIA(texto, 'ia', modelo);
};

const montarPromptRespostaJSON = (prompts: PromptBundle) => {
  return `
${prompts.sugestaoPreco}

${prompts.relatorio}

Responda somente em JSON válido com as chaves:
{
  "resultado": "resumo curto da análise",
  "sugestoes": ["lista de recomendações de preço e margem"],
  "relatorio": "relatório financeiro em linguagem natural",
  "avisos": ["alertas sobre dados incompletos, se houver"]
}
`.trim();
};

const normalizarRespostaIA = (
  entrada: unknown,
  origem: ResultadoAssistenteIA['origem'],
  modelo?: string,
): ResultadoAssistenteIA => {
  const registro = parsearRegistroIA(entrada);

  return {
    resultado: textoSeguro(registro.resultado, 'Análise concluída.'),
    sugestoes: listaTextoSeguro(registro.sugestoes),
    relatorio: textoSeguro(registro.relatorio, typeof entrada === 'string' ? entrada : 'Relatório gerado pela IA.'),
    origem,
    modelo: textoSeguro(registro.modelo, modelo),
    avisos: listaTextoSeguro(registro.avisos),
    geradoEm: new Date().toISOString(),
  };
};

const parsearRegistroIA = (entrada: unknown): RegistroIA => {
  if (typeof entrada === 'string') {
    const jsonExtraido = extrairJSON(entrada);
    return ehRegistro(jsonExtraido) ? jsonExtraido : { relatorio: entrada };
  }

  return ehRegistro(entrada) ? entrada : {};
};

const extrairJSON = (texto: string): unknown => {
  try {
    return JSON.parse(texto);
  } catch {
    const inicio = texto.indexOf('{');
    const fim = texto.lastIndexOf('}');

    if (inicio < 0 || fim <= inicio) return null;

    try {
      return JSON.parse(texto.slice(inicio, fim + 1));
    } catch {
      return null;
    }
  }
};

const ehRegistro = (valor: unknown): valor is RegistroIA => {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
};

const textoSeguro = (valor: unknown, fallback = '') => {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : fallback;
};

const listaTextoSeguro = (valor: unknown) => {
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const extrairTextoOpenAI = (corpo: unknown) => {
  if (!ehRegistro(corpo)) return '';

  const outputText = corpo.output_text;
  if (typeof outputText === 'string') return outputText;

  const output = corpo.output;
  if (!Array.isArray(output)) return '';

  return output
    .flatMap((item) => (ehRegistro(item) && Array.isArray(item.content) ? item.content : []))
    .map((content) => (ehRegistro(content) && typeof content.text === 'string' ? content.text : ''))
    .join('\n')
    .trim();
};

const extrairTextoGemini = (corpo: unknown) => {
  if (!ehRegistro(corpo) || !Array.isArray(corpo.candidates)) return '';

  return corpo.candidates
    .flatMap((candidate) => (ehRegistro(candidate) && ehRegistro(candidate.content) ? candidate.content.parts : []))
    .map((part) => (ehRegistro(part) && typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
};

const gerarAnaliseDemonstrativa = (dados: DadosAnaliseFinanceira): ResultadoAssistenteIA => {
  const produtosOrdenadosPorLucro = [...dados.produtos].sort((a, b) => b.lucroCalculado - a.lucroCalculado);
  const maisLucrativo = produtosOrdenadosPorLucro[0];
  const menosLucrativo = produtosOrdenadosPorLucro[produtosOrdenadosPorLucro.length - 1];
  const produtosComRisco = dados.produtos.filter((produto) => produto.custoProducao > 0 && produto.margemAtual < 25);
  const ingredientesFrequentes = listarIngredientesFrequentes(dados.produtos);

  return {
    resultado: `Analisei ${dados.resumo.quantidadeProdutos} produto(s), com receita de ${formatarMoeda(
      dados.resumo.receitaTotal,
    )} e margem média de ${formatarPercentual(dados.resumo.margemMedia)}.`,
    sugestoes: montarSugestoes(dados.produtos),
    relatorio: montarRelatorioDemonstrativo(
      maisLucrativo,
      menosLucrativo,
      produtosComRisco,
      ingredientesFrequentes,
      dados.resumo.produtosSemCusto,
    ),
    origem: 'demonstracao',
    modelo: 'analise-local',
    geradoEm: new Date().toISOString(),
    avisos:
      dados.resumo.produtosSemCusto.length > 0
        ? [`${dados.resumo.produtosSemCusto.length} produto(s) ainda não possuem custo de produção cadastrado.`]
        : [],
  };
};

const montarSugestoes = (produtos: ProdutoFinanceiro[]) => {
  return produtos.slice(0, 4).map((produto) => {
    if (produto.custoProducao <= 0) {
      return `${produto.produto}: cadastre o custo de produção para calcular margem real e preço sugerido.`;
    }

    const precoMinimo = produto.custoProducao / (1 - margemMinimaSaudavel / 100);
    const precoOportunidade = produto.custoProducao / (1 - margemOportunidade / 100);
    const lucroNoPrecoAtual = produto.precoVenda - produto.custoProducao;
    const margemNoPrecoMinimo = calcularMargem(precoMinimo, precoMinimo - produto.custoProducao);
    const risco = produto.margemAtual < 25 ? 'alto risco de subprecificação' : 'margem dentro de uma faixa administrável';

    return `${produto.produto}: preço atual ${formatarMoeda(produto.precoVenda)}, custo ${formatarMoeda(
      produto.custoProducao,
    )} e lucro unitário ${formatarMoeda(lucroNoPrecoAtual)}. Sugestão entre ${formatarMoeda(
      precoMinimo,
    )} e ${formatarMoeda(precoOportunidade)} para margem estimada a partir de ${formatarPercentual(
      margemNoPrecoMinimo,
    )}. Situação: ${risco}.`;
  });
};

const montarRelatorioDemonstrativo = (
  maisLucrativo: ProdutoFinanceiro,
  menosLucrativo: ProdutoFinanceiro,
  produtosComRisco: ProdutoFinanceiro[],
  ingredientesFrequentes: string[],
  produtosSemCusto: string[],
) => {
  const riscoTexto =
    produtosComRisco.length > 0
      ? `Há risco de subprecificação em ${produtosComRisco.map((produto) => produto.produto).join(', ')}.`
      : 'Não há produtos com margem crítica considerando os custos cadastrados.';

  const desperdicioTexto =
    ingredientesFrequentes.length > 0
      ? `Ingredientes recorrentes como ${ingredientesFrequentes.join(', ')} merecem controle de compra e estoque.`
      : 'Cadastre ingredientes por produto para identificar possíveis desperdícios e itens de maior impacto.';

  const custosPendentes =
    produtosSemCusto.length > 0
      ? ` Complete o custo de produção de ${produtosSemCusto.join(', ')} para evitar decisões com margem artificial.`
      : '';

  return `Os dados indicam que ${maisLucrativo.produto} é o produto mais lucrativo, com lucro calculado de ${formatarMoeda(
    maisLucrativo.lucroCalculado,
  )}. ${menosLucrativo.produto} apresenta o menor lucro calculado, com ${formatarMoeda(
    menosLucrativo.lucroCalculado,
  )}. ${riscoTexto} ${desperdicioTexto} Recomenda-se priorizar a divulgação dos produtos de maior lucro, revisar preços dos itens com baixa margem e negociar ingredientes mais frequentes com fornecedores.${custosPendentes}`;
};

const listarIngredientesFrequentes = (produtos: ProdutoFinanceiro[]) => {
  const contagem = new Map<string, number>();

  produtos.forEach((produto) => {
    produto.ingredientes.forEach((ingrediente) => {
      const chave = ingrediente.trim().toLowerCase();
      if (!chave) return;
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    });
  });

  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ingrediente]) => ingrediente);
};