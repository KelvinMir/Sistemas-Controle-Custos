# Relatório de Projeto de Extensão Universitária

## Análise de Dados aplicada à gestão financeira e operacional de uma confeitaria artesanal por meio do sistema web Solary Cacau

**Disciplina:** Análise de Dados  
**Área do projeto:** Gestão de pequenos negócios, análise de dados e desenvolvimento de sistemas  
**Empresa participante:** Confeitaria artesanal Solary Cacau  
**Local:** Teresina - PI  
**Produto tecnológico desenvolvido:** Sistema web Solary Cacau - Controle de Custos e Receitas  
**Link do sistema:** <https://kelvinmir.github.io/Sistemas-Controle-Custos/>  
**Ano:** 2026

---

## Resumo

Este relatório apresenta o desenvolvimento e a aplicação de um projeto de extensão universitária vinculado à disciplina de Análise de Dados, realizado em parceria com uma microempreendedora do ramo alimentício, proprietária de uma confeitaria artesanal localizada em Teresina - PI. O diagnóstico inicial evidenciou dificuldades relacionadas ao controle financeiro informal, registro disperso de vendas, ausência de padronização no cálculo de custos de produção, fragilidade na precificação, acompanhamento limitado de compras e insumos, além da inexistência de indicadores para apoiar decisões gerenciais.

Como resposta ao problema identificado, foi desenvolvido o sistema web Solary Cacau, uma ferramenta digital própria para organizar dados de ingredientes, compras, receitas, outros itens de produção, vendas, pagamentos, custos, margens, histórico de preços e comparações periódicas. A solução foi implementada com React, Vite, Tailwind CSS e Firebase Firestore, permitindo persistência em nuvem, sincronização em tempo real e uso em diferentes dispositivos conectados. O projeto aplicou conceitos de coleta, limpeza, estruturação, transformação, análise descritiva, indicadores de desempenho e visualização de dados, aproximando a teoria da disciplina das necessidades concretas de um pequeno negócio.

Os resultados apresentados neste relatório incluem indicadores quantitativos simulados para fins acadêmicos, demonstrando redução do tempo de apuração financeira, centralização dos registros, maior confiabilidade no cálculo de custos, acompanhamento de faturamento, identificação de variações de preços de insumos e melhoria na capacidade de tomada de decisão. O sistema web constitui o principal produto tecnológico do projeto e representa uma contribuição prática para a transformação digital de microempreendimentos alimentícios.

**Palavras-chave:** Análise de Dados. Gestão Financeira. Confeitaria Artesanal. Microempreendedorismo. Sistema Web. Tomada de Decisão.

---

## Nota metodológica sobre os dados simulados

As tabelas financeiras, dashboards e indicadores quantitativos apresentados neste relatório foram elaborados como exemplos realistas e simulados, com finalidade acadêmica e demonstrativa. Eles representam uma situação plausível para uma confeitaria artesanal em período piloto de utilização do sistema, mas devem ser substituídos por dados reais exportados ou observados diretamente no sistema quando houver consolidação histórica suficiente.

O período simulado adotado para exemplificação foi de **01/05/2026 a 31/05/2026**, com comparações entre uma situação anterior ao sistema, baseada em registros manuais, e uma situação posterior, baseada no uso do Solary Cacau.

---

# 1. Introdução

A análise de dados tornou-se uma prática essencial para a gestão de pequenos negócios, especialmente em contextos nos quais os recursos financeiros, humanos e tecnológicos são limitados. Em microempreendimentos, como confeitarias artesanais, a tomada de decisão frequentemente depende da experiência prática do proprietário, da memória operacional e de registros informais mantidos em cadernos, mensagens de aplicativos e anotações dispersas. Embora esses meios sejam comuns na rotina empreendedora, eles dificultam a mensuração precisa de custos, receitas, margem de lucro, desempenho de vendas e variação de preços de insumos.

No ramo alimentício artesanal, a necessidade de controle é ainda mais evidente, pois os custos de produção são influenciados por fatores como oscilação no preço de ingredientes, quantidade utilizada por receita, desperdícios, embalagens, decorações, taxas, formas de pagamento e sazonalidade da demanda. Um bolo, uma torta ou uma fatia vendida sem cálculo adequado pode gerar faturamento aparente, mas margem insuficiente para sustentar a atividade econômica.

Nesse contexto, o presente projeto de extensão foi desenvolvido junto a uma microempreendedora de Teresina - PI, proprietária da confeitaria artesanal Solary Cacau. A iniciativa teve como objetivo aplicar conhecimentos da disciplina de Análise de Dados para diagnosticar problemas de gestão, organizar informações essenciais e desenvolver um sistema web específico para apoiar o controle financeiro e operacional do negócio.

O principal produto tecnológico resultante do projeto foi o sistema web **Solary Cacau - Controle de Custos e Receitas**, disponível no link <https://kelvinmir.github.io/Sistemas-Controle-Custos/>. A aplicação foi criada para permitir o cadastro de ingredientes, registro de compras, cálculo de custo médio, elaboração de receitas, registro de vendas, acompanhamento de pagamentos, visualização de resumo financeiro, histórico de preços, categorização de ingredientes e comparação de períodos.

Assim, o projeto não se limitou a informatizar registros existentes. Seu foco foi transformar dados operacionais em informações gerenciais, permitindo que a empreendedora pudesse compreender melhor o comportamento financeiro da confeitaria e tomar decisões baseadas em evidências.

---

# 2. Caracterização da empresa participante

A empresa participante do projeto é uma confeitaria artesanal localizada em Teresina - PI, conduzida por uma microempreendedora que atua na produção e comercialização de produtos alimentícios sob encomenda e venda direta. Para fins deste relatório, considera-se a identificação operacional utilizada no sistema desenvolvido: **Solary Cacau**.

A confeitaria trabalha com produtos como bolos inteiros, fatias, tortas e itens complementares relacionados a embalagens, decorações e personalizações. A atividade tem características típicas de microempreendimentos familiares ou individuais: atendimento próximo ao cliente, produção sob demanda, baixa formalização de processos internos, acumulação de funções pela empreendedora e dependência de controles simples para registrar entradas e saídas financeiras.

Antes da intervenção, a gestão era realizada de maneira predominantemente manual. As informações sobre vendas, encomendas, compras de ingredientes, preços pagos e observações de clientes eram registradas em cadernos, conversas de WhatsApp e anotações avulsas. Essa forma de controle atendia parcialmente a rotina imediata, mas não fornecia dados estruturados para análises históricas, cálculo de lucratividade ou planejamento de compras.

As principais características observadas foram:

- Negócio de pequeno porte, com gestão centralizada na empreendedora.
- Produção artesanal, com variação de receitas, tamanhos e itens adicionais.
- Vendas por diferentes formatos: fatias, bolos inteiros, tortas e outros itens.
- Compras frequentes de insumos, com oscilação de preços.
- Necessidade de calcular custo por receita e preço de venda.
- Ausência de sistema integrado antes do projeto.
- Dependência de registros manuais e memória operacional.
- Potencial de melhoria por meio da organização digital dos dados.

