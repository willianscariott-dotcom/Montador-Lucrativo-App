# Montador Lucrativo - Regras para a IA (Antigravity / OpenCode)

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

## Progress
### Done
- Configuração inicial do projeto (Vite + React + Tailwind v4 + Supabase)
- Sistema de Auth com Login/Signup via Zustand
- Dashboard com BottomNav e tabs (Home, Quotes, Clients, Documents, Settings)
- QuoteBuilder com RLS fixado (tenant_id via supabase.auth.getSession), mutation com invalidar queries, PDF download
- PDF Engine completo com A4, logo customizável, tables, status em português, Instagram footer, premium mode
- PricingSettings com cálculo Valor/Hora, detalhamento de lucro (margem %, valor lucro/mês, total c/ lucro)
- HomeTab: Saldo Mensal isolado, Saldo Geral Acumulado, Receitas/Despesas mensais, navegação mensal, barra meta com gamificação, limite anual, modo privacidade (Eye), pb-24
- SettingsTab: CatalogManager, PricingSettings, ReferralDashboard, UpgradePlan, CategoriesManager, AccountsManager, LimitsManager, ReminderManager, WarrantyManager, ProfileManager
- ClientsTab: modal completo, editar/excluir, WhatsApp button direto (wa.me/55), máscara CPF/CNPJ dinâmica, campo Data de Nascimento, alerta aniversário
- QuotesTab: useQuery com quotes do Supabase, PDF/WhatsApp conectados, CRUD completo, status ('draft'/'approved'/'paid'/'rejected'), automação de caixa em Marcar Pago, Google Calendar (draft + approved)
- WarrantyManager: 3 textareas (intro, cobre, não cobre), salvar em settings.warranty
- HomeTab: filtros estritos getMonth/getFullYear, recorrentes filtrados por monthStart/monthEnd, pb-24, privacyMode com blur-sm
- Relatório Anual PDF em DocumentsTab (com geração por ano, totais mensais, receitas/despesas/balance)
- Perfil completo via ProfileManager (nome, telefone, avatar upload base64, endereço, CNPJ, Instagram, chave Pix)
- Google Calendar botão no QuoteBuilder e no QuotesTab (draft + approved)
- useUpdateProfile hook em useProfile.js
- Meta de Faturamento condicional: mês futuro oculta barra/dias, mês passado mostra "Fechamento", mês atual mostra dias restantes
- TransactionModal: editing suporta recorrência (checkbox + repeatMonths visível), cria múltiplas instâncias no JSONB
- HomeTab: FinanceSettingsModal com botões de Contas e Categorias via ícone SlidersHorizontal no header
- QuoteBuilder: DEFAULT_SERVICES + DEFAULT_PARTS pré-populados, select com Avulso, campo detalhes/especificação em todos os itens, layout reorganizado com "Itens Adicionados" e linha divisória, detalhes no PDF
- Transações recorrentes: filtro exato por mês/ano (sem acumulação), soma sem multiplier
- Transações: botões editar/excluir com Pencil + Trash2 em cada item
- Desmarcar Pago em QuotesTab: status volta para 'approved', remove transação com quote_id do JSONB
- ProfileManager: pb-24 + mb-24 para não ficar atrás da BottomNav

### In Progress
- Admin Dashboard em /admin

### Blocked
- (none)

### Next Steps
- Admin Dashboard (/admin): ver profiles, wallets, editar status do usuário
- Testar e validar tudo

