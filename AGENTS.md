# Montador Pro - Regras para a IA (Antigravity / OpenCode)

## 1. Stack Tecnológica
- **Frontend:** React 19, Vite 8 (motor Rolldown).
- **Estilização:** Tailwind CSS v4 (Use CSS-native variables `@theme`).
- **Backend/DB:** Supabase (PostgreSQL), Supabase Auth.
- **Estado/Offline:** Zustand (para persistência de UI) e TanStack Query (para sincronização offline-first).

## 2. Arquitetura e Performance
- **Offline-First:** O app DEVE funcionar sem internet. Use mutações otimistas. Modificações atualizam o cache local e enfileiram requisições para quando a rede voltar.
- **Tree-Shaking:** Evite 'barrel files' (arquivos `index.js` que exportam tudo). Use importações nomeadas diretas para reduzir o tamanho do bundle mobile.
- **Hidratação:** Preste atenção em erros de hidratação no React. Atrase a renderização de datas locais ou acessos ao `window`/`localStorage` usando `useEffect` ou Skeletons.

## 3. Segurança e Banco de Dados
- **Multi-Tenant RLS:** O isolamento de dados é absoluto. Todas as tabelas transacionais devem ter a coluna `tenant_id` (ou `organization_id`). 
- **Políticas RLS:** Filtre os dados no backend usando os JWT Claims do usuário autenticado nas políticas do PostgreSQL (exemplo de check: `tenant_id = (select auth.jwt() ->> 'tenant_id')::uuid`).
- **PROIBIDO:** Sob nenhuma hipótese exponha a chave `service_role` do Supabase no código client-side.

## 4. UI/UX (Blue-Collar Design)
- **Cores (DeWalt Premium):** Fundo predominante em Slate 950 (`#0f172a` ou `#1F2326`) com calls-to-action em Amber 500 (`#f59e0b`).
- **Thumb Zone:** Botões principais de conversão devem estar centralizados na parte inferior da tela. Alvos de toque (Touch Targets) DEVEM ter entre 48px e 56px para uso confortável com apenas uma mão.
- **Sombras:** Use "Stamped shadows" (sombras curtas + inset) para simular botões industriais usinados, nada de sombras difusas SaaS.

## 5. Engine de PDF
- A geração de PDFs DEVE ser 100% Client-Side. 
- Use preferencialmente `jsPDF` com `jspdf-autotable`. Embuta logos e fontes críticas (como Inter/Barlow) diretamente em Base64 no código para que a geração funcione sem rede em subsolos de clientes.

## 6. Painel de Administração (Admin Dashboard)
- Crie uma área restrita sob a rota `/admin`.
- **Proteção de Rota:** O acesso a `/admin` só pode ser renderizado se a coluna `role` do perfil logado for igual a `'admin'`. Caso contrário, redirecione para `/`.
- **Funções Exigidas no Painel:** O admin deve poder visualizar todos os usuários (`profiles`), ver as tabelas `wallets` (para processar saques de indicação) e ter um botão para editar o `status` do usuário (para aprovar premium manualmente).
- O layout do painel admin também deve ser focado no Mobile (para o dono operar do celular).