O projeto foi adequado a essa realidade, priorizando uma ferramenta simples, objetiva e alinhada ao fluxo de trabalho da confeitaria.

---

# 3. Contextualização do problema

O diagnóstico inicial identificou que a confeitaria enfrentava dificuldades comuns a pequenos negócios alimentícios que crescem a partir da prática cotidiana, mas sem uma estrutura formal de controle. O problema central estava na ausência de dados organizados e confiáveis para apoiar decisões financeiras e operacionais.

Entre os principais problemas encontrados, destacaram-se:

- **Controle financeiro informal:** as entradas e saídas não eram registradas em uma base única, o que dificultava a apuração do resultado real.
- **Falta de organização das vendas:** as encomendas e vendas realizadas ficavam espalhadas entre mensagens, anotações e memória da empreendedora.
- **Dificuldade no cálculo dos custos de produção:** não havia ficha técnica digital capaz de relacionar ingredientes, quantidades e custo médio.
- **Problemas na precificação:** os preços eram definidos, em parte, por experiência e comparação com o mercado, mas sem apoio sistemático de dados de custo e margem.
- **Controle inadequado de insumos:** compras eram registradas de forma isolada, sem histórico consolidado de preços, quantidades e variações.
- **Dificuldade para identificar produtos e formatos mais relevantes:** não existia acompanhamento organizado de vendas por fatias, bolos inteiros, tortas ou outros itens.
- **Ausência de indicadores gerenciais:** não havia visão de faturamento, ticket médio, margem estimada, gastos semanais ou comparação entre períodos.

Do ponto de vista da Análise de Dados, o problema podia ser descrito como uma situação de baixa maturidade informacional. Os dados existiam, mas estavam dispersos, incompletos, sem padronização e com baixa capacidade de gerar conhecimento. A intervenção proposta buscou converter registros informais em uma base estruturada, permitindo cálculos automáticos, visualizações e indicadores.

---

# 4. Justificativa

A realização deste projeto justifica-se pela relevância econômica e social dos pequenos negócios, bem como pela necessidade de aproximar conhecimentos acadêmicos da realidade produtiva local. Microempreendimentos, especialmente os conduzidos por trabalhadores autônomos e empreendedores individuais, frequentemente enfrentam dificuldades para adotar sistemas de gestão pagos, complexos ou pouco adaptados ao seu processo de trabalho.

No caso da confeitaria artesanal estudada, a ausência de controle sistematizado comprometia a confiabilidade das informações financeiras. Sem dados estruturados, decisões como aumentar o preço de uma fatia, comprar maior quantidade de determinado ingrediente, aceitar uma encomenda personalizada ou priorizar um produto mais lucrativo eram tomadas com base em percepção subjetiva.

A disciplina de Análise de Dados oferece instrumentos adequados para esse tipo de problema, pois permite transformar dados brutos em informações úteis, por meio de etapas como coleta, limpeza, organização, cálculo de indicadores, comparação temporal e visualização. Ao aplicar esses conhecimentos em uma situação real, o projeto fortalece a formação discente e contribui diretamente para a melhoria da gestão de um pequeno negócio.

A justificativa também se apoia na transformação digital dos microempreendimentos. O uso de ferramentas digitais simples, acessíveis e ajustadas ao contexto da empreendedora pode reduzir erros, economizar tempo, aumentar a confiança nos números e ampliar a autonomia gerencial. Nesse sentido, o sistema Solary Cacau foi desenvolvido como principal produto tecnológico do projeto, com foco não apenas em armazenamento de dados, mas também em apoio à decisão.

---

# 5. Fundamentação teórica

## 5.1 Análise de Dados

A Análise de Dados pode ser compreendida como o conjunto de processos voltados à coleta, organização, tratamento, interpretação e comunicação de informações extraídas de dados. Em ambientes organizacionais, sua finalidade é apoiar decisões mais precisas, reduzir incertezas e identificar padrões que não seriam facilmente percebidos por observação informal.

No contexto deste projeto, a análise de dados foi aplicada em nível descritivo e gerencial. A análise descritiva busca responder a perguntas como: quanto foi vendido, quanto foi gasto, qual foi o custo médio de determinado ingrediente, qual receita possui maior custo, qual foi o ticket médio e como o desempenho atual se compara ao período anterior. Essas perguntas são essenciais para pequenos negócios, pois fornecem uma visão objetiva da situação financeira.

O processo analítico adotado seguiu as seguintes etapas:

- **Coleta de dados:** registro de ingredientes, compras, receitas, outros itens, vendas, preços e pagamentos.
- **Tratamento dos dados:** padronização de datas, conversão de valores monetários e normalização de unidades.
- **Organização da base:** separação dos dados em coleções como ingredientes, compras, receitas, vendas, configurações e outros itens.
- **Transformação:** cálculo de custo médio, custo de receita, total de vendas, lucro estimado, ticket médio e variação percentual.
- **Visualização:** apresentação dos resultados em cards, listas analíticas, comparativos e barras de preço.
- **Interpretação:** uso dos indicadores para precificação, compras e avaliação do desempenho.

Assim, a disciplina de Análise de Dados foi aplicada diretamente na construção de um sistema capaz de transformar a rotina operacional da confeitaria em informações relevantes para gestão.

## 5.2 Gestão financeira para pequenos negócios

A gestão financeira em pequenos negócios envolve o controle das entradas e saídas de recursos, a análise de custos, a definição de preços, o acompanhamento de fluxo de caixa e a avaliação da lucratividade. Em microempreendimentos, esse controle é decisivo, pois pequenas variações nos custos de insumos podem afetar significativamente a margem de lucro.

No ramo de confeitaria, a gestão financeira deve considerar tanto custos diretos quanto itens complementares. Entre os custos diretos, estão ingredientes como farinha, chocolate, ovos, leite, manteiga, açúcar e fermento. Entre os custos complementares, incluem-se embalagens, decorações, formas descartáveis, etiquetas, transporte e outros materiais utilizados na produção ou entrega.

Uma prática fundamental é a elaboração de fichas técnicas de receitas. A ficha técnica permite relacionar cada ingrediente à quantidade utilizada e ao custo unitário, resultando no custo total da receita. A partir desse valor, a empreendedora pode definir o preço de venda considerando margem desejada, despesas operacionais, concorrência e valor percebido pelo cliente.

O sistema desenvolvido apoia essa gestão ao registrar compras, calcular custo médio por ingrediente, permitir a composição de receitas e apresentar resumo financeiro com vendas, lucro estimado, margem, ticket médio, gasto semanal e ganho semanal.

## 5.3 Tomada de decisão baseada em dados

A tomada de decisão baseada em dados consiste no uso de informações verificáveis para orientar escolhas organizacionais. Em vez de decidir apenas por intuição, o gestor utiliza indicadores para avaliar cenários, identificar problemas e selecionar alternativas.

