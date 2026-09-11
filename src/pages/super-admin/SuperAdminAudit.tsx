import { useState } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { useAuditLogs } from '@/hooks/use-super-admin';
import { SAPagination } from '@/components/super-admin/ui';
import { ScrollText, Search, Filter, Loader2, User, Building2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const resourceColors: Record<string, string> = {
  tenant:    'text-violet-400 bg-violet-500/10 border-violet-500/20',
  plan:      'text-blue-400 bg-blue-500/10 border-blue-500/20',
  user:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
  lead:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  proposal:  'text-pink-400 bg-pink-500/10 border-pink-500/20',
  property:  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  auth:      'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function SuperAdminAudit() {
  const [search, setSearch] = useState('');
  const [filterResource, setFilterResource] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { data: logsData, isLoading } = useAuditLogs(page, pageSize);
  const logs = logsData?.data ?? [];
  const totalCount = logsData?.count ?? 0;

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchResource = filterResource === 'all' || l.resource_type === filterResource;
    return matchSearch && matchResource;
  });

  const resourceTypes = [...new Set(logs.map(l => l.resource_type))];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Auditoria</h1>
          <p className="text-slate-400 text-sm mt-1">Log completo de ações realizadas no sistema</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ação, usuário ou descrição..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            />
          </div>
          <select
            value={filterResource}
            onChange={e => setFilterResource(e.target.value)}
            className="px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          >
            <option value="all">Todos os recursos</option>
            {resourceTypes.map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Logs */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum log encontrado</p>
              <p className="text-xs mt-1">As ações do sistema aparecerão aqui conforme ocorrem</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {filtered.map(log => {
                const colorClass = resourceColors[log.resource_type] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20';
                const tenant = log.tenant as { name?: string } | null;
                return (
                  <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center shrink-0 mt-0.5">
                      <ScrollText className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                          {log.resource_type}
                        </span>
                        <span className="text-sm font-medium text-white">{log.action}</span>
                      </div>
                      {log.description && (
                        <p className="text-xs text-slate-400 mb-1.5">{log.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {log.user_email && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user_email}
                          </span>
                        )}
                        {tenant?.name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {tenant.name}
                          </span>
                        )}
                        {log.ip_address && (
                          <span className="text-slate-600">{log.ip_address}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="w-3 h-3" />
                      {log.created_at
                        ? format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })
                        : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <SAPagination page={page} pageSize={pageSize} total={totalCount} onPageChange={setPage} />
        </div>
      </div>
    </SuperAdminLayout>
  );
}
