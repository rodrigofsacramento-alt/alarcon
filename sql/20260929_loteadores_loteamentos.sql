-- ============================================================
-- TCK Imoveis: Loteadores/Proprietarios + Loteamentos (29/09/2026)
-- Segmentação de loteadores/proprietários e loteamentos, vínculo com
-- properties (terrenos/lotes) + deeplink. Multi-tenant: tenant_id + RLS.
-- Só estrutura — SEM dados fake.
-- ============================================================

-- 1) LOTEADORES / PROPRIETÁRIOS
create table if not exists public.loteadores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  nome text not null,
  tipo text not null default 'pessoa' check (tipo in ('pessoa','empresa')),
  telefone text,
  whatsapp text,
  documento text,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) LOTEAMENTOS
create table if not exists public.loteamentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  nome text not null,
  cidade text,
  estado text,
  disponibilidade boolean not null default true,
  valor_minimo numeric,
  valor_maximo numeric,
  loteador_id uuid references public.loteadores(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Vínculo de imóveis (terrenos/lotes) a loteamento e/ou loteador
alter table public.properties
  add column if not exists loteamento_id uuid references public.loteamentos(id) on delete set null;
alter table public.properties
  add column if not exists loteador_id uuid references public.loteadores(id) on delete set null;

-- 4) tenant_id automático (mesmo padrão de properties)
drop trigger if exists trg_auto_tenant_id_loteadores on public.loteadores;
create trigger trg_auto_tenant_id_loteadores before insert on public.loteadores
  for each row execute function auto_set_tenant_id();

drop trigger if exists trg_auto_tenant_id_loteamentos on public.loteamentos;
create trigger trg_auto_tenant_id_loteamentos before insert on public.loteamentos
  for each row execute function auto_set_tenant_id();

-- updated_at
drop trigger if exists trg_loteadores_updated_at on public.loteadores;
create trigger trg_loteadores_updated_at before update on public.loteadores
  for each row execute function lote_touch_updated_at();

drop trigger if exists trg_loteamentos_updated_at on public.loteamentos;
create trigger trg_loteamentos_updated_at before update on public.loteamentos
  for each row execute function lote_touch_updated_at();

-- 5) RLS
alter table public.loteadores enable row level security;
alter table public.loteamentos enable row level security;

drop policy if exists loteadores_select on public.loteadores;
create policy loteadores_select on public.loteadores for select
  using (tenant_id = get_my_tenant_id());
drop policy if exists loteadores_insert on public.loteadores;
create policy loteadores_insert on public.loteadores for insert
  with check (tenant_id = get_my_tenant_id());
drop policy if exists loteadores_update on public.loteadores;
create policy loteadores_update on public.loteadores for update
  using (tenant_id = get_my_tenant_id()) with check (tenant_id = get_my_tenant_id());
drop policy if exists loteadores_delete on public.loteadores;
create policy loteadores_delete on public.loteadores for delete
  using (tenant_id = get_my_tenant_id());
drop policy if exists loteadores_service_all on public.loteadores;
create policy loteadores_service_all on public.loteadores for all
  using (current_setting('role') = 'service_role') with check (current_setting('role') = 'service_role');

drop policy if exists loteamentos_select on public.loteamentos;
create policy loteamentos_select on public.loteamentos for select
  using (tenant_id = get_my_tenant_id());
drop policy if exists loteamentos_insert on public.loteamentos;
create policy loteamentos_insert on public.loteamentos for insert
  with check (tenant_id = get_my_tenant_id());
drop policy if exists loteamentos_update on public.loteamentos;
create policy loteamentos_update on public.loteamentos for update
  using (tenant_id = get_my_tenant_id()) with check (tenant_id = get_my_tenant_id());
drop policy if exists loteamentos_delete on public.loteamentos;
create policy loteamentos_delete on public.loteamentos for delete
  using (tenant_id = get_my_tenant_id());
drop policy if exists loteamentos_service_all on public.loteamentos;
create policy loteamentos_service_all on public.loteamentos for all
  using (current_setting('role') = 'service_role') with check (current_setting('role') = 'service_role');

-- 6) Índices
create index if not exists idx_loteadores_tenant on public.loteadores(tenant_id);
create index if not exists idx_loteamentos_tenant on public.loteamentos(tenant_id);
create index if not exists idx_loteamentos_loteador on public.loteamentos(loteador_id);
create index if not exists idx_properties_loteamento_id on public.properties(loteamento_id);
create index if not exists idx_properties_loteador_id on public.properties(loteador_id);