Na confeitaria participante, decisões importantes passaram a poder ser fundamentadas por dados, tais como:

- Ajustar o preço por kg do bolo quando o custo médio dos ingredientes aumentar.
- Priorizar produtos com maior margem estimada.
- Identificar semanas de maior ou menor faturamento.
- Avaliar se as vendas por fatia ou por bolo inteiro geram melhor resultado.
- Planejar compras considerando histórico de preço dos insumos.
- Verificar pagamentos pendentes e reduzir risco de inadimplência.
- Comparar desempenho semanal ou mensal.

O sistema Solary Cacau materializa esse conceito por meio de indicadores e telas analíticas. O módulo de comparação, por exemplo, permite visualizar vendas, compras, lucro, margem e ticket médio no período atual e no período anterior, calculando a variação percentual. Esse recurso transforma registros de rotina em apoio concreto à decisão.

## 5.4 Transformação digital em microempreendimentos

A transformação digital em microempreendimentos não se resume ao uso de redes sociais ou meios de pagamento digitais. Ela inclui a incorporação de ferramentas tecnológicas para organizar processos, automatizar cálculos, reduzir retrabalho e melhorar a qualidade das decisões.

Em muitos pequenos negócios, a digitalização precisa ser gradual e adaptada à realidade do empreendedor. Sistemas complexos podem ser abandonados se exigirem conhecimentos técnicos avançados ou fluxos muito distantes da prática diária. Por isso, o projeto priorizou uma interface direta, com campos alinhados à linguagem da confeitaria: ingredientes, compras, receitas, fatias, bolos, tortas, outros itens, vendas e pagamentos.

O Ministério do Empreendedorismo, da Microempresa e da Empresa de Pequeno Porte destaca o avanço da maturidade digital das micro e pequenas empresas brasileiras e a importância de recursos digitais para produtividade e competitividade. Nesse sentido, o Solary Cacau representa uma intervenção de transformação digital aplicada a um caso concreto, com foco em autonomia, organização e análise de dados.

---

# 6. Metodologia

O projeto foi desenvolvido como uma atividade de extensão universitária com características de estudo de caso aplicado e pesquisa-ação. A pesquisa-ação se justifica porque houve interação direta entre os participantes, diagnóstico de uma situação real, desenvolvimento de uma solução e avaliação prática dos resultados.

A abordagem metodológica combinou aspectos qualitativos e quantitativos:

- **Qualitativos:** entrevistas informais, observação da rotina, levantamento das dificuldades e validação da usabilidade do sistema.
- **Quantitativos:** estruturação de dados de compras, vendas, receitas, custos, indicadores financeiros e comparações periódicas.

As etapas metodológicas foram:

1. **Diagnóstico inicial:** identificação dos registros existentes, fluxos de trabalho e principais dificuldades da empreendedora.
2. **Levantamento de requisitos:** definição das funcionalidades essenciais para controle de custos, receitas, vendas e análises.
3. **Modelagem dos dados:** definição das entidades principais do sistema, como ingredientes, compras, receitas, vendas, configurações e outros itens.
4. **Desenvolvimento do sistema web:** implementação da aplicação Solary Cacau com tecnologias web.
5. **Implantação e testes:** verificação do registro de dados, cálculos e persistência em nuvem.
6. **Capacitação da empreendedora:** orientação sobre o uso das telas e interpretação dos indicadores.
7. **Análise dos dados:** criação de tabelas, indicadores e dashboards demonstrativos.
8. **Avaliação dos resultados:** comparação entre a situação anterior e posterior à implementação.

O desenvolvimento do sistema foi orientado pelo princípio de adequação ao usuário final. Assim, as funcionalidades foram pensadas para reduzir barreiras de uso e apoiar tarefas reais da confeitaria.

---

# 7. Levantamento das necessidades da confeitaria

O levantamento de necessidades identificou que a confeitaria precisava de uma solução capaz de centralizar informações e gerar indicadores simples, mas relevantes. As necessidades foram agrupadas em cinco eixos.

## 7.1 Controle de insumos e compras

A empreendedora precisava registrar ingredientes, unidades de medida, valores pagos e quantidades compradas. Também havia necessidade de acompanhar o histórico de compras para perceber aumento ou redução no preço de insumos importantes, como chocolate, farinha, ovos e manteiga.

Necessidades específicas:

- Cadastrar ingredientes por nome.
- Definir unidade de medida: kg, unidade, pacote ou litro.
- Registrar compras com quantidade e valor pago.
- Calcular preço por unidade de compra.
- Visualizar preço médio, menor preço, maior preço e último preço.
- Categorizar ingredientes por grupos, como chocolate, farinhas, gorduras e laticínios.

## 7.2 Controle de receitas e custos de produção

A confeitaria precisava calcular o custo das receitas de forma mais objetiva. Antes do sistema, esse cálculo era manual e sujeito a esquecimentos.

Necessidades específicas:

- Criar receitas com nome identificável.
- Adicionar ingredientes a uma receita.
- Informar a quantidade utilizada de cada ingrediente.
- Calcular automaticamente o custo previsto.
- Incluir outros itens, como embalagens e decorações.
- Visualizar o custo total da receita selecionada.

## 7.3 Registro de vendas

As vendas precisavam ser registradas com data, tipo, quantidade, valor e anotações. Também era necessário diferenciar vendas pagas e pendentes.

Necessidades específicas:

- Registrar venda por fatias.
- Registrar venda de bolo inteiro por kg.
- Registrar venda de tortas.
- Registrar outros tipos de venda.
- Usar preço padrão ou valor manual.
- Calcular automaticamente o total estimado da venda.
- Registrar data e observações.
- Marcar pagamento como pago ou pendente.

## 7.4 Indicadores e relatórios

O negócio necessitava de uma visão consolidada para acompanhamento financeiro.

Necessidades específicas:

- Ver total de vendas realizadas.
- Calcular ticket médio.
- Estimar lucro.
- Visualizar margem estimada.
- Acompanhar gasto semanal e ganho semanal.
- Comparar semana atual com semana anterior.
- Comparar mês atual com mês anterior.
- Identificar variações no preço de ingredientes.

## 7.5 Usabilidade e acesso

Por se tratar de uma microempreendedora, o sistema precisava ser simples e acessível.

Necessidades específicas:

- Interface objetiva.
- Funcionamento em navegador.
- Acesso por computador ou celular.
- Persistência em nuvem.
- Atualização em tempo real.
- Baixa complexidade de uso.

---

# 8. Desenvolvimento do sistema web

O sistema web Solary Cacau foi desenvolvido especificamente para o projeto, tomando como base as necessidades reais da confeitaria. A aplicação possui uma estrutura voltada para cadastro, registro, cálculo e análise de dados operacionais.

O sistema está organizado em duas áreas principais:

- **Controle:** tela principal para cadastro de ingredientes, receitas, outros itens, vendas e resumo financeiro.
- **Histórico de compras:** tela dedicada ao acompanhamento das compras por ingrediente e comparação de preços.

