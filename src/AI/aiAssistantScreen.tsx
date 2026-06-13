import { useMemo, useState } from "react";
import { analisarDadosComIA } from "./aiAssistant";
import { formatarMoeda, formatarPercentual, normalizarVendasParaAnalise } from "./finance";
import type { ResultadoAssistenteIA, Venda } from "./types";

interface VendaApp {
  id?: string | number;
  tipo?: string;
  quantidade?: number;
  valor?: number;
  precoUnitario?: number;
  descricao?: string;
  descricaoOutros?: string;
  data?: string;
}

interface AiAssistantScreenProps {
  vendas: VendaApp[];
  custoPorFatia: number;
  custoTotalReceita: number;
}

function nomeProduto(venda: VendaApp): string {
  if (venda.tipo === "bolo") return "Bolo inteiro";
  if (venda.tipo === "torta") return "Torta";
  if (venda.tipo === "outros") return venda.descricaoOutros || venda.descricao || "Outros";
  return "Fatias de bolo";
}

function mapearVenda(venda: VendaApp, custoPorFatia: number, custoTotalReceita: number): Venda {
  const qtd = Math.max(1, Number(venda.quantidade) || 1);
  const precoVenda = Number(venda.precoUnitario) || (Number(venda.valor) / qtd);

  let custoProducao = 0;
  if (venda.tipo === "fatias") custoProducao = custoPorFatia;
  else if (venda.tipo === "bolo" || venda.tipo === "torta") custoProducao = custoTotalReceita;

  return {
    id: venda.id,
    produto: nomeProduto(venda),
    descricaoPeca: venda.descricao,
    precoVenda,
    valor: Number(venda.valor),
    quantidadeVendida: qtd,
    custoProducao,
    ingredientes: [],
    dataRecebimento: new Date(venda.data || Date.now()),
  };
}

export default function AiAssistantScreen({ vendas, custoPorFatia, custoTotalReceita }: AiAssistantScreenProps) {
  const [resultado, setResultado] = useState<ResultadoAssistenteIA | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const dadosAnalise = useMemo(() => {
    const vendasMapeadas = vendas.map(v => mapearVenda(v, custoPorFatia, custoTotalReceita));
    return normalizarVendasParaAnalise(vendasMapeadas);
  }, [vendas, custoPorFatia, custoTotalReceita]);

  const handleAnalisar = async () => {
    setLoading(true);
    setErro("");
    try {
      const response = await analisarDadosComIA(dadosAnalise);
      setResultado(response);
    } catch (error) {
      console.error(error);
      setResultado(null);
      setErro(error instanceof Error ? error.message : "Não foi possível gerar a análise com IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="card bg-white/95 border border-rose-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-rose-700 m-0">Assistente IA</p>
            <h2 className="text-2xl font-bold text-rose-950 mt-1 mb-2">Análise financeira inteligente</h2>
            <p className="text-sm text-gray-600 m-0 max-w-3xl">
              Analisa vendas, custos de produção e margem de lucro para gerar recomendações de gestão personalizadas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAnalisar}
            disabled={loading}
            className="btn btn-primary lg:min-w-52"
          >
            {loading ? "Analisando..." : "✨ Analisar com IA"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ResumoCard titulo="Produtos" valor={String(dadosAnalise.resumo.quantidadeProdutos)} />
        <ResumoCard titulo="Receita analisada" valor={formatarMoeda(dadosAnalise.resumo.receitaTotal)} />
        <ResumoCard titulo="Lucro estimado" valor={formatarMoeda(dadosAnalise.resumo.lucroTotal)} />
        <ResumoCard titulo="Margem média" valor={formatarPercentual(dadosAnalise.resumo.margemMedia)} />
      </div>

      {erro && (
        <div className="card border border-red-200 bg-red-50">
          <p className="text-sm font-semibold text-red-700 m-0">{erro}</p>
        </div>
      )}

      {loading && (
        <div className="card bg-white/95 border border-rose-100">
          <p className="text-sm font-semibold text-gray-600 m-0">
            Gerando sugestões de preço e relatório financeiro...
          </p>
        </div>
      )}

      {resultado && (
        <div className="space-y-4">
          <article className="card bg-white/95 border border-rose-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="text-lg font-bold text-rose-950 m-0">Resultado</h3>
              <span className="inline-flex w-fit rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                {resultado.origem === "ia" ? resultado.modelo ?? "IA" : "Demonstração"}
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-700 m-0">{resultado.resultado}</p>
          </article>

          {resultado.sugestoes.length > 0 && (
            <article className="card bg-white/95 border border-rose-100">
              <h3 className="text-lg font-bold text-rose-950 m-0 mb-3">Sugestões</h3>
              <ul className="space-y-3 m-0 p-0 list-none">
                {resultado.sugestoes.map((sugestao) => (
                  <li
                    key={sugestao}
                    className="rounded-lg border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm leading-6 text-gray-700"
                  >
                    {sugestao}
                  </li>
                ))}
              </ul>
            </article>
          )}

          <article className="card bg-white/95 border border-rose-100">
            <h3 className="text-lg font-bold text-rose-950 m-0 mb-3">Relatório gerado</h3>
            <p className="whitespace-pre-line text-sm leading-6 text-gray-700 m-0">{resultado.relatorio}</p>
          </article>

          {resultado.avisos && resultado.avisos.length > 0 && (
            <article className="card border border-amber-100 bg-amber-50">
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800 m-0 mb-3">Avisos</h3>
              <ul className="space-y-2 m-0 pl-5 text-sm text-amber-800">
                {resultado.avisos.map((aviso) => (
                  <li key={aviso}>{aviso}</li>
                ))}
              </ul>
            </article>
          )}
        </div>
      )}
    </section>
  );
}

function ResumoCard({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="card bg-white/95 border border-rose-100">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{titulo}</span>
      <strong className="block mt-2 text-xl text-rose-950">{valor}</strong>
    </div>
  );
}
