export default function FinancialSummary({
  receitaSelecionada,
  custoTotal,
  vendaTotal,
  ticketMedio,
  margemLucro,
  lucro,
  resumoReceitas,
  custoCatalogoReceitas,
  receitaSelecionadaIdAtual,
  setReceitaSelecionadaId,
  gastoSemana,
  ganhoSemana,
  isBusy,
}) {
  return (
    <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 text-white rounded-lg shadow-md p-4 sm:p-5 border ">
      <h2 className="font-bold text-xl mb-4">💰 Resumo Financeiro</h2>
      <div className="space-y-3 text-sm font-semibold">
        <div className="bg-white/15 rounded-lg p-3 border border-white/10">
          <p className="text-rose-100">Custo da receita selecionada</p>
          <p className="text-xs text-white/75 mt-1 break-words">{receitaSelecionada?.nome || "Nenhuma receita"}</p>
          <p className="text-2xl font-bold break-words">R$ {custoTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white/15 rounded-lg p-3 border border-white/10">
          <p className="text-rose-100">Vendas realizadas</p>
          <p className="text-2xl font-bold break-words">R$ {vendaTotal.toFixed(2)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-lg p-2 border border-white/10 min-w-0">
            <p className="text-rose-100 text-xs">Ticket médio</p>
            <p className="font-bold break-words">R$ {ticketMedio.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 border border-white/10 min-w-0">
            <p className="text-rose-100 text-xs">Margem estimada</p>
            <p className="font-bold break-words">{margemLucro.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 border border-white/60">
          <p className="text-white text-xs">LUCRO TOTAL</p>
          <p className="text-2xl sm:text-3xl font-bold break-words">{lucro >= 0 ? '✅' : '❌'} R$ {Math.abs(lucro).toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/30">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="font-bold text-sm">Custos por receita</p>
          <p className="text-xs text-white/75">Catálogo: R$ {custoCatalogoReceitas.toFixed(2)}</p>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {resumoReceitas.map((r) => {
            const selecionada = String(r.id) === String(receitaSelecionadaIdAtual);

            return (
              <button
                key={`resumo-receita-${r.id}`}
                type="button"
                disabled={isBusy}
                onClick={() => setReceitaSelecionadaId(r.id)}
                className={`w-full text-left rounded-lg px-3 py-2 border transition ${selecionada ? "bg-white text-rose-950 border-white" : "bg-white/10 text-white border-white/10 hover:bg-white/20"}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-sm break-words">{r.nome}</span>
                  <span className="font-bold text-sm shrink-0">R$ {r.custo.toFixed(2)}</span>
                </span>
                <span className={selecionada ? "text-xs text-gray-500" : "text-xs text-white/70"}>
                  {r.totalItens} ingrediente(s)
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <hr className="my-4 border-white/40" />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/10 rounded-lg p-2 text-center min-w-0 border border-white/10">
          <p className="text-rose-100">Gasto/Semana</p>
          <p className="font-bold break-words">R$ {gastoSemana.toFixed(2)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2 text-center min-w-0 border border-white/10">
          <p className="text-rose-100">Ganho/Semana</p>
          <p className="font-bold break-words">R$ {ganhoSemana.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
