import { Navigate } from 'react-router-dom';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';

interface Props {
  children: React.ReactNode;
}

export function SuperAdminRoute({ children }: Props) {
  const { loading, adminCheckLoading, isSuperAdmin } = useSuperAdmin();

  if (loading || (adminCheckLoading && !isSuperAdmin)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <>{children}</>;
}
