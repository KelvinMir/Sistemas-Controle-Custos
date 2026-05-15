import { formatarDataBR } from "../utils/dates";
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

  return (
    <>
      <div className="card border border-rose-200/80 bg-white/95">
        <button
          type="button"
          onClick={() => setShowConfigVendas(prev => !prev)}
          className="w-full flex items-center justify-between gap-3 text-left"
          aria-expanded={showConfigVendas}
          disabled={isBusy}
        >
          <span>
            <span className="block font-bold text-lg text-rose-950">⚙️ Configurar Vendas</span>
            <span className="block text-xs text-gray-500 mt-1">Preços e fatias ficam guardados para os próximos registros.</span>
          </span>
          <span className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 shrink-0">
            {showConfigVendas ? "▲" : "▼"}
          </span>
        </button>

        {showConfigVendas && (
          <div className="pt-4 mt-4 border-t border-rose-100">
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Preço por kg (bolo inteiro)</label>
                <input disabled={isBusy} type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="R$ ex: 45.00" value={precoBolo} onChange={e => setPrecoBolo(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Preço por fatia</label>
                <input disabled={isBusy} type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="R$ ex: 8.50" value={precoFatia} onChange={e => setPrecoFatia(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Fatias por bolo</label>
                <input disabled={isBusy} type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="ex: 12" value={fatiasPerBolo} onChange={e => setFatiasPerBolo(e.target.value)} />
              </div>
            </div>
            <button disabled={isBusy} onClick={onSalvarConfigsVendas} className="btn btn-primary w-full">💾 Salvar Configuração</button>
          </div>
        )}
      </div>

      {showNovaVenda ? (
        <div className="card bg-rose-50/90 border border-rose-200/80">
          <h3 className="font-bold text-lg mb-4 text-rose-950">
            {isEditingVenda ? "✏️ Editar Venda" : "🛍️ Registrar Venda"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-rose-200 hover:border-rose-500 transition">
              <input disabled={isBusy} type="radio" value="fatias" checked={tipoVenda === "fatias"} onChange={e => { setTipoVenda(e.target.value); setValorVenda(""); }} name="tipoVenda" className="accent-rose-800" />
              <span className="text-sm font-semibold text-gray-700">🍰 Fatias</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-rose-200 hover:border-rose-500 transition">
              <input disabled={isBusy} type="radio" value="bolo" checked={tipoVenda === "bolo"} onChange={e => { setTipoVenda(e.target.value); setValorVenda(""); }} name="tipoVenda" className="accent-rose-800" />
              <span className="text-sm font-semibold text-gray-700">🎂 Bolo Inteiro</span>
            </label>
          </div>

          <div className="space-y-3">
            <input disabled={isBusy} type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder={tipoVenda === "bolo" ? "Quantidade (kg, ex: 2.5)" : "Quantidade (ex: 3)"} value={qtdVenda} onChange={e => setQtdVenda(e.target.value)} />
            <div>
              <label htmlFor="valorVendaManual" className="text-xs font-semibold text-gray-600 block mb-1">
                {tipoVenda === "bolo" ? "Valor por kg nesta venda" : "Valor por fatia nesta venda"}
              </label>
              <input
                id="valorVendaManual"
                disabled={isBusy}
                type="text"
                className="input border-2 border-rose-200 focus:border-rose-700"
                placeholder={tipoVenda === "bolo" ? `Opcional - padrão R$ ${parseNumero(precoBolo).toFixed(2)} / kg` : `Opcional - padrão R$ ${parseNumero(precoFatia).toFixed(2)} / fatia`}
                value={valorVenda}
                onChange={e => setValorVenda(e.target.value)}
              />
            </div>
            <input disabled={isBusy} type="date" className="input border-2 border-rose-200 focus:border-rose-700" value={dataVenda} onChange={e => setDataVenda(e.target.value)} />
            <textarea disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700 resize-none" placeholder="Anotação (ex: Cliente: Maria, Entrega 14h)" value={anotacaoVenda} onChange={e => setAnotacaoVenda(e.target.value)} rows="3" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button disabled={isBusy} onClick={onSubmitVenda} className="btn btn-primary flex-1">
              {isEditingVenda ? "✓ Atualizar" : "✅ Registrar"}
            </button>
            <button disabled={isBusy} onClick={onCancelVenda} className="btn flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">❌ Cancelar</button>
          </div>
        </div>
      ) : (
        <button disabled={isBusy} onClick={() => setShowNovaVenda(true)} className="btn btn-primary w-full shadow-md">+ Nova Venda</button>
      )}

      <div className="card border border-rose-200/80 bg-white/95">
        <h3 className="font-bold text-lg mb-4 text-rose-950">📋 Vendas Realizadas</h3>
        {vendas.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhuma venda registrada</p>
        ) : (
          <div className="space-y-3">
            {vendas.map((v) => (
              <div key={`vend-${v.id}`} className="border-b border-rose-100 pb-4 last:border-b-0 hover:bg-rose-50 p-3 rounded-lg transition">
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-3 items-stretch sm:items-start">
                  <div className="flex-1 text-sm min-w-0">
                    <p className="font-bold text-gray-800 break-words">{v.descricao}</p>
                    {v.anotacao && <p className="text-xs text-gray-600 mt-1 bg-rose-50 p-2 rounded border-l-2 border-rose-300 break-words">📝 {v.anotacao}</p>}
                    <p className="text-xs text-gray-500 mt-2">📅 {formatarDataBR(v.data)}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end lg:justify-between xl:justify-end gap-3 shrink-0">
                    <p className="font-bold text-lg text-emerald-700 break-words">R$ {Number(v.valor || 0).toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <button disabled={isBusy} onClick={() => onEditarVenda(v)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold rounded-md" aria-label="Editar venda">✏️</button>
                      <button disabled={isBusy} onClick={() => onRemoverVenda(v.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md" aria-label="Remover venda">🗑️</button>
                    </div>
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
