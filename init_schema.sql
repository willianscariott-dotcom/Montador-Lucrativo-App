  -- ============================================================
  -- MONTADOR PRO - Schema Inicial
  -- Multi-Tenant + RLS Completo
  -- ============================================================

  -- ============================================================
  -- EXTENSIONS
  -- ============================================================
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- ============================================================
  -- FUNÇÕES AUXILIARES
  -- ============================================================

  -- Função helper para extrair tenant_id do JWT
  CREATE OR REPLACE FUNCTION get_tenant_id()
  RETURNS UUID AS $$
  BEGIN
    RETURN (auth.jwt() ->> 'tenant_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

  -- ============================================================
  -- FUNÇÃO is_admin() - Obrigatória para bypass de RLS
  -- SECURITY DEFINER para contornar RLS durante verificação
  -- ============================================================
  CREATE OR REPLACE FUNCTION is_admin()
  RETURNS BOOLEAN AS $$
  BEGIN
    IF auth.uid() IS NULL THEN
      RETURN FALSE;
    END IF;
    RETURN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

  -- ============================================================
  -- TABELA: profiles
  -- ============================================================
  CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL DEFAULT (auth.jwt() ->> 'tenant_id')::UUID,
    full_name TEXT,
    phone TEXT UNIQUE,
    invited_by UUID REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'free', 'expired')),
    settings JSONB DEFAULT '{}',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ============================================================
  -- TABELA: wallets
  -- ============================================================
  CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ============================================================
  -- TABELA: quotes
  -- ============================================================
  CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    client_name TEXT NOT NULL,
    client_document TEXT,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ============================================================
  -- TABELA: quote_items
  -- ============================================================
  CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service', 'material')),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ============================================================
  -- TABELA: assets
  -- ============================================================
  CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
    useful_life_months INTEGER NOT NULL CHECK (useful_life_months > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ============================================================
  -- ÍNDICES
  -- ============================================================
  CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
  CREATE INDEX idx_profiles_invited_by ON profiles(invited_by);
  CREATE INDEX idx_wallets_profile ON wallets(profile_id);
  CREATE INDEX idx_quotes_tenant ON quotes(tenant_id);
  CREATE INDEX idx_quotes_status ON quotes(status);
  CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
  CREATE INDEX idx_quote_items_tenant ON quote_items(tenant_id);
  CREATE INDEX idx_assets_tenant ON assets(tenant_id);

  -- ============================================================
  -- TRIGGER: Auto-create profile on auth.users insert
  -- ============================================================
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  DECLARE
    v_tenant_id UUID;
  BEGIN
    -- Se o JWT tiver tenant_id, usa ele; caso contrário usa o próprio user id como tenant
    v_tenant_id := COALESCE(
      (auth.jwt() ->> 'tenant_id')::UUID,
      NEW.id
    );

    INSERT INTO profiles (id, tenant_id, full_name)
    VALUES (NEW.id, v_tenant_id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

  -- ============================================================
  -- TRIGGER: Auto-create wallet on profile insert
  -- ============================================================
  CREATE OR REPLACE FUNCTION handle_new_profile()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO wallets (profile_id)
    VALUES (NEW.id);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

  -- ============================================================
  -- TRIGGER: Update updated_at
  -- ============================================================
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  CREATE TRIGGER wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  CREATE TRIGGER quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  CREATE TRIGGER quote_items_updated_at
    BEFORE UPDATE ON quote_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  CREATE TRIGGER assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  -- ============================================================
  -- FUNÇÃO: Atualizar total_amount do quote ao modificar itens
  -- ============================================================
  CREATE OR REPLACE FUNCTION recalculate_quote_total()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE quotes
    SET total_amount = (
      SELECT COALESCE(SUM(quantity * unit_price), 0)
      FROM quote_items
      WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    )
    WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
    RETURN COALESCE(NEW, OLD);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_quote_item_change
    AFTER INSERT OR UPDATE OR DELETE ON quote_items
    FOR EACH ROW EXECUTE FUNCTION recalculate_quote_total();

  -- ============================================================
  -- RLS: Enable Row Level Security
  -- ============================================================

  -- PROFILES
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "profiles_select_own_or_admin"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR is_admin());

  CREATE POLICY "profiles_update_own_or_admin"
    ON profiles FOR UPDATE
    USING (id = auth.uid() OR is_admin());

  CREATE POLICY "profiles_insert_system_only"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

  -- WALLETS
  ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "wallets_select_own_or_admin"
    ON wallets FOR SELECT
    USING (profile_id = auth.uid() OR is_admin());

  CREATE POLICY "wallets_update_by_admin"
    ON wallets FOR UPDATE
    USING (is_admin());

  -- QUOTES
  ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "quotes_select_tenant_or_admin"
    ON quotes FOR SELECT
    USING (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "quotes_insert_tenant"
    ON quotes FOR INSERT
    WITH CHECK (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "quotes_update_tenant_or_admin"
    ON quotes FOR UPDATE
    USING (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "quotes_delete_tenant_or_admin"
    ON quotes FOR DELETE
    USING (tenant_id = get_tenant_id() OR is_admin());

  -- QUOTE_ITEMS
  ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "quote_items_select_tenant_or_admin"
    ON quote_items FOR SELECT
    USING (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "quote_items_insert_tenant"
    ON quote_items FOR INSERT
    WITH CHECK (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "quote_items_update_tenant_or_admin"
    ON quote_items FOR UPDATE
    USING (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "quote_items_delete_tenant_or_admin"
    ON quote_items FOR DELETE
    USING (tenant_id = get_tenant_id() OR is_admin());

  -- ASSETS
  ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "assets_select_tenant_or_admin"
    ON assets FOR SELECT
    USING (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "assets_insert_tenant"
    ON assets FOR INSERT
    WITH CHECK (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "assets_update_tenant_or_admin"
    ON assets FOR UPDATE
    USING (tenant_id = get_tenant_id() OR is_admin());

  CREATE POLICY "assets_delete_tenant_or_admin"
    ON assets FOR DELETE
    USING (tenant_id = get_tenant_id() OR is_admin());

  -- ============================================================
  -- GRANT PERMISSIONS
  -- ============================================================

  -- Tables
  GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
  GRANT SELECT, UPDATE ON wallets TO authenticated;
  GRANT ALL ON quotes TO authenticated;
  GRANT ALL ON quote_items TO authenticated;
  GRANT ALL ON assets TO authenticated;

  -- Sequences (for UUID generation)
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

  -- Functions (for triggers and security)
  GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
  GRANT EXECUTE ON FUNCTION get_tenant_id() TO authenticated;
  GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
  GRANT EXECUTE ON FUNCTION handle_new_profile() TO authenticated;