import { useState, useEffect } from "react";
import React from "react";
import { db, syncFromFirestore, syncToFirestore, setupRealtimeSync, migrateToFirestore } from "./db";
import Modal from "./components/Modal";
import sunflowerIcon from "./img/sunflower-svgrepo-com.svg";


export default function App() {
  const [ingredientes, setIngredientes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [receita, setReceita] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [receitaSelecionadaId, setReceitaSelecionadaId] = useState(null);
  const [nomeReceita, setNomeReceita] = useState("");

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
  const [showConfigVendas, setShowConfigVendas] = useState(false);
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

      let [ings, comps, rec, receitasData, cfg, vends] = await Promise.all([
        db.ingredientes.toArray(),
        db.compras.toArray(),
        db.receita.toArray(),
        db.receitas.toArray(),
        db.config.get("precoVenda"),
        db.vendas.toArray(),
      ]);

      let deveSincronizarReceitas = false;

      if (receitasData.length === 0) {
        const receitaPadrao = {
          nome: "Receita principal",
          data: new Date().toISOString(),
        };
        const receitaPadraoId = await db.receitas.add(receitaPadrao);
        receitasData = [{ ...receitaPadrao, id: receitaPadraoId }];
        deveSincronizarReceitas = true;
      }

      const receitaPadraoId = receitasData[0]?.id;
      const itensSemReceita = rec.filter(r => r.receitaId === undefined || r.receitaId === null);

      if (receitaPadraoId && itensSemReceita.length > 0) {
        await Promise.all(
          itensSemReceita.map(item =>
            db.receita.update(item.id, {
              receitaId: receitaPadraoId,
              receitaNome: receitasData[0].nome,
            })
          )
        );
        rec = await db.receita.toArray();
        deveSincronizarReceitas = true;
      }

      if (deveSincronizarReceitas) {
        await syncToFirestore();
      }

      setIngredientes(ings);
      setCompras(comps);
      setReceita(rec);
      setReceitas(receitasData);
      setReceitaSelecionadaId(receitaPadraoId || null);
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

      setupRealtimeSync();
    };

    carregarDados();
  }, []);

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

    await syncToFirestore();
  };

  const custoMedio = (ingredienteId) => {
    const lista = compras.filter(c => c.ingredienteId === ingredienteId);

    const totalValor = lista.reduce((acc, c) => acc + c.preco, 0);
    const totalQtd = lista.reduce((acc, c) => acc + c.quantidade, 0);

    if (totalQtd <= 0) return 0;

    return totalValor / totalQtd;
  };

  const adicionarNaReceita = (ingrediente) => {
    if (!receitaSelecionadaId) {
      setAlertMessage("Crie ou selecione uma receita antes de adicionar ingredientes.");
      setAlertOpen(true);
      return;
    }

    setUsarModalIngrediente(ingrediente);
    setUsarModalQtd("");
    setTimeout(() => setUsarModalOpen(true), 0);
  };

  const adicionarNaReceitaExec = async () => {
    const ingrediente = usarModalIngrediente;
    if (!ingrediente) return;
    const receitaAtual = receitas.find(r => String(r.id) === String(receitaSelecionadaId));
    if (!receitaAtual) return setAlertMessage("Selecione uma receita para adicionar este ingrediente."), setAlertOpen(true);
    const qtd = parseNumero(usarModalQtd);
    if (!qtd) return setAlertMessage("Informe a quantidade usada."), setAlertOpen(true);

    const custoUnitario = custoMedio(ingrediente.id);
    let qtdNormalizada = qtd;
    if (ingrediente.unidade === "g") qtdNormalizada = qtd / 1000;

    const custo = qtdNormalizada * custoUnitario;

    const novoItem = {
      receitaId: receitaAtual.id,
      receitaNome: receitaAtual.nome,
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

    await syncToFirestore();
  };

  const removerDaReceita = async (itemId) => {
    await db.receita.delete(itemId);
    setReceita(prev => prev.filter(r => r.id !== itemId));

    await syncToFirestore();
  };

  const criarReceita = async () => {
    const nomeNormalizado = nomeReceita.trim();

    if (!nomeNormalizado) {
      setAlertMessage("Informe o nome da receita.");
      setAlertOpen(true);
      return;
    }

    const novaReceita = {
      nome: nomeNormalizado,
      data: new Date().toISOString(),
    };
    const receitaId = await db.receitas.add(novaReceita);
    const receitaComId = { ...novaReceita, id: receitaId };

    setReceitas(prev => [...prev, receitaComId]);
    setReceitaSelecionadaId(receitaId);
    setNomeReceita("");

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
    await syncToFirestore();
    setShowConfigVendas(false);
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

        valorFinal = valor;
        descricao = `${qtd} fatia(s) - valor total R$ ${valor.toFixed(2)}`;
      } else if (precoFatia) {

        valorFinal = qtd * parseNumero(precoFatia);
        descricao = `${qtd} fatia(s) R$ ${parseNumero(precoFatia).toFixed(2)}`;
      } else {
        setAlertMessage("Configure o preço padrão da fatia ou informe o valor total.");
        setAlertOpen(true);
        return;
      }
    } else {

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

    await syncToFirestore();
  };

  const receitaSelecionada = receitas.find(r => String(r.id) === String(receitaSelecionadaId)) || receitas[0] || null;
  const receitaSelecionadaIdAtual = receitaSelecionada?.id ?? null;
  const receitaPadraoIdAtual = receitas[0]?.id ?? receitaSelecionadaIdAtual;
  const itensReceitaSelecionada = receita.filter(item =>
    receitaSelecionadaIdAtual && String(item.receitaId ?? receitaPadraoIdAtual) === String(receitaSelecionadaIdAtual)
  );
  const custoTotal = itensReceitaSelecionada.reduce((acc, r) => acc + r.custo, 0);
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
    <div className="min-h-screen flex flex-col bg-[#fff7fc] text-gray-900">
      <header className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex sm:justify-between sm:items-center gap-2">
          <div className="flex flex-grow items-center gap-3">
            <img className="h-12 w-12" src={sunflowerIcon} alt="" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold m-0 text-white">
                Solary Cacau
              </h1>
              <p className="text-white/85 text-sm m-0">Controle dos custos e receitas para suas encomendas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            <div className="card border border-rose-100/80 bg-white/95">
              <h2 className="font-bold text-xl mb-4 text-rose-950">📦 Ingrediente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                <input className="input border-2 border-rose-200 focus:border-rose-700 placeholder-gray-400" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />

                <select className="input border-2 border-rose-200 focus:border-rose-700 bg-white" value={unidade} onChange={e => setUnidade(e.target.value)}>
                  <option value="kg">Kg</option>
                  <option value="un">Unidade</option>
                  <option value="pacote">Pacote</option>
                  <option value="litro">Litro</option>
                </select>

                <div className="border-2 border-rose-200 p-3 rounded-lg bg-rose-50/80 sm:col-span-2 xl:col-span-1">
                  <div className="flex gap-2 items-center mb-2">
                    <input id="usePrecoPorUnidade" type="checkbox" checked={usePrecoPorUnidade} onChange={e => setUsePrecoPorUnidade(e.target.checked)} className="w-4 h-4 cursor-pointer accent-rose-800" />
                    <label htmlFor="usePrecoPorUnidade" className="text-xs font-semibold cursor-pointer flex-1 text-gray-700">Valor por unidade</label>
                  </div>
                  {usePrecoPorUnidade ? (
                    <input type="text" className="input border-2 border-rose-200 focus:border-rose-700 mt-1 text-sm" placeholder="Valor por unidade" value={precoUnitario} onChange={e => setPrecoUnitario(e.target.value)} />
                  ) : (
                    <input type="text" className="input border-2 border-rose-200 focus:border-rose-700 mt-1 text-sm" placeholder="Valor gasto" value={precoCompra} onChange={e => setPrecoCompra(e.target.value)} />
                  )}
                </div>

                <input type="text" className="input border-2 border-rose-200 focus:border-rose-700 placeholder-gray-400" placeholder="Qtd (ex: 0.5 = 500g)" value={qtdCompra} onChange={e => setQtdCompra(e.target.value)} />

                <button onClick={salvarIngrediente} className="btn btn-primary w-full sm:col-span-2 xl:col-span-1">
                  {editIndex !== null ? "✓ Atualizar" : "+ Adicionar"}
                </button>
              </div>
            </div>

            <div className="card border border-rose-200/80 bg-white/95">
              <h2 className="font-bold text-xl mb-4 text-rose-950">🥄 Ingredientes</h2>
              {ingredientes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum ingrediente cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {ingredientes.map((i, idx) => {
                    const custo = custoMedio(i.id);
                    const isPeso = i.unidade === "kg" || i.unidade === "g";
                    const displayCusto = i.unidade === "g" ? custo * 1000 : custo;
                    const displayUnidade = isPeso ? "kg" : i.unidade;
                    const labelUnidade = isPeso ? "kg" : i.unidade;

                    return (
                      <div key={`ing-${i.id}`} className="flex flex-col sm:flex-row sm:justify-between gap-3 border-b border-rose-100 py-4 last:border-b-0 items-stretch sm:items-start hover:bg-rose-50 px-3 rounded-lg transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 break-words">{i.nome}</p>
                          <p className="text-xs text-gray-500 mt-1 break-words">📊 Custo: R$ <span className="font-semibold text-rose-900">{displayCusto.toFixed(2)}</span> / {displayUnidade}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:ml-4 shrink-0">
                          <button onClick={() => registrarCompra(i)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold text-xs rounded-md" aria-label={`Registrar compra de ${i.nome}`}>💳</button>
                          <button onClick={() => adicionarNaReceita(i)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold text-xs rounded-md" aria-label={`Usar ${i.nome} na receita`}>✅</button>
                          <button onClick={() => editarIngrediente(idx)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold text-xs rounded-md" aria-label={`Editar ${i.nome}`}>✏️</button>
                          <button onClick={() => removerIngrediente(idx)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold text-xs rounded-md" aria-label={`Remover ${i.nome}`}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card border border-rose-200/80 bg-white/95">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-rose-950">🧁 Receitas</h3>
                  <p className="text-xs text-gray-500 mt-1">Selecione uma receita e use o botão ✅ nos ingredientes para montar a ficha.</p>
                </div>
                <p className="text-sm font-bold text-rose-900 shrink-0">Custo: R$ {custoTotal.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-4">
                <input className="input border-2 border-rose-200 focus:border-rose-700" placeholder="Nome da receita" value={nomeReceita} onChange={e => setNomeReceita(e.target.value)} />
                <button onClick={criarReceita} className="btn btn-primary">+ Receita</button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {receitas.map((r) => {
                  const selecionada = String(r.id) === String(receitaSelecionadaIdAtual);

                  return (
                    <button
                      key={`receita-${r.id}`}
                      type="button"
                      onClick={() => setReceitaSelecionadaId(r.id)}
                      className={`small-btn shrink-0 ${selecionada ? "bg-rose-900 text-white hover:bg-rose-950" : "bg-rose-100 text-rose-900 hover:bg-rose-200"}`}
                    >
                      {r.nome}
                    </button>
                  );
                })}
              </div>

              {itensReceitaSelecionada.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {receitaSelecionada ? `Sem ingredientes em ${receitaSelecionada.nome}` : "Crie uma receita para começar"}
                </p>
              ) : (
                <div className="space-y-2">
                  {itensReceitaSelecionada.map((r) => (
                    <div key={`rec-${r.id}`} className="border-b border-rose-100 pb-3 last:border-b-0 hover:bg-rose-50 p-3 rounded-lg transition flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 justify-between items-stretch sm:items-center lg:items-stretch xl:items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 break-words">{r.nome}</p>
                        <p className="text-xs text-gray-500 mt-1 break-words">{r.qtd} {r.unidade || "un"} • Custo: <span className="font-semibold text-rose-900">R$ {r.custo.toFixed(2)}</span></p>
                      </div>
                      <button onClick={() => removerDaReceita(r.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md self-start sm:self-center lg:self-start xl:self-center" aria-label={`Remover ${r.nome} da receita`}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-5 lg:space-y-6">
            <div className="bg-gradient-to-br from-pink-400 via-rose-400 to orange-400 text-white rounded-lg shadow-md p-4 sm:p-5 border ">
              <h2 className="font-bold text-xl mb-4">💰 Resumo Financeiro</h2>
              <div className="space-y-3 text-sm font-semibold">
                <div className="bg-white/15 rounded-lg p-3 border border-white/10">
                  <p className="text-rose-100">Custo da receita</p>
                  <p className="text-2xl font-bold break-words">R$ {custoTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white/15 rounded-lg p-3 border border-white/10">
                  <p className="text-rose-100">Vendas realizadas</p>
                  <p className="text-2xl font-bold break-words">R$ {vendaTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 border border-white/60">
                  <p className="text-white text-xs">LUCRO TOTAL</p>
                  <p className="text-2xl sm:text-3xl font-bold break-words">{lucro >= 0 ? '✅' : '❌'} R$ {Math.abs(lucro).toFixed(2)}</p>
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

            <div className="card border border-rose-200/80 bg-white/95">
              <button
                type="button"
                onClick={() => setShowConfigVendas(prev => !prev)}
                className="w-full flex items-center justify-between gap-3 text-left"
                aria-expanded={showConfigVendas}
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
                      <input type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="R$ ex: 45.00" value={precoBolo} onChange={e => setPrecoBolo(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Preço por fatia</label>
                      <input type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="R$ ex: 8.50" value={precoFatia} onChange={e => setPrecoFatia(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Fatias por bolo</label>
                      <input type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="ex: 12" value={fatiasPerBolo} onChange={e => setFatiasPerBolo(e.target.value)} />
                    </div>
                  </div>
                  <button onClick={salvarConfigsVendas} className="btn btn-primary w-full">💾 Salvar Configuração</button>
                </div>
              )}
            </div>

            {showNovaVenda ? (
              <div className="card bg-rose-50/90 border border-rose-200/80">
                <h3 className="font-bold text-lg mb-4 text-rose-950">🛍️ Registrar Venda</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-rose-200 hover:border-rose-500 transition">
                    <input type="radio" value="fatias" checked={tipoVenda === "fatias"} onChange={e => setTipoVenda(e.target.value)} name="tipoVenda" className="accent-rose-800" />
                    <span className="text-sm font-semibold text-gray-700">🍰 Fatias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border-2 border-rose-200 hover:border-rose-500 transition">
                    <input type="radio" value="bolo" checked={tipoVenda === "bolo"} onChange={e => setTipoVenda(e.target.value)} name="tipoVenda" className="accent-rose-800" />
                    <span className="text-sm font-semibold text-gray-700">🎂 Bolo Inteiro</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <input type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder={tipoVenda === "bolo" ? "Quantidade (kg, ex: 2.5)" : "Quantidade (ex: 3)"} value={qtdVenda} onChange={e => setQtdVenda(e.target.value)} />
                  {tipoVenda === "fatias" && (
                    <input type="text" className="input border-2 border-rose-200 focus:border-rose-700" placeholder="Valor total (opcional - usa R$ por fatia se vazio)" value={valorVenda} onChange={e => setValorVenda(e.target.value)} />
                  )}
                  <input type="date" className="input border-2 border-rose-200 focus:border-rose-700" value={dataVenda} onChange={e => setDataVenda(e.target.value)} />
                  <textarea className="input border-2 border-rose-200 focus:border-rose-700 resize-none" placeholder="Anotação (ex: Cliente: Maria, Entrega 14h)" value={anotacaoVenda} onChange={e => setAnotacaoVenda(e.target.value)} rows="3" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button onClick={registrarVenda} className="btn btn-primary flex-1">✅ Registrar</button>
                  <button onClick={() => { setShowNovaVenda(false); setAnotacaoVenda(""); setDataVenda(new Date().toISOString().split('T')[0]); }} className="btn flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">❌ Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNovaVenda(true)} className="btn btn-primary w-full shadow-md">+ Nova Venda</button>
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
                          <p className="text-xs text-gray-500 mt-2">📅 {new Date(v.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end lg:justify-between xl:justify-end gap-3 shrink-0">
                          <p className="font-bold text-lg text-emerald-700 break-words">R$ {v.valor.toFixed(2)}</p>
                          <button onClick={() => removerVenda(v.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md" aria-label="Remover venda">🗑️</button>
                        </div>
                      </div>
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
            <input className="input border-2 border-rose-200 focus:border-rose-700" value={compraModalPrecoUnit} onChange={e => setCompraModalPrecoUnit(e.target.value)} placeholder={compraModalIngrediente?.unidade === 'g' ? 'R$ / kg (ex: 12.5)' : 'R$ / unidade'} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade ({compraModalIngrediente?.unidade || ''})</label>
            <input className="input border-2 border-rose-200 focus:border-rose-700" value={compraModalQtd} onChange={e => setCompraModalQtd(e.target.value)} placeholder={compraModalIngrediente?.unidade === 'g' ? 'ex: 0.5 = 500g' : ''} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Valor total (opcional)</label>
            <input className="input border-2 border-rose-200 focus:border-rose-700" value={compraModalPrecoTotal} onChange={e => setCompraModalPrecoTotal(e.target.value)} placeholder="Valor total pago" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setCompraModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={registrarCompraExec}>✅ Salvar compra</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={usarModalOpen} onClose={() => setUsarModalOpen(false)} title={usarModalIngrediente ? `✅ Usar — ${usarModalIngrediente.nome} em ${receitaSelecionada?.nome || "receita"}` : 'Usar ingrediente'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade ({usarModalIngrediente?.unidade || ''})</label>
            <input className="input border-2 border-rose-200 focus:border-rose-700" value={usarModalQtd} onChange={e => setUsarModalQtd(e.target.value)} placeholder={usarModalIngrediente?.unidade === 'g' ? 'ex: 0.5 = 500g' : ''} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setUsarModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={adicionarNaReceitaExec}>✅ Adicionar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="⚠️ Confirmação">
        <div className="space-y-4">
          <p className="text-gray-700 font-medium text-lg">{confirmMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setConfirmOpen(false)}>Não</button>
            <button className="btn bg-red-500 text-white hover:bg-red-600" onClick={handleConfirmYes}>Sim, excluir</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title="ℹ️ Aviso">
        <div className="space-y-4">
          <p className="text-gray-700 font-medium text-lg bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">{alertMessage}</p>
          <div className="flex sm:justify-end pt-4 border-t border-gray-200">
            <button className="btn btn-primary w-full sm:w-auto" onClick={() => setAlertOpen(false)}>✅ OK</button>
          </div>
        </div>
      </Modal>

      <footer className="bg-white/85 border-t border-pink-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-rose-950 font-bold">🎂 Feito com ❤️ para minha confeiteira predileta!</p>
          <p className="text-xs text-gray-600 mt-1">Sistema de Controle de Custos • v1.0</p>
        </div>
      </footer>
    </div>
  );
}
