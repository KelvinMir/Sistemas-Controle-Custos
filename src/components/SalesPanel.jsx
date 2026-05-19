import { formatarDataBR } from "../utils/dates";
import { formatarMoeda } from "../utils/analytics";
import { parseNumero } from "../utils/numbers";

export default function SalesPanel({
  showConfigVendas,
  setShowConfigVendas,
  precoBolo,
  setPrecoBolo,
  precoFatia,
  setPrecoFatia,
  fatiasPerBolo,
  setFatiasPerBolo,
  onSalvarConfigsVendas,
  showNovaVenda,
  setShowNovaVenda,
  tipoVenda,
  setTipoVenda,
  qtdVenda,
  setQtdVenda,
  valorVenda,
  setValorVenda,
  anotacaoVenda,
  setAnotacaoVenda,
  dataVenda,
  setDataVenda,
  vendaEditandoId,
  onSubmitVenda,
  onCancelVenda,
  vendas,
  onEditarVenda,
  onRemoverVenda,
  isBusy,
}) {
  const isEditingVenda = vendaEditandoId !== null && vendaEditandoId !== undefined;
  const precoPadraoAtual = tipoVenda === "bolo" ? parseNumero(precoBolo) : parseNumero(precoFatia);
  const precoManual = parseNumero(valorVenda);
  const precoAplicado = precoManual > 0 ? precoManual : precoPadraoAtual;
  const quantidadeVenda = parseNumero(qtdVenda);
  const valorEstimado = quantidadeVenda > 0 && precoAplicado > 0
    ? quantidadeVenda * precoAplicado
    : 0;
  const unidadeQuantidadeVenda = tipoVenda === "bolo" ? "kg" : "fatia(s)";
  const unidadePrecoVenda = tipoVenda === "bolo" ? "kg" : "fatia";
  const origemPreco = precoManual > 0 ? "manual" : "padrão";

  const totalVendas = vendas.reduce((sum, v) => sum + parseNumero(v.valor), 0);

  return (
    <>
      {/* Configurar Vendas Card */}
      <div className="card sales-config-card">
        <button
          type="button"
          onClick={() => setShowConfigVendas(prev => !prev)}
          className="sales-disclosure"
          aria-expanded={showConfigVendas}
          disabled={isBusy}
        >
          <span className="sales-disclosure__copy">
            <span>⚙️ Configurar Vendas</span>
            <small>Preços e fatias ficam guardados para os próximos registros.</small>
          </span>
          <span className="sales-disclosure__icon" aria-hidden="true">
            {showConfigVendas ? "▲" : "▼"}
          </span>
        </button>

        {showConfigVendas && (
          <div className="sales-config-card__body">
            <div className="sales-config-form">
              <label className="sales-form__field">
                <span>Preço por kg</span>
                <input disabled={isBusy} type="text" className="input" placeholder="R$ 45,00" value={precoBolo} onChange={e => setPrecoBolo(e.target.value)} />
              </label>
              <label className="sales-form__field">
                <span>Preço por fatia</span>
                <input disabled={isBusy} type="text" className="input" placeholder="R$ 8,50" value={precoFatia} onChange={e => setPrecoFatia(e.target.value)} />
              </label>
              <label className="sales-form__field">
                <span>Fatias por bolo</span>
                <input disabled={isBusy} type="text" className="input" placeholder="12" value={fatiasPerBolo} onChange={e => setFatiasPerBolo(e.target.value)} />
              </label>
            </div>
            <button disabled={isBusy} onClick={onSalvarConfigsVendas} className="btn btn-primary w-full">💾 Salvar Configuração</button>
          </div>
        )}
      </div>

      {/* Nova Venda Card */}
      {showNovaVenda ? (
        <div className="card sales-entry-card">
          <div className="sales-entry-card__header">
            <div>
              <h3>{isEditingVenda ? "✏️ Editar Venda" : "🛍️ Registrar Venda"}</h3>
            </div>
            <span>{isEditingVenda ? "Editando" : "Novo registro"}</span>
          </div>

          <div className="sales-type-control" role="radiogroup" aria-label="Tipo de venda">
            <label className={`sales-type-option ${tipoVenda === "fatias" ? "is-active" : ""}`}>
              <input disabled={isBusy} type="radio" value="fatias" checked={tipoVenda === "fatias"} onChange={e => { setTipoVenda(e.target.value); setValorVenda(""); }} name="tipoVenda" />
              <span>🍰</span>
              <strong>Fatias</strong>
            </label>
            <label className={`sales-type-option ${tipoVenda === "bolo" ? "is-active" : ""}`}>
              <input disabled={isBusy} type="radio" value="bolo" checked={tipoVenda === "bolo"} onChange={e => { setTipoVenda(e.target.value); setValorVenda(""); }} name="tipoVenda" />
              <span>🎂</span>
              <strong>Bolo inteiro</strong>
            </label>
          </div>

          <div className="sales-form">
            <label className="sales-form__field">
              <span>Quantidade</span>
              <input disabled={isBusy} type="text" className="input" placeholder={tipoVenda === "bolo" ? "Ex: 2.5 kg" : "Ex: 3"} value={qtdVenda} onChange={e => setQtdVenda(e.target.value)} />
            </label>

            <label className="sales-form__field">
              <span>{tipoVenda === "bolo" ? "Valor por kg" : "Valor por fatia"}</span>
              <input
                id="valorVendaManual"
                disabled={isBusy}
                type="text"
                className="input"
                placeholder={`Padrão ${formatarMoeda(precoPadraoAtual)} / ${unidadePrecoVenda}`}
                value={valorVenda}
                onChange={e => setValorVenda(e.target.value)}
              />
            </label>

            <label className="sales-form__field">
              <span>Data</span>
              <input disabled={isBusy} type="date" className="input" value={dataVenda} onChange={e => setDataVenda(e.target.value)} />
            </label>

            <div className="sales-total-preview">
              <span>Total estimado</span>
              <strong>{formatarMoeda(valorEstimado)}</strong>
              <small>{quantidadeVenda > 0 ? `${quantidadeVenda} ${unidadeQuantidadeVenda} com preço ${origemPreco}` : "Informe a quantidade"}</small>
            </div>

            <label className="sales-form__field sales-form__field--note">
              <span>Anotação</span>
              <textarea disabled={isBusy} className="input resize-none" placeholder="Cliente, entrega, observações..." value={anotacaoVenda} onChange={e => setAnotacaoVenda(e.target.value)} rows="3" />
            </label>
          </div>

          <div className="sales-form__actions">
            <button disabled={isBusy} onClick={onSubmitVenda} className="btn btn-primary">
              {isEditingVenda ? "✓ Atualizar" : "✅ Registrar"}
            </button>
            <button disabled={isBusy} onClick={onCancelVenda} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      ) : (
        <button disabled={isBusy} onClick={() => setShowNovaVenda(true)} className="btn btn-primary sales-new-sale-button shadow-md">+ Nova Venda</button>
      )}

      {/* Vendas Realizadas Card */}
      <div className="card sales-list-card">
        {/* Header com resumo */}
        <div className="sales-list-header">
          <div className="sales-list-title-section">
            <h3>📋 Vendas Realizadas</h3>
            <span className="sales-list-count">{vendas.length} venda{vendas.length === 1 ? "" : "s"}</span>
          </div>
          {vendas.length > 0 && (
            <div className="sales-list-summary">
              <div className="sales-list-summary__item">
                <span>Total</span>
                <strong>{formatarMoeda(totalVendas)}</strong>
              </div>
            </div>
          )}
        </div>

        {vendas.length === 0 ? (
          <div className="sales-list-empty">
            <p className="text-sm text-gray-400">Nenhuma venda registrada</p>
            <small className="text-gray-300">Clique em "Nova Venda" para registrar sua primeira venda</small>
          </div>
        ) : (
          <div className="sales-list-container">
            {vendas.map((v) => (
              <div key={`vend-${v.id}`} className="sales-row">
                <div className="sales-row__main">
                  <p>{v.descricao}</p>
                  <span>📅 {formatarDataBR(v.data)}</span>
                  {v.anotacao && <small>📝 {v.anotacao}</small>}
                </div>
                <div className="sales-row__side">
                  <strong>{formatarMoeda(v.valor)}</strong>
                  <div className="sales-row__actions">
                    <button disabled={isBusy} onClick={() => onEditarVenda(v)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold rounded-md" aria-label="Editar venda">✏️</button>
                    <button disabled={isBusy} onClick={() => onRemoverVenda(v.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md" aria-label="Remover venda">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
