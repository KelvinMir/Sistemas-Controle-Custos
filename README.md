🎂 Sistema de Controle de Custos para Confeitaria

Sistema web desenvolvido para auxiliar no controle de custos de produção de bolos confeitados, considerando a variação de preços dos ingredientes ao longo do tempo.

Este repositório foi reorganizado como um projeto React usando Vite. Arquivos principais:
- [src/App.jsx](src/App.jsx)
- [src/main.jsx](src/main.jsx)
- [index.html](index.html)
- [package.json](package.json)

Instalação e execução (local):

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (ex.: http://localhost:5173).

📌 Sobre o projeto

Este projeto foi criado com o objetivo de resolver um problema real:
o custo dos insumos varia a cada compra, enquanto o preço de venda do produto permanece fixo.

A aplicação permite registrar compras de ingredientes, calcular automaticamente o custo médio de cada item e determinar o custo total de uma receita, além do lucro obtido.

🚀 Funcionalidades
	Cadastro de ingredientes com unidade de medida
	Registro de compras com valores variáveis
	Cálculo de custo médio ponderado
	Montagem de receitas com base no consumo de ingredientes
	Cálculo automático de:
	Custo total do bolo
	Lucro por venda
	Controle financeiro semanal:
	Total gasto
	Ganho estimado

🧠 Conceitos aplicados
	Custo médio ponderado
	Gestão de insumos
	Modelagem de dados
	Manipulação de estado no React
	Persistência com LocalStorage

🛠️ Tecnologias utilizadas
	React
	Tailwind CSS
	JavaScript (ES6+)
	LocalStorage
📂 Estrutura do projeto
	src/
	 ├── App.jsx
	 ├── components/
	 ├── styles/

▶️ Como executar o projeto
	# Clone o repositório
	git clone https://github.com/seu-usuario/seu-repo
	
	# Acesse a pasta
	cd seu-repo
	
	# Instale as dependências
	npm install
	
	# Execute o projeto
	npm run dev

📊 Exemplo de uso
	Cadastre um ingrediente (ex: farinha, açúcar, leite)
	Informe o valor pago e a quantidade comprada
	Registre novas compras conforme os preços variam
	Monte uma receita informando o consumo de cada item
	Defina o preço de venda
	Visualize automaticamente:
	custo do bolo
	lucro
	desempenho semanal
🎯 Objetivo

	Este projeto foi desenvolvido com foco em:
	
	Prática de desenvolvimento front-end
	Aplicação de regras de negócio reais
	Construção de um sistema com valor prático
	Composição de portfólio profissional
	
📌 Melhorias futuras
	Interface com modais (substituir prompts)
	Dashboard com gráficos
	Controle de estoque
	Sistema de vendas
	Backend com API e banco de dados
	Autenticação de usuários
	
👨‍💻 Autor

Kelvin Rodrigues de Miranda
React/React Native Developer
