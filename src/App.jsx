import { useState, useEffect, useRef } from "react";
import React from "react";
import {
  createId,
  deleteFromFirestore,
  getAllFromFirestore,
  saveToFirestore,
  setupRealtimeSync,
} from "./db";
import FinancialSummary from "./components/FinancialSummary";
import Modal from "./components/Modal";
import PrettySelect from "./components/PrettySelect";
import PurchaseHistory from "./components/PurchaseHistory";
import SalesPanel from "./components/SalesPanel";
import PriceHistory from "./components/PriceHistory";
import PeriodComparison from "./components/PeriodComparison";
import IngredientCategories from "./components/IngredientCategories";
import AiAssistantScreen from "./AI/aiAssistantScreen";
import sunflowerIcon from "./img/sunflower-svgrepo-com.svg";
import { dataInputParaISO, formatarDataBR, formatarDataLocal, isoParaDataInput } from "./utils/dates";
import { comprasDoIngrediente, estatisticasCompras, formatarMoeda } from "./utils/analytics";
import { parseNumero } from "./utils/numbers";
import { FaPlus, FaTrash } from "react-icons/fa";


export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState("controle");
  const [ingredientes, setIngredientes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [ingredienteHistoricoId, setIngredienteHistoricoId] = useState("");
  const [receita, setReceita] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [receitaSelecionadaId, setReceitaSelecionadaId] = useState(null);
  const [nomeReceita, setNomeReceita] = useState("");
  const [ingredienteReceitaId, setIngredienteReceitaId] = useState("");
  const [qtdIngredienteReceita, setQtdIngredienteReceita] = useState("");
  const [subReceitaId, setSubReceitaId] = useState("");
  const [qtdSubReceita, setQtdSubReceita] = useState("");
  const [novaReceitaFatias, setNovaReceitaFatias] = useState("10");
  const [editandoNomeReceitaId, setEditandoNomeReceitaId] = useState(null);
  const [editandoNomeReceitaValor, setEditandoNomeReceitaValor] = useState("");
  
  // Outros itens - catálogo
  const [outrosItens, setOutrosItens] = useState([]);
  const [nomeOutroItem, setNomeOutroItem] = useState("");
  const [valorOutroItem, setValorOutroItem] = useState("");
  const [qtdOutroItem, setQtdOutroItem] = useState("");
  const [outroItemEditandoId, setOutroItemEditandoId] = useState(null);
  
  // Modal para usar outro item na receita
  const [usarOutroItemModalOpen, setUsarOutroItemModalOpen] = useState(false);
  const [usarOutroItemModal, setUsarOutroItemModal] = useState(null);
  const [usarOutroItemQtd, setUsarOutroItemQtd] = useState("1");

  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("kg");
  const [precoCompra, setPrecoCompra] = useState("");
  const [qtdCompra, setQtdCompra] = useState("");
  const [ingredienteEditandoId, setIngredienteEditandoId] = useState(null);

  const [precoUnitario, setPrecoUnitario] = useState("");
  const [usePrecoPorUnidade, setUsePrecoPorUnidade] = useState(false);

  // Modais e estados auxiliares
  const [compraModalOpen, setCompraModalOpen] = useState(false);
  const [compraModalIngrediente, setCompraModalIngrediente] = useState(null);
  const [compraModalPrecoUnit, setCompraModalPrecoUnit] = useState("");
  const [compraModalQtd, setCompraModalQtd] = useState("");
  const [compraModalPrecoTotal, setCompraModalPrecoTotal] = useState("");
  const [compraModalAviso, setCompraModalAviso] = useState("");
  const [compraModalData, setCompraModalData] = useState(formatarDataLocal());
  const [compraEditandoId, setCompraEditandoId] = useState(null);
  const [compraEditandoData, setCompraEditandoData] = useState(null);

  const [usarModalOpen, setUsarModalOpen] = useState(false);
  const [usarModalIngrediente, setUsarModalIngrediente] = useState(null);
  const [usarModalQtd, setUsarModalQtd] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // "delete-ingredient", "delete-sale" ou "delete-recipe"
  const [confirmData, setConfirmData] = useState(null); // dados para a ação (ex: { ingredienteId } ou { vendaId })

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [firebaseStatus, setFirebaseStatus] = useState("idle");
  const [operacaoAtual, setOperacaoAtual] = useState("");
  const firebaseSyncIdRef = useRef(0);
  const outroItemFormRef = useRef(null);

  // Novos modais de análises
  const [priceHistoryOpen, setPriceHistoryOpen] = useState(false);
  const [periodComparisonOpen, setPeriodComparisonOpen] = useState(false);
  const [ingredientCategoriesOpen, setIngredientCategoriesOpen] = useState(false);

  // VENDAS
  const [precoBolo, setPrecoBolo] = useState("");
  const [precoFatia, setPrecoFatia] = useState("");
  const [precoTorta, setPrecoTorta] = useState("");
  const [fatiasPerBolo, setFatiasPerBolo] = useState("");
  const [showConfigVendas, setShowConfigVendas] = useState(false);
  const [vendas, setVendas] = useState([]);
  const [confirmacaoVendaOpen, setConfirmacaoVendaOpen] = useState(false);
  const [dadosVendaConfirmacao, setDadosVendaConfirmacao] = useState(null);
  const [confirmacaoPagamentoOpen, setConfirmacaoPagamentoOpen] = useState(false);
  const [vendaPagamentoConfirmacao, setVendaPagamentoConfirmacao] = useState(null);
  
  // INGREDIENTES
  const [buscaIngredientes, setBuscaIngredientes] = useState("");
  const [showNovaVenda, setShowNovaVenda] = useState(false);
  const [vendaEditandoId, setVendaEditandoId] = useState(null);
  const [tipoVenda, setTipoVenda] = useState("fatias"); // "fatias", "bolo", "torta" ou "outros"
  const [qtdVenda, setQtdVenda] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [descricaoOutrosVenda, setDescricaoOutrosVenda] = useState("");
  const [anotacaoVenda, setAnotacaoVenda] = useState("");
  const [dataVenda, setDataVenda] = useState(formatarDataLocal()); // YYYY-MM-DD

  const [filtroDataInicioCompras, setFiltroDataInicioCompras] = useState("");
  const [filtroDataFimCompras, setFiltroDataFimCompras] = useState("");


  useEffect(() => {
    let isMounted = true;
    let stopRealtimeSync = () => {};

    const getConfigValor = (configs, chave) =>
      configs.find((config) => config.chave === chave)?.valor || "";

    const aplicarColecao = (coll, data) => {
      if (!isMounted) return;

      if (coll === "ingredientes") setIngredientes(data);
      if (coll === "compras") setCompras(data);
      if (coll === "receita") setReceita(data);
      if (coll === "vendas") setVendas(data);
      if (coll === "outrosItens") setOutrosItens(data);
      if (coll === "receitas") {
        setReceitas(data);
        setReceitaSelecionadaId((receitaAtual) => {
          const receitaExiste = data.some((receitaItem) => String(receitaItem.id) === String(receitaAtual));
          return receitaExiste ? receitaAtual : data[0]?.id ?? null;
        });
      }
      if (coll === "config") {
        setPrecoBolo(getConfigValor(data, "precoBolo"));
        setPrecoFatia(getConfigValor(data, "precoFatia"));
        setPrecoTorta(getConfigValor(data, "precoTorta"));
        setFatiasPerBolo(getConfigValor(data, "fatiasPerBolo"));
      }
    };

    const aplicarDados = (dados) => {
      if (!isMounted) return;

      const receitasData = dados.receitas || [];
      const configs = dados.config || [];

      setIngredientes(dados.ingredientes || []);
      setCompras(dados.compras || []);
      setReceita(dados.receita || []);
      setReceitas(receitasData);
      setReceitaSelecionadaId(receitasData[0]?.id ?? null);
      setVendas(dados.vendas || []);
      setOutrosItens(dados.outrosItens || []);
      setPrecoBolo(getConfigValor(configs, "precoBolo"));
      setPrecoFatia(getConfigValor(configs, "precoFatia"));
      setPrecoTorta(getConfigValor(configs, "precoTorta"));
      setFatiasPerBolo(getConfigValor(configs, "fatiasPerBolo"));
    };

    const temDadosRemotos = (dados) =>
      ["ingredientes", "compras", "receita", "receitas", "vendas", "config", "outrosItens"]
        .some((coll) => (dados[coll] || []).length > 0);

    const migrarLocalStorageParaFirestore = async (dadosAtuais) => {
      const raw = localStorage.getItem("sistema_bolos");
      if (!raw || temDadosRemotos(dadosAtuais)) return dadosAtuais;

      try {
        const data = JSON.parse(raw);
        let ingredientesData = data.ingredientes || [];
        let comprasData = data.compras || [];
        const receitaData = data.receita || [];

        comprasData = comprasData.map((compra) => {
          const ingrediente = ingredientesData.find((item) => String(item.id) === String(compra.ingredienteId));
          if (ingrediente && ingrediente.unidade === "g") return { ...compra, quantidade: compra.quantidade / 1000 };
          return compra;
        });
        ingredientesData = ingredientesData.map((ingrediente) =>
          ingrediente.unidade === "g" ? { ...ingrediente, unidade: "kg" } : ingrediente
        );

        const writes = [
          ...ingredientesData.map((item) => saveToFirestore("ingredientes", { ...item, id: item.id ?? createId() })),
          ...comprasData.map((item) => saveToFirestore("compras", { ...item, id: item.id ?? createId() })),
          ...receitaData.map((item) => saveToFirestore("receita", { ...item, id: item.id ?? createId() })),
        ];

        if (data.precoVenda) {
          writes.push(saveToFirestore("config", { chave: "precoVenda", valor: data.precoVenda }));
        }

        await Promise.all(writes);
        localStorage.removeItem("sistema_bolos");
        return getAllFromFirestore();
      } catch (error) {
        console.error("Erro ao migrar dados do localStorage:", error);
        return dadosAtuais;
      }
    };

    const garantirReceitas = async (dados) => {
      let receitasData = [...(dados.receitas || [])];
      let receitaData = [...(dados.receita || [])];
      const writes = [];

      if (receitasData.length === 0) {
        const receitaPadrao = {
          id: createId(),
          nome: "Receita principal",
          data: new Date().toISOString(),
        };
        receitasData = [receitaPadrao];
        writes.push(saveToFirestore("receitas", receitaPadrao));
      }

      const receitaPadraoId = receitasData[0]?.id;
      const itensSemReceita = receitaData.filter((item) => item.receitaId === undefined || item.receitaId === null);
      if (receitaPadraoId && itensSemReceita.length > 0) {
        receitaData = receitaData.map((item) => {
          if (item.receitaId !== undefined && item.receitaId !== null) return item;

          const itemAtualizado = {
            ...item,
            id: item.id ?? createId(),
            receitaId: receitaPadraoId,
            receitaNome: receitasData[0].nome,
          };
          writes.push(saveToFirestore("receita", itemAtualizado));
          return itemAtualizado;
        });
      }

      if (writes.length > 0) {
        await Promise.all(writes);
      }

      return {
        ...dados,
        receitas: receitasData,
        receita: receitaData,
      };
    };

    const carregarDados = async () => {
      setFirebaseStatus("syncing");

      try {
        let dados = await getAllFromFirestore();
        dados = await migrarLocalStorageParaFirestore(dados);
        dados = await garantirReceitas(dados);

        aplicarDados(dados);

        if (!isMounted) return;
        setFirebaseStatus("synced");
        stopRealtimeSync();
        stopRealtimeSync = setupRealtimeSync(aplicarColecao);
      } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
        if (isMounted) {
          mostrarErroFirebase(error, "carregar dados do Firebase");
        }
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
      stopRealtimeSync();
    };
  }, []);

  const normalizarNomeIngrediente = (valor) =>
    String(valor || "")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");

  const encontrarIngredientePorNome = (nomeBusca, ignorarId = null) => {
    const nomeNormalizado = normalizarNomeIngrediente(nomeBusca);
    if (!nomeNormalizado) return null;

    return ingredientes.find((ingrediente) => {
      const mesmoNome = normalizarNomeIngrediente(ingrediente.nome) === nomeNormalizado;
      const mesmoIdIgnorado = ignorarId !== null && String(ingrediente.id) === String(ignorarId);
      return mesmoNome && !mesmoIdIgnorado;
    }) || null;
  };

  const limparFormularioIngrediente = () => {
    setNome("");
    setUnidade("kg");
    setPrecoCompra("");
    setPrecoUnitario("");
    setUsePrecoPorUnidade(false);
    setQtdCompra("");
  };

  const limparFormularioOutroItem = () => {
    setNomeOutroItem("");
    setValorOutroItem("");
    setQtdOutroItem("");
    setOutroItemEditandoId(null);
  };

  const salvarOutroItem = async () => {
    const nomeLimpo = nomeOutroItem.trim();
    if (!nomeLimpo) return;

    const valorNum = parseNumero(valorOutroItem);
    const qtdNum = parseNumero(qtdOutroItem);

    if (valorNum <= 0) {
      setAlertMessage("Informe o valor unitário do outro item.");
      setAlertOpen(true);
      return;
    }

    if (qtdNum <= 0) {
      setAlertMessage("Informe a quantidade do outro item.");
      setAlertOpen(true);
      return;
    }

    if (outroItemEditandoId !== null) {
      const outroItemAtualizado = {
        id: outroItemEditandoId,
        nome: nomeLimpo,
        valor: valorNum,
        quantidade: qtdNum,
        data: new Date().toISOString()
      };
      setOutrosItens(prev => prev.map(item =>
        String(item.id) === String(outroItemEditandoId) ? outroItemAtualizado : item
      ));
      await salvarItensNoFirebase(
        [{ coll: "outrosItens", item: outroItemAtualizado }],
        "atualizar outro item no Firebase"
      );
    } else {
      const id = createId();
      const novoOutroItem = {
        id,
        nome: nomeLimpo,
        valor: valorNum,
        quantidade: qtdNum,
        data: new Date().toISOString()
      };
      setOutrosItens(prev => [...prev, novoOutroItem]);
      await salvarItensNoFirebase(
        [{ coll: "outrosItens", item: novoOutroItem }],
        "salvar outro item no Firebase"
      );
    }

    limparFormularioOutroItem();
  };

  const editarOutroItem = (outroItem) => {
    setNomeOutroItem(outroItem.nome);
    setValorOutroItem(String(outroItem.valor));
    setQtdOutroItem(String(outroItem.quantidade || ""));
    setOutroItemEditandoId(outroItem.id);
    setTimeout(() => outroItemFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const removerOutroItem = (outroItem) => {
    setConfirmMessage(`Tem certeza que deseja excluir o item "${outroItem.nome}"?`);
    setConfirmAction("delete-outro-item");
    setConfirmData({ outroItemId: outroItem.id });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const adicionarOutroItemNaReceita = (outroItem) => {
    setUsarOutroItemModal(outroItem);
    setUsarOutroItemQtd("1");
    setTimeout(() => setUsarOutroItemModalOpen(true), 0);
  };

  const adicionarOutroItemNaReceitaExec = async () => {
    const outroItem = usarOutroItemModal;
    if (!outroItem || !receitaSelecionada) return;

    const qtd = parseNumero(usarOutroItemQtd);
    if (!qtd || qtd <= 0) {
      setAlertMessage("Informe uma quantidade maior que zero.");
      setAlertOpen(true);
      return;
    }

    const novoItem = {
      receitaId: receitaSelecionada.id,
      receitaNome: receitaSelecionada.nome,
      tipo: "outro",
      outroItemId: outroItem.id,
      nome: outroItem.nome,
      qtd,
      unidade: "un",
      custoUnitario: outroItem.valor,
      custo: qtd * outroItem.valor,
      data: new Date().toISOString()
    };

    const itemId = createId();
    const itemComId = { ...novoItem, id: itemId };
    setReceita(prev => [...prev, itemComId]);
    await salvarItensNoFirebase(
      [{ coll: "receita", item: itemComId }],
      "salvar outro item da receita no Firebase"
    );

    setUsarOutroItemModalOpen(false);
  };

  const labelPrecoPorUnidade = (unidadeIngrediente) => {
    if (unidadeIngrediente === "kg" || unidadeIngrediente === "g") return "Preço por kg";
    if (unidadeIngrediente === "litro") return "Preço por litro";
    if (unidadeIngrediente === "pacote") return "Preço por pacote";
    return "Preço por unidade";
  };

  const labelTogglePreco = (unidadeIngrediente) => {
    if (unidadeIngrediente === "kg" || unidadeIngrediente === "g") return "Por kg";
    if (unidadeIngrediente === "litro") return "Por litro";
    if (unidadeIngrediente === "pacote") return "Por pacote";
    return "Por un.";
  };

  const mostrarErroFirebase = (error, acao) => {
    console.error(`Erro ao ${acao}:`, error);
    setFirebaseStatus("error");
    setAlertMessage(
      `Não consegui ${acao}. ` +
      `Verifique a conexão e as regras do Firestore. Detalhe: ${error.message || error}`
    );
    setAlertOpen(true);
  };

  const executarOperacaoBanco = async (acao, operacao) => {
    const syncId = firebaseSyncIdRef.current + 1;
    firebaseSyncIdRef.current = syncId;
    setFirebaseStatus("syncing");
    setOperacaoAtual(acao);

    try {
      await operacao();
      if (firebaseSyncIdRef.current === syncId) {
        setFirebaseStatus("synced");
      }
      return true;
    } catch (error) {
      if (firebaseSyncIdRef.current === syncId) {
        mostrarErroFirebase(error, acao);
      }
      return false;
    } finally {
      if (firebaseSyncIdRef.current === syncId) {
        setOperacaoAtual("");
      }
    }
  };

  const salvarItensNoFirebase = async (itens, acao) => {
    const itensValidos = itens.filter(Boolean);
    if (itensValidos.length === 0) return true;

    return executarOperacaoBanco(acao, () =>
      Promise.all(
        itensValidos.map(({ coll, item }) => saveToFirestore(coll, item))
      )
    );
  };

  const salvarIngrediente = async () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    const precoNum = parseNumero(precoCompra);
    const precoUnitNum = parseNumero(precoUnitario);
    const qtdNum = parseNumero(qtdCompra);
    const ingredienteEditado = ingredienteEditandoId !== null
      ? ingredientes.find((item) => String(item.id) === String(ingredienteEditandoId))
      : null;
    const itensParaSalvar = [];

    if (ingredienteEditandoId !== null && !ingredienteEditado) {
      setAlertMessage("Não encontrei o ingrediente em edição. Selecione novamente.");
      setAlertOpen(true);
      limparFormularioIngrediente();
      setIngredienteEditandoId(null);
      return;
    }

    const ingredienteExistente = encontrarIngredientePorNome(nomeLimpo, ingredienteEditado?.id ?? null);

    if (ingredienteExistente) {
      abrirModalCompra(ingredienteExistente, {
        precoUnit: usePrecoPorUnidade ? precoUnitario : "",
        precoTotal: usePrecoPorUnidade ? "" : precoCompra,
        qtd: qtdCompra,
        aviso: "Esse ingrediente já existe. Registre uma nova compra nele para atualizar o custo médio.",
      });
      limparFormularioIngrediente();
      setIngredienteEditandoId(null);
      return;
    }

    if (ingredienteEditado) {
      const ing = ingredienteEditado;
      const ingredienteAtualizado = { ...ing, nome: nomeLimpo, unidade };
      setIngredientes(prev => prev.map((item) =>
        String(item.id) === String(ing.id) ? ingredienteAtualizado : item
      ));
      itensParaSalvar.push({ coll: "ingredientes", item: ingredienteAtualizado });

      const precoFinalEdit = usePrecoPorUnidade && precoUnitNum > 0 ? precoUnitNum * qtdNum : precoNum;
      if (precoFinalEdit > 0 && qtdNum > 0) {
        let quantidadeArmazenada = qtdNum;
        if (unidade === "g") quantidadeArmazenada = qtdNum / 1000;
        const novaCompra = {
          ingredienteId: ing.id,
          nome: nomeLimpo,
          preco: precoFinalEdit,
          quantidade: quantidadeArmazenada,
          data: new Date().toISOString()
        };
        const compraId = createId();
        const compraComId = { ...novaCompra, id: compraId };
        setCompras(prev => [...prev, compraComId]);
        itensParaSalvar.push({ coll: "compras", item: compraComId });
      }
      setIngredienteEditandoId(null);
    } else {

      const precoFinal = usePrecoPorUnidade && precoUnitNum > 0 ? precoUnitNum * qtdNum : precoNum;
      const temPreco = precoFinal > 0 && qtdNum > 0;
      
      if (!temPreco) {
        setAlertMessage("Para adicionar um novo ingrediente, informe o preço e quantidade iniciais.");
        setAlertOpen(true);
        return;
      }

      const id = createId();
      const novoIngrediente = { id, nome: nomeLimpo, unidade };
      setIngredientes(prev => [...prev, novoIngrediente]);
      itensParaSalvar.push({ coll: "ingredientes", item: novoIngrediente });

      let quantidadeArmazenada = qtdNum;
      if (unidade === "g") quantidadeArmazenada = qtdNum / 1000;

      const novaCompra = {
        ingredienteId: id,
        nome: nomeLimpo,
        preco: precoFinal,
        quantidade: quantidadeArmazenada,
        data: new Date().toISOString()
      };
      const compraId = createId();
      const compraComId = { ...novaCompra, id: compraId };
      setCompras(prev => [...prev, compraComId]);
      itensParaSalvar.push({ coll: "compras", item: compraComId });
    }

    await salvarItensNoFirebase(itensParaSalvar, "salvar ingrediente no Firebase");

    limparFormularioIngrediente();
  };

  const editarIngrediente = (ingrediente) => {
    setNome(ingrediente.nome);
    setUnidade(ingrediente.unidade);
    setIngredienteEditandoId(ingrediente.id);
  };

  const removerIngrediente = (ingrediente) => {
    setConfirmMessage(`Tem certeza que deseja excluir o ingrediente "${ingrediente.nome}"?`);
    setConfirmAction("delete-ingredient");
    setConfirmData({ ingredienteId: ingrediente.id });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const abrirModalCompra = (ingrediente, dados = {}) => {
    setCompraModalIngrediente(ingrediente);
    setCompraModalPrecoUnit(dados.precoUnit || "");
    setCompraModalQtd(dados.qtd || "");
    setCompraModalPrecoTotal(dados.precoTotal || "");
    setCompraModalData(dados.data || formatarDataLocal());
    setCompraModalAviso(dados.aviso || "");
    setTimeout(() => setCompraModalOpen(true), 0);
  };

  const abrirModalEditarCompra = (compra) => {
    const ingrediente = ingredientes.find(i => String(i.id) === String(compra.ingredienteId));
    if (!ingrediente) return;

    const precoUnit = compra.quantidade > 0 ? compra.preco / compra.quantidade : 0;
    
    setCompraEditandoId(compra.id);
    setCompraEditandoData(compra.data);
    setCompraModalIngrediente(ingrediente);
    setCompraModalPrecoUnit(precoUnit ? precoUnit.toFixed(2) : "");
    setCompraModalQtd(compra.quantidade.toString());
    setCompraModalPrecoTotal(compra.preco.toFixed(2));
    setCompraModalData(isoParaDataInput(compra.data));
    setCompraModalAviso("Editando esta compra");
    setTimeout(() => setCompraModalOpen(true), 0);
  };

  const deletarCompra = (compra) => {
    setConfirmMessage(`Tem certeza que deseja excluir a compra de "${compra.nome}" de ${formatarDataBR(compra.data)}?`);
    setConfirmAction("delete-purchase");
    setConfirmData({ compraId: compra.id });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const fecharModalCompra = () => {
    setCompraModalOpen(false);
    setCompraEditandoId(null);
    setCompraEditandoData(null);
    setCompraModalIngrediente(null);
    setCompraModalPrecoUnit("");
    setCompraModalQtd("");
    setCompraModalPrecoTotal("");
    setCompraModalData(formatarDataLocal());
    setCompraModalAviso("");
  };

  const registrarCompra = (ingrediente) => {
    abrirModalCompra(ingrediente);
  };

  const registrarCompraExec = async () => {
    const ingrediente = compraModalIngrediente;
    if (!ingrediente) return;
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

    const compraData = {
      ingredienteId: ingrediente.id,
      nome: ingrediente.nome,
      preco: precoFinal,
      quantidade: qtdArmazenada,
      data: dataInputParaISO(compraModalData)
    };

    if (compraEditandoId) {
      // Edição de compra existente
      const compraAtualizada = { ...compraData, id: compraEditandoId };
      setCompras(prev => prev.map(c => String(c.id) === String(compraEditandoId) ? compraAtualizada : c));
      
      await salvarItensNoFirebase(
        [{ coll: "compras", item: compraAtualizada }],
        "atualizar compra no Firebase"
      );
      
      setCompraEditandoId(null);
      setCompraEditandoData(null);
    } else {
      // Criação de nova compra
      const compraId = createId();
      const compraComId = { ...compraData, id: compraId };
      setCompras(prev => [...prev, compraComId]);

      await salvarItensNoFirebase(
        [{ coll: "compras", item: compraComId }],
        "salvar compra no Firebase"
      );
    }
    
    setCompraModalOpen(false);
  };

  const custoMedio = (ingredienteId) => {
    return estatisticasCompras(comprasDoIngrediente(compras, ingredienteId)).precoMedio;
  };

  const normalizarQuantidadeReceita = (quantidade, unidadeIngrediente) => {
    if (unidadeIngrediente === "g") return quantidade / 1000;
    return quantidade;
  };

  const unidadeReceita = (unidadeIngrediente) => unidadeIngrediente === "g" ? "kg" : unidadeIngrediente;

  const calcularCustoItemReceita = (item, visitados = new Set()) => {
    if (item.tipo === "sub-receita") {
      const custoSubReceita = calcularCustoReceita(item.subReceitaId, visitados);
      return Number(item.qtd || 1) * custoSubReceita;
    }

    if (item.tipo === "outro") {
      const custoCalculado = Number(item.qtd || 1) * Number(item.custoUnitario || 0);
      if (custoCalculado > 0) return custoCalculado;
      return Number(item.custo || 0);
    }

    const ingrediente = ingredientes.find(i => String(i.id) === String(item.ingredienteId));
    const custoUnitarioAtual = ingrediente ? custoMedio(ingrediente.id) : item.custoUnitario;
    const custoAtual = Number(item.qtd || 0) * Number(custoUnitarioAtual || 0);

    if (custoAtual > 0) return custoAtual;
    return Number(item.custo || 0);
  };

  const calcularCustoReceita = (receitaId, visitados = new Set()) => {
    if (visitados.has(String(receitaId))) return 0;
    const visitadosAtual = new Set(visitados);
    visitadosAtual.add(String(receitaId));
    const receitaIdComparacao = String(receitaId);

    return receita
      .filter(item => String(item.receitaId ?? receitaPadraoIdAtual) === receitaIdComparacao)
      .reduce((acc, item) => acc + calcularCustoItemReceita(item, visitadosAtual), 0);
  };

  const salvarItemReceita = async (ingrediente, quantidadeInformada) => {
    if (!receitaSelecionada) {
      setAlertMessage("Crie ou selecione uma receita antes de adicionar ingredientes.");
      setAlertOpen(true);
      return false;
    }

    if (!ingrediente) {
      setAlertMessage("Selecione um ingrediente para adicionar na receita.");
      setAlertOpen(true);
      return false;
    }

    const qtd = parseNumero(quantidadeInformada);
    if (!qtd) {
      setAlertMessage("Informe a quantidade usada.");
      setAlertOpen(true);
      return false;
    }

    const custoUnitario = custoMedio(ingrediente.id);
    const qtdNormalizada = normalizarQuantidadeReceita(qtd, ingrediente.unidade);
    const custo = qtdNormalizada * custoUnitario;

    const novoItem = {
      receitaId: receitaSelecionada.id,
      receitaNome: receitaSelecionada.nome,
      ingredienteId: ingrediente.id,
      nome: ingrediente.nome,
      qtd: qtdNormalizada,
      unidade: unidadeReceita(ingrediente.unidade),
      custoUnitario,
      custo,
      data: new Date().toISOString()
    };

    const itemId = createId();
    const itemComId = { ...novoItem, id: itemId };
    setReceita(prev => [...prev, itemComId]);
    await salvarItensNoFirebase(
      [{ coll: "receita", item: itemComId }],
      "salvar item da receita no Firebase"
    );

    return true;
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
    const salvou = await salvarItemReceita(ingrediente, usarModalQtd);

    if (salvou) {
      setUsarModalOpen(false);
    }
  };

  const adicionarIngredienteReceitaSelecionada = async () => {
    const ingrediente = ingredientes.find(i => String(i.id) === String(ingredienteReceitaId));
    const salvou = await salvarItemReceita(ingrediente, qtdIngredienteReceita);

    if (salvou) {
      setIngredienteReceitaId("");
      setQtdIngredienteReceita("");
    }
  };

  const adicionarSubReceitaNaReceita = async () => {
    if (!receitaSelecionada) {
      setAlertMessage("Selecione uma receita antes de adicionar uma sub-receita.");
      setAlertOpen(true);
      return;
    }
    if (!subReceitaId) {
      setAlertMessage("Selecione uma receita para adicionar.");
      setAlertOpen(true);
      return;
    }
    if (String(subReceitaId) === String(receitaSelecionadaIdAtual)) {
      setAlertMessage("Não é possível adicionar uma receita a si mesma.");
      setAlertOpen(true);
      return;
    }
    const subReceita = receitas.find(r => String(r.id) === String(subReceitaId));
    if (!subReceita) return;

    const multiplicador = Math.max(0.01, parseNumero(qtdSubReceita) || 1);
    const custoSubReceita = calcularCustoReceita(subReceita.id);
    const custoItem = multiplicador * custoSubReceita;

    const novoItem = {
      receitaId: receitaSelecionada.id,
      receitaNome: receitaSelecionada.nome,
      tipo: "sub-receita",
      subReceitaId: subReceita.id,
      nome: subReceita.nome,
      qtd: multiplicador,
      unidade: "receita",
      custoUnitario: custoSubReceita,
      custo: custoItem,
      data: new Date().toISOString()
    };

    const itemId = createId();
    const itemComId = { ...novoItem, id: itemId };
    setReceita(prev => [...prev, itemComId]);
    await salvarItensNoFirebase(
      [{ coll: "receita", item: itemComId }],
      "salvar sub-receita no Firebase"
    );
    setSubReceitaId("");
    setQtdSubReceita("");
  };

  const atualizarFatiasReceita = async (novasFatias) => {
    if (!receitaSelecionada) return;
    const fatias = Math.max(1, Number(novasFatias) || 1);
    const receitaAtualizada = { ...receitaSelecionada, fatias };
    setReceitas(prev => prev.map(r => String(r.id) === String(receitaSelecionada.id) ? receitaAtualizada : r));
    await salvarItensNoFirebase(
      [{ coll: "receitas", item: receitaAtualizada }],
      "atualizar fatias da receita"
    );
  };

  const salvarEdicaoNomeReceita = async () => {
    const novoNome = editandoNomeReceitaValor.trim();
    if (!novoNome || !editandoNomeReceitaId) {
      setEditandoNomeReceitaId(null);
      return;
    }
    const receitaAlvo = receitas.find(r => String(r.id) === String(editandoNomeReceitaId));
    if (!receitaAlvo) { setEditandoNomeReceitaId(null); return; }
    const receitaAtualizada = { ...receitaAlvo, nome: novoNome };
    setReceitas(prev => prev.map(r => String(r.id) === String(editandoNomeReceitaId) ? receitaAtualizada : r));
    setReceita(prev => prev.map(item =>
      String(item.receitaId) === String(editandoNomeReceitaId) ? { ...item, receitaNome: novoNome } : item
    ));
    setEditandoNomeReceitaId(null);
    await salvarItensNoFirebase(
      [{ coll: "receitas", item: receitaAtualizada }],
      "atualizar nome da receita"
    );
  };

  const removerDaReceita = async (itemId) => {
    const removeu = await executarOperacaoBanco("remover item da receita no Firebase", () =>
      deleteFromFirestore("receita", itemId)
    );

    if (removeu) {
      setReceita(prev => prev.filter(r => String(r.id) !== String(itemId)));
    }
  };

  const removerReceita = (receitaParaRemover) => {
    if (!receitaParaRemover) return;

    if (receitas.length <= 1) {
      setAlertMessage("Mantenha pelo menos uma receita cadastrada.");
      setAlertOpen(true);
      return;
    }

    setConfirmMessage(`Excluir a receita "${receitaParaRemover.nome}" e todos os ingredientes dela?`);
    setConfirmAction("delete-recipe");
    setConfirmData({ receitaId: receitaParaRemover.id });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const criarReceita = async () => {
    const nomeNormalizado = nomeReceita.trim();

    if (!nomeNormalizado) {
      setAlertMessage("Informe o nome da receita.");
      setAlertOpen(true);
      return;
    }

    const novaReceita = {
      id: createId(),
      nome: nomeNormalizado,
      fatias: Math.max(1, Number(novaReceitaFatias) || 10),
      data: new Date().toISOString(),
    };
    const receitaComId = novaReceita;

    setReceitas(prev => [...prev, receitaComId]);
    setReceitaSelecionadaId(receitaComId.id);
    setNomeReceita("");
    setNovaReceitaFatias("10");

    await salvarItensNoFirebase(
      [{ coll: "receitas", item: receitaComId }],
      "salvar receita no Firebase"
    );
  };

  const copiarReceita = async () => {
    if (!receitaSelecionada) return;
    const novaReceita = {
      id: createId(),
      nome: `${receitaSelecionada.nome} (Cópia)`,
      fatias: receitaSelecionada.fatias || 10,
      data: new Date().toISOString(),
    };
    const itensOriginais = receita.filter(item =>
      String(item.receitaId ?? receitaPadraoIdAtual) === String(receitaSelecionada.id)
    );
    const novosItens = itensOriginais.map(item => ({
      ...item,
      id: createId(),
      receitaId: novaReceita.id,
      receitaNome: novaReceita.nome,
      data: new Date().toISOString(),
    }));
    setReceitas(prev => [...prev, novaReceita]);
    setReceita(prev => [...prev, ...novosItens]);
    setReceitaSelecionadaId(novaReceita.id);
    await salvarItensNoFirebase(
      [
        { coll: "receitas", item: novaReceita },
        ...novosItens.map(item => ({ coll: "receita", item })),
      ],
      "copiar receita no Firebase"
    );
  };

  const vendaPagamento = Object.fromEntries(vendas.map(v => [String(v.id), v.pago || false]));

  const handleTogglePagamento = (vendaId) => {
    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;
    setVendaPagamentoConfirmacao(venda);
    setConfirmacaoPagamentoOpen(true);
  };

  const confirmarPagamento = async () => {
    const venda = vendaPagamentoConfirmacao;
    if (!venda) return;
    const novoPago = !(venda.pago || false);
    const vendaAtualizada = { ...venda, pago: novoPago };
    setVendas(prev => prev.map(v => String(v.id) === String(venda.id) ? vendaAtualizada : v));
    setConfirmacaoPagamentoOpen(false);
    setVendaPagamentoConfirmacao(null);
    await salvarItensNoFirebase(
      [{ coll: "vendas", item: vendaAtualizada }],
      "atualizar pagamento no Firebase"
    );
  };

  const salvarConfigsVendas = async () => {
    if (!precoBolo && !precoFatia && !precoTorta) {
      setAlertMessage("Configure pelo menos o preço do bolo, da fatia ou da torta.");
      setAlertOpen(true);
      return;
    }

    const configs = [
      precoBolo && { chave: "precoBolo", valor: parseNumero(precoBolo) },
      precoFatia && { chave: "precoFatia", valor: parseNumero(precoFatia) },
      precoTorta && { chave: "precoTorta", valor: parseNumero(precoTorta) },
      fatiasPerBolo && { chave: "fatiasPerBolo", valor: parseNumero(fatiasPerBolo) },
    ].filter(Boolean);

    await salvarItensNoFirebase(
      configs.map((config) => ({ coll: "config", item: config })),
      "salvar configurações no Firebase"
    );
    setShowConfigVendas(false);
    setAlertMessage("Configurações de vendas salvas!");
    setAlertOpen(true);
  };

  const limparFormularioVenda = () => {
    setVendaEditandoId(null);
    setQtdVenda("");
    setValorVenda("");
    setDescricaoOutrosVenda("");
    setAnotacaoVenda("");
    setDataVenda(formatarDataLocal());
  };

  const cancelarFormularioVenda = () => {
    setShowNovaVenda(false);
    limparFormularioVenda();
  };

  const montarDadosVenda = () => {
    if (!qtdVenda) {
      setAlertMessage("Preencha a quantidade/valor da venda.");
      setAlertOpen(true);
      return null;
    }

    let valorFinal = 0;
    let descricao = "";
    let precoAplicado = 0;
    let origemPreco = "config";
    const qtd = parseNumero(qtdVenda);
    const valorInformado = parseNumero(valorVenda);

    if (qtd <= 0) {
      setAlertMessage("Informe uma quantidade maior que zero.");
      setAlertOpen(true);
      return null;
    }

    if (tipoVenda === "fatias") {
      precoAplicado = valorInformado > 0 ? valorInformado : parseNumero(precoFatia);
      origemPreco = valorInformado > 0 ? "manual" : "config";

      if (precoAplicado > 0) {
        valorFinal = qtd * precoAplicado;
        descricao = `${qtd} ${qtd === 1 ? "fatia" : "fatias"} R$ ${precoAplicado.toFixed(2)} / fatia${origemPreco === "manual" ? " (valor informado)" : ""}`;
      } else {
        setAlertMessage("Configure o preço padrão da fatia ou informe o valor por fatia nesta venda.");
        setAlertOpen(true);
        return null;
      }
    } else if (tipoVenda === "bolo") {
      precoAplicado = valorInformado > 0 ? valorInformado : parseNumero(precoBolo);
      origemPreco = valorInformado > 0 ? "manual" : "config";

      if (precoAplicado > 0) {
        valorFinal = qtd * precoAplicado;
        descricao = `${qtd} kg R$ ${precoAplicado.toFixed(2)} / kg${origemPreco === "manual" ? " (valor informado)" : ""}`;
      } else {
        setAlertMessage("Configure o preço padrão por kg do bolo inteiro ou informe o valor por kg nesta venda.");
        setAlertOpen(true);
        return null;
      }
    } else if (tipoVenda === "torta") {
      precoAplicado = valorInformado > 0 ? valorInformado : parseNumero(precoTorta);
      origemPreco = valorInformado > 0 ? "manual" : "config";

      if (precoAplicado > 0) {
        valorFinal = qtd * precoAplicado;
        descricao = `${qtd} ${qtd === 1 ? "torta" : "tortas"} R$ ${precoAplicado.toFixed(2)} / torta${origemPreco === "manual" ? " (valor informado)" : ""}`;
      } else {
        setAlertMessage("Configure o preço padrão da torta ou informe o valor por torta nesta venda.");
        setAlertOpen(true);
        return null;
      }
    } else if (tipoVenda === "outros") {
      const descricaoLimpa = (descricaoOutrosVenda || "").trim();
      if (!descricaoLimpa) {
        setAlertMessage("Informe a descrição da venda.");
        setAlertOpen(true);
        return null;
      }
      precoAplicado = valorInformado;
      if (precoAplicado <= 0) {
        setAlertMessage("Informe o valor para esta venda.");
        setAlertOpen(true);
        return null;
      }
      valorFinal = qtd * precoAplicado;
      descricao = qtd > 1
        ? `${qtd}× ${descricaoLimpa} R$ ${precoAplicado.toFixed(2)}`
        : `${descricaoLimpa} — R$ ${precoAplicado.toFixed(2)}`;
      origemPreco = "manual";
    }

    return {
      tipo: tipoVenda,
      quantidade: qtd,
      valor: valorFinal,
      precoUnitario: precoAplicado,
      origemPreco,
      descricao,
      ...(tipoVenda === "outros" && { descricaoOutros: (descricaoOutrosVenda || "").trim() }),
      anotacao: anotacaoVenda || "",
      data: dataInputParaISO(dataVenda),
    };
  };

  const registrarVenda = async () => {
    const dadosVenda = montarDadosVenda();
    if (!dadosVenda) return;

    setDadosVendaConfirmacao(dadosVenda);
    setConfirmacaoVendaOpen(true);
  };

  const confirmarRegistroVenda = async () => {
    if (!dadosVendaConfirmacao) return;

    if (vendaEditandoId !== null) {
      const vendaAtualizada = { ...dadosVendaConfirmacao, id: vendaEditandoId };
      setVendas(prev => prev.map(v => String(v.id) === String(vendaEditandoId) ? vendaAtualizada : v));
      await salvarItensNoFirebase(
        [{ coll: "vendas", item: vendaAtualizada }],
        "atualizar venda no Firebase"
      );
    } else {
      const vendaId = createId();
      const vendaComId = { ...dadosVendaConfirmacao, id: vendaId };
      setVendas(prev => [...prev, vendaComId]);
      await salvarItensNoFirebase(
        [{ coll: "vendas", item: vendaComId }],
        "salvar venda no Firebase"
      );
    }

    limparFormularioVenda();
    setShowNovaVenda(false);
    setConfirmacaoVendaOpen(false);
    setDadosVendaConfirmacao(null);
  };

  const editarVenda = (venda) => {
    const precoUnitarioVenda = Number(venda.precoUnitario || 0) > 0
      ? Number(venda.precoUnitario)
      : Number(venda.quantidade || 0) > 0
        ? Number(venda.valor || 0) / Number(venda.quantidade)
        : 0;

    setVendaEditandoId(venda.id);
    setTipoVenda(venda.tipo || "fatias");
    setQtdVenda(String(venda.quantidade || ""));
    setValorVenda(precoUnitarioVenda > 0 ? String(precoUnitarioVenda) : "");
    setDescricaoOutrosVenda(venda.descricaoOutros || "");
    setAnotacaoVenda(venda.anotacao || "");
    setDataVenda(isoParaDataInput(venda.data));
    setShowNovaVenda(true);
  };

  const removerVenda = (vendaId) => {
    setConfirmMessage("Remover esta venda?");
    setConfirmAction("delete-sale");
    setConfirmData({ vendaId });
    setTimeout(() => setConfirmOpen(true), 0);
  };

  const atualizarIngredienteComCategoria = async (ingredienteAtualizado) => {
    const atualizou = await executarOperacaoBanco("atualizar categoria do ingrediente", () =>
      saveToFirestore("ingredientes", ingredienteAtualizado)
    );

    if (atualizou) {
      setIngredientes(prev =>
        prev.map(ing =>
          String(ing.id) === String(ingredienteAtualizado.id)
            ? ingredienteAtualizado
            : ing
        )
      );
    }
  };

  const fecharConfirmacao = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleConfirmYes = async () => {
    if (confirmAction === "delete-ingredient" && confirmData) {
      const { ingredienteId } = confirmData;
      const ingredienteRemovido = ingredientes.find((item) => String(item.id) === String(ingredienteId));

      if (!ingredienteRemovido) {
        fecharConfirmacao();
        return;
      }

      const comprasDoIngrediente = compras.filter(c => String(c.ingredienteId) === String(ingredienteId));
      const removeu = await executarOperacaoBanco("remover ingrediente no Firebase", () =>
        Promise.all([
          deleteFromFirestore("ingredientes", ingredienteId),
          ...comprasDoIngrediente.map((compra) =>
            deleteFromFirestore("compras", compra.id)
          ),
        ])
      );

      if (!removeu) {
        fecharConfirmacao();
        return;
      }

      setIngredientes(prev => prev.filter(item => String(item.id) !== String(ingredienteId)));
      setCompras(prev => prev.filter(c => String(c.ingredienteId) !== String(ingredienteId)));
      if (String(ingredienteEditandoId) === String(ingredienteId)) {
        limparFormularioIngrediente();
        setIngredienteEditandoId(null);
      }
    } else if (confirmAction === "delete-sale" && confirmData) {
      const { vendaId } = confirmData;
      const removeu = await executarOperacaoBanco("remover venda no Firebase", () =>
        deleteFromFirestore("vendas", vendaId)
      );

      if (!removeu) {
        fecharConfirmacao();
        return;
      }

      setVendas(prev => prev.filter(v => String(v.id) !== String(vendaId)));
    } else if (confirmAction === "delete-purchase" && confirmData) {
      const { compraId } = confirmData;
      const removeu = await executarOperacaoBanco("remover compra no Firebase", () =>
        deleteFromFirestore("compras", compraId)
      );

      if (!removeu) {
        fecharConfirmacao();
        return;
      }

      setCompras(prev => prev.filter(c => String(c.id) !== String(compraId)));
      if (String(compraEditandoId) === String(compraId)) {
        setCompraEditandoId(null);
        setCompraEditandoData(null);
        setCompraModalOpen(false);
      }
    } else if (confirmAction === "delete-recipe" && confirmData) {
      const { receitaId } = confirmData;
      const receitaIdComparacao = String(receitaId);
      const receitaPadraoId = receitas[0]?.id ?? receitaId;
      const itensDaReceita = receita.filter(item =>
        String(item.receitaId ?? receitaPadraoId) === receitaIdComparacao
      );
      const idsItens = new Set(itensDaReceita.map(item => String(item.id)));
      const receitasRestantes = receitas.filter(r => String(r.id) !== receitaIdComparacao);
      const receitaSelecionadaRemovida = String(receitaSelecionadaIdAtual) === receitaIdComparacao;
      const removeu = await executarOperacaoBanco("remover receita no Firebase", () =>
        Promise.all([
          deleteFromFirestore("receitas", receitaId),
          ...itensDaReceita.map((item) =>
            deleteFromFirestore("receita", item.id)
          ),
        ])
      );

      if (!removeu) {
        fecharConfirmacao();
        return;
      }

      setReceitas(receitasRestantes);
      setReceita(prev => prev.filter(item => !idsItens.has(String(item.id))));
      if (receitaSelecionadaRemovida) {
        setReceitaSelecionadaId(receitasRestantes[0]?.id ?? null);
      }
    } else if (confirmAction === "delete-outro-item" && confirmData) {
      const { outroItemId } = confirmData;
      const removeu = await executarOperacaoBanco("remover outro item no Firebase", () =>
        deleteFromFirestore("outrosItens", outroItemId)
      );

      if (!removeu) {
        fecharConfirmacao();
        return;
      }

      setOutrosItens(prev => prev.filter(item => String(item.id) !== String(outroItemId)));
      if (String(outroItemEditandoId) === String(outroItemId)) {
        limparFormularioOutroItem();
      }
    }
    fecharConfirmacao();
  };

  const receitaSelecionada = receitas.find(r => String(r.id) === String(receitaSelecionadaId)) || receitas[0] || null;
  const receitaSelecionadaIdAtual = receitaSelecionada?.id ?? null;
  const receitaPadraoIdAtual = receitas[0]?.id ?? receitaSelecionadaIdAtual;
  const itensReceitaSelecionada = receita.filter(item =>
    receitaSelecionadaIdAtual && String(item.receitaId ?? receitaPadraoIdAtual) === String(receitaSelecionadaIdAtual)
  );
  const custoTotal = receitaSelecionadaIdAtual ? calcularCustoReceita(receitaSelecionadaIdAtual) : 0;
  const vendaTotal = vendas.reduce((acc, v) => acc + v.valor, 0);
  const lucro = vendaTotal - custoTotal;
  const ticketMedio = vendas.length > 0 ? vendaTotal / vendas.length : 0;
  const fatiasReceita = Number(receitaSelecionada?.fatias) || 10;
  const precoFatiaParsed = parseNumero(precoFatia) || 0;
  const vendaPresumidaReceita = precoFatiaParsed * fatiasReceita;
  const margemLucro = vendaPresumidaReceita > 0
    ? ((vendaPresumidaReceita - custoTotal) / vendaPresumidaReceita) * 100
    : vendaTotal > 0 ? ((vendaTotal - custoTotal) / vendaTotal) * 100 : 0;
  const resumoReceitas = receitas.map((r) => {
    const itens = receita.filter(item =>
      String(item.receitaId ?? receitaPadraoIdAtual) === String(r.id)
    );
    const custo = calcularCustoReceita(r.id);
    const fatias = Number(r.fatias) || 10;
    const vendaPresumida = precoFatiaParsed * fatias;
    const margem = vendaPresumida > 0 ? ((vendaPresumida - custo) / vendaPresumida) * 100 : null;
    return {
      ...r,
      custo,
      totalItens: itens.length,
      margem,
    };
  });
  const custoCatalogoReceitas = resumoReceitas.reduce((acc, r) => acc + r.custo, 0);
  const ingredienteReceitaSelecionado = ingredientes.find(i => String(i.id) === String(ingredienteReceitaId));
  const ingredienteHistoricoSelecionadoId = ingredientes.some(i => String(i.id) === String(ingredienteHistoricoId))
    ? ingredienteHistoricoId
    : ingredientes[0]?.id ?? "";
  const unidadeOptions = [
    { value: "kg", label: "Kg", description: "Quilos" },
    { value: "un", label: "Unidade", description: "Itens unitários" },
    { value: "pacote", label: "Pacote", description: "Pacotes fechados" },
    { value: "litro", label: "Litro", description: "Líquidos" },
  ];
  const ingredientesReceitaOptions = ingredientes.map((ingrediente) => ({
    value: ingrediente.id,
    label: ingrediente.nome,
    description: labelPrecoPorUnidade(ingrediente.unidade),
  }));
  const qtdIngredienteReceitaNumero = parseNumero(qtdIngredienteReceita);
  const custoPrevistoIngredienteReceita = ingredienteReceitaSelecionado && qtdIngredienteReceitaNumero
    ? normalizarQuantidadeReceita(qtdIngredienteReceitaNumero, ingredienteReceitaSelecionado.unidade) * custoMedio(ingredienteReceitaSelecionado.id)
    : 0;
  const unidadeIngredienteReceita = ingredienteReceitaSelecionado
    ? unidadeReceita(ingredienteReceitaSelecionado.unidade)
    : "";

  const subReceitaSelecionada = receitas.find(r => String(r.id) === String(subReceitaId));
  const qtdSubReceitaNumero = Math.max(0.01, parseNumero(qtdSubReceita) || 1);
  const custoPrevistoSubReceita = subReceitaSelecionada
    ? qtdSubReceitaNumero * calcularCustoReceita(subReceitaSelecionada.id)
    : 0;
  const subReceitasOptions = receitas
    .filter(r => String(r.id) !== String(receitaSelecionadaIdAtual))
    .map(r => ({
      value: r.id,
      label: r.nome,
      description: `R$ ${calcularCustoReceita(r.id).toFixed(2)} total`,
    }));
  const custoPorFatia = fatiasReceita > 0 ? custoTotal / fatiasReceita : 0;

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);

  const gastoSemana = compras
    .filter(c => new Date(c.data) >= inicioSemana)
    .reduce((acc, c) => acc + parseNumero(c.preco), 0);

  const ganhoSemana = vendas
    .filter(v => new Date(v.data) >= inicioSemana)
    .reduce((acc, v) => acc + parseNumero(v.valor), 0);

  const isBusy = Boolean(operacaoAtual);

  return (
    <div className="app-shell min-h-screen flex flex-col text-gray-900">
      <header className="app-header text-white shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
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
        <div className="mb-5 flex flex-wrap gap-2 items-center justify-between">
          <div className="page-tabs" role="tablist" aria-label="Páginas do sistema">
            <button
              type="button"
              role="tab"
              aria-selected={paginaAtiva === "controle"}
              className={`page-tab ${paginaAtiva === "controle" ? "is-active" : ""}`}
              onClick={() => setPaginaAtiva("controle")}
            >
              Controle
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={paginaAtiva === "historico"}
              className={`page-tab ${paginaAtiva === "historico" ? "is-active" : ""}`}
              onClick={() => setPaginaAtiva("historico")}
            >
              Histórico de compras
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={paginaAtiva === "ia"}
              className={`page-tab ${paginaAtiva === "ia" ? "is-active" : ""}`}
              onClick={() => setPaginaAtiva("ia")}
            >
              ✨ Análise IA
            </button>
          </div>

          <div className="analysis-launcher" aria-label="Ferramentas de análise">
            <button
              type="button"
              onClick={() => setIngredientCategoriesOpen(true)}
              className="analysis-launch-button"
              title="Categorizar ingredientes"
            >
              📂 Categorias
            </button>
            <button
              type="button"
              onClick={() => setPriceHistoryOpen(true)}
              className="analysis-launch-button"
              title="Ver histórico de preços"
            >
              📊 Preços
            </button>
            <button
              type="button"
              onClick={() => setPeriodComparisonOpen(true)}
              className="analysis-launch-button"
              title="Comparar períodos"
            >
              📈 Comparar
            </button>
          </div>
        </div>

        {paginaAtiva === "controle" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            <div className="card ingredient-entry-card border border-rose-100/80 bg-white/95">
              <div className="ingredient-entry-card__header">
                <h2 className="font-bold text-xl text-rose-950">📦 Ingrediente</h2>
                <span>{ingredienteEditandoId !== null ? "Editando" : "Novo cadastro"}</span>
              </div>
              <div className="ingredient-form">
                <label className="ingredient-form__field ingredient-form__field--name">
                  <span>Nome</span>
                  <input
                    disabled={isBusy}
                    className="input border-2 border-rose-200 focus:border-rose-700 placeholder-gray-400"
                    placeholder="Nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                  />
                </label>

                <div className="ingredient-form__field ingredient-form__field--unit">
                  <span>Unidade</span>
                  <PrettySelect
                    value={unidade}
                    onChange={setUnidade}
                    options={unidadeOptions}
                    ariaLabel="Unidade do ingrediente"
                    disabled={isBusy}
                    buttonClassName="border-2 border-rose-200 focus:border-rose-700"
                  />
                </div>

                <div className="ingredient-form__field ingredient-form__field--price price-mode-field">
                  <span>{usePrecoPorUnidade ? labelPrecoPorUnidade(unidade) : "Valor gasto"}</span>
                  <div className="price-mode-field__control">
                    {usePrecoPorUnidade ? (
                      <input
                        disabled={isBusy}
                        type="text"
                        className="input price-mode-field__input border-2 border-rose-200 focus:border-rose-700 text-sm"
                        placeholder="R$ 0,00"
                        value={precoUnitario}
                        onChange={e => setPrecoUnitario(e.target.value)}
                      />
                    ) : (
                      <input
                        disabled={isBusy}
                        type="text"
                        className="input price-mode-field__input border-2 border-rose-200 focus:border-rose-700 text-sm"
                        placeholder="R$ 0,00"
                        value={precoCompra}
                        onChange={e => setPrecoCompra(e.target.value)}
                      />
                    )}
                    <label
                      htmlFor="usePrecoPorUnidade"
                      className={`price-mode-option ${isBusy ? "is-disabled" : ""}`}
                      title={labelPrecoPorUnidade(unidade)}
                    >
                      <span className="price-mode-option__control">
                        <input
                          disabled={isBusy}
                          id="usePrecoPorUnidade"
                          type="checkbox"Vendas Rea
                          checked={usePrecoPorUnidade}
                          onChange={e => setUsePrecoPorUnidade(e.target.checked)}
                          className="price-mode-option__input"
                        />
                        <span className="price-mode-option__track" aria-hidden="true" />
                      </span>
                      <span className="price-mode-option__copy">
                        <span>{labelTogglePreco(unidade)}</span>
                      </span>
                    </label>
                  </div>
                </div>

                <label className="ingredient-form__field ingredient-form__field--quantity">
                  <span>Quantidade</span>
                  <input
                    disabled={isBusy}
                    type="text"
                    className="input border-2 border-rose-200 focus:border-rose-700 placeholder-gray-400"
                    placeholder="Ex: 0.5"
                    value={qtdCompra}
                    onChange={e => setQtdCompra(e.target.value)}
                  />
                </label>

                <button disabled={isBusy} onClick={salvarIngrediente} className="btn btn-primary ingredient-form__submit">
                  {ingredienteEditandoId !== null ? "✓ Atualizar" : "+ Adicionar"}
                </button>
              </div>
            </div>

            <div className="card border border-rose-200/80 bg-white/95">
              <h2 className="font-bold text-xl mb-4 text-rose-950">🥄 Ingredientes</h2>
              {ingredientes.length > 0 && (
                <div className="mb-4">
                  <input
                    type="text"
                    className="input border-2 border-rose-200 focus:border-rose-700"
                    placeholder="🔍 Buscar ingrediente..."
                    value={buscaIngredientes}
                    onChange={e => setBuscaIngredientes(e.target.value)}
                    disabled={isBusy}
                  />
                </div>
              )}
              {ingredientes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum ingrediente cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {ingredientes
                    .filter((i) => {
                      const busca = buscaIngredientes.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      const nome = (i.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      return nome.includes(busca);
                    })
                    .map((i) => {
                    const custo = custoMedio(i.id);
                    const isPeso = i.unidade === "kg" || i.unidade === "g";
                    const displayCusto = i.unidade === "g" ? custo * 1000 : custo;
                    const displayUnidade = isPeso ? "kg" : i.unidade;

                    return (
                      <div key={`ing-${i.id}`} className="flex flex-col sm:flex-row sm:justify-between gap-3 border-b border-rose-100 py-4 last:border-b-0 items-stretch sm:items-start hover:bg-rose-50 px-3 rounded-lg transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 break-words">{i.nome}</p>
                          <p className="text-xs text-gray-500 mt-1 break-words">📊 Custo: R$ <span className="font-semibold text-rose-900">{displayCusto.toFixed(2)}</span> / {displayUnidade}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:ml-4 shrink-0">
                          <button disabled={isBusy} onClick={() => registrarCompra(i)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-700 font-semibold text-xs rounded-md" aria-label={`Registrar compra de ${i.nome}`}><FaPlus size={18} color="#059669"/></button>
                          <button disabled={isBusy} onClick={() => removerIngrediente(i)} className="small-btn bg-red-100 text-red-700 font-semibold text-xs rounded-md" aria-label={`Remover ${i.nome}`}><FaTrash size={18} color="#dc2626"/></button>
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
                  <p className="text-xs text-gray-500 mt-1">Selecione uma receita e adicione os ingredientes usados na ficha.</p>
                </div>
                <p className="text-sm font-bold text-rose-900 shrink-0">Custo: R$ {custoTotal.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 mb-4">
                <input disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700" placeholder="Nome da receita" value={nomeReceita} onChange={e => setNomeReceita(e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Fatias</label>
                  <input
                    disabled={isBusy}
                    type="number"
                    min="1"
                    className="input border-2 border-rose-200 focus:border-rose-700 w-20 text-center"
                    placeholder="10"
                    value={novaReceitaFatias}
                    onChange={e => setNovaReceitaFatias(e.target.value)}
                  />
                </div>
                <button disabled={isBusy} onClick={criarReceita} className="btn btn-primary self-end">+ Receita</button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {receitas.map((r) => {
                  const selecionada = String(r.id) === String(receitaSelecionadaIdAtual);
                  const editando = String(r.id) === String(editandoNomeReceitaId);

                  if (editando) {
                    return (
                      <input
                        key={`edit-${r.id}`}
                        autoFocus
                        disabled={isBusy}
                        className="small-btn shrink-0 bg-white border-2 border-rose-700 text-rose-950 font-semibold rounded-md px-2 py-1 text-sm focus:outline-none min-w-[100px]"
                        value={editandoNomeReceitaValor}
                        onChange={e => setEditandoNomeReceitaValor(e.target.value)}
                        onBlur={salvarEdicaoNomeReceita}
                        onKeyDown={e => {
                          if (e.key === "Enter") salvarEdicaoNomeReceita();
                          if (e.key === "Escape") setEditandoNomeReceitaId(null);
                        }}
                      />
                    );
                  }

                  return (
                    <button
                      key={`receita-${r.id}`}
                      type="button"
                      disabled={isBusy}
                      onClick={() => setReceitaSelecionadaId(r.id)}
                      onDoubleClick={() => {
                        setEditandoNomeReceitaId(r.id);
                        setEditandoNomeReceitaValor(r.nome);
                      }}
                      title="Clique duplo para renomear"
                      className={`small-btn shrink-0 ${selecionada ? "bg-rose-900 text-white hover:bg-rose-950" : "bg-rose-100 text-rose-900 hover:bg-rose-200"}`}
                    >
                      {r.nome}
                    </button>
                  );
                })}
              </div>

              {receitaSelecionada && (
                <div className="border border-rose-100 bg-rose-50/70 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-rose-950">Adicionar em {receitaSelecionada.nome}</h4>
                      <p className="text-xs text-gray-500 mt-1">O custo usa o custo médio atual do ingrediente.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1 border border-rose-100">
                        <span className="text-xs text-gray-500">Fatias:</span>
                        <input
                          type="number"
                          min="1"
                          disabled={isBusy}
                          className="w-12 text-xs font-bold text-rose-900 text-center border-0 bg-transparent p-0 focus:outline-none focus:ring-0"
                          key={receitaSelecionada.id}
                          defaultValue={Number(receitaSelecionada.fatias) || 10}
                          onBlur={e => atualizarFatiasReceita(e.target.value)}
                        />
                      </div>
                      <span className="text-xs font-bold text-rose-900 bg-white rounded-md px-2 py-1 border border-rose-100 w-fit">
                        Total: R$ {custoTotal.toFixed(2)}
                      </span>
                      <span className="text-xs text-rose-700 bg-rose-50 rounded-md px-2 py-1 border border-rose-100 w-fit">
                        R$ {custoPorFatia.toFixed(2)} / fatia
                      </span>
                      {vendaPresumidaReceita > 0 && (
                        <span className={`text-xs font-bold rounded-md px-2 py-1 border w-fit ${margemLucro >= 0 ? "text-green-700 bg-green-50 border-green-100" : "text-red-700 bg-red-50 border-red-100"}`}>
                          Margem: {margemLucro.toFixed(1)}%
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={copiarReceita}
                        className="small-btn bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold text-xs rounded-md"
                        aria-label={`Copiar receita ${receitaSelecionada.nome}`}
                      >
                        📋 Copiar
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => removerReceita(receitaSelecionada)}
                        className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold text-xs rounded-md"
                        aria-label={`Excluir receita ${receitaSelecionada.nome}`}
                      >
                        🗑️ Receita
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto] gap-3 items-end">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Ingrediente</label>
                      <PrettySelect
                        disabled={isBusy}
                        value={ingredienteReceitaId}
                        onChange={setIngredienteReceitaId}
                        options={ingredientesReceitaOptions}
                        placeholder="Selecione"
                        emptyMessage="Nenhum ingrediente cadastrado"
                        ariaLabel="Ingrediente da receita"
                        buttonClassName="border-2 border-rose-200 focus:border-rose-700"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Quantidade {unidadeIngredienteReceita ? `(${unidadeIngredienteReceita})` : ""}
                      </label>
                      <input
                        type="text"
                        disabled={isBusy}
                        className="input border-2 border-rose-200 focus:border-rose-700"
                        placeholder="Ex: 0.5"
                        value={qtdIngredienteReceita}
                        onChange={e => setQtdIngredienteReceita(e.target.value)}
                      />
                    </div>

                    <div className="min-h-[2.75rem] rounded-lg border border-rose-100 bg-white px-3 py-2 flex flex-col justify-center">
                      <span className="text-[11px] font-semibold text-gray-500">Custo previsto</span>
                      <span className="text-sm font-bold text-rose-950">R$ {custoPrevistoIngredienteReceita.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={adicionarIngredienteReceitaSelecionada}
                      className="btn btn-primary md:min-w-36"
                    >
                      + Ingrediente
                    </button>
                  </div>

                  {receitas.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-rose-100">
                      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto] gap-3 items-end">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Sub-receita</label>
                          <PrettySelect
                            disabled={isBusy}
                            value={subReceitaId}
                            onChange={setSubReceitaId}
                            options={subReceitasOptions}
                            placeholder="Selecione uma receita"
                            emptyMessage="Nenhuma outra receita cadastrada"
                            ariaLabel="Sub-receita"
                            buttonClassName="border-2 border-rose-200 focus:border-rose-700"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Quantidade (padrão: 1)</label>
                          <input
                            type="text"
                            disabled={isBusy}
                            className="input border-2 border-rose-200 focus:border-rose-700"
                            placeholder="1"
                            value={qtdSubReceita}
                            onChange={e => setQtdSubReceita(e.target.value)}
                          />
                        </div>

                        <div className="min-h-[2.75rem] rounded-lg border border-rose-100 bg-white px-3 py-2 flex flex-col justify-center">
                          <span className="text-[11px] font-semibold text-gray-500">Custo previsto</span>
                          <span className="text-sm font-bold text-rose-950">R$ {custoPrevistoSubReceita.toFixed(2)}</span>
                        </div>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={adicionarSubReceitaNaReceita}
                          className="btn btn-primary md:min-w-36"
                        >
                          + Sub-receita
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {itensReceitaSelecionada.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {receitaSelecionada ? `Sem itens em ${receitaSelecionada.nome}` : "Crie uma receita para começar"}
                </p>
              ) : (
                <div className="space-y-2">
                  {itensReceitaSelecionada.map((r) => {
                    const isOutroItem = r.tipo === "outro";
                    const isSubReceita = r.tipo === "sub-receita";
                    const custoItem = calcularCustoItemReceita(r);
                    const ingredienteAtual = ingredientes.find(i => String(i.id) === String(r.ingredienteId));
                    const custoUnitarioAtual = ingredienteAtual ? custoMedio(ingredienteAtual.id) : r.custoUnitario;
                    const unidadeItem = r.unidade || "un";
                    const quantidadeItem = Number(r.qtd || (isOutroItem ? 1 : 0));

                    return (
                      <div key={`rec-${r.id}`} className="border-b border-rose-100 pb-3 last:border-b-0 hover:bg-rose-50 p-3 rounded-lg transition flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 justify-between items-stretch sm:items-center lg:items-stretch xl:items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 break-words">
                            {isSubReceita && <span className="mr-1">🧁</span>}{r.nome}
                            {isSubReceita && <span className="ml-1.5 text-xs font-normal text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">sub-receita</span>}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 break-words">
                            {isSubReceita
                              ? <>{Number(r.qtd) === 1 ? "Receita completa" : `${Number(r.qtd).toFixed(2)}× receita`}</>
                              : isOutroItem ? "Outro item" : `${r.qtd} ${unidadeItem}`
                            }
                            {" "}• Custo: <span className="font-semibold text-rose-900">R$ {custoItem.toFixed(2)}</span>
                            {!isSubReceita && custoUnitarioAtual > 0 && <span> • Base R$ {Number(custoUnitarioAtual).toFixed(2)} / {unidadeItem}</span>}
                            {isOutroItem && quantidadeItem > 1 && <span> • {quantidadeItem} un</span>}
                          </p>
                        </div>
                        <button disabled={isBusy} onClick={() => removerDaReceita(r.id)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md self-start sm:self-center lg:self-start xl:self-center" aria-label={`Remover ${r.nome} da receita`}>🗑️</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div ref={outroItemFormRef} className="card other-items-card border border-rose-200/80 bg-white/95">
              <div className="ingredient-entry-card__header">
                <h2 className="font-bold text-xl text-rose-950">🧾 Outros itens</h2>
                <span>{outroItemEditandoId !== null ? "Editando" : "Novo cadastro"}</span>
              </div>
              <div className="ingredient-form">
                <label className="ingredient-form__field ingredient-form__field--name">
                  <span>Nome</span>
                  <input
                    disabled={isBusy}
                    className="input border-2 border-rose-200 focus:border-rose-700 placeholder-gray-400"
                    placeholder="Ex: embalagem, decoração"
                    value={nomeOutroItem}
                    onChange={e => setNomeOutroItem(e.target.value)}
                  />
                </label>

                <label className="ingredient-form__field ingredient-form__field--price">
                  <span>Valor unitário</span>
                  <input
                    disabled={isBusy}
                    type="text"
                    className="input border-2 border-rose-200 focus:border-rose-700 text-sm"
                    placeholder="R$ 0,00"
                    value={valorOutroItem}
                    onChange={e => setValorOutroItem(e.target.value)}
                  />
                </label>

                <label className="ingredient-form__field ingredient-form__field--quantity">
                  <span>Quantidade</span>
                  <input
                    disabled={isBusy}
                    type="text"
                    className="input border-2 border-rose-200 focus:border-rose-700 placeholder-gray-400"
                    placeholder="Ex: 100"
                    value={qtdOutroItem}
                    onChange={e => setQtdOutroItem(e.target.value)}
                  />
                </label>

                <button disabled={isBusy} onClick={salvarOutroItem} className="btn btn-primary ingredient-form__submit">
                  {outroItemEditandoId !== null ? "✓ Atualizar" : "+ Adicionar"}
                </button>
                {outroItemEditandoId !== null && (
                  <button disabled={isBusy} onClick={limparFormularioOutroItem} className="btn btn-secondary ingredient-form__submit">
                    Cancelar
                  </button>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg text-rose-950 mb-4">Catálogo de Outros Itens</h3>
                {outrosItens.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Nenhum outro item cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {outrosItens.map((item) => (
                      <div key={`outro-item-${item.id}`} className="flex flex-col sm:flex-row sm:justify-between gap-3 border-b border-rose-100 py-4 last:border-b-0 items-stretch sm:items-start hover:bg-rose-50 px-3 rounded-lg transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 break-words">{item.nome}</p>
                          <p className="text-xs text-gray-500 mt-1 break-words">💰 Valor: R$ <span className="font-semibold text-rose-900">{Number(item.valor).toFixed(2)}</span> / un • Qtd: <span className="font-semibold text-rose-900">{Number(item.quantidade || 1)}</span> un</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:ml-4 shrink-0">
                          <button disabled={isBusy} onClick={() => adicionarOutroItemNaReceita(item)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold text-xs rounded-md" aria-label={`Usar ${item.nome} na receita`}>✅</button>
                          <button disabled={isBusy} onClick={() => editarOutroItem(item)} className="small-btn bg-rose-100 text-rose-900 hover:bg-rose-200 font-semibold text-xs rounded-md" aria-label={`Editar ${item.nome}`}>✏️</button>
                          <button disabled={isBusy} onClick={() => removerOutroItem(item)} className="small-btn bg-red-100 text-red-700 hover:bg-red-200 font-semibold text-xs rounded-md" aria-label={`Remover ${item.nome}`}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-5 lg:space-y-6">
            <FinancialSummary
              receitaSelecionada={receitaSelecionada}
              custoTotal={custoTotal}
              vendaTotal={vendaTotal}
              ticketMedio={ticketMedio}
              margemLucro={margemLucro}
              lucro={lucro}
              resumoReceitas={resumoReceitas}
              custoCatalogoReceitas={custoCatalogoReceitas}
              receitaSelecionadaIdAtual={receitaSelecionadaIdAtual}
              setReceitaSelecionadaId={setReceitaSelecionadaId}
              gastoSemana={gastoSemana}
              ganhoSemana={ganhoSemana}
              isBusy={isBusy}
            />

            <SalesPanel
              showConfigVendas={showConfigVendas}
              setShowConfigVendas={setShowConfigVendas}
              precoBolo={precoBolo}
              setPrecoBolo={setPrecoBolo}
              precoFatia={precoFatia}
              setPrecoFatia={setPrecoFatia}
              precoTorta={precoTorta}
              setPrecoTorta={setPrecoTorta}
              fatiasPerBolo={fatiasPerBolo}
              setFatiasPerBolo={setFatiasPerBolo}
              onSalvarConfigsVendas={salvarConfigsVendas}
              showNovaVenda={showNovaVenda}
              setShowNovaVenda={setShowNovaVenda}
              tipoVenda={tipoVenda}
              setTipoVenda={setTipoVenda}
              qtdVenda={qtdVenda}
              setQtdVenda={setQtdVenda}
              valorVenda={valorVenda}
              setValorVenda={setValorVenda}
              anotacaoVenda={anotacaoVenda}
              setAnotacaoVenda={setAnotacaoVenda}
              descricaoOutrosVenda={descricaoOutrosVenda}
              setDescricaoOutrosVenda={setDescricaoOutrosVenda}
              dataVenda={dataVenda}
              setDataVenda={setDataVenda}
              vendaEditandoId={vendaEditandoId}
              onSubmitVenda={registrarVenda}
              onCancelVenda={cancelarFormularioVenda}
              vendas={vendas}
              vendaPagamento={vendaPagamento}
              onTogglePagamento={handleTogglePagamento}
              onEditarVenda={editarVenda}
              onRemoverVenda={removerVenda}
              isBusy={isBusy}
            />

          </aside>
        </div>
        ) : paginaAtiva === "historico" ? (
          <PurchaseHistory
            ingredientes={ingredientes}
            compras={compras}
            ingredienteSelecionadoId={ingredienteHistoricoSelecionadoId}
            onSelectIngrediente={setIngredienteHistoricoId}
            onEditarCompra={abrirModalEditarCompra}
            onDeletarCompra={deletarCompra}
            dataInicio={filtroDataInicioCompras}
            dataFim={filtroDataFimCompras}
            onDataInicioChange={setFiltroDataInicioCompras}
            onDataFimChange={setFiltroDataFimCompras}
          />
        ) : (
          <AiAssistantScreen
            vendas={vendas}
            custoPorFatia={custoPorFatia}
            custoTotalReceita={custoTotal}
          />
        )}
      </main>
      <Modal isOpen={compraModalOpen} onClose={fecharModalCompra} title={compraModalIngrediente ? `💳 ${compraEditandoId ? 'Editar' : 'Registrar'} compra — ${compraModalIngrediente.nome}` : 'Registrar compra'}>
        <div className="space-y-4">
          {compraModalAviso && (
            <p className="text-sm font-semibold text-rose-900 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {compraModalAviso}
            </p>
          )}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Data da compra</label>
            <input 
              disabled={isBusy} 
              type="date"
              className="input border-2 border-rose-200 focus:border-rose-700 w-full" 
              value={compraModalData} 
              onChange={e => setCompraModalData(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">{labelPrecoPorUnidade(compraModalIngrediente?.unidade)} (opcional)</label>
            <input disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700" value={compraModalPrecoUnit} onChange={e => setCompraModalPrecoUnit(e.target.value)} placeholder={`R$ / ${compraModalIngrediente?.unidade === 'kg' || compraModalIngrediente?.unidade === 'g' ? 'kg' : compraModalIngrediente?.unidade || 'unidade'}`} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade ({compraModalIngrediente?.unidade || ''})</label>
            <input disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700" value={compraModalQtd} onChange={e => setCompraModalQtd(e.target.value)} placeholder={compraModalIngrediente?.unidade === 'g' ? 'ex: 0.5 = 500g' : ''} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Valor total (opcional)</label>
            <input disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700" value={compraModalPrecoTotal} onChange={e => setCompraModalPrecoTotal(e.target.value)} placeholder="Valor total pago" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button disabled={isBusy} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={fecharModalCompra}>Cancelar</button>
            <button disabled={isBusy} className="btn btn-primary" onClick={registrarCompraExec}>✅ {compraEditandoId ? 'Atualizar' : 'Salvar'} compra</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={usarModalOpen} onClose={() => setUsarModalOpen(false)} title={usarModalIngrediente ? `✅ Usar — ${usarModalIngrediente.nome} em ${receitaSelecionada?.nome || "receita"}` : 'Usar ingrediente'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade ({usarModalIngrediente?.unidade || ''})</label>
            <input disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700" value={usarModalQtd} onChange={e => setUsarModalQtd(e.target.value)} placeholder={usarModalIngrediente?.unidade === 'g' ? 'ex: 0.5 = 500g' : ''} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button disabled={isBusy} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setUsarModalOpen(false)}>Cancelar</button>
            <button disabled={isBusy} className="btn btn-primary" onClick={adicionarNaReceitaExec}>✅ Adicionar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={usarOutroItemModalOpen} onClose={() => setUsarOutroItemModalOpen(false)} title={usarOutroItemModal ? `✅ Usar — ${usarOutroItemModal.nome} em ${receitaSelecionada?.nome || "receita"}` : 'Usar outro item'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Quantidade (un)</label>
            <input disabled={isBusy} className="input border-2 border-rose-200 focus:border-rose-700" value={usarOutroItemQtd} onChange={e => setUsarOutroItemQtd(e.target.value)} placeholder="1" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor unitário: R$ {usarOutroItemModal ? Number(usarOutroItemModal.valor).toFixed(2) : '0.00'}</p>
            <p className="text-sm font-bold text-rose-900">Custo total: R$ {usarOutroItemModal ? (parseNumero(usarOutroItemQtd) * Number(usarOutroItemModal.valor)).toFixed(2) : '0.00'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button disabled={isBusy} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setUsarOutroItemModalOpen(false)}>Cancelar</button>
            <button disabled={isBusy} className="btn btn-primary" onClick={adicionarOutroItemNaReceitaExec}>✅ Adicionar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmacaoVendaOpen} onClose={() => setConfirmacaoVendaOpen(false)} title="✅ Confirmar Venda">
        {dadosVendaConfirmacao && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
              <p className="text-sm text-gray-600 mb-2">Resumo da venda:</p>
              <p className="font-bold text-lg text-rose-950">{dadosVendaConfirmacao.descricao}</p>
              <div className="mt-3 space-y-1">
                <p className="text-sm"><strong>Data:</strong> {formatarDataBR(dadosVendaConfirmacao.data)}</p>
                <p className="text-sm"><strong>Valor:</strong> <span className="text-rose-900 font-bold">{formatarMoeda(dadosVendaConfirmacao.valor)}</span></p>
                {dadosVendaConfirmacao.anotacao && <p className="text-sm"><strong>Anotação:</strong> {dadosVendaConfirmacao.anotacao}</p>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
              <button disabled={isBusy} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setConfirmacaoVendaOpen(false)}>Cancelar</button>
              <button disabled={isBusy} className="btn btn-primary" onClick={confirmarRegistroVenda}>✓ Confirmar Venda</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={confirmacaoPagamentoOpen} onClose={() => setConfirmacaoPagamentoOpen(false)} title="💳 Confirmar Pagamento">
        {vendaPagamentoConfirmacao && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
              <p className="text-sm text-gray-600 mb-2">
                {vendaPagamentoConfirmacao.pago ? "Desmarcar este pagamento?" : "Confirmar recebimento do pagamento?"}
              </p>
              <p className="font-bold text-rose-950">{vendaPagamentoConfirmacao.descricao}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm"><strong>Data:</strong> {formatarDataBR(vendaPagamentoConfirmacao.data)}</p>
                <p className="text-sm"><strong>Valor:</strong> <span className="text-rose-900 font-bold">{formatarMoeda(vendaPagamentoConfirmacao.valor)}</span></p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
              <button disabled={isBusy} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setConfirmacaoPagamentoOpen(false)}>Cancelar</button>
              <button disabled={isBusy} className="btn btn-primary" onClick={confirmarPagamento}>
                {vendaPagamentoConfirmacao.pago ? "Desmarcar" : "✓ Confirmar Pago"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={confirmOpen} onClose={fecharConfirmacao} title="⚠️ Confirmação">
        <div className="space-y-4">
          <p className="text-gray-700 font-medium text-lg">{confirmMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button disabled={isBusy} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={fecharConfirmacao}>Não</button>
            <button disabled={isBusy} className="btn bg-red-500 text-white hover:bg-red-600" onClick={handleConfirmYes}>Sim, excluir</button>
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

      {priceHistoryOpen && (
        <PriceHistory
          ingredientes={ingredientes}
          compras={compras}
          isOpen={priceHistoryOpen}
          onClose={() => setPriceHistoryOpen(false)}
        />
      )}

      {periodComparisonOpen && (
        <PeriodComparison
          vendas={vendas}
          compras={compras}
          isOpen={periodComparisonOpen}
          onClose={() => setPeriodComparisonOpen(false)}
        />
      )}

      {ingredientCategoriesOpen && (
        <IngredientCategories
          ingredientes={ingredientes}
          onUpdateIngrediente={atualizarIngredienteComCategoria}
          isOpen={ingredientCategoriesOpen}
          onClose={() => setIngredientCategoriesOpen(false)}
        />
      )}

      <footer className="app-footer bg-white/85 border-t border-pink-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-rose-950 font-bold">🎂 Feito com ❤️ para minha confeiteira predileta!</p>
          <p className="text-xs text-gray-600 mt-1">Sistema de Controle de Custos • v1.0</p>
        </div>
      </footer>
    </div>
  );
}
