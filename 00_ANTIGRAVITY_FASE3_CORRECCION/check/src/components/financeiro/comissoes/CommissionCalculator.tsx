import { useState, useMemo, useEffect } from "react";
import { useCommissionRules, useCreateCommission, calculateProgressiveCommission } from "@/hooks/use-commissions";
import { useAgents } from "@/hooks/use-agents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Calculator, Save, AlertCircle, RefreshCw } from "lucide-react";
export function CommissionCalculator() {
  const {
    data: rules,
    isLoading: loadingRules
  } = useCommissionRules();
  const {
    data: agents
  } = useAgents();
  const createMutation = useCreateCommission();
  const [agentId, setAgentId] = useState("");
  const [propertyType, setPropertyType] = useState("lote");
  const [saleValueUSD, setSaleValueUSD] = useState("");
  const [hasAssessoria, setHasAssessoria] = useState(false);
  const [exchangeRate, setExchangeRate] = useState("7500");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingExchange, setLoadingExchange] = useState(false);
  const [manualLevel, setManualLevel] = useState<'auto' | 'level1' | 'level2' | 'level3'>('auto');
  const fetchLiveExchangeRate = async () => {
    setLoadingExchange(true);
    try {
      const response = await fetch("https://economia.awesomeapi.com.br/last/USD-PYG");
      if (!response.ok) throw new Error("Erro na resposta da API de Câmbio.");
      const data = await response.json();
      const rate = data.USDPYG?.ask;
      if (rate) {
        setExchangeRate(Math.round(parseFloat(rate)).toString());
        toast({
          title: "Câmbio Atualizado!",
          description: `Cotação do Dólar (USD/PYG) atualizada em tempo real para Gs. ${Math.round(parseFloat(rate)).toLocaleString('es-PY')}`
        });
      }
    } catch (err) {
      console.error("Erro ao buscar câmbio:", err);
      toast({
        title: "Erro ao buscar cotação",
        description: "Não foi possível obter o câmbio automático. Você pode digitar manualmente.",
        variant: "destructive"
      });
    } finally {
      setLoadingExchange(false);
    }
  };
  useEffect(() => {
    fetchLiveExchangeRate();
  }, []);

  // Mock accumulated sales for the agent this month (should come from DB in real usage)
  const accumulatedSalesUSD = 0;
  const calculation = useMemo(() => {
    if (!rules) return null;
    const valueUSD = parseFloat(saleValueUSD) || 0;
    const rate = parseFloat(exchangeRate) || 7500;
    // Auto-calculate 3% of the sale value in PYG as the assessoria base
    const assessoriaPYG = valueUSD * rate * 0.03;
    if (valueUSD <= 0) return null;
    const baseCalc = calculateProgressiveCommission(valueUSD, accumulatedSalesUSD, rules, propertyType, hasAssessoria ? assessoriaPYG : 0, rate);
    if (manualLevel !== 'auto') {
      let pct = 0.30;
      if (manualLevel === 'level2') pct = 0.35;
      if (manualLevel === 'level3') pct = 0.40;
      const basePYG = valueUSD * rate;
      const netCommissionAgent = basePYG * (pct / 100);
      const supervisorCommission = basePYG * ((baseCalc.appliedVendaRule?.percentage_supervisor || 0.14) / 100);
      const managerCommission = basePYG * ((baseCalc.appliedVendaRule?.percentage_manager || 0.20) / 100);
      const grossCommission = netCommissionAgent + supervisorCommission + managerCommission;
      return {
        ...baseCalc,
        gross_commission_pyg: grossCommission,
        net_commission_agent_pyg: netCommissionAgent,
        supervisor_commission_pyg: supervisorCommission,
        manager_commission_pyg: managerCommission,
        appliedVendaRule: {
          ...baseCalc.appliedVendaRule,
          percentage_agent: pct
        }
      };
    }
    return baseCalc;
  }, [rules, saleValueUSD, accumulatedSalesUSD, propertyType, hasAssessoria, exchangeRate, manualLevel]);
  const handleSave = () => {
    if (!agentId || !calculation || !saleValueUSD) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    const valueUSD = parseFloat(saleValueUSD) || 0;
    const rate = parseFloat(exchangeRate) || 7500;
    const autoAssessoriaPYG = valueUSD * rate * 0.03;
    createMutation.mutate({
      agent_id: agentId,
      sale_value: valueUSD,
      sale_currency: "USD",
      property_type: propertyType,
      commission_base_usd: valueUSD,
      gross_commission_pyg: calculation.gross_commission_pyg,
      net_commission_agent_pyg: calculation.net_commission_agent_pyg,
      supervisor_commission_pyg: calculation.supervisor_commission_pyg,
      manager_commission_pyg: calculation.manager_commission_pyg,
      has_assessoria: hasAssessoria,
      assessoria_base_pyg: hasAssessoria ? autoAssessoriaPYG : 0,
      assessoria_agent_pyg: calculation.assessoria_agent_pyg,
      assessoria_supervisor_pyg: calculation.assessoria_supervisor_pyg,
      assessoria_manager_pyg: calculation.assessoria_manager_pyg,
      status: 'pendente',
      month_reference: saleDate,
      created_at: `${saleDate}T12:00:00Z`
    }, {
      onSuccess: () => {
        toast({
          title: "Comissão Salva",
          description: "Comissão registrada com sucesso!"
        });
        setSaleValueUSD("");
      },
      onError: (err: any) => {
        toast({
          title: "Erro ao salvar",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };
  if (loadingRules) return <div>Carregando calculadora...</div>;
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Venda</CardTitle>
          <CardDescription>Insira os dados da venda para calcular a comissão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Agente / Corretor</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o agente" />
              </SelectTrigger>
              <SelectContent>
                {agents?.map(a => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select value={propertyType} onValueChange={val => {
              setPropertyType(val);
              if (val !== 'lote' && val !== 'loteamento_aberto') setHasAssessoria(false);
            }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lote">Lote</SelectItem>
                  <SelectItem value="loteamento_aberto">Loteamento Aberto</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor da Venda (USD)</Label>
              <Input type="number" placeholder="Ex: 100000" value={saleValueUSD} onChange={e => setSaleValueUSD(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="exchangeRate">Câmbio (USD/PYG)</Label>
                <button type="button" onClick={fetchLiveExchangeRate} disabled={loadingExchange} className="flex items-center gap-1 text-[10px] text-accent hover:text-accent-hover font-semibold transition-colors duration-200" title="Atualizar câmbio em tempo real">
                  <RefreshCw className={cn("h-3 w-3", loadingExchange && "animate-spin")} />
                  <span>Obter Câmbio</span>
                </button>
              </div>
              <div className="relative">
                <Input id="exchangeRate" type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="pr-12 font-medium" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded pointer-events-none uppercase tracking-wide">
                  PYG
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleDate">Data da Venda</Label>
              <Input id="saleDate" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="font-medium" />
            </div>
          </div>

          {(propertyType === 'lote' || propertyType === 'loteamento_aberto') && <div className="p-4 bg-muted/50 rounded-lg space-y-3 mt-4 border border-border">
              <div className="flex items-center space-x-2">
                <Checkbox id="assessoria" checked={hasAssessoria} onCheckedChange={c => setHasAssessoria(!!c)} />
                <Label htmlFor="assessoria" className="cursor-pointer font-medium text-foreground">Incluir Assessoria</Label>
              </div>
              
              {hasAssessoria && <div className="space-y-2 pt-2">
                  <Label>Valor Base da Assessoria (PYG) — Calculado (3% do Lote)</Label>
                  <div className="p-2.5 rounded-lg bg-card border font-bold text-accent select-none">
                    {formatCurrency(Math.round((parseFloat(saleValueUSD) || 0) * (parseFloat(exchangeRate) || 7500) * 0.03), 'PYG')}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Comissão de assessoria será calculada automaticamente sobre este valor de 3%.</p>
                </div>}
            </div>}

          {/* Checklist de Validação de Teste Manual */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-lg space-y-3 mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Checklist de Validação / Teste Manual
            </h4>
            <p className="text-xs text-muted-foreground">
              Selecione uma faixa para forçar o cálculo manual e validar a matemática do corretor:
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="level_auto" checked={manualLevel === 'auto'} onCheckedChange={() => setManualLevel('auto')} />
                <Label htmlFor="level_auto" className="cursor-pointer font-normal text-sm">
                  Automático (Progressivo por Faixa)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level_1" checked={manualLevel === 'level1'} onCheckedChange={() => setManualLevel('level1')} />
                <Label htmlFor="level_1" className="cursor-pointer font-normal text-sm">
                  1 = Faixa 1 (0,30% comissão do corretor)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level_2" checked={manualLevel === 'level2'} onCheckedChange={() => setManualLevel('level2')} />
                <Label htmlFor="level_2" className="cursor-pointer font-normal text-sm">
                  2 = Faixa 2 (0,35% comissão do corretor)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level_3" checked={manualLevel === 'level3'} onCheckedChange={() => setManualLevel('level3')} />
                <Label htmlFor="level_3" className="cursor-pointer font-normal text-sm">
                  3 = Faixa 3 (0,40% comissão do corretor)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!calculation || createMutation.isPending} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Salvar Comissão
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-accent" />
            Simulação de Cálculo
          </CardTitle>
          <CardDescription>O cálculo é atualizado automaticamente.</CardDescription>
        </CardHeader>
        <CardContent>
          {!calculation ? <div className="py-12 text-center flex flex-col items-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              <p>Insira o valor da venda para ver o cálculo.</p>
            </div> : <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Comissão de Venda</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Faixa Aplicada:</span>
                    <span className="font-medium flex items-center gap-1.5">
                      {calculation.appliedVendaRule?.percentage_agent}% (Agente)
                      {manualLevel !== 'auto' && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded uppercase font-semibold">Manual</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comissão Bruta Total:</span>
                    <span className="font-medium">{formatCurrency(calculation.gross_commission_pyg, 'PYG')}</span>
                  </div>
                  <div className="flex justify-between text-success font-medium pt-2 border-t border-border">
                    <span>Líquido do Agente:</span>
                    <span>{formatCurrency(calculation.net_commission_agent_pyg, 'PYG')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Supervisor:</span>
                    <span>{formatCurrency(calculation.supervisor_commission_pyg, 'PYG')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gerente:</span>
                    <span>{formatCurrency(calculation.manager_commission_pyg, 'PYG')}</span>
                  </div>
                </div>
              </div>

              {hasAssessoria && <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Comissão de Assessoria</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-success font-medium">
                      <span>Líquido do Agente:</span>
                      <span>{formatCurrency(calculation.assessoria_agent_pyg, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Supervisor:</span>
                      <span>{formatCurrency(calculation.assessoria_supervisor_pyg, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Gerente:</span>
                      <span>{formatCurrency(calculation.assessoria_manager_pyg, 'PYG')}</span>
                    </div>
                  </div>
                </div>}
              
              <div className="p-4 bg-accent/10 rounded-lg flex items-center justify-between border border-accent/20">
                <span className="font-semibold text-foreground">Total a Pagar ao Agente</span>
                <span className="text-lg font-bold text-accent">
                  {formatCurrency(calculation.net_commission_agent_pyg + (calculation.assessoria_agent_pyg || 0), 'PYG')}
                </span>
              </div>
            </div>}
        </CardContent>
      </Card>
    </div>;
}