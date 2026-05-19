import { useMemo, useState } from "react";
import Modal from "./Modal";
import {
  filtrarPorPeriodo,
  formatarMoeda,
  periodoPorTipo,
  resumirCompras,
  resumirVendas,
  variacaoPercentual,
} from "../utils/analytics";
import { formatarDataBR } from "../utils/dates";

const formatarVariacao = (valor) =>
  valor === null ? "Sem anterior" : `${valor >= 0 ? "+" : ""}${valor.toFixed(1)}%`;

const classeVariacao = (valor, maiorMelhor = true) => {
  if (valor === null || valor === 0) return "";
  const positivo = maiorMelhor ? valor > 0 : valor < 0;
  return positivo ? "is-positive" : "is-negative";
};

export default function PeriodComparison({
  vendas,
  compras,
  isOpen,
  onClose,
}) {
  const [periodType, setPeriodType] = useState("week");
  const periodos = useMemo(() => periodoPorTipo(periodType), [periodType]);

  const vendasAtual = useMemo(
    () => filtrarPorPeriodo(vendas, periodos.atual),
    [vendas, periodos]
  );
  const vendasAnterior = useMemo(
    () => filtrarPorPeriodo(vendas, periodos.anterior),
    [vendas, periodos]
  );
  const comprasAtual = useMemo(
    () => filtrarPorPeriodo(compras, periodos.atual),
    [compras, periodos]
  );
  const comprasAnterior = useMemo(
    () => filtrarPorPeriodo(compras, periodos.anterior),
    [compras, periodos]
  );

  const resumoVendasAtual = resumirVendas(vendasAtual);
  const resumoVendasAnterior = resumirVendas(vendasAnterior);
  const resumoComprasAtual = resumirCompras(comprasAtual);
  const resumoComprasAnterior = resumirCompras(comprasAnterior);
  const lucroAtual = resumoVendasAtual.total - resumoComprasAtual.total;
  const lucroAnterior = resumoVendasAnterior.total - resumoComprasAnterior.total;
  const margemAtual = resumoVendasAtual.total > 0 ? (lucroAtual / resumoVendasAtual.total) * 100 : 0;
  const margemAnterior = resumoVendasAnterior.total > 0 ? (lucroAnterior / resumoVendasAnterior.total) * 100 : 0;

  const metricas = [
    {
      label: "Vendas",
      atual: resumoVendasAtual.total,
      anterior: resumoVendasAnterior.total,
      formato: formatarMoeda,
      maiorMelhor: true,
    },
    {
      label: "Compras",
      atual: resumoComprasAtual.total,
      anterior: resumoComprasAnterior.total,
      formato: formatarMoeda,
      maiorMelhor: false,
    },
    {
      label: "Lucro",
      atual: lucroAtual,
      anterior: lucroAnterior,
      formato: formatarMoeda,
      maiorMelhor: true,
    },
    {
      label: "Margem",
      atual: margemAtual,
      anterior: margemAnterior,
      formato: (valor) => `${valor.toFixed(1)}%`,
      maiorMelhor: true,
    },
    {
      label: "Ticket médio",
      atual: resumoVendasAtual.ticketMedio,
      anterior: resumoVendasAnterior.ticketMedio,
      formato: formatarMoeda,
      maiorMelhor: true,
    },
  ].map((metrica) => ({
    ...metrica,
    variacao: variacaoPercentual(metrica.atual, metrica.anterior),
  }));

  const vendasPorTipo = ["fatias", "bolo"].map((tipo) => {
    const atual = vendasAtual.filter((venda) => venda.tipo === tipo);
    const anterior = vendasAnterior.filter((venda) => venda.tipo === tipo);
    const resumoAtual = resumirVendas(atual);
    const resumoAnterior = resumirVendas(anterior);

    return {
      tipo,
      label: tipo === "bolo" ? "Bolo inteiro" : "Fatias",
      atual: resumoAtual,
      anterior: resumoAnterior,
      variacao: variacaoPercentual(resumoAtual.total, resumoAnterior.total),
    };
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📈 Comparar">
      <div className="analysis-modal">
        <div className="analysis-segmented" role="tablist" aria-label="Período de comparação">
          <button
            type="button"
            role="tab"
            aria-selected={periodType === "week"}
            onClick={() => setPeriodType("week")}
            className={periodType === "week" ? "is-active" : ""}
          >
            Semanal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={periodType === "month"}
            onClick={() => setPeriodType("month")}
            className={periodType === "month" ? "is-active" : ""}
          >
            Mensal
          </button>
        </div>

        <div className="comparison-periods">
          <div>
            <span>Período atual</span>
            <strong>{formatarDataBR(periodos.atual.inicio)} - {formatarDataBR(periodos.atual.fim)}</strong>
          </div>
          <div>
            <span>Período anterior</span>
            <strong>{formatarDataBR(periodos.anterior.inicio)} - {formatarDataBR(periodos.anterior.fim)}</strong>
          </div>
        </div>

        <div className="comparison-grid">
          {metricas.map((metrica) => (
            <div key={metrica.label} className="comparison-card">
              <span>{metrica.label}</span>
              <strong>{metrica.formato(metrica.atual)}</strong>
              <small className={classeVariacao(metrica.variacao, metrica.maiorMelhor)}>
                {formatarVariacao(metrica.variacao)}
              </small>
              <em>Anterior: {metrica.formato(metrica.anterior)}</em>
            </div>
          ))}
        </div>

        <div className="analysis-card">
          <div className="analysis-card__header">
            <h3>Vendas por tipo</h3>
            <span>{resumoVendasAtual.quantidade} venda{resumoVendasAtual.quantidade === 1 ? "" : "s"}</span>
          </div>

          <div className="analysis-list">
            {vendasPorTipo.map((item) => (
              <div key={item.tipo} className="analysis-row">
                <div>
                  <p>{item.label}</p>
                  <span>{item.atual.quantidade} atual • {item.anterior.quantidade} anterior</span>
                </div>
                <div className="analysis-row__metric">
                  <strong>{formatarMoeda(item.atual.total)}</strong>
                  <span className={classeVariacao(item.variacao)}>
                    {formatarVariacao(item.variacao)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