Além dessas áreas, o sistema possui ferramentas de análise acessadas por botões específicos:

- **Categorias:** permite classificar ingredientes em grupos.
- **Preços:** apresenta estatísticas e histórico de preços por ingrediente.
- **Comparar:** realiza comparação semanal ou mensal entre períodos.

O desenvolvimento seguiu uma lógica incremental. Primeiro foram implementadas as funcionalidades básicas de cadastro e cálculo. Em seguida, foram adicionadas funções analíticas, como histórico de preços, comparação de períodos e resumo financeiro.

Do ponto de vista de engenharia de dados, o sistema foi estruturado para coletar dados operacionais no momento em que a atividade ocorre. Assim, cada compra, venda ou composição de receita alimenta a base de dados e se torna disponível para cálculos e análises posteriores.

---

# 9. Tecnologias utilizadas

As tecnologias utilizadas foram escolhidas considerando simplicidade, desempenho, facilidade de implantação e adequação a um projeto web acessível.

| Tecnologia | Uso no projeto | Justificativa |
|---|---|---|
| React 18.2.0 | Construção da interface | Permite criar componentes reutilizáveis e telas dinâmicas. |
| Vite 5.2.0 | Ambiente de desenvolvimento e build | Proporciona desenvolvimento rápido e empacotamento eficiente. |
| Tailwind CSS 3.4.0 | Estilização da interface | Facilita a criação de layout responsivo e padronizado. |
| Firebase 12.12.0 | Banco em nuvem, autenticação anônima e sincronização | Permite persistência de dados em tempo real com menor complexidade de infraestrutura. |
| Firestore | Armazenamento das coleções | Registra ingredientes, compras, receitas, vendas, configurações e outros itens. |
| GitHub Pages | Publicação do sistema | Disponibiliza o sistema por meio de link público. |
| JavaScript | Lógica da aplicação | Implementa cálculos, filtros, validações e indicadores. |

O Firestore foi utilizado como fonte principal dos dados, com coleções como:

- `ingredientes`
- `compras`
- `receita`
- `receitas`
- `vendas`
- `config`
- `outrosItens`

O sistema também utiliza autenticação anonima do Firebase para permitir leitura e escrita de dados sem exigir tela de cadastro para a empreendedora. Essa decisão favorece a usabilidade, embora exija regras de segurança adequadas no ambiente de produção.

---

# 10. Funcionalidades do sistema

As funcionalidades do Solary Cacau foram desenvolvidas para cobrir o ciclo basico de gestão da confeitaria: comprar insumos, calcular custos, registrar vendas e analisar resultados.

## 10.1 Cadastro de ingredientes

Permite cadastrar ingredientes com nome e unidade de medida. As unidades disponíveis no sistema são kg, unidade, pacote e litro. O sistema também possibilita registrar o valor gasto e a quantidade adquirida.

## 10.2 Registro de compras

Cada ingrediente pode receber novas compras. O sistema registra valor pago, quantidade e data, permitindo calcular o preço unitário e o custo médio.

## 10.3 Histórico de compras

A tela de histórico permite selecionar um ingrediente e visualizar:

- Total gasto.
- Quantidade comprada.
- Preço médio.
- Ultima compra.
- Lista de compras realizadas.
- Comparativo visual de preço por compra.
- Menor e maior preço.

## 10.4 Criação de receitas

O sistema permite criar receitas, selecionar uma receita ativa e adicionar ingredientes com quantidades específicas. A cada item inserido, o custo previsto e calculado com base no custo médio do ingrediente.

## 10.5 Cadastro de outros itens

Itens como embalagens, decorações e materiais adicionais podem ser cadastrados separadamente, com valor unitário e quantidade. Esses itens podem ser adicionados as receitas, permitindo uma composição de custo mais completa.

## 10.6 Configuração de vendas

O sistema permite configurar preços padrão para:

- Preço por kg de bolo inteiro.
- Preço por fatia.
- Preço por torta.
- Quantidade de fatias por bolo.

Essas configurações reduzem retrabalho e padronizam o registro de vendas.

## 10.7 Registro de vendas

As vendas podem ser registradas nos seguintes tipos:

- Fatias.
- Bolo inteiro.
- Tortas.
- Outros itens.

O sistema calcula o total da venda com base na quantidade e no preço aplicado. O preço pode vir da configuração padrão ou ser informado manualmente em casos específicos.

## 10.8 Controle de pagamento

Cada venda pode ser marcada como paga ou pendente. Essa funcionalidade auxilia no acompanhamento de recebimentos e reduz o risco de esquecimento de valores a receber.

## 10.9 Resumo financeiro

O painel financeiro apresenta:

- Custo da receita selecionada.
- Total de vendas realizadas.
- Ticket médio.
- Margem estimada.
- Lucro total estimado.
- Custos por receita.
- Gasto semanal.
- Ganho semanal.

## 10.10 Histórico e alerta de preços

O módulo de preços permite analisar a evolução dos custos de insumos. Ele apresenta preço médio, último preço, menor preço e maior preço. Também permite configurar alerta de aumento percentual, por exemplo, quando o preço de um ingrediente sobe mais de 10% em relação à compra anterior.

## 10.11 Comparação de períodos

O módulo de comparação permite comparar semana atual com semana anterior ou mês atual com mês anterior. Os indicadores comparados são:

- Vendas.
- Compras.
- Lucro.
- Margem.
- Ticket médio.
- Vendas por tipo.

## 10.12 Categorização de ingredientes

O sistema permite classificar ingredientes em categorias como açúcares, chocolate, decorações, farinhas, gorduras, ovos/laticínios e outros. Essa classificação facilita análises por grupo de insumo e apoia a organização do estoque operacional.

---

# 11. Aplicação prática do sistema

A aplicação prática do sistema pode ser descrita por meio do fluxo de uso da confeitaria.

Primeiramente, a empreendedora cadastra os ingredientes utilizados, como farinha de trigo, chocolate em pó, ovos, manteiga, leite condensado e açúcar. Ao cadastrar cada ingrediente, informa a unidade de medida, o valor pago e a quantidade adquirida. Esses dados permitem que o sistema calcule o custo médio por unidade.

Em seguida, a empreendedora cria receitas, por exemplo, "Bolo de chocolate 1 kg", "Torta de morango" ou "Brownie tradicional". Para cada receita, adiciona os ingredientes e as quantidades utilizadas. O sistema calcula automaticamente o custo de cada item e o custo total da receita.

Quando ocorre uma venda, a empreendedora registra o tipo da venda, a quantidade, o valor aplicado, a data e eventuais observações. Se a venda for de fatias, o sistema utiliza o preço padrão da fatia, salvo quando houver valor manual. Se for bolo inteiro, utiliza o preço por kg. Se for torta, utiliza o preço por torta. Se for outro item, exige descrição e valor unitário.

A partir desses registros, o sistema gera indicadores no resumo financeiro e nas ferramentas de análise. A empreendedora pode observar o total vendido, o ticket médio, a margem estimada, o lucro estimado, o gasto semanal e a comparação entre períodos. Também pode verificar se determinado ingrediente teve aumento expressivo no preço e ajustar compras ou preços de venda.

Exemplo prático de aplicação:

1. Compra registrada: 5 kg de farinha por R$ 27,50.
2. Sistema calcula custo unitário: R$ 5,50 por kg.
3. Receita usa 0,5 kg de farinha.
4. Sistema calcula custo da farinha na receita: R$ 2,75.
5. A receita também recebe chocolate, ovos, manteiga e embalagem.
6. Sistema soma os itens e informa o custo total.
7. A venda e registrada como bolo inteiro de 1,2 kg.
8. Sistema calcula o valor de venda com base no preço por kg.
9. O resumo financeiro atualiza vendas, ticket médio e lucro estimado.

Esse fluxo demonstra a aplicação prática da análise de dados em uma rotina de pequeno negócio.

---

# 12. Organização e tratamento dos dados

A organização dos dados foi uma das etapas mais importantes do projeto. Antes do sistema, as informações estavam dispersas, sem padrão e sem estrutura adequada para análise. O Solary Cacau passou a registrar os dados em coleções específicas, com campos orientados a cálculos e visualizações.

## 12.1 Modelo lógico dos dados

| Entidade | Descrição | Exemplos de campos |
|---|---|---|
| Ingredientes | Insumos utilizados na produção | id, nome, unidade, categoria |
| Compras | Registros de aquisição de ingredientes | id, ingredienteId, nome, preço, quantidade, data |
| Receitas | Cadastro das fichas técnicas | id, nome, data |
| Itens de receita | Ingredientes ou outros itens usados em receitas | receitaId, ingredienteId, qtd, custoUnitário, custo |
| Outros itens | Embalagens, decorações e materiais adicionais | id, nome, valor, quantidade |
| Vendas | Registros de vendas realizadas | id, tipo, quantidade, valor, preçoUnitário, pago, data |
| Configurações | Preços padrão e parametros | preçoBolo, preçoFatia, preçoTorta, fatiasPerBolo |

## 12.2 Tratamentos aplicados

O tratamento dos dados incluiu:

- Conversão de valores monetários digitados para números.
- Padronização de datas em formato compatível com cálculos.
- Conversão de gramas para kg quando necessário.
- Cálculo de custo médio por ingrediente.
- Ordenação de compras por data mais recente.
- Filtro de vendas e compras por período.
- Cálculo de variação percentual.
- Separação de vendas por tipo.
- Identificação de vendas pagas e pendentes.

## 12.3 Indicadores calculados

Os principais indicadores calculados pelo sistema ou propostos na análise são:

| Indicador | Formula | Aplicação |
|---|---|---|
| Custo médio do ingrediente | Soma dos valores pagos / soma das quantidades compradas | Precificação e custo de receita |
| Custo da receita | Soma de quantidade usada x custo unitário | Formação de preço |
| Faturamento | Soma dos valores das vendas | Acompanhamento financeiro |
| Ticket médio | Faturamento / numero de vendas | Análise de valor médio por venda |
| Lucro estimado | Vendas - custos considerados | Avaliação de resultado |
| Margem estimada | Lucro estimado / vendas x 100 | Análise de rentabilidade |
| Variação percentual | (Atual - anterior) / anterior x 100 | Comparação temporal |
| Percentual de vendas pagas | Vendas pagas / total de vendas x 100 | Controle de recebimentos |

## 12.4 Observação sobre estoque

No contexto atual do sistema, o controle de estoque opera como acompanhamento gerencial de insumos, compras, categorias, histórico de preços e composição de receitas. Essa estrutura já melhora a organização do estoque operacional, pois permite saber quais ingredientes existem na base, quando foram comprados e qual foi o custo médio.

Como evolução futura, recomenda-se implementar saldo automático de estoque, com baixa de insumos a partir das vendas vinculadas a receitas. A formula proposta seria:

**Estoque final = estoque inicial + compras - consumo estimado pelas receitas vendidas**

Essa evolução permitiria transformar o controle atual de compras e custos em um inventário completo com alertas de reposição.

---

# 13. Dashboards e análises realizadas

Os dashboards do projeto foram pensados para responder perguntas gerenciais simples e recorrentes. No sistema atual, os resultados aparecem principalmente em cards, listas analíticas, comparativos, indicadores e barras de preço. Para apresentação acadêmica, os mesmos dados podem ser convertidos em gráficos.

## 13.1 Dashboard financeiro principal

O dashboard financeiro principal corresponde ao painel de resumo do sistema. Ele apresenta uma visão consolidada da confeitaria.

Exemplo simulado:

| Indicador | Valor em maio/2026 | Interpretação |
|---|---:|---|
| Vendas realizadas | R$ 4.965,00 | Faturamento bruto do período |
| Ticket médio | R$ 60,55 | Valor médio por venda registrada |
| Custo da receita selecionada | R$ 38,72 | Custo da ficha técnica ativa |
| Margem estimada | 62,4% | Indicador de rentabilidade aproximada |
| Lucro estimado | R$ 3.097,10 | Resultado estimado apos custos considerados |
| Gasto semanal | R$ 418,30 | Compras recentes de insumos |
| Ganho semanal | R$ 1.245,00 | Vendas recentes |

Gráficos sugeridos:

- Gráfico de linhas para faturamento diário.
- Gráfico de barras para vendas por tipo.
- Cartoes KPI para ticket médio, lucro e margem.
- Gráfico de colunas para gasto semanal versus ganho semanal.

## 13.2 Dashboard de vendas

O dashboard de vendas permite compreender quais formatos possuem maior participação no faturamento.

Exemplo simulado:

| Tipo de venda | Quantidade | Faturamento | Participação |
|---|---:|---:|---:|
| Fatias | 45 | R$ 742,50 | 15,0% |
| Bolo inteiro | 18 | R$ 2.430,00 | 48,9% |
| Tortas | 11 | R$ 1.210,00 | 24,4% |
| Outros | 8 | R$ 582,50 | 11,7% |
| **Total** | **82** | **R$ 4.965,00** | **100,0%** |

Análise: no exemplo, os bolos inteiros representam a maior parcela do faturamento, embora as fatias tenham maior numero de vendas. Isso indica que a empreendedora deve analisar não apenas quantidade vendida, mas também valor médio e margem por tipo de produto.

Gráficos sugeridos:

- Barras horizontais: faturamento por tipo de venda.
- Pizza ou rosca: participação percentual por tipo.
- Linha temporal: vendas por dia.
- Ranking: produtos ou tipos mais vendidos.

## 13.3 Dashboard de histórico de preços

O dashboard de preços auxilia na identificação de variações de insumos.

Exemplo simulado para chocolate:

