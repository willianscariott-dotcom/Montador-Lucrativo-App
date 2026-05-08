# Arquitetura de Banco de Dados - Montador Lucrativo (Supabase)

## 1. Paradigma Multi-Tenant e Segurança
- **Isolamento de Dados:** Utilizaremos "Tabela Compartilhada com RLS (Row Level Security)". 
- **Regra de Ouro:** TODAS as tabelas transacionais devem ter uma coluna `tenant_id` (UUID). 
- O acesso a qualquer linha é estritamente bloqueado pelas políticas do PostgreSQL usando JWT Claims ou funções que validam `tenant_id = auth.uid()` ou via tabela de organização.
- **Bypass de Admin:** Todas as políticas RLS (SELECT, INSERT, UPDATE, DELETE) em todas as tabelas devem ter uma cláusula OR permitindo acesso total se o usuário for administrador. Exemplo lógico: `tenant_id = auth.uid() OR is_admin()`.

## 2. Estrutura de Tabelas (Schema)

### Tabela: `profiles`
Gerencia a identidade do usuário, vínculo com a autenticação e o sistema de indicações (Referral).
- `id` (UUID, Primary Key, Foreign Key para `auth.users`)
- `tenant_id` (UUID, Not Null)
- `full_name` (TEXT)
- `phone` (TEXT, Unique) - Trava anti-freeloader.
- `invited_by` (UUID, Nullable, Foreign Key para `profiles.id`) - Rastreia quem indicou este usuário.
- `status` (TEXT) - 'trial', 'active', 'free', 'expired'.
- `settings` (JSONB) - Preferências da empresa (cores, logo base64).
- `role` (TEXT, Default 'user') - Pode ser 'user' ou 'admin'.


### Tabela: `wallets` (Sistema de Indicação/Cashback)
Rastreia o saldo ganho com indicações.
- `id` (UUID, Primary Key)
- `profile_id` (UUID, Foreign Key para `profiles.id`)
- `balance` (NUMERIC(12,2), Default 0) - Saldo em R$.
- `total_earned` (NUMERIC(12,2), Default 0) - Total histórico ganho.

### Tabela: `quotes` (Cabeçalho de Orçamentos)
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Not Null)
- `client_name` (TEXT, Not Null)
- `client_document` (TEXT) - CPF/CNPJ.
- `total_amount` (NUMERIC(12,2)) - Uso de NUMERIC para precisão financeira.
- `status` (TEXT) - 'draft', 'sent', 'approved', 'completed'.
- `created_at` (TIMESTAMPTZ)

### Tabela: `quote_items` (Itens do Orçamento)
Diferencia serviços de peças para cálculos independentes.
- `id` (UUID, Primary Key)
- `quote_id` (UUID, Foreign Key para `quotes.id`, ON DELETE CASCADE)
- `tenant_id` (UUID, Not Null)
- `type` (TEXT) - 'service' ou 'material'.
- `description` (TEXT)
- `quantity` (INTEGER)
- `unit_price` (NUMERIC(12,2))

### Tabela: `assets` (Ferramentas e Depreciação)
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Not Null)
- `name` (TEXT) - Ex: Furadeira Makita.
- `purchase_price` (NUMERIC(12,2))
- `useful_life_months` (INTEGER) - Meses de vida útil para amortização.

## 3. Lógica de Negócios e Triggers (Funções)
- **Criação Automática de Perfil:** Um `Trigger` deve escutar `auth.users` e inserir uma linha em `profiles` automaticamente.
- **Recompensa de Indicação:** Uma Edge Function (ou Trigger) deve escutar os pagamentos do sistema (Stripe/Pix). Quando um usuário paga a primeira mensalidade, o sistema verifica a coluna `invited_by` no `profiles` do pagador. Se existir, adiciona R$ 5.00 no `balance` da tabela `wallets` do indicador.
- **Função Admin (Security Definer):** Crie uma função `is_admin()` que verifica se o `auth.uid()` possui `role = 'admin'` na tabela `profiles`. Essa função DEVE ser `SECURITY DEFINER` para contornar o RLS durante a verificação.

## 4. Tipos de Dados Críticos
- Valores Monetários SEMPRE usarão `NUMERIC(12,2)`.
- Meta-dados flexíveis (configurações visuais do PDF) usarão `JSONB`.
- Chaves Estrangeiras sempre usarão `UUID`.