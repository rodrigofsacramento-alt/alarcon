import { useMemo, useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useGlobalUsers,
  useToggleUserActive,
  useTenants,
} from '@/hooks/use-super-admin';
import {
  SAPageHeader, SAStatCard, SACard, SABadge, SAEmptyState, SAButton,
  SAFilterBar, SAPagination, SA_TOKENS,
} from '@/components/super-admin/ui';
import {
  Users, Search, Filter, MoreHorizontal,
  ShieldCheck, UserCog, Briefcase, UserCircle2,
  Lock, Unlock, Building2, CheckCircle2, Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import { format } from 'date-fns';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', manager: 'Gestor', agent: 'Consultor', client: 'Cliente',
};

const ROLE_TONE: Record<string, 'accent' | 'info' | 'success' | 'neutral'> = {
  admin: 'accent', manager: 'info', agent: 'success', client: 'neutral',
};

export default function SuperAdminUsers() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: usersData, isLoading } = useGlobalUsers(page, pageSize, {
    search,
    role: roleFilter,
    tenant_id: tenantFilter,
    status: statusFilter,
  });
  const users = usersData?.data ?? [];
  const totalCount = usersData?.count ?? 0;
  const { data: tenantsData } = useTenants();
  const tenants = tenantsData?.data ?? [];
  const toggleMutation = useToggleUserActive();

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, tenantFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: totalCount,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'manager').length,
    agents: users.filter(u => u.role === 'agent').length,
  }), [users, totalCount]);

  const handleToggle = async (userId: string, current: boolean) => {
    try {
      await toggleMutation.mutateAsync({ userId, active: !current });
      toast({ title: current ? 'Usuário bloqueado' : 'Usuário ativado' });
    } catch (e) {
      toast({ title: 'Erro', description: translateError(e), variant: 'destructive' });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Usuários Globais"
          description="Todos os usuários cadastrados no sistema, em todas as empresas"
          icon={Users}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SAStatCard label="Total" value={stats.total} icon={Users} iconColor="#60a5fa" />
          <SAStatCard label="Ativos" value={stats.active} icon={CheckCircle2} iconColor="#10b981" />
          <SAStatCard label="Gestores" value={stats.admins} icon={ShieldCheck} iconColor={SA_TOKENS.accent} />
          <SAStatCard label="Consultores" value={stats.agents} icon={Briefcase} iconColor="#8b5cf6" />
        </div>

        <SAFilterBar>
          <SAButton
            variant="secondary"
            icon={Download}
            size="sm"
            onClick={() => exportToCSV(users, [
              { key: 'full_name', label: 'Nome' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Papel' },
              { key: 'is_active', label: 'Ativo' },
              { key: 'tenant', label: 'Empresa' },
              { key: 'created_at', label: 'Criado em' },
            ], 'usuarios')}
          >
            CSV
          </SAButton>
          <SAButton
            variant="secondary"
            icon={Download}
            size="sm"
            onClick={() => exportToPDF('Relatório de Usuários', users, [
              { key: 'full_name', label: 'Nome' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Papel', format: (v) => ROLE_LABEL[String(v)] || String(v) },
              { key: 'is_active', label: 'Ativo', format: (v) => v ? 'Sim' : 'Não' },
              { key: 'tenant', label: 'Empresa', format: (v) => (v && typeof v === 'object' && 'name' in v) ? String((v as Record<string, unknown>).name) : '-' },
              { key: 'created_at', label: 'Criado em', format: (v) => v ? format(new Date(String(v)), 'dd/MM/yyyy') : '-' },
            ], 'usuarios')}
          >
            PDF
          </SAButton>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: SA_TOKENS.textMuted }} />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 bg-transparent border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-transparent border-white/10 text-white">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="Papel" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todos papéis</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Gestor</SelectItem>
              <SelectItem value="agent">Consultor</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tenantFilter} onValueChange={setTenantFilter}>
            <SelectTrigger className="w-[180px] h-9 bg-transparent border-white/10 text-white">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todas empresas</SelectItem>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 bg-transparent border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </SAFilterBar>

        <SACard noPadding>
          {isLoading ? (
            <div className="p-8 text-center text-sm" style={{ color: SA_TOKENS.textMuted }}>Carregando...</div>
          ) : users.length === 0 ? (
            <SAEmptyState icon={Users} title="Nenhum usuário" description="Não há usuários para os filtros aplicados" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${SA_TOKENS.border}` }}>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Usuário</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Empresa</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Papel</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Status</th>
                    <th className="px-5 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: `1px solid ${SA_TOKENS.borderSubtle}` }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
                               style={{ background: SA_TOKENS.accentBg, color: SA_TOKENS.accentLight }}>
                            {(u.full_name || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>{u.full_name}</p>
                            <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: SA_TOKENS.textSecondary }}>
                        {u.tenant?.name || <span style={{ color: SA_TOKENS.textMuted }}>—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <SABadge tone={ROLE_TONE[u.role] || 'neutral'}>
                          {ROLE_LABEL[u.role] || u.role}
                        </SABadge>
                      </td>
                      <td className="px-5 py-3">
                        {u.is_active ? (
                          <SABadge tone="success" icon={CheckCircle2}>Ativo</SABadge>
                        ) : (
                          <SABadge tone="danger" icon={Lock}>Bloqueado</SABadge>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded hover:bg-white/5">
                              <MoreHorizontal className="w-4 h-4" style={{ color: SA_TOKENS.textMuted }} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => handleToggle(u.id, !!u.is_active)}
                              className="text-slate-300 focus:bg-slate-700"
                            >
                              {u.is_active ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                              {u.is_active ? 'Bloquear' : 'Desbloquear'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <SAPagination page={page} pageSize={pageSize} total={totalCount} onPageChange={setPage} />
        </SACard>
      </div>
    </SuperAdminLayout>
  );
}
