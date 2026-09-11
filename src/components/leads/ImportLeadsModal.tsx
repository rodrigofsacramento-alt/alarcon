import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAgents } from "@/hooks/use-agents";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ImportLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedLead {
  originalName: string;
  name: string;
  phone: string;
  email: string;
  originalAgent: string;
  responsible_id: string | null;
  notes: string;
  status: "valid" | "invalid_agent" | "missing_name";
}

export function ImportLeadsModal({ open, onOpenChange }: ImportLeadsModalProps) {
  const { data: agents = [] } = useAgents();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      parseFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      parseFile(dropped);
    }
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    setStep(2);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      const processed: ParsedLead[] = jsonData.map((row: any) => {
        // Passo 2: Padronização Bruta
        const name = row["Nome"] || row["Nome do contato"] || [row["Primeiro Nome"], row["Último Nome"]].filter(Boolean).join(" ") || "";
        const phone = (row["Número"] || row["Telefone"] || row["Phone"] || row["Número de telefone"] || "").toString();
        const email = (row["Email"] || row["E-mail"] || row["e-mail"] || "").toString().trim();
        const agentName = (row["Agente"] || row["Agente "] || "").toString().trim();
        const tags = row["Grupo"] ? [row["Grupo"].toString()] : [];

        // Agrupar campos extras em Notes
        const extraData = [];
        if (row["CPF"]) extraData.push(`CPF: ${row["CPF"]}`);
        if (row["Data Nascimento"]) extraData.push(`Nasc: ${row["Data Nascimento"]}`);
        if (row["Empresa"]) extraData.push(`Empresa: ${row["Empresa"]}`);
        const notes = extraData.join(" | ");

        // Passo 3: Busca e Mapeamento Inteligente
        let responsible_id = null;
        if (agentName) {
          const matchedAgent = agents.find(
            (a) =>
              a.full_name.toLowerCase().includes(agentName.toLowerCase()) ||
              agentName.toLowerCase().includes(a.full_name.toLowerCase().split(' ')[0])
          );
          if (matchedAgent) {
            responsible_id = matchedAgent.id;
          }
        }

        // Validação da linha
        let status: ParsedLead["status"] = "valid";
        if (!name) {
          status = "missing_name";
        } else if (agentName && !responsible_id) {
          status = "invalid_agent";
        }

        return {
          originalName: name,
          name,
          phone,
          email,
          originalAgent: agentName,
          responsible_id,
          notes,
          tags,
          status,
        };
      });

      setParsedLeads(processed);
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao ler o arquivo. Verifique o formato.");
      setStep(1);
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const validLeads = parsedLeads.filter((l) => l.status === "valid" || l.status === "invalid_agent");
      
      const payload = validLeads.map((l) => ({
        name: l.name,
        phone: l.phone,
        email: l.email || null,
        responsible_id: l.responsible_id,
        notes: l.notes,
        stage: "Lead Cadastrado",
        source: "Outros",
        tags: (l as any).tags || [],
      }));

      // 1. Buscar todos os telefones que já existem no banco
      const { data: existingData, error: fetchError } = await supabase
        .from("leads")
        .select("phone")
        .not("phone", "is", null);
      
      if (fetchError) throw fetchError;

      // 2. Criar um Set para busca super rápida
      const existingPhones = new Set(existingData.map(l => l.phone));
      const uniquePayload = [];

      // 3. Filtrar a planilha: remover quem já tá no banco E remover duplicados dentro da própria planilha
      for (const lead of payload) {
        // Se tem telefone e já existe no Set, pula (ignora)
        if (lead.phone && existingPhones.has(lead.phone)) {
          continue;
        }
        // Se tem telefone, adiciona no Set pra não repetir o próximo
        if (lead.phone) {
          existingPhones.add(lead.phone);
        }
        uniquePayload.push(lead);
      }

      if (uniquePayload.length === 0) {
        toast.info("Nenhum lead importado: todos os telefones já existem no sistema.");
        setIsImporting(false);
        return;
      }

      // Inserir em lotes menores (100) e com uma pausa para não sobrecarregar o Supabase
      const CHUNK_SIZE = 100;
      for (let i = 0; i < uniquePayload.length; i += CHUNK_SIZE) {
        const chunk = uniquePayload.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from("leads").insert(chunk);
        if (error) throw error;
        
        // Pausa de 300ms entre cada lote para o banco "respirar" e evitar o Failed to fetch
        if (i + CHUNK_SIZE < payload.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      toast.success(`${uniquePayload.length} leads importados com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro na importação: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setParsedLeads([]);
  };

  const validCount = parsedLeads.filter((l) => l.status === "valid").length;
  const invalidAgentCount = parsedLeads.filter((l) => l.status === "invalid_agent").length;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Importação Inteligente de Leads</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Importe planilhas brutas (.xlsx, .csv) e mapeie automaticamente
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div
              className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Arraste sua planilha aqui ou clique para selecionar
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Formatos aceitos: .xlsx, .csv. O sistema padronizará os campos e mapeará os agentes automaticamente.
              </p>
              <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Selecionar Arquivo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
              <h3 className="text-lg font-medium">Processando e padronizando dados...</h3>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{parsedLeads.length}</p>
                    <p className="text-sm text-muted-foreground">Total Encontrados</p>
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{validCount}</p>
                    <p className="text-sm text-muted-foreground">Prontos / Mapeados</p>
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{invalidAgentCount}</p>
                    <p className="text-sm text-muted-foreground">Agente não encontrado</p>
                  </div>
                </div>
              </div>

              {invalidAgentCount > 0 && (
                <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3 text-warning-foreground text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                  <p>
                    Alguns leads possuem um Agente preenchido na planilha que não foi encontrado no banco de dados.
                    Eles serão importados, mas sem responsável definido.
                  </p>
                </div>
              )}

              <div className="border border-border rounded-xl overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Nome</th>
                        <th className="p-3 text-left font-medium">E-mail</th>
                        <th className="p-3 text-left font-medium">Telefone</th>
                        <th className="p-3 text-left font-medium">Agente Identificado</th>
                        <th className="p-3 text-left font-medium">Dados Agrupados (Notes)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedLeads.slice(0, 100).map((lead, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="p-3">
                            {lead.status === "valid" && <CheckCircle2 className="h-4 w-4 text-success" />}
                            {lead.status === "invalid_agent" && <AlertTriangle className="h-4 w-4 text-warning" title="Agente não encontrado" />}
                            {lead.status === "missing_name" && <AlertTriangle className="h-4 w-4 text-destructive" title="Nome faltando" />}
                          </td>
                          <td className="p-3 font-medium">{lead.name || "-"}</td>
                          <td className="p-3 text-muted-foreground">{lead.email || "-"}</td>
                          <td className="p-3 text-muted-foreground">{lead.phone || "-"}</td>
                          <td className="p-3">
                            {lead.responsible_id ? (
                              <span className="text-success font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {agents.find(a => a.id === lead.responsible_id)?.full_name || lead.originalAgent}
                              </span>
                            ) : (
                              lead.originalAgent ? (
                                <span className="text-warning flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {lead.originalAgent} (Não achou)
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate" title={lead.notes}>
                            {lead.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedLeads.length > 100 && (
                  <div className="p-3 text-center text-sm text-muted-foreground border-t border-border bg-muted/30">
                    Mostrando 100 de {parsedLeads.length} leads.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {step === 3 && (
          <div className="bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={reset} disabled={isImporting}>
              Cancelar / Escolher outro arquivo
            </Button>
            <Button variant="cta" onClick={handleImport} disabled={isImporting || parsedLeads.filter(l => l.status !== 'missing_name').length === 0}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                `Confirmar Importação de ${parsedLeads.filter(l => l.status !== 'missing_name').length} Leads`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
