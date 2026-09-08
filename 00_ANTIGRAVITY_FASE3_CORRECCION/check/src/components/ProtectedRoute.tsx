import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}
export function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const {
    user,
    profile,
    loading,
    profileLoading,
    tenantId,
    tenantStatus
  } = useAuth();
  if (loading || user && profileLoading && !profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to blocked screen if tenant is suspended
  if (tenantStatus === 'suspended') {
    return <Navigate to="/blocked" replace />;
  }

  // Role-based access control
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'client') {
      return <Navigate to="/area-cliente" replace />;
    }
    if (profile.role === 'agent') {
      return <Navigate to="/corretor-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}