| Data | Quantidade | Valor pago | Preço por kg | Variação |
|---|---:|---:|---:|---:|
| 03/05/2026 | 2 kg | R$ 64,00 | R$ 32,00 | - |
| 11/05/2026 | 2 kg | R$ 68,00 | R$ 34,00 | +6,25% |
| 21/05/2026 | 3 kg | R$ 111,00 | R$ 37,00 | +8,82% |
| 29/05/2026 | 2 kg | R$ 82,00 | R$ 41,00 | +10,81% |

Análise: a variação acumulada do chocolate no período foi relevante. O alerta de aumento acima de 10% indicaria a necessidade de revisar fornecedores, ajustar preço de venda ou reduzir desperdícios.

Gráficos sugeridos:

- Linha: evolução do preço por kg.
- Barras: comparativo entre compras.
- Indicador de alerta: aumento acima do limite definido.

## 13.4 Dashboard de compras e insumos

Exemplo simulado:

| Categoria | Total gasto | Participação | Principal item |
|---|---:|---:|---|
| Chocolate | R$ 325,00 | 18,7% | Chocolate em pó |
| Ovos/Laticínios | R$ 412,30 | 23,7% | Leite condensado |
| Farinhas | R$ 168,50 | 9,7% | Farinha de trigo |
| Gorduras | R$ 231,00 | 13,3% | Manteiga |
| Decorações | R$ 186,00 | 10,7% | Granulados e confeitos |
| Outros | R$ 419,50 | 24,1% | Embalagens |
| **Total** | **R$ 1.742,30** | **100,0%** | - |

Gráficos sugeridos:

- Barras empilhadas por categoria.
- Pareto de insumos com maior impacto financeiro.
- Linha de evolução de gastos por semana.

## 13.5 Dashboard de comparação semanal ou mensal

O sistema possui módulo de comparação por semana ou mês. Esse módulo calcula indicadores do período atual e anterior, permitindo avaliar crescimento ou redução.

Exemplo simulado de comparação semanal:

| Indicador | Semana anterior | Semana atual | Variação |
|---|---:|---:|---:|
| Vendas | R$ 980,00 | R$ 1.245,00 | +27,0% |
| Compras | R$ 510,00 | R$ 418,30 | -18,0% |
| Lucro estimado | R$ 470,00 | R$ 826,70 | +75,9% |
| Margem estimada | 48,0% | 66,4% | +18,4 p.p. |
| Ticket médio | R$ 54,44 | R$ 65,53 | +20,4% |

Análise: a semana atual apresenta aumento de vendas e redução de compras, gerando melhora no resultado estimado. Essa leitura pode indicar melhor aproveitamento de estoque ou maior venda de produtos de maior valor.

---

# 14. Capacitação da empreendedora

A capacitação da empreendedora foi uma etapa essencial para garantir que a ferramenta não fosse apenas desenvolvida, mas efetivamente incorporada à rotina do negócio. A orientação priorizou o uso prático do sistema e a interpretação dos indicadores.

Os tópicos abordados na capacitação foram:

- Acesso ao sistema pelo navegador.
- Cadastro de ingredientes e definição de unidade de medida.
- Registro de novas compras.
- Interpretação de custo médio.
- Criação de receitas e inclusão de ingredientes.
- Cadastro de outros itens, como embalagens e decorações.
- Configuração de preços padrão de venda.
- Registro de vendas por fatia, bolo, torta e outros.
- Marcação de pagamentos como pagos ou pendentes.
- Leitura do resumo financeiro.
- Uso do histórico de compras.
- Uso do módulo de preços e alertas.
- Comparação semanal e mensal de indicadores.

Durante a capacitação, foi reforçado que o valor do sistema depende da qualidade dos dados inseridos. Assim, a empreendedora foi orientada a registrar compras e vendas de forma contínua, com datas corretas, valores reais e descrições consistentes.

Também foi discutida a importância de revisar preços periodicamente, principalmente quando o sistema indicar aumento no custo dos ingredientes mais relevantes.

---

# 15. Resultados obtidos

Os resultados obtidos demonstram que o projeto contribuiu para a organização dos dados e para a criação de uma cultura inicial de gestão baseada em indicadores. Como os dados quantitativos abaixo são simulados para fins acadêmicos, eles representam uma situação plausível de período piloto.

## 15.1 Indicadores de uso do sistema

Período simulado: 01/05/2026 a 31/05/2026.

| Registro | Quantidade |
|---|---:|
| Ingredientes cadastrados | 21 |
| Categorias utilizadas | 7 |
| Compras registradas | 47 |
| Receitas cadastradas | 7 |
| Outros itens cadastrados | 6 |
| Vendas registradas | 82 |
| Vendas marcadas como pagas | 73 |
| Vendas pendentes | 9 |

## 15.2 Indicadores financeiros simulados

| Indicador | Valor |
|---|---:|
| Faturamento do mês | R$ 4.965,00 |
| Compras de insumos | R$ 1.742,30 |
| Despesas complementares simuladas | R$ 125,60 |
| Lucro bruto estimado | R$ 3.097,10 |
| Ticket médio | R$ 60,55 |
| Margem estimada | 62,4% |
| Percentual de vendas pagas | 89,0% |
| Percentual de vendas pendentes | 11,0% |

## 15.3 Resultados qualitativos

Os principais resultados qualitativos observados foram:

- Centralização das informações em um unico sistema.
- Redução da dependência de cadernos e mensagens dispersas.
- Maior clareza sobre o custo das receitas.
- Melhor acompanhamento de compras e variação de preços.
- Maior controle sobre vendas pagas e pendentes.
- Possibilidade de comparar resultados entre períodos.
- Melhoria na segurança para definir preços.
- Apróximacao da empreendedora com conceitos de análise de dados.

## 15.4 Demonstração da aplicação da Análise de Dados

A disciplina de Análise de Dados foi aplicada de forma direta nos seguintes pontos:

- Definição das variáveis relevantes para o negócio.
- Estruturação de uma base de dados operacional.
- Tratamento de valores numericos e datas.
- Cálculo de indicadores financeiros.
- Criação de comparações entre períodos.
- Análise de variação percentual de preços.
- Identificação de tendencias de vendas.
- Organização de dashboards para apoio gerencial.

---

# 16. Comparação da situação antes e depois da implementação

A comparação entre a situação anterior e posterior evidencia a contribuição do sistema para a organização gerencial da confeitaria.

| Aspecto avaliado | Antes da implementação | Depois da implementação |
|---|---|---|
| Registro de vendas | Cadernos, WhatsApp e memória | Registro digital por tipo, data, valor e pagamento |
| Controle de compras | Anotações dispersas | Histórico por ingrediente |
| Cálculo de custo | Manual e eventual | Automatico por ingrediente e receita |
| Precificação | Baseada em experiência | Apoiada por custo médio e indicadores |
| Pagamentos pendentes | Dificil acompanhamento | Status pago/pendente por venda |
| Indicadores financeiros | Ausentes | Vendas, ticket médio, margem, lucro estimado, gasto e ganho semanal |
| Comparação temporal | Não realizada | Comparação semanal e mensal |
| Histórico de preços | Inexistente ou incompleto | Preço médio, último, menor, maior e variação |
| Organização de insumos | Lista informal | Cadastro com unidade e categoria |
| Base para decisão | Intuição e experiência | Dados estruturados e dashboards |

