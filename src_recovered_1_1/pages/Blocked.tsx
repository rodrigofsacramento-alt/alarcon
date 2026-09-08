import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { AlertOctagon, CreditCard, Mail, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface InvoiceData {
  invoice_url: string;
  due_date: string;
  value_cents: number;
}

export default function Blocked() {
  const { signOut, user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchInvoice() {
      try {
        const { data, error } = await supabase.rpc("get_latest_pending_invoice");
        if (error) throw error;
        
        if (data && data.length > 0) {
          setInvoice(data[0]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar fatura pendente:", err);
      } finally {
        setLoadingInvoice(false);
      }
    }

    fetchInvoice();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (err: any) {
      toast({
        title: "Erro ao sair",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8 space-y-6 relative z-10 backdrop-blur-sm">
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse-accent">
            <AlertOctagon className="h-8 w-8" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Acesso Suspenso
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O período de testes (trial) ou a assinatura da sua imobiliária expirou. 
            Para restabelecer o acesso aos painéis, leads e integração de WhatsApp, regularize sua conta.
          </p>
        </div>

        {/* Invoice Section */}
        {loadingInvoice ? (
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
            <Loader2 className="h-5 w-5 animate-spin text-accent mr-2" />
            <span className="text-xs text-muted-foreground">Buscando informações de faturamento...</span>
          </div>
        ) : invoice ? (
          <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-3">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Fatura pendente:</span>
              <span className="font-semibold text-foreground">{formatBRL(invoice.value_cents)}</span>
            </div>
            {invoice.due_date && (
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Vencimento:</span>
                <span className="font-semibold text-foreground">{formatDate(invoice.due_date)}</span>
              </div>
            )}
            <Button
              variant="cta"
              className="w-full gap-2 shadow-accent"
              onClick={() => window.open(invoice.invoice_url, "_blank")}
            >
              <CreditCard className="h-4 w-4" />
              Pagar Fatura no Asaas
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              Nenhuma fatura automática pendente encontrada. Entre em contato com nossa equipe para gerar a cobrança.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => window.open("mailto:suporte@bardendev.com", "_blank")}
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Contatar Suporte
          </Button>

          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="mt-8 text-xs text-muted-foreground opacity-60">
        ApeXfy SaaS &copy; {new Date().getFullYear()} — Todos os direitos reservados.
      </p>
    </div>
  );
}
