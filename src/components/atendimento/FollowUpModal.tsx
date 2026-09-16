import { useState } from "react";
import { Calendar, Clock, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateFollowUp } from "@/hooks/use-followups";

interface FollowUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  conversationId: string;
  onCreated?: () => void;
}

export function FollowUpModal({
  open,
  onOpenChange,
  tenantId,
  conversationId,
  onCreated,
}: FollowUpModalProps) {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const createFollowUp = useCreateFollowUp();
  const isPending = createFollowUp.isPending;

  const isValid = !!date && !!time;

  const handleSubmit = async () => {
    if (!isValid) return;
    const scheduled_at = new Date(`${date}T${time}:00`).toISOString();
    try {
      await createFollowUp.mutateAsync({
        tenant_id: tenantId,
        conversation_id: conversationId,
        message,
        scheduled_at,
      });
      setMessage("");
      setDate("");
      setTime("");
      onOpenChange(false);
      onCreated?.();
    } catch {
      // erro é propagado pelo toast/erro do mutation
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <AlarmClock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Agendar Follow-up</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Programe um retorno para esta conversa
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Mensagem */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-accent" />
              <span>Mensagem de lembrete</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="followupMessage">Mensagem *</Label>
                <Textarea
                  id="followupMessage"
                  placeholder="Escreva o lembrete do follow-up (ex.: retornar com o corretor sobre o imóvel...)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4 text-accent" />
              <span>Agendamento</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followupDate">Data *</Label>
                  <div className="relative">
                    <input
                      id="followupDate"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={today}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followupTime">Horário *</Label>
                  <div className="relative">
                    <input
                      id="followupTime"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="cta" onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              "Agendar Follow-up"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}