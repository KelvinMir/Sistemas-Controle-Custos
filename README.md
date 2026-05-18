# Solary Cacau - Sistema de Controle de Custos

Sistema web em React para controlar custos, receitas e vendas de uma confeitaria. A aplicacao calcula custo medio dos ingredientes, custo das receitas, vendas realizadas, lucro estimado e indicadores semanais.

## Funcionalidades

- Cadastro, edicao e exclusao de ingredientes.
- Registro de compras por ingrediente, com atualizacao do custo medio.
- Criacao e exclusao de receitas.
- Adicao e remocao de ingredientes em receitas.
- Configuracao de preco por kg, preco por fatia e fatias por bolo.
- Cadastro, edicao e exclusao de vendas.
- Resumo financeiro com vendas, lucro, ticket medio, margem estimada e resultados da semana.
- Persistencia em nuvem com Firebase Firestore.
- Atualizacao em tempo real entre dispositivos conectados.

## Persistencia e sincronizacao

O Firestore e a fonte unica de verdade do sistema. A aplicacao carrega os dados do Firebase, mantem uma copia em memoria enquanto a tela esta aberta e grava cada alteracao diretamente no documento afetado:

- adicionar/atualizar usa `setDoc` no documento afetado;
- excluir usa `deleteDoc` no documento afetado;
- listeners em tempo real atualizam a interface quando o banco muda.

O app tambem usa o cache persistente nativo do Firestore configurado em `firebase.js`, sem banco local proprio.

## Tecnologias

- React
- Vite
- Tailwind CSS
- Firebase Auth anonimo
- Firebase Firestore

## Como executar

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite, por exemplo:

```text
http://localhost:5173/Sistemas-Controle-Custos/
```

## Build

```bash
npm run build
```

## Estrutura principal

```text
src/
  App.jsx
  db.js
  firebase.js
  components/
    FinancialSummary.jsx
    Modal.jsx
    SalesPanel.jsx
  utils/
    dates.js
    numbers.js
```

## Observacoes

As regras do Firestore permitem leitura e escrita apenas para usuarios autenticados. O app usa login anonimo para habilitar a sincronizacao sem tela de cadastro.

Autor: Kelvin Rodrigues de Miranda
