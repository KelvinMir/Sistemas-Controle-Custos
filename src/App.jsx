import { useState, useEffect } from "react";
import React from "react";
import { db, syncFromFirestore, syncToFirestore, setupRealtimeSync, migrateToFirestore } from "./db";
import Modal from "./components/Modal";


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
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [usePrecoPorUnidade, setUsePrecoPorUnidade] = useState(false);

  // Modais e estados auxiliares
  const [compraModalOpen, setCompraModalOpen] = useState(false);
  const [compraModalIngrediente, setCompraModalIngrediente] = useState(null);
  const [compraModalPrecoUnit, setCompraModalPrecoUnit] = useState("");
  const [compraModalQtd, setCompraModalQtd] = useState("");
  const [compraModalPrecoTotal, setCompraModalPrecoTotal] = useState("");

  const [usarModalOpen, setUsarModalOpen] = useState(false);
  const [usarModalIngrediente, setUsarModalIngrediente] = useState(null);
  const [usarModalQtd, setUsarModalQtd] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // "delete-ingredient" ou "delete-sale"
  const [confirmData, setConfirmData] = useState(null); // dados para a ação (ex: { index } ou { vendaId })

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // VENDAS
  const [precoBolo, setPrecoBolo] = useState("");
  const [precoFatia, setPrecoFatia] = useState("");
  const [fatiasPerBolo, setFatiasPerBolo] = useState("");
  const [vendas, setVendas] = useState([]);
  const [showNovaVenda, setShowNovaVenda] = useState(false);
  const [tipoVenda, setTipoVenda] = useState("fatias"); // "fatias" ou "bolo"
  const [qtdVenda, setQtdVenda] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [anotacaoVenda, setAnotacaoVenda] = useState("");
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD



  useEffect(() => {
    const carregarDados = async () => {
      // Migrate and synchronize with Firebase if configured
      await migrateToFirestore();
      await syncFromFirestore();

      // Migra dados do localStorage para o IndexedDB na primeira vez
      const raw = localStorage.getItem("sistema_bolos");
      const jaTemDados = (await db.ingredientes.count()) > 0;

      if (raw && !jaTemDados) {
        const data = JSON.parse(raw);
        let ingredientesData = data.ingredientes || [];
        let comprasData = data.compras || [];

        // Converte unidade "g" para "kg" e ajusta quantidades
        comprasData = comprasData.map(c => {
          const ing = ingredientesData.find(i => i.id === c.ingredienteId);
          if (ing && ing.unidade === "g") return { ...c, quantidade: c.quantidade / 1000 };
          return c;
        });
        ingredientesData = ingredientesData.map(i =>
          i.unidade === "g" ? { ...i, unidade: "kg" } : i
        );

        if (ingredientesData.length) await db.ingredientes.bulkPut(ingredientesData);
        if (comprasData.length) await db.compras.bulkAdd(comprasData);
        if ((data.receita || []).length) await db.receita.bulkAdd(data.receita);
        if (data.precoVenda) await db.config.put({ chave: "precoVenda", valor: data.precoVenda });

        localStorage.removeItem("sistema_bolos");
      }

      const [ings, comps, rec, cfg, vends] = await Promise.all([
        db.ingredientes.toArray(),
        db.compras.toArray(),
        db.receita.toArray(),
        db.config.get("precoVenda"),
        db.vendas.toArray(),
      ]);

      setIngredientes(ings);
      setCompras(comps);
      setReceita(rec);
      setPrecoVenda(cfg?.valor || "");
      setVendas(vends);

      // Carrega configurações de vendas
      const [cfgBolo, cfgFatia, cfgFatias] = await Promise.all([
        db.config.get("precoBolo"),
        db.config.get("precoFatia"),
        db.config.get("fatiasPerBolo"),
      ]);
      setPrecoBolo(cfgBolo?.valor || "");
      setPrecoFatia(cfgFatia?.valor || "");
      setFatiasPerBolo(cfgFatias?.valor || "");

      // Configurar sincronização em tempo real
      setupRealtimeSync();
    };

    carregarDados();
  }, []);

  // 🔥 normaliza número (corrige vírgula brasileira)
  const parseNumero = (valor) => {
    if (!valor) return 0;
    return Number(String(valor).replace(",", "."));
  };

  const salvarIngrediente = async () => {
    if (!nome) return;

    const precoNum = parseNumero(precoCompra);
    const precoUnitNum = parseNumero(precoUnitario);
    const qtdNum = parseNumero(qtdCompra);

    if (editIndex !== null) {
      const ing = ingredientes[editIndex];
      await db.ingredientes.update(ing.id, { nome, unidade });
      setIngredientes(prev => prev.map((item, i) => i === editIndex ? { ...item, nome, unidade } : item));
      // Se usuário informou preço/quantidade no formulário ao editar, registra como nova compra
      const precoFinalEdit = usePrecoPorUnidade && precoUnitNum > 0 ? precoUnitNum * qtdNum : precoNum;
      if (precoFinalEdit > 0 && qtdNum > 0) {
        let quantidadeArmazenada = qtdNum;
        if (unidade === "g") quantidadeArmazenada = qtdNum / 1000;
        const novaCompra = {
          ingredienteId: ing.id,
          nome,
          preco: precoFinalEdit,
          quantidade: quantidadeArmazenada,
          data: new Date().toISOString()
        };
        const compraId = await db.compras.add(novaCompra);
        setCompras(prev => [...prev, { ...novaCompra, id: compraId }]);
      }
      setEditIndex(null);
    } else {
      // Novo ingrediente: valida se há preço/quantidade inicial
      const precoFinal = usePrecoPorUnidade && precoUnitNum > 0 ? precoUnitNum * qtdNum : precoNum;
      const temPreco = precoFinal > 0 && qtdNum > 0;
      
      if (!temPreco) {
        setAlertMessage("Para adicionar um novo ingrediente, informe o preço e quantidade iniciais.");
        setAlertOpen(true);
        return;
      }

      const id = Date.now();
      const novoIngrediente = { id, nome, unidade };
      await db.ingredientes.put(novoIngrediente);
      setIngredientes(prev => [...prev, novoIngrediente]);

      let quantidadeArmazenada = qtdNum;
      if (unidade === "g") quantidadeArmazenada = qtdNum / 1000;

      const novaCompra = {
        ingredienteId: id,
        nome,
        preco: precoFinal,
        quantidade: quantidadeArmazenada,
        data: new Date().toISOString()
      };
      const compraId = await db.compras.add(novaCompra);
      setCompras(prev => [...prev, { ...novaCompra, id: compraId }]);
    }

    // Sincronizar com Firestore após salvar
    await syncToFirestore();

    setNome("");
    setUnidade("kg");
    setPrecoCompra("");
    setPrecoUnitario("");
    setUsePrecoPorUnidade(false);
    setQtdCompra("");
  };

  const editarIngrediente = (index) => {
    setNome(ingredientes[index].nome);
    setUnidade(ingredientes[index].unidade);
    setEditIndex(index);
  };
  const removerIngrediente = (index) => {
    setConfirmMessage(`Tem certeza que deseja excluir o ingrediente "${ingredientes[index].nome}"?`);
    setConfirmAction("delete-ingredient");
    setConfirmData({ index });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const registrarCompra = (ingrediente) => {
    setCompraModalIngrediente(ingrediente);
    setCompraModalPrecoUnit("");
    setCompraModalQtd("");
    setCompraModalPrecoTotal("");
    setTimeout(() => setCompraModalOpen(true), 0);
  };

  const registrarCompraExec = async () => {
    const ingrediente = compraModalIngrediente;
    if (!ingrediente) return;
    const unidadeLabel = ingrediente.unidade === "g" ? "kg (ex: 0.5 = 500g)" : ingrediente.unidade;
    const precoUnit = parseNumero(compraModalPrecoUnit);
    const qtd = parseNumero(compraModalQtd);
    if (!qtd) return setAlertMessage("Informe a quantidade da compra."), setAlertOpen(true);

    let precoFinal = 0;
    if (precoUnit > 0) {
      precoFinal = precoUnit * qtd;
    } else {
      const precoTotal = parseNumero(compraModalPrecoTotal);
      if (!precoTotal) return setAlertMessage("Informe o valor total pago."), setAlertOpen(true);
      precoFinal = precoTotal;
    }

    let qtdArmazenada = qtd;
    if (ingrediente.unidade === "g") qtdArmazenada = qtd / 1000;

    const novaCompra = {
      ingredienteId: ingrediente.id,
      nome: ingrediente.nome,
      preco: precoFinal,
      quantidade: qtdArmazenada,
      data: new Date().toISOString()
    };
    const compraId = await db.compras.add(novaCompra);
    setCompras(prev => [...prev, { ...novaCompra, id: compraId }]);
    setCompraModalOpen(false);

    // Sincronizar com Firestore após salvar
    await syncToFirestore();
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
    setUsarModalIngrediente(ingrediente);
    setUsarModalQtd("");
    setTimeout(() => setUsarModalOpen(true), 0);
  };

  const adicionarNaReceitaExec = async () => {
    const ingrediente = usarModalIngrediente;
    if (!ingrediente) return;
    const qtd = parseNumero(usarModalQtd);
    if (!qtd) return setAlertMessage("Informe a quantidade usada."), setAlertOpen(true);

    const custoUnitario = custoMedio(ingrediente.id);
    let qtdNormalizada = qtd;
    if (ingrediente.unidade === "g") qtdNormalizada = qtd / 1000;

    const custo = qtdNormalizada * custoUnitario;

    const novoItem = {
      nome: ingrediente.nome,
      qtd: qtdNormalizada,
      unidade: ingrediente.unidade === "g" ? "kg" : ingrediente.unidade,
      custoUnitario,
      custo,
      data: new Date().toISOString()
    };
    const itemId = await db.receita.add(novoItem);
    setReceita(prev => [...prev, { ...novoItem, id: itemId }]);
    setUsarModalOpen(false);

    // Sincronizar com Firestore após salvar
    await syncToFirestore();
  };

  const removerDaReceita = async (itemId) => {
    await db.receita.delete(itemId);
    setReceita(prev => prev.filter(r => r.id !== itemId));

    // Sincronizar com Firestore após remover
    await syncToFirestore();
  };

  const salvarConfigsVendas = async () => {
    if (!precoBolo && !precoFatia) {
      setAlertMessage("Configure pelo menos o preço do bolo ou da fatia.");
      setAlertOpen(true);
      return;
    }
    await Promise.all([
      precoBolo && db.config.put({ chave: "precoBolo", valor: parseNumero(precoBolo) }),
      precoFatia && db.config.put({ chave: "precoFatia", valor: parseNumero(precoFatia) }),
      fatiasPerBolo && db.config.put({ chave: "fatiasPerBolo", valor: parseNumero(fatiasPerBolo) }),
    ]);
    alert("Configurações de vendas salvas!");
  };

  const registrarVenda = async () => {
    if (!qtdVenda) {
      setAlertMessage("Preencha a quantidade/valor da venda.");
      setAlertOpen(true);
      return;
    }

    let valorFinal = 0;
    let descricao = "";

    if (tipoVenda === "fatias") {
      const qtd = parseNumero(qtdVenda);
      const valor = parseNumero(valorVenda);

      if (valor > 0) {
        // Uso valor informado
        valorFinal = valor;
        descricao = `${qtd} fatia(s) - valor total R$ ${valor.toFixed(2)}`;
      } else if (precoFatia) {
        // Usa preço padrão da fatia
        valorFinal = qtd * parseNumero(precoFatia);
        descricao = `${qtd} fatia(s) R$ ${parseNumero(precoFatia).toFixed(2)}`;
      } else {
        setAlertMessage("Configure o preço padrão da fatia ou informe o valor total.");
        setAlertOpen(true);
        return;
      }
    } else {
      // Bolo inteiro — preço por kg
      const qtd = parseNumero(qtdVenda);
      if (precoBolo) {
        valorFinal = qtd * parseNumero(precoBolo);
        descricao = `${qtd} kg @ R$ ${parseNumero(precoBolo).toFixed(2)} / kg`;
      } else {
        setAlertMessage("Configure o preço por kg do bolo inteiro.");
        setAlertOpen(true);
        return;
      }
    }

    const novaVenda = {
      tipo: tipoVenda,
      quantidade: parseNumero(qtdVenda),
      valor: valorFinal,
      descricao,
      anotacao: anotacaoVenda || "",
      data: new Date(`${dataVenda}T00:00:00`).toISOString()
    };

    const vendaId = await db.vendas.add(novaVenda);
    setVendas(prev => [...prev, { ...novaVenda, id: vendaId }]);
    setQtdVenda("");
    setValorVenda("");
    setAnotacaoVenda("");
    setDataVenda(new Date().toISOString().split('T')[0]);
    setShowNovaVenda(false);

    // Sincronizar com Firestore após salvar
    await syncToFirestore();
  };

  const removerVenda = (vendaId) => {
    setConfirmMessage("Remover esta venda?");
    setConfirmAction("delete-sale");
    setConfirmData({ vendaId });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const handleConfirmYes = async () => {
    if (confirmAction === "delete-ingredient" && confirmData) {
      const { index } = confirmData;
      const id = ingredientes[index].id;
      await db.compras.where("ingredienteId").equals(id).delete();
      await db.ingredientes.delete(id);
      setIngredientes(prev => prev.filter((_, i) => i !== index));
      setCompras(prev => prev.filter(c => c.ingredienteId !== id));
      if (editIndex === index) {
        setNome("");
        setUnidade("kg");
        setPrecoCompra("");
        setPrecoUnitario("");
        setUsePrecoPorUnidade(false);
        setQtdCompra("");
        setEditIndex(null);
      }
    } else if (confirmAction === "delete-sale" && confirmData) {
      const { vendaId } = confirmData;
      await db.vendas.delete(vendaId);
      setVendas(prev => prev.filter(v => v.id !== vendaId));
    }
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmData(null);

    // Sincronizar com Firestore após alterações
    await syncToFirestore();
  };

  const custoTotal = receita.reduce((acc, r) => acc + r.custo, 0);
  const vendaTotal = vendas.reduce((acc, v) => acc + v.valor, 0);
  const lucro = vendaTotal - custoTotal;

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);

  const gastoSemana = compras
    .filter(c => new Date(c.data) >= inicioSemana)
    .reduce((acc, c) => acc + c.preco, 0);

  const ganhoSemana = vendas
    .filter(v => new Date(v.data) >= inicioSemana)
    .reduce((acc, v) => acc + v.valor, 0);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-600 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold m-0">🎂 Solary Cacau</h1>
            <p className="text-pink-100 text-sm m-0">Controle dos custos e receitas para suas encomendas</p>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-white rounded-2xl shadow-lg border-2 border-pink-100 hover:shadow-xl transition-shadow">
              <h2 className="font-bold text-xl mb-4 text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-purple-600">📦 Ingrediente</h2>
              <div className="grid grid-cols-5 gap-3">
                <input className="input border-2 border-pink-200 focus:border-pink-500 placeholder-gray-400" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />

                <select className="input border-2 border-pink-200 focus:border-pink-500 bg-white" value={unidade} onChange={e => setUnidade(e.target.value)}>
                  <option value="kg">Kg</option>
                  <option value="un">Unidade</option>
                  <option value="pacote">Pacote</option>
                  <option value="litro">Litro</option>
                </select>

                <div className="border-2 border-pink-200 p-3 rounded-lg bg-pink-50">
                  <div className="flex gap-2 items-center mb-2">
                    <input id="usePrecoPorUnidade" type="checkbox" checked={usePrecoPorUnidade} onChange={e => setUsePrecoPorUnidade(e.target.checked)} className="w-4 h-4 cursor-pointer accent-pink-500" />
                    <label htmlFor="usePrecoPorUnidade" className="text-xs font-semibold cursor-pointer flex-1 text-gray-700">Valor por unidade</label>
                  </div>
                  {usePrecoPorUnidade ? (
                    <input type="text" className="input border-2 border-pink-200 focus:border-pink-500 mt-1 text-sm" placeholder="Valor por unidade" value={precoUnitario} onChange={e => setPrecoUnitario(e.target.value)} />
                  ) : (
                    <input type="text" className="input border-2 border-pink-200 focus:border-pink-500 mt-1 text-sm" placeholder="Valor gasto" value={precoCompra} onChange={e => setPrecoCompra(e.target.value)} />
                  )}
                </div>

                <input type="text" className="input border-2 border-pink-200 focus:border-pink-500 placeholder-gray-400" placeholder="Qtd (ex: 0.5 = 500g)" value={qtdCompra} onChange={e => setQtdCompra(e.target.value)} />

                <button onClick={salvarIngrediente} className="btn btn-primary rounded-xl font-bold shadow-md hover:shadow-lg">
                  {editIndex !== null ? "✓ Atualizar" : "+ Adicionar"}
                </button>
              </div>
            </div>

            <div className="card bg-white rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
              <h2 className="font-bold text-xl mb-4 text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">🥄 Ingredientes</h2>
              {ingredientes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum ingrediente cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {ingredientes.map((i, idx) => {
                    const custo = custoMedio(i.id);
                    const isPeso = i.unidade === "kg" || i.unidade === "g";
                    const displayCusto = i.unidade === "g" ? custo * 1000 : custo;
                    const displayUnidade = isPeso ? "kg" : i.unidade;
                    const labelUnidade = isPeso ? "kg" : i.unidade;

                    return (
                      <div key={`ing-${i.id}`} className="flex justify-between border-b border-purple-100 py-4 last:border-b-0 items-start hover:bg-purple-50 px-3 rounded-lg transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800">{i.nome}</p>
                          <p className="text-xs text-gray-500 mt-1">📊 Custo: R$ <span className="font-semibold text-purple-600">{displayCusto.toFixed(2)}</span> / {displayUnidade}</p>
                        </div>
                        <div className="flex gap-2 items-center ml-4 shrink-0">
                          <button onClick={() => registrarCompra(i)} className="small-btn bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold text-xs rounded-md">💳</button>
                          <button onClick={() => adicionarNaReceita(i)} className="small-btn bg-green-100 text-green-700 hover:bg-green-200 font-semibold text-xs rounded-md">✅</button>
                          <button onClick={() => editarIngrediente(idx)} className="small-btn bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-semibold text-xs rounded-md">✏️</button>
                          <button onClick={() => removerIngrediente(idx)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold text-xs rounded-md">🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-linear-to-br from-pink-400 via-rose-400 to-orange-400 text-white rounded-2xl shadow-2xl p-6 border-2 border-rose-300">
              <h2 className="font-bold text-xl mb-4">💰 Resumo Financeiro</h2>
              <div className="space-y-3 text-sm font-semibold">
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-rose-100">Custo da receita</p>
                  <p className="text-2xl font-bold">R$ {custoTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-rose-100">Vendas realizadas</p>
                  <p className="text-2xl font-bold">R$ {vendaTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white/30 rounded-lg p-3 backdrop-blur border-2 border-white">
                  <p className="text-white text-xs">LUCRO TOTAL</p>
                  <p className="text-3xl font-bold">{lucro >= 0 ? '✅' : '❌'} R$ {Math.abs(lucro).toFixed(2)}</p>
                </div>
              </div>
              <hr className="my-4 border-white/40" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="text-rose-100">Gasto/Semana</p>
                  <p className="font-bold">R$ {gastoSemana.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="text-rose-100">Ganho/Semana</p>
                  <p className="font-bold">R$ {ganhoSemana.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card bg-white rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow">
              <h2 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-600">⚙️ Configurar Vendas</h2>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Preço por kg (bolo inteiro)</label>
                  <input type="text" className="input border-2 border-blue-200 focus:border-blue-500" placeholder="R$ ex: 45.00" value={precoBolo} onChange={e => setPrecoBolo(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Preço por fatia</label>
                  <input type="text" className="input border-2 border-blue-200 focus:border-blue-500" placeholder="R$ ex: 8.50" value={precoFatia} onChange={e => setPrecoFatia(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Fatias por bolo</label>
                  <input type="text" className="input border-2 border-blue-200 focus:border-blue-500" placeholder="ex: 12" value={fatiasPerBolo} onChange={e => setFatiasPerBolo(e.target.value)} />
                </div>
              </div>
              <button onClick={salvarConfigsVendas} className="btn btn-primary w-full rounded-xl font-bold shadow-md">💾 Salvar Configuração</button>
            </div>

            {showNovaVenda ? (
              <div className="card bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200">
                <h3 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-orange-600">🛍️ Registrar Venda</h3>
                <div className="flex gap-3 mb-4">
                  <label className="flex-1 flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 transition">
                    <input type="radio" value="fatias" checked={tipoVenda === "fatias"} onChange={e => setTipoVenda(e.target.value)} name="tipoVenda" className="accent-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">🍰 Fatias</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 transition">
                    <input type="radio" value="bolo" checked={tipoVenda === "bolo"} onChange={e => setTipoVenda(e.target.value)} name="tipoVenda" className="accent-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">🎂 Bolo Inteiro</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <input type="text" className="input border-2 border-amber-200 focus:border-amber-500" placeholder={tipoVenda === "bolo" ? "Quantidade (kg, ex: 2.5)" : "Quantidade (ex: 3)"} value={qtdVenda} onChange={e => setQtdVenda(e.target.value)} />
                  {tipoVenda === "fatias" && (
                    <input type="text" className="input border-2 border-amber-200 focus:border-amber-500" placeholder="Valor total (opcional - usa R$ por fatia se vazio)" value={valorVenda} onChange={e => setValorVenda(e.target.value)} />
                  )}
                  <input type="date" className="input border-2 border-amber-200 focus:border-amber-500" value={dataVenda} onChange={e => setDataVenda(e.target.value)} />
                  <textarea className="input border-2 border-amber-200 focus:border-amber-500 resize-none" placeholder="Anotação (ex: Cliente: Maria, Entrega 14h)" value={anotacaoVenda} onChange={e => setAnotacaoVenda(e.target.value)} rows="3" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={registrarVenda} className="btn btn-primary flex-1 rounded-xl font-bold">✅ Registrar</button>
                  <button onClick={() => { setShowNovaVenda(false); setAnotacaoVenda(""); setDataVenda(new Date().toISOString().split('T')[0]); }} className="btn flex-1 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300">❌ Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNovaVenda(true)} className="btn btn-primary w-full rounded-xl font-bold shadow-lg hover:shadow-xl">+ Nova Venda</button>
            )}

            <div className="card bg-white rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600">📋 Vendas Realizadas</h3>
              {vendas.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma venda registrada</p>
              ) : (
                <div className="space-y-3">
                  {vendas.map((v) => (
                    <div key={`vend-${v.id}`} className="border-b border-green-100 pb-4 last:border-b-0 hover:bg-green-50 p-3 rounded-lg transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 text-sm">
                          <p className="font-bold text-gray-800">{v.descricao}</p>
                          {v.anotacao && <p className="text-xs text-gray-600 mt-1 bg-blue-50 p-2 rounded border-l-2 border-blue-400">📝 {v.anotacao}</p>}
                          <p className="text-xs text-gray-500 mt-2">📅 {new Date(v.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <p className="font-bold text-lg text-green-600 min-w-max">R$ {v.valor.toFixed(2)}</p>
                          <button onClick={() => removerVenda(v.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-white rounded-2xl shadow-lg border-2 border-indigo-100 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">🧁 Ingredientes na Receita</h3>
              {receita.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sem itens na receita</p>
              ) : (
                <div className="space-y-2">
                  {receita.map((r) => (
                    <div key={`rec-${r.id}`} className="border-b border-indigo-100 pb-3 last:border-b-0 hover:bg-indigo-50 p-3 rounded-lg transition flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{r.nome}</p>
                        <p className="text-xs text-gray-500 mt-1">{r.qtd} {r.unidade || "un"} • Custo: <span className="font-semibold text-indigo-600">R$ {r.custo.toFixed(2)}</span></p>
                      </div>
                      <button onClick={() => removerDaReceita(r.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md ml-2">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Modal isOpen={compraModalOpen} onClose={() => setCompraModalOpen(false)} title={compraModalIngrediente ? `💳 Registrar compra — ${compraModalIngrediente.nome}` : 'Registrar compra'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Preço por unidade (opcional)</label>
            <input className="input border-2 border-blue-200 focus:border-blue-500" value={compraModalPrecoUnit} onChange={e => setCompraModalPrecoUnit(e.target.value)} placeholder={compraModalIngrediente?.unidade === 'g' ? 'R$ / kg (ex: 12.5)' : 'R$ / unidade'} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade ({compraModalIngrediente?.unidade || ''})</label>
            <input className="input border-2 border-blue-200 focus:border-blue-500" value={compraModalQtd} onChange={e => setCompraModalQtd(e.target.value)} placeholder={compraModalIngrediente?.unidade === 'g' ? 'ex: 0.5 = 500g' : ''} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Valor total (opcional)</label>
            <input className="input border-2 border-blue-200 focus:border-blue-500" value={compraModalPrecoTotal} onChange={e => setCompraModalPrecoTotal(e.target.value)} placeholder="Valor total pago" />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-bold" onClick={() => setCompraModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary rounded-lg font-bold shadow-lg" onClick={registrarCompraExec}>✅ Salvar compra</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={usarModalOpen} onClose={() => setUsarModalOpen(false)} title={usarModalIngrediente ? `✅ Usar — ${usarModalIngrediente.nome}` : 'Usar ingrediente'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade ({usarModalIngrediente?.unidade || ''})</label>
            <input className="input border-2 border-green-200 focus:border-green-500" value={usarModalQtd} onChange={e => setUsarModalQtd(e.target.value)} placeholder={usarModalIngrediente?.unidade === 'g' ? 'ex: 0.5 = 500g' : ''} />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-bold" onClick={() => setUsarModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary rounded-lg font-bold shadow-lg" onClick={adicionarNaReceitaExec}>✅ Adicionar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="⚠️ Confirmação">
        <div className="space-y-4">
          <p className="text-gray-700 font-medium text-lg">{confirmMessage}</p>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-bold" onClick={() => setConfirmOpen(false)}>Não</button>
            <button className="btn bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold shadow-lg" onClick={handleConfirmYes}>Sim, excluir</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title="ℹ️ Aviso">
        <div className="space-y-4">
          <p className="text-gray-700 font-medium text-lg bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">{alertMessage}</p>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button className="btn btn-primary rounded-lg font-bold shadow-lg" onClick={() => setAlertOpen(false)}>✅ OK</button>
          </div>
        </div>
      </Modal>

      <footer className="bg-linear-to-r from-pink-100 via-purple-100 to-blue-100 border-t-4 border-pink-400 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-purple-600 font-bold">🎂 Feito com ❤️ para minha confeiteira predileta!</p>
          <p className="text-xs text-gray-600 mt-1">Sistema de Controle de Custos • v1.0</p>
        </div>
      </footer>
    </div>
  );
}
