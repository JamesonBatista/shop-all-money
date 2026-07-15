# Bank Shop

Aplicação de banco digital + marketplace de luxo (**shop-all-money**), pronta para GitHub Pages.

## Funcionalidades

- Login e registro com design bancário, hovers e transições
- Cadastro com nome, e-mail, senha, operadora de cartão e crédito (máx. R$ 100.000.000)
- Dashboard bancário com ações fictícias e saldo real do registro
- Depósito com teto de 100 milhões
- Loja por nichos (roupas, relógios, casas, móveis, etc.)
- Em cada nicho: lista de lojas temáticas → vitrine da loja → carrinho
- Relógios: boutiques Rolex, Patek Philippe, AP, Omega, Cartier
- Compra abate o saldo e envia e-mail de confirmação temático
- Bootstrap silencioso (CRUD) no Firestore ao iniciar
- Persistência Firestore + fallback localStorage

## Stack

React 19 · TypeScript · Vite · React Router · Framer Motion · Firebase Firestore · Vitest

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## GitHub Pages

- Base path: `/shop-all-money/`
- Roteamento via `HashRouter` (compatível com Pages)
- Workflow: `.github/workflows/deploy-pages.yml`

Após merge em `main`, ative **Settings → Pages → GitHub Actions**.

URL esperada: `https://jamesonbatista.github.io/shop-all-money/`

## Firebase

Configuração em `src/firebase/config.ts` (projeto `shop-all-money`).
