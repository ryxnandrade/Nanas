# Nanas - Controle Financeiro

## 📝 Descrição do Projeto

**Nanas** é uma aplicação web completa de gerenciamento financeiro pessoal, desenvolvida como projeto para a disciplina de **Software Product: Analysis, Specification, Project & Implementation**. A plataforma permite que os usuários cadastrem suas contas (carteiras), registrem transações, gerenciem cartões de crédito e visualizem um dashboard consolidado e interativo de sua saúde financeira.

O objetivo principal é fornecer uma ferramenta intuitiva e visualmente agradável para o controle de finanças, aplicando conceitos modernos de desenvolvimento full-stack.

---

## ✨ Funcionalidades Principais

A plataforma conta com um conjunto robusto de funcionalidades para um controle financeiro completo:

*   **Autenticação de Usuários:** Sistema seguro de cadastro e login utilizando Firebase Authentication para proteger os dados do usuário.

*   **Dashboard Analítico e Interativo:**
    *   **Cards de Resumo:** Visão geral e instantânea do saldo total, receitas e despesas do mês, e valor da fatura atual do cartão.
    *   **Gráfico de Distribuição de Despesas:** Um gráfico de pizza (`Pie Chart`) que mostra a proporção dos gastos por categoria, permitindo identificar para onde o dinheiro está indo.
    *   **Gráfico de Evolução de Saldo:** Um gráfico de linha (`Line Chart`) que exibe a progressão do saldo total ao longo do tempo, ajudando a visualizar o crescimento patrimonial.
    *   **Filtros Dinâmicos:** Capacidade de filtrar a evolução do saldo por carteira específica ou visualizar os dados de todas as contas de forma consolidada.

*   **Módulo de Cartão de Crédito:**
    *   **Gerenciamento de Cartões:** Cadastre múltiplos cartões de crédito, definindo nome, limite, e dias de fechamento e vencimento.
    *   **Registro de Gastos:** Lance despesas diretamente na fatura do cartão de crédito escolhido.
    *   **Visualização de Faturas:** Acompanhe em tempo real os lançamentos da **fatura atual** e da **próxima fatura**, com o cálculo automático do valor total de cada uma.

*   **Gerenciamento de Contas (Carteiras):**
    *   Crie e gerencie diferentes tipos de contas (Conta Corrente, Poupança, Investimentos, etc.).
    *   Realize transferências de valores entre as carteiras.

*   **Registro de Transações:**
    *   Adicione receitas e despesas de forma simples e rápida.
    *   Associe cada transação a uma categoria para melhor organização.

*   **Gerenciamento de Categorias:** Crie, edite e delete categorias personalizadas para classificar suas movimentações financeiras.

*   **UI Moderna e Responsiva:**
    *   **Design Responsivo:** Interface totalmente adaptável para uso em desktops, tablets e smartphones.
    *   **Notificações Elegantes:** Utilização de `SweetAlert2` para feedbacks de sucesso e erro, proporcionando uma experiência de usuário superior aos alertas padrão.
    *   **Animações Fluidas:** Componentes animados com `Framer Motion` que tornam a navegação mais agradável e intuitiva.

---

## 🛠️ Tecnologias Utilizadas 

O projeto foi construído com uma arquitetura moderna, separando o frontend do backend.

### Backend (API REST)

*   **Linguagem:** [Java 17](https://www.oracle.com/java/ )
*   **Framework:** [Spring Boot](https://spring.io/projects/spring-boot )
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/ )
*   **Autenticação:** [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup ) para validação de tokens.
*   **ORM:** [Spring Data JPA](https://spring.io/projects/spring-data-jpa ) com [Hibernate](https://hibernate.org/ ).
*   **Dependências:** Lombok, Spring Web, Spring Security, MapStruct.

### Frontend (Cliente Web)

*   **Framework:** [React](https://react.dev/ ) com [Vite](https://vitejs.dev/ )
*   **Linguagem:** JavaScript (ES6+) com JSX
*   **Roteamento:** [React Router DOM](https://reactrouter.com/ )
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/ )
*   **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/ ) e [Recharts](https://recharts.org/ ) para gráficos.
*   **Animações:** [Framer Motion](https://www.framer.com/motion/ )
*   **Autenticação:** [Firebase Client SDK](https://firebase.google.com/docs/web/setup )
*   **Alertas e Pop-ups:** [SweetAlert2](https://sweetalert2.github.io/ )
