import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import PrettySelect from "./PrettySelect";
import { formatarDataBR } from "../utils/dates";
import {
  comprasDoIngrediente as obterComprasDoIngrediente,
  estatisticasCompras,
  formatarMoeda,
  formatarQuantidade,
  precoUnitarioCompra,
  unidadeParaCompra,
  variacaoPercentual,
} from "../utils/analytics";

const alertaPadrao = { ativo: false, limiteAumento: 10 };

export default function PriceHistory({
  ingredientes,
  compras,
  isOpen,
  onClose,
}) {
  const [selectedIngredienteId, setSelectedIngredienteId] = useState("");
  const [priceAlerts, setPriceAlerts] = useState({});

  useEffect(() => {
    if (!selectedIngredienteId && ingredientes[0]?.id) {
      setSelectedIngredienteId(ingredientes[0].id);
    }
  }, [ingredientes, selectedIngredienteId]);

  const selectedIngrediente = ingredientes.find(
    (ingrediente) => String(ingrediente.id) === String(selectedIngredienteId)
  ) || ingredientes[0] || null;
  const ingredienteIdAtual = selectedIngrediente?.id ?? "";
  const unidadeAtual = unidadeParaCompra(selectedIngrediente);
  const comprasSelected = useMemo(
    () => obterComprasDoIngrediente(compras, ingredienteIdAtual),
    [compras, ingredienteIdAtual]
  );
  const stats = estatisticasCompras(comprasSelected);
  const ultimasCompras = stats.comprasOrdenadas.slice(0, 8);
  const alertSettings = priceAlerts[ingredienteIdAtual] || alertaPadrao;

  const alerta = useMemo(() => {
    if (!alertSettings.ativo || stats.comprasOrdenadas.length < 2) return null;

    const precoAtual = precoUnitarioCompra(stats.comprasOrdenadas[0]);
    const precoAnterior = precoUnitarioCompra(stats.comprasOrdenadas[1]);
    const percentual = variacaoPercentual(precoAtual, precoAnterior);

    if (percentual !== null && percentual > alertSettings.limiteAumento) {
      return { percentual, precoAtual, precoAnterior };
    }

    return null;
  }, [alertSettings, stats.comprasOrdenadas]);

  const ingredienteOptions = ingredientes.map((ingrediente) => ({
    value: ingrediente.id,
    label: ingrediente.nome,
    description: unidadeParaCompra(ingrediente),
  }));

  const atualizarAlerta = (dados) => {
    setPriceAlerts((prev) => ({
      ...prev,
      [ingredienteIdAtual]: {
        ...alertaPadrao,
        ...prev[ingredienteIdAtual],
        ...dados,
      },
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Preços">
      <div className="analysis-modal">
        <div className="analysis-field">
          <span>Ingrediente</span>
          <PrettySelect
            value={ingredienteIdAtual}
            onChange={setSelectedIngredienteId}
            options={ingredienteOptions}
            placeholder="Selecione um ingrediente"
            emptyMessage="Cadastre ingredientes para ver preços"
            ariaLabel="Ingrediente do histórico de preços"
            disabled={ingredientes.length === 0}
            buttonClassName="border-2 border-rose-200 focus:border-rose-700"
          />
        </div>

        {selectedIngrediente ? (
          <>
            <div className="price-alert-settings">
              <label className={`analysis-toggle ${alertSettings.ativo ? "is-active" : ""}`}>
                <input
                  type="checkbox"
                  checked={alertSettings.ativo}
                  onChange={(event) => atualizarAlerta({ ativo: event.target.checked })}
                />
                <span />
                <strong>Alerta de aumento</strong>
              </label>

              {alertSettings.ativo && (
                <label className="analysis-field is-inline">
                  <span>Limite</span>
                  <input
                    type="number"
                    value={alertSettings.limiteAumento}
                    onChange={(event) => atualizarAlerta({ limiteAumento: Number(event.target.value) || 0 })}
                    className="input"
                    min="0"
                    step="0.5"
                  />
                </label>
              )}
            </div>

            {alerta && (
              <div className="analysis-alert is-danger">
                <strong>Preço subiu {alerta.percentual.toFixed(1)}%</strong>
                <span>{formatarMoeda(alerta.precoAnterior)} para {formatarMoeda(alerta.precoAtual)} / {unidadeAtual}</span>
              </div>
            )}

            <div className="analysis-stat-grid">
              <div className="analysis-stat">
                <span>Preço médio</span>
                <strong>{formatarMoeda(stats.precoMedio)}</strong>
              </div>
              <div className="analysis-stat">
                <span>Último preço</span>
                <strong>{formatarMoeda(stats.ultimoPrecoUnitario)}</strong>
              </div>
              <div className="analysis-stat">
                <span>Menor preço</span>
                <strong>{formatarMoeda(stats.menorPrecoUnitario)}</strong>
              </div>
              <div className="analysis-stat">
                <span>Maior preço</span>
                <strong>{formatarMoeda(stats.maiorPrecoUnitario)}</strong>
              </div>
            </div>

            <div className="analysis-card">
              <div className="analysis-card__header">
                <h3>Compras recentes</h3>
                <span>{comprasSelected.length} registro{comprasSelected.length === 1 ? "" : "s"}</span>
              </div>

              {ultimasCompras.length === 0 ? (
                <p className="analysis-empty">Nenhuma compra registrada para este ingrediente.</p>
              ) : (
                <div className="analysis-list">
                  {ultimasCompras.map((compra, index) => {
                    const precoUnitario = precoUnitarioCompra(compra);
                    const compraAnterior = ultimasCompras[index + 1];
                    const variacao = compraAnterior
                      ? variacaoPercentual(precoUnitario, precoUnitarioCompra(compraAnterior))
                      : null;

                    return (
                      <div key={compra.id} className="analysis-row">
                        <div>
                          <p>{formatarDataBR(compra.data) || "Sem data"}</p>
                          <span>{formatarQuantidade(compra.quantidade)} {unidadeAtual}</span>
                        </div>
                        <div className="analysis-row__metric">
                          <strong>{formatarMoeda(precoUnitario)} / {unidadeAtual}</strong>
                          {variacao !== null && (
                            <span className={variacao >= 0 ? "is-negative" : "is-positive"}>
                              {variacao >= 0 ? "↑" : "↓"} {Math.abs(variacao).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="analysis-empty">Cadastre ingredientes para ver o histórico de preços.</p>
        )}
      </div>
    </Modal>
  );
}
