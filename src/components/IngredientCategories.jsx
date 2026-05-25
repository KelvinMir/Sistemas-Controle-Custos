import { useMemo, useState } from "react";
import Modal from "./Modal";
import PrettySelect from "./PrettySelect";

const CATEGORIAS_PREDEFINIDAS = [
  "Açúcares",
  "Chocolate",
  "Decorações",
  "Essências",
  "Especiarias",
  "Farinhas",
  "Frutas/Secas",
  "Gorduras",
  "Levedura",
  "Ovos/Laticínios",
  "Outros",
];

const FILTRO_SEM_CATEGORIA = "__sem_categoria__";

export default function IngredientCategories({
  ingredientes,
  onUpdateIngrediente,
  isOpen,
  onClose,
}) {
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [categoriaDraft, setCategoriaDraft] = useState("");

  const categoriasUsadas = useMemo(
    () => ingredientes.filter((ingrediente) => ingrediente.categoria).map((ingrediente) => ingrediente.categoria),
    [ingredientes]
  );

  const todasCategorias = useMemo(
    () => Array.from(new Set([...CATEGORIAS_PREDEFINIDAS, ...categoriasUsadas])).sort(),
    [categoriasUsadas]
  );

  const categoriaOptions = [
    { value: "", label: "Sem categoria", description: "Remove a categoria" },
    ...todasCategorias.map((categoria) => ({
      value: categoria,
      label: categoria,
      description: `${ingredientes.filter((ingrediente) => ingrediente.categoria === categoria).length} ${ingredientes.filter((ingrediente) => ingrediente.categoria === categoria).length === 1 ? "ingrediente" : "ingredientes"}`,
    })),
  ];

  const ingredientesSemCategoria = ingredientes.filter((ingrediente) => !ingrediente.categoria);
  const ingredientesComCategoria = ingredientes.length - ingredientesSemCategoria.length;
  const ingredientesFiltrados = filtroCategoria === FILTRO_SEM_CATEGORIA
    ? ingredientesSemCategoria
    : filtroCategoria
      ? ingredientes.filter((ingrediente) => ingrediente.categoria === filtroCategoria)
      : ingredientes;

  const iniciarEdicao = (ingrediente) => {
    setEditandoId(ingrediente.id);
    setCategoriaDraft(ingrediente.categoria || "");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setCategoriaDraft("");
  };

  const atualizarCategoria = (ingrediente, categoria) => {
    onUpdateIngrediente({
      ...ingrediente,
      categoria: categoria || "",
    });
    cancelarEdicao();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📂 Categorias">
      <div className="analysis-modal">
        <div className="analysis-stat-grid">
          <div className="analysis-stat">
            <span>Total</span>
            <strong>{ingredientes.length}</strong>
          </div>
          <div className="analysis-stat">
            <span>Com categoria</span>
            <strong>{ingredientesComCategoria}</strong>
          </div>
          <div className="analysis-stat">
            <span>Sem categoria</span>
            <strong>{ingredientesSemCategoria.length}</strong>
          </div>
        </div>

        <div className="analysis-filter-bar" aria-label="Filtrar por categoria">
          <button
            type="button"
            onClick={() => setFiltroCategoria("")}
            className={`analysis-chip ${filtroCategoria === "" ? "is-active" : ""}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFiltroCategoria(FILTRO_SEM_CATEGORIA)}
            className={`analysis-chip ${filtroCategoria === FILTRO_SEM_CATEGORIA ? "is-active" : ""}`}
          >
            Sem categoria
          </button>
          {todasCategorias.map((categoria) => (
            <button
              key={categoria}
              type="button"
              onClick={() => setFiltroCategoria(categoria)}
              className={`analysis-chip ${filtroCategoria === categoria ? "is-active" : ""}`}
            >
              {categoria}
            </button>
          ))}
        </div>

        <div className="category-list">
          {ingredientesFiltrados.length === 0 ? (
            <p className="analysis-empty">Nenhum ingrediente encontrado.</p>
          ) : (
            ingredientesFiltrados.map((ingrediente) => {
              const editando = editandoId === ingrediente.id;

              return (
                <div key={ingrediente.id} className="category-row">
                  <div className="category-row__main">
                    <p>{ingrediente.nome}</p>
                    <span>{ingrediente.unidade || "un"} {ingrediente.categoria ? `• ${ingrediente.categoria}` : "• Sem categoria"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => editando ? cancelarEdicao() : iniciarEdicao(ingrediente)}
                    className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold rounded-md"
                  >
                    {editando ? "Pronto" : "Editar"}
                  </button>

                  {editando && (
                    <div className="category-edit-panel">
                      <label className="analysis-field">
                        <span>Categoria</span>
                        <PrettySelect
                          value={categoriaDraft}
                          onChange={setCategoriaDraft}
                          options={categoriaOptions}
                          placeholder="Selecione"
                          ariaLabel={`Categoria de ${ingrediente.nome}`}
                          buttonClassName="border-2 border-rose-200 focus:border-rose-700"
                        />
                      </label>

                      <div className="analysis-filter-bar is-compact">
                        {todasCategorias.map((categoria) => (
                          <button
                            key={categoria}
                            type="button"
                            onClick={() => setCategoriaDraft(categoria)}
                            className={`analysis-chip ${categoriaDraft === categoria ? "is-active" : ""}`}
                          >
                            {categoria}
                          </button>
                        ))}
                      </div>

                      <div className="analysis-actions">
                        <button
                          type="button"
                          onClick={() => atualizarCategoria(ingrediente, categoriaDraft)}
                          className="btn btn-primary"
                        >
                          Salvar
                        </button>
                        {ingrediente.categoria && (
                          <button
                            type="button"
                            onClick={() => atualizarCategoria(ingrediente, "")}
                            className="btn bg-red-500 text-white hover:bg-red-600"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
