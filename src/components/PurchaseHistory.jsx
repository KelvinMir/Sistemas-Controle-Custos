import PrettySelect from "./PrettySelect";
import { formatarDataBR } from "../utils/dates";
import {
  comprasDoIngrediente as obterComprasDoIngrediente,
  estatisticasCompras,
  formatarMoeda,
  formatarQuantidade,
  precoUnitarioCompra,
  unidadeParaCompra,
} from "../utils/analytics";

export default function PurchaseHistory({
  ingredientes,
  compras,
  ingredienteSelecionadoId,
  onSelectIngrediente,
  onEditarCompra,
  onDeletarCompra,
  dataInicio = "",
  dataFim = "",
  onDataInicioChange = () => {},
  onDataFimChange = () => {},
}) {
  const ingredienteSelecionado = ingredientes.find(
    (ingrediente) => String(ingrediente.id) === String(ingredienteSelecionadoId)
  ) || ingredientes[0] || null;

  const ingredienteIdAtual = ingredienteSelecionado?.id ?? "";
  const unidadeAtual = unidadeParaCompra(ingredienteSelecionado);
  let comprasDoIngrediente = obterComprasDoIngrediente(compras, ingredienteIdAtual);

  // Filtrar por data se fornecidas
  if (dataInicio || dataFim) {
    comprasDoIngrediente = comprasDoIngrediente.filter((compra) => {
      const dataCompra = compra.data ? new Date(compra.data).toISOString().split("T")[0] : null;
      if (!dataCompra) return true;
      
      if (dataInicio && dataCompra < dataInicio) return false;
      if (dataFim && dataCompra > dataFim) return false;
      return true;
    });
  }

  const opcoesIngredientes = ingredientes.map((ingrediente) => {
    const totalCompras = compras.filter(
      (compra) => String(compra.ingredienteId) === String(ingrediente.id)
    ).length;

    return {
      value: ingrediente.id,
      label: ingrediente.nome,
      description: `${totalCompras} compra${totalCompras === 1 ? "" : "s"} registrada${totalCompras === 1 ? "" : "s"}`,
    };
  });

  const {
    totalGasto,
    quantidadeTotal,
    precoMedio,
    ultimaCompra,
    ultimoPrecoUnitario,
    menorPrecoUnitario,
    maiorPrecoUnitario,
  } = estatisticasCompras(comprasDoIngrediente);

  return (
    <section className="space-y-5 lg:space-y-6">
      <div className="card border border-rose-100/80 bg-white/95">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)] gap-4 items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-rose-700">Compras por ingrediente</p>
            <h2 className="font-bold text-2xl text-rose-950 mt-1">Histórico de compras</h2>
            <p className="text-sm text-gray-500 mt-2">
              Veja quanto cada compra custou e acompanhe o preço por {unidadeAtual} do ingrediente selecionado.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Ingrediente</label>
            <PrettySelect
              value={ingredienteIdAtual}
              onChange={onSelectIngrediente}
              options={opcoesIngredientes}
              placeholder="Selecione um ingrediente"
              emptyMessage="Cadastre ingredientes para ver o histórico"
              ariaLabel="Ingrediente do histórico de compras"
              disabled={ingredientes.length === 0}
              buttonClassName="border-2 border-rose-200 focus:border-rose-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
              className="w-full px-3 py-2 border-2 border-rose-200 focus:border-rose-700 rounded-md text-sm focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
              className="w-full px-3 py-2 border-2 border-rose-200 focus:border-rose-700 rounded-md text-sm focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
          <div className="purchase-stat">
            <span>Total gasto</span>
            <strong>{formatarMoeda(totalGasto)}</strong>
          </div>
          <div className="purchase-stat">
            <span>Quantidade comprada</span>
            <strong>{formatarQuantidade(quantidadeTotal)} {unidadeAtual}</strong>
          </div>
          <div className="purchase-stat">
            <span>Preço médio</span>
            <strong>{formatarMoeda(precoMedio)} / {unidadeAtual}</strong>
          </div>
          <div className="purchase-stat">
            <span>Última compra</span>
            <strong>{ultimaCompra ? formatarMoeda(ultimoPrecoUnitario) : "R$ 0,00"} / {unidadeAtual}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] gap-5 lg:gap-6 items-start">
        <div className="card border border-rose-200/80 bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-lg text-rose-950">
                {ingredienteSelecionado ? `Compras de ${ingredienteSelecionado.nome}` : "Compras"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Cada registro mostra o valor pago e o preço por {unidadeAtual}.</p>
            </div>
            <span className="text-xs font-bold text-rose-900 bg-rose-50 border border-rose-100 rounded-md px-2 py-1 w-fit">
              {comprasDoIngrediente.length} registro{comprasDoIngrediente.length === 1 ? "" : "s"}
            </span>
          </div>

          {ingredientes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Nenhum ingrediente cadastrado ainda.</p>
          ) : comprasDoIngrediente.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Nenhuma compra registrada para este ingrediente.</p>
          ) : (
            <div className="space-y-3">
              {comprasDoIngrediente.map((compra) => {
                const quantidade = compra.quantidade;
                const precoTotal = compra.preco;
                const precoUnitario = precoUnitarioCompra(compra);

                return (
                  <div key={`hist-compra-${compra.id}`} className="purchase-row group">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 break-words">{formatarDataBR(compra.data) || "Sem data"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatarQuantidade(quantidade)} {unidadeAtual} comprados
                      </p>
                    </div>
                    <div className="purchase-row__values">
                      <div>
                        <span>Preço / {unidadeAtual}</span>
                        <strong>{formatarMoeda(precoUnitario)}</strong>
                      </div>
                      <div>
                        <span>Valor pago</span>
                        <strong>{formatarMoeda(precoTotal)}</strong>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {onEditarCompra && (
                        <button
                          onClick={() => onEditarCompra(compra)}
                          className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          title="Editar compra"
                        >
                          ✏️ Editar
                        </button>
                      )}
                      {onDeletarCompra && (
                        <button
                          onClick={() => onDeletarCompra(compra)}
                          className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          title="Deletar compra"
                        >
                          🗑️ Deletar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card border border-rose-200/80 bg-white/95">
          <h3 className="font-bold text-lg text-rose-950">Comparativo de preço</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Barras maiores indicam compras com maior preço por {unidadeAtual}.</p>

          {comprasDoIngrediente.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sem compras para comparar.</p>
          ) : (
            <>
              <div className="space-y-3">
                {comprasDoIngrediente.slice(0, 8).map((compra) => {
                  const precoUnitario = precoUnitarioCompra(compra);
                  const largura = maiorPrecoUnitario > 0
                    ? Math.max(10, (precoUnitario / maiorPrecoUnitario) * 100)
                    : 0;

                  return (
                    <div key={`barra-compra-${compra.id}`} className="purchase-price-bar">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-gray-600">{formatarDataBR(compra.data) || "Sem data"}</span>
                        <span className="font-bold text-rose-950">{formatarMoeda(precoUnitario)}</span>
                      </div>
                      <div className="purchase-price-bar__track" aria-hidden="true">
                        <span style={{ width: `${largura}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-rose-100">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <span className="text-xs font-semibold text-emerald-800">Menor preço</span>
                  <strong className="block text-sm text-emerald-900 mt-1">{formatarMoeda(menorPrecoUnitario)}</strong>
                </div>
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-3">
                  <span className="text-xs font-semibold text-rose-800">Maior preço</span>
                  <strong className="block text-sm text-rose-950 mt-1">{formatarMoeda(maiorPrecoUnitario)}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
