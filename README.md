# Nanas - Gerenciador Financeiro Pessoal

## 📝 Descrição do Projeto

**Nanas** é uma aplicação web completa de gerenciamento financeiro pessoal, desenvolvida como projeto para a disciplina de **Software Product: Analysis, Specification, Project & Implementation**. A plataforma permite que os usuários cadastrem suas contas (carteiras), 
registrem transações (receitas, despesas e transferências) e visualizem um dashboard consolidado de sua saúde financeira.

O objetivo principal é fornecer uma ferramenta intuitiva e visualmente agradável para o controle de finanças, aplicando conceitos modernos de desenvolvimento full-stack.

---

## ✨ Funcionalidades Principais

*   **Autenticação de Usuários:** Sistema seguro de cadastro e login utilizando Firebase Authentication.
*   **Dashboard Interativo:** Visão geral do saldo total, resumo de receitas e despesas, e lista de transações recentes.
*   **Gerenciamento de Carteiras:** Crie e gerencie diferentes tipos de contas (Conta Corrente, Poupança, Investimentos, etc.).
*   **Registro de Transações:** Adicione receitas, despesas e transferências entre carteiras, associando-as a categorias.
*   **Gerenciamento de Categorias:** Crie categorias personalizadas para organizar suas transações.
*   **Filtragem e Ordenação:** Ferramentas para buscar e organizar transações por data, valor ou descrição.
*   **Design Responsivo:** Interface adaptável para uso em desktops, tablets e smartphones.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com uma arquitetura moderna, separando o frontend do backend.

### Backend (API REST)

*   **Linguagem:** [Java 17](https://www.oracle.com/java/ )
*   **Framework:** [Spring Boot](https://spring.io/projects/spring-boot )
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/ )
*   **Autenticação:** [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup ) para validação de tokens.
*   **ORM:** [Spring Data JPA](https://spring.io/projects/spring-data-jpa ) com [Hibernate](https://hibernate.org/ ).
*   **Dependências:** Lombok, Spring Web, Spring Security.

### Frontend (Cliente Web)

*   **Framework:** [React](https://react.dev/ ) com [Vite](https://vitejs.dev/ )
*   **Linguagem:** JavaScript (ES6+) com JSX
*   **Roteamento:** [React Router DOM](https://reactrouter.com/ )
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/ )
*   **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/ )
*   **Animações:** [Framer Motion](https://www.framer.com/motion/ )
*   **Autenticação:** [Firebase Client SDK](https://firebase.google.com/docs/web/setup )
*   **Alertas e Pop-ups:** [SweetAlert2](https://sweetalert2.github.io/ )