## 16.1 Indicadores quantitativos antes e depois

| Indicador | Antes | Depois | Melhoria estimada |
|---|---:|---:|---:|
| Tempo médio para calcular custo de uma receita | 45 min | 8 min | -82,2% |
| Tempo semanal para apurar vendas | 2h30 | 25 min | -83,3% |
| Vendas com data e valor organizados | 35% | 100% | +65 p.p. |
| Vendas com status de pagamento identificado | 20% | 100% | +80 p.p. |
| Ingredientes com histórico de preço | 0% | 86% | +86 p.p. |
| Receitas com custo calculado | 15% | 100% | +85 p.p. |
| Indicadores gerenciais disponíveis | 0 | 8 | +8 indicadores |
| Fontes de registro utilizadas | 4 | 1 | Centralização |

A análise demonstra que o maior ganho do projeto ocorreu na transformação de registros dispersos em dados estruturados. Essa mudança permite reduzir tempo, aumentar confiabilidade e melhorar a qualidade da tomada de decisão.

---

# 17. Benefícios para a empreendedora

Os benefícios gerados para a empreendedora podem ser agrupados em benefícios financeiros, operacionais, informacionais e estratégicos.

## 17.1 Benefícios financeiros

- Maior clareza sobre custos de produção.
- Apoio à definição de preços mais coerentes.
- Identificação de aumento no custo de ingredientes.
- Acompanhamento de faturamento e margem estimada.
- Controle de pagamentos pendentes.

## 17.2 Benefícios operacionais

- Redução da necessidade de procurar informações em cadernos e mensagens.
- Organização de receitas e ingredientes.
- Registro histórico de compras.
- Melhor acompanhamento de itens complementares, como embalagens.
- Uso de uma base única de dados.

## 17.3 Benefícios informacionais

- Visualização de indicadores em tempo real.
- Comparação entre períodos.
- Histórico de preços por ingrediente.
- Categorização de insumos.
- Registro padronizado das vendas.

## 17.4 Benefícios estratégicos

- Maior capacidade de planejamento.
- Melhor tomada de decisão sobre compras.
- Possibilidade de identificar formatos de venda mais relevantes.
- Base para crescimento do negócio.
- Início de uma cultura de gestão orientada por dados.

---

# 18. Impacto social do projeto

O impacto social do projeto está relacionado à contribuição da universidade para a realidade local, especialmente no apoio a microempreendedores. Ao desenvolver uma solução digital para uma confeitaria artesanal de Teresina - PI, o projeto promoveu transferência de conhecimento, inclusão digital e fortalecimento da gestão de um pequeno negócio.

Entre os impactos sociais, destacam-se:

- **Fortalecimento do empreendedorismo local:** a ferramenta contribui para maior sustentabilidade financeira do negócio.
- **Valorização do trabalho artesanal:** o sistema ajuda a demonstrar o real custo e valor dos produtos produzidos.
- **Inclusão digital:** a empreendedora passa a utilizar uma ferramenta web própria para gerir dados.
- **Autonomia gerencial:** a tomada de decisão deixa de depender apenas de memória e intuição.
- **Aplicação social da universidade:** o conhecimento acadêmico é convertido em benefício prático para a comunidade.
- **Potencial de replicabilidade:** a solução pode inspirar projetos semelhantes para outros microempreendimentos.

O projeto também contribui para a formação dos estudantes, pois permite vivenciar problemas reais de dados, sistemas e gestão, desenvolvendo competências técnicas e sociais.

---

# 19. Evidências que podem ser anexadas

Para fortalecer a apresentação acadêmica do projeto, recomenda-se anexar evidências documentais, visuais e técnicas.

Evidências sugeridas:

- Print da tela inicial do sistema Solary Cacau.
- Print do cadastro de ingredientes.
- Print da tela de receitas e custo calculado.
- Print do resumo financeiro.
- Print do registro de vendas.
- Print do histórico de compras.
- Print do módulo de preços.
- Print do módulo de comparação semanal ou mensal.
- Print do módulo de categorias.
- Link público do sistema: <https://kelvinmir.github.io/Sistemas-Controle-Custos/>.
- Tabelas simuladas ou reais de compras, vendas e receitas.
- Fotos da capacitação da empreendedora, caso autorizadas.
- Termo de consentimento ou autorização de uso das informações, caso exigido pela instituição.
- Relato da empreendedora sobre a experiência de uso.
- Código-fonte ou repositório do projeto, caso a instituição solicite evidência técnica.

É importante anonimizar dados sensíveis, como nomes de clientes, telefone, endereço e valores que a empreendedora não deseje divulgar.

---

# 20. Considerações finais

O projeto de extensão desenvolvido na disciplina de Análise de Dados demonstrou a relevância da aplicação de conhecimentos acadêmicos em problemas reais de pequenos negócios. A confeitaria artesanal participante apresentava dificuldades de controle financeiro, organização de vendas, cálculo de custos, precificação e acompanhamento de indicadores. Esses problemas eram agravados pela dispersão dos dados em cadernos, mensagens e anotações informais.

Como resposta, foi desenvolvido o sistema web Solary Cacau, principal produto tecnológico do projeto. A ferramenta permitiu centralizar registros, automatizar cálculos, estruturar dados e apresentar indicadores gerenciais de forma acessível. O sistema contempla funcionalidades como cadastro de ingredientes, registro de compras, criação de receitas, cadastro de outros itens, registro de vendas, controle de pagamentos, resumo financeiro, histórico de preços, categorização de ingredientes e comparação de períodos.

Do ponto de vista da Análise de Dados, o projeto aplicou conceitos essenciais como coleta, limpeza, transformação, organização, cálculo de indicadores, análise descritiva, comparação temporal e visualização de dados. A solução permitiu converter informações dispersas em conhecimento util para tomada de decisão.

Os indicadores simulados apresentados demonstram potencial de melhoria significativa, especialmente na redução do tempo de apuração financeira, aumento da confiabilidade dos custos, controle de pagamentos e disponibilidade de indicadores. Além disso, o projeto contribuiu para a autonomia da empreendedora e para a transformação digital de um microempreendimento local.

Conclui-se que o projeto cumpriu seu objetivo geral ao aplicar técnicas de análise de dados e uma ferramenta digital própria para auxiliar a gestão financeira e operacional da confeitaria. Como evoluções futuras, recomenda-se implementar baixa automática de estoque, vincular vendas diretamente a receitas específicas, criar ranking de produtos mais lucrativos com base em custo real por unidade, exportar relatórios em PDF ou planilha e adicionar gráficos interativos ao dashboard.

---

# 21. Referências em padrão ABNT

ASSAF NETO, Alexandre. **Administração financeira: princípios, fundamentos e práticas brasileiras**. São Paulo: Atlas, 2014.

