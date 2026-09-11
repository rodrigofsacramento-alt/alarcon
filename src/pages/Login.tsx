import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { translateError } from "@/lib/error-messages";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const loginMode = true;

  const navigateByProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setError("Não foi possível validar a sessão do usuário.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", authUser.id)
      .single();

    if (!profile?.role) {
      setError("Seu usuário não possui perfil válido para acessar o sistema.");
      return;
    }

    if (profile.role !== "client" && !profile.tenant_id) {
      setError("Seu usuário não está vinculado a nenhuma empresa.");
      return;
    }

    if (profile.role === "client") {
      navigate("/area-cliente");
    } else if (profile.role === "agent") {
      navigate("/corretor-dashboard");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    setGoogleLoading(true);
    setError("");

    supabase.auth.exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        window.history.replaceState({}, document.title, window.location.pathname);
        if (exchangeError) {
          setError(translateError(exchangeError));
          return;
        }
        return navigateByProfile();
      })
      .catch((err: any) => {
        setError(err?.message || "Erro ao validar login Google.");
      })
      .finally(() => setGoogleLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (authLoading || !session || params.get("code")) return;

    setError("");
    setGoogleLoading(true);
    navigateByProfile().finally(() => setGoogleLoading(false));
  }, [authLoading, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email.trim(), password.trim());
      if (error) {
        setError(`${error.message} - ${translateError(error)}`);
      } else {
        await navigateByProfile();
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    const { error } = await signInWithGoogle();
    if (error) {
      setError(translateError(error));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://i.imgur.com/cUiF709.png"
          alt="Estate.ia Imobiliaria"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {loginMode ? "Bem-vindo de volta" : "Acesso ao sistema"}
          </h2>
          <p className="text-muted-foreground mb-8">
            Entre com suas credenciais para acessar o sistema.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3 font-semibold"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Entrar com Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {loginMode && (
                  <button type="button" className="text-xs text-accent hover:underline">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" variant="cta" disabled={loading || googleLoading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              O acesso é liberado apenas para usuários provisionados pela sua empresa.
            </p>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Estate.ia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
