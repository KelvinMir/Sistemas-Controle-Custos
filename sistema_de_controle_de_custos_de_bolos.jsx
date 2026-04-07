import { useState, useEffect } from "react";

export default function App() {
  const [ingredientes, setIngredientes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [receita, setReceita] = useState([]);

  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("kg");
  const [precoCompra, setPrecoCompra] = useState("");
  const [qtdCompra, setQtdCompra] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const [precoVenda, setPrecoVenda] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("sistema_bolos"));
    if (data) {
      setIngredientes(data.ingredientes || []);
      setCompras(data.compras || []);
      setReceita(data.receita || []);
      setPrecoVenda(data.precoVenda || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "sistema_bolos",
      JSON.stringify({ ingredientes, compras, receita, precoVenda })
    );
  }, [ingredientes, compras, receita, precoVenda]);

  // 🔥 normaliza número (corrige vírgula brasileira)
  const parseNumero = (valor) => {
    if (!valor) return 0;
    return Number(String(valor).replace(",", "."));
  };

  const salvarIngrediente = () => {
    if (!nome) return;

    const precoNum = parseNumero(precoCompra);
    const qtdNum = parseNumero(qtdCompra);

    const id = Date.now();

    if (editIndex !== null) {
      const novos = [...ingredientes];
      novos[editIndex] = { ...novos[editIndex], nome, unidade };
      setIngredientes(novos);
      setEditIndex(null);
    } else {
      const novoIngrediente = { id, nome, unidade };
      setIngredientes(prev => [...prev, novoIngrediente]);

      // 🔥 salva compra inicial corretamente
      if (precoNum > 0 && qtdNum > 0) {
        setCompras(prev => [
          ...prev,
          {
            ingredienteId: id,
            nome,
            preco: precoNum,
            quantidade: qtdNum,
            data: new Date().toISOString()
          }
        ]);
      }
    }

    setNome("");
    setUnidade("kg");
    setPrecoCompra("");
    setQtdCompra("");
  };

  const editarIngrediente = (index) => {
    setNome(ingredientes[index].nome);
    setUnidade(ingredientes[index].unidade);
    setEditIndex(index);
  };

  const removerIngrediente = (index) => {
    const id = ingredientes[index].id;
    setIngredientes(prev => prev.filter((_, i) => i !== index));
    setCompras(prev => prev.filter(c => c.ingredienteId !== id));
  };

  const registrarCompra = (ingrediente) => {
    const preco = parseNumero(prompt(`Preço pago por ${ingrediente.nome}:`));
    const qtd = parseNumero(prompt(`Quantidade comprada (${ingrediente.unidade}):`));

    if (!preco || !qtd) return;

    setCompras(prev => [
      ...prev,
      {
        ingredienteId: ingrediente.id,
        nome: ingrediente.nome,
        preco,
        quantidade: qtd,
        data: new Date().toISOString()
      }
    ]);
  };

  // 🔥 CORREÇÃO DEFINITIVA
  const custoMedio = (ingredienteId) => {
    const lista = compras.filter(c => c.ingredienteId === ingredienteId);

    const totalValor = lista.reduce((acc, c) => acc + c.preco, 0);
    const totalQtd = lista.reduce((acc, c) => acc + c.quantidade, 0);

    if (totalQtd <= 0) return 0;

    return totalValor / totalQtd;
  };

  const adicionarNaReceita = (ingrediente) => {
    const qtd = parseNumero(prompt(`Quantidade usada de ${ingrediente.nome} (${ingrediente.unidade}):`));

    if (!qtd) return;

    const custoUnitario = custoMedio(ingrediente.id);
    const custo = qtd * custoUnitario;

    setReceita(prev => [
      ...prev,
      {
        nome: ingrediente.nome,
        qtd,
        custoUnitario,
        custo,
        data: new Date().toISOString()
      }
    ]);
  };

  const custoTotal = receita.reduce((acc, r) => acc + r.custo, 0);
  const lucro = precoVenda ? precoVenda - custoTotal : 0;

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);

  const gastoSemana = compras
    .filter(c => new Date(c.data) >= inicioSemana)
    .reduce((acc, c) => acc + c.preco, 0);

  const ganhoSemana = receita
    .filter(r => new Date(r.data) >= inicioSemana)
    .reduce((acc) => acc + Number(precoVenda || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Controle Profissional de Custos</h1>

      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <h2 className="font-semibold mb-2">Ingrediente</h2>
        <div className="grid grid-cols-5 gap-2">
          <input className="border p-2" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />

          <select className="border p-2" value={unidade} onChange={e => setUnidade(e.target.value)}>
            <option value="kg">Kg</option>
            <option value="g">Gramas</option>
            <option value="un">Unidade</option>
            <option value="pacote">Pacote</option>
            <option value="litro">Litro</option>
          </select>

          <input type="text" className="border p-2" placeholder="Valor gasto" value={precoCompra} onChange={e => setPrecoCompra(e.target.value)} />

          <input type="text" className="border p-2" placeholder="Qtd comprada" value={qtdCompra} onChange={e => setQtdCompra(e.target.value)} />

          <button onClick={salvarIngrediente} className="bg-blue-500 text-white px-4 py-2 rounded">
            {editIndex !== null ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <h2 className="font-semibold mb-2">Ingredientes</h2>
        {ingredientes.map((i, idx) => (
          <div key={i.id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-medium">{i.nome} ({i.unidade})</p>
              <p className="text-sm text-gray-500">
                Custo médio: R$ {custoMedio(i.id).toFixed(2)} / {i.unidade}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => registrarCompra(i)} className="text-blue-500">Comprar</button>
              <button onClick={() => adicionarNaReceita(i)} className="text-green-600">Usar</button>
              <button onClick={() => editarIngrediente(idx)} className="text-yellow-600">Editar</button>
              <button onClick={() => removerIngrediente(idx)} className="text-red-600">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-100 p-4 rounded-2xl shadow">
        <h2 className="font-semibold mb-2">Financeiro</h2>

        <input type="number" placeholder="Preço de venda" className="border p-2 mb-2 w-full" value={precoVenda} onChange={e => setPrecoVenda(Number(e.target.value))} />

        <p><strong>Custo total:</strong> R$ {custoTotal.toFixed(2)}</p>
        <p><strong>Lucro:</strong> R$ {lucro.toFixed(2)}</p>

        <hr className="my-3" />

        <p>Gasto na semana: R$ {gastoSemana.toFixed(2)}</p>
        <p>Ganho estimado na semana: R$ {ganhoSemana.toFixed(2)}</p>
      </div>
    </div>
  );
}