BRASIL. Ministério do Empreendedorismo, da Microempresa e da Empresa de Pequeno Porte. **Avanço tecnológico nas micro e pequenas empresas brasileiras: um salto na maturidade digital em 2023**. Brasília, DF: MEMP, 2023. Disponível em: <https://www.gov.br/memp/pt-br/assuntos/noticias/maturidade-digital-em-alta-nas-mpes-brasileiras-em-2023>. Acesso em: 1 jun. 2026.

DAVENPORT, Thomas H.; HARRIS, Jeanne G. **Competing on analytics: the new science of winning**. Boston: Harvard Business School Press, 2007.

FIREBASE. **Cloud Firestore documentation**. Mountain View: Google, 2026. Disponível em: <https://firebase.google.com/docs/firestore>. Acesso em: 1 jun. 2026.

GITHUB. **GitHub Pages documentation**. San Francisco: GitHub, 2026. Disponível em: <https://docs.github.com/pt/pages>. Acesso em: 1 jun. 2026.

LAUDON, Kenneth C.; LAUDON, Jane P. **Management information systems: managing the digital firm**. 16. ed. Harlow: Pearson, 2020.

PROVOST, Foster; FAWCETT, Tom. **Data science for business: what you need to know about data mining and data-analytic thinking**. Sebastopol: O'Reilly Media, 2013.

REACT. **Quick Start: React documentation**. [S. l.]: Meta Open Source, 2026. Disponível em: <https://react.dev/learn>. Acesso em: 1 jun. 2026.

SEBRAE. **A gestão financeira do pequeno negócio**. [S. l.]: Sebrae, [2021?]. Disponível em: <https://sebrae.com.br/sites/PortalSebrae/ufs/am/artigos/a-gestao-financeira-do-pequeno-negocio%2Cc77bc529bd81c710VgnVCM100000d701210aRCRD>. Acesso em: 1 jun. 2026.

SEBRAE. **Como calcular o lucro**. [S. l.]: Sebrae, [s. d.]. Disponível em: <https://sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/BA/Anexos/como_calcular_lucro.pdf>. Acesso em: 1 jun. 2026.

SEBRAE. **Como formar o preço de venda**. [S. l.]: Sebrae, [s. d.]. Disponível em: <https://sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/MG/Imagens/Infogra%CC%81fico%20-%20Como%20formar%20o%20prec%CC%A7o%20de%20venda.pdf>. Acesso em: 1 jun. 2026.

TURBAN, Efraim; SHARDA, Ramesh; DELEN, Dursun. **Decision support and business intelligence systems**. 9. ed. Upper Saddle River: Pearson, 2011.

---

# Apêndice A - Exemplos realistas de tabelas financeiras

## A.1 Tabela de compras de ingredientes

| Data | Ingrediente | Categoria | Quantidade | Valor pago | Custo unitário |
|---|---|---|---:|---:|---:|
| 03/05/2026 | Farinha de trigo | Farinhas | 5 kg | R$ 27,50 | R$ 5,50/kg |
| 04/05/2026 | Chocolate em po | Chocolate | 2 kg | R$ 64,00 | R$ 32,00/kg |
| 05/05/2026 | Ovos | Ovos/Laticínios | 60 un | R$ 42,00 | R$ 0,70/un |
| 07/05/2026 | Leite condensado | Ovos/Laticínios | 24 un | R$ 156,00 | R$ 6,50/un |
| 08/05/2026 | Manteiga | Gorduras | 3 kg | R$ 96,00 | R$ 32,00/kg |
| 10/05/2026 | Embalagem para bolo | Outros | 30 un | R$ 75,00 | R$ 2,50/un |

## A.2 Tabela de custo de receita

Receita simulada: **Bolo de chocolate 1 kg**

| Item | Unidade | Quantidade usada | Custo unitário | Custo na receita |
|---|---:|---:|---:|---:|
| Farinha de trigo | kg | 0,400 | R$ 5,50 | R$ 2,20 |
| Chocolate em po | kg | 0,180 | R$ 32,00 | R$ 5,76 |
| Ovos | un | 4 | R$ 0,70 | R$ 2,80 |
| Leite condensado | un | 1 | R$ 6,50 | R$ 6,50 |
| Manteiga | kg | 0,120 | R$ 32,00 | R$ 3,84 |
| Acucar | kg | 0,250 | R$ 4,80 | R$ 1,20 |
| Embalagem | un | 1 | R$ 2,50 | R$ 2,50 |
| Decoração | un | 1 | R$ 4,00 | R$ 4,00 |
| **Total** | - | - | - | **R$ 28,80** |

## A.3 Tabela de vendas

| Data | Tipo | Quantidade | Preço aplicado | Valor total | Status |
|---|---|---:|---:|---:|---|
| 02/05/2026 | Fatias | 8 | R$ 8,50 | R$ 68,00 | Pago |
| 04/05/2026 | Bolo inteiro | 1,5 kg | R$ 75,00/kg | R$ 112,50 | Pago |
| 08/05/2026 | Torta | 2 | R$ 55,00 | R$ 110,00 | Pendente |
| 12/05/2026 | Fatias | 12 | R$ 8,50 | R$ 102,00 | Pago |
| 18/05/2026 | Bolo inteiro | 2 kg | R$ 75,00/kg | R$ 150,00 | Pago |
| 22/05/2026 | Outros | 1 | R$ 35,00 | R$ 35,00 | Pago |

## A.4 Demonstrativo simplificado de resultado

| Item | Valor |
|---|---:|
| Receita bruta de vendas | R$ 4.965,00 |
| Custos estimados de produção | R$ 1.742,30 |
| Outros custos diretos | R$ 125,60 |
| **Lucro bruto estimado** | **R$ 3.097,10** |
| Margem bruta estimada | 62,4% |
| Ticket médio | R$ 60,55 |
| Vendas registradas | 82 |

---

# Apêndice B - Sugestões de gráficos para apresentação

| Gráfico | Variáveis | Objetivo |
|---|---|---|
| Linha de faturamento diário | Data x valor vendido | Identificar dias de maior venda |
| Barras de vendas por tipo | Tipo de venda x faturamento | Comparar fatias, bolos, tortas e outros |
| Barras horizontais de produtos mais vendidos | Produto/tipo x quantidade | Visualizar ranking de saída |
| Linha de preço de ingrediente | Data x preço por unidade | Acompanhar inflação de insumos |
| Barras de compras por categoria | Categoria x total gasto | Identificar grupos de maior impacto |
| KPI de margem | Lucro / vendas x 100 | Avaliar rentabilidade |
| Comparativo semanal | Semana anterior x semana atual | Medir crescimento ou queda |
| Gráfico de pagamentos | Pago x pendente | Controlar recebimentos |

Para o contexto atual do sistema, o ranking de produtos mais vendidos pode ser inicialmente construído por tipo de venda. Como evolução, recomenda-se vincular cada venda a uma receita específica para gerar ranking por produto real, como bolo de chocolate, torta de morango ou brownie.
