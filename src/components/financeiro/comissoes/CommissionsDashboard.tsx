// cache buster 2
import { useState } from "react";
import { useAgentCommissions, AgentCommission } from "@/hooks/use-commissions";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp, PieChart as PieChartIcon, Info, MessageSquare, Send, X, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { HologramIntro } from "./HologramIntro";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CommissionsDashboard() {
  const { data: commissions, isLoading, error } = useAgentCommissions();
  const [selectedCommission, setSelectedCommission] = useState<AgentCommission | null>(null);
  const [showChartData, setShowChartData] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: "Olá! Sou a Hut AI, sua assistente financeira integrada. Posso te ajudar a consultar suas vendas de lotes, comissões de imóvel, taxas de assessoria e regras do painel. Pergunte-me qualquer coisa!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando métricas...</div>;
  if (error) return <div className="p-8 text-center text-destructive flex flex-col items-center gap-2"><AlertCircle className="h-8 w-8" /> Erro ao carregar comissões: {error instanceof Error ? error.message : JSON.stringify(error)}</div>;

  const totalGross = commissions?.reduce((acc, c) => acc + (c.gross_commission_pyg || 0), 0) || 0;
  const totalNet = commissions?.reduce((acc, c) => acc + (c.net_commission_agent_pyg || 0), 0) || 0;
  const totalAssessoria = commissions?.reduce((acc, c) => acc + (c.assessoria_agent_pyg || 0), 0) || 0;

  // Agregações para os Gráficos Gerenciais - Consolidação Híbrida: Agentes Separados + Gestão Consolidada
  const agentDataMap = commissions?.reduce((acc: Record<string, { name: string, Venda: number, Assessoria: number, Total: number }>, curr) => {
    const agentName = curr.agent?.full_name?.split(' ')[0] || 'Desconhecido';
    if (!acc[agentName]) acc[agentName] = { 
      name: `${agentName} (Agente)`, 
      Venda: 0, 
      Assessoria: 0, 
      Total: 0 
    };
    acc[agentName].Venda += (curr.net_commission_agent_pyg || 0);
    acc[agentName].Assessoria += (curr.assessoria_agent_pyg || 0);
    acc[agentName].Total += (curr.net_commission_agent_pyg || 0) + (curr.assessoria_agent_pyg || 0);
    return acc;
  }, {} as Record<string, { name: string, Venda: number, Assessoria: number, Total: number }>);

  const individualAgentBars = Object.values(agentDataMap || {}).sort((a: { Total: number }, b: { Total: number }) => b.Total - a.Total);

  const totalSupervisorVenda = commissions?.reduce((acc, c) => acc + (c.supervisor_commission_pyg || 0), 0) || 0;
  const totalSupervisorAssessoria = commissions?.reduce((acc, c) => acc + (c.assessoria_supervisor_pyg || 0), 0) || 0;

  const totalGerenteVenda = commissions?.reduce((acc, c) => acc + (c.manager_commission_pyg || 0), 0) || 0;
  const totalGerenteAssessoria = commissions?.reduce((acc, c) => acc + (c.assessoria_manager_pyg || 0), 0) || 0;

  const chartDataAgent = [
    ...individualAgentBars,
    {
      name: "Supervisor",
      Venda: totalSupervisorVenda,
      Assessoria: totalSupervisorAssessoria,
      Total: totalSupervisorVenda + totalSupervisorAssessoria
    },
    {
      name: "Gerente",
      Venda: totalGerenteVenda,
      Assessoria: totalGerenteAssessoria,
      Total: totalGerenteVenda + totalGerenteAssessoria
    }
  ];

  const propertyDataMap = commissions?.reduce((acc: Record<string, number>, curr) => {
    const type = curr.property_type.replace('_', ' ').toUpperCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartDataProperty = Object.keys(propertyDataMap || {}).map(key => ({
    name: key, value: propertyDataMap[key]
  }));

  // Função auxiliar para recalcular dados detalhados que não estão no banco (como cotação)
  const getCommissionDetails = (c: AgentCommission) => {
    const pct = c.supervisor_commission_pyg 
      ? ((c.net_commission_agent_pyg / c.supervisor_commission_pyg) * 0.14)
      : (c.manager_commission_pyg ? ((c.net_commission_agent_pyg / c.manager_commission_pyg) * 0.20) : 0);
    
    const inferredFaixa = pct > 0 ? `${pct.toFixed(2)}%` : 'Manual';

    let saleValuePYG = 0;
    let supPct = 0;
    let mgrPct = 0;

    if (c.supervisor_commission_pyg) {
      saleValuePYG = c.supervisor_commission_pyg / 0.0014;
      supPct = 0.14;
    } else if (c.manager_commission_pyg) {
      saleValuePYG = c.manager_commission_pyg / 0.0020;
    } else if (pct > 0) {
      saleValuePYG = c.net_commission_agent_pyg / (pct / 100);
    } else {
      saleValuePYG = c.sale_value * 7500;
    }

    if (saleValuePYG > 0) {
      if (c.supervisor_commission_pyg) supPct = (c.supervisor_commission_pyg / saleValuePYG) * 100;
      if (c.manager_commission_pyg) mgrPct = (c.manager_commission_pyg / saleValuePYG) * 100;
    }

    const isPYG = c.sale_currency === 'PYG';
    const saleValueUSD = isPYG ? (c.commission_base_usd || 0) : c.sale_value;
    const finalSaleValuePYG = isPYG ? c.sale_value : saleValuePYG;
    const exchangeRate = isPYG 
      ? (c.commission_base_usd > 0 ? Math.round(c.sale_value / c.commission_base_usd) : 7500)
      : Math.round(saleValuePYG / c.sale_value);
    
    return { pct, inferredFaixa, saleValueUSD, saleValuePYG: finalSaleValuePYG, supPct, mgrPct, exchangeRate };
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    const userMessage = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const formattedComms = commissions ? commissions.map(c => {
        const details = getCommissionDetails(c);
        return {
          id: c.id,
          ref: c.property?.code || "REF-GERAL",
          imovel: c.property?.title || c.property_type,
          agente: c.agent?.full_name || "Desconhecido",
          valor_venda: `${details.saleValueUSD} USD (${details.saleValuePYG} PYG)`,
          has_assessoria: c.has_assessoria,
          comissao_venda_pyg: c.net_commission_agent_pyg,
          comissao_assessoria_pyg: c.assessoria_agent_pyg || 0,
          supervisor_comissao_pyg: c.supervisor_commission_pyg || 0,
          manager_comissao_pyg: c.manager_commission_pyg || 0,
          status: c.status,
          data: c.created_at || c.month_reference
        };
      }) : [];

      const systemPrompt = `Você é a Hut AI, a inteligência artificial oficial de gestão de comissões integrada diretamente no dashboard do corretor.
Você está conversando com o usuário pelo chat do dashboard.
Aqui está a lista real das comissões registradas no banco de dados para consulta imediata:
${JSON.stringify(formattedComms, null, 2)}

INSTRUÇÕES:
1. Responda de forma clara, simpática e profissional em português.
2. Sempre formate os valores monetários no formato Guaraní (Gs. XX.XXX.XXX) ou Dólares ($XX.XXX).
3. Use formatação Markdown (negrito, listas, etc.) para deixar as respostas bonitas.
4. Nunca invente dados que não estejam no contexto JSON acima.
5. Ajude o corretor a entender suas vendas, seus ganhos de comissão de imóvel e de assessoria (corretor recebe 7% sobre a assessoria de 3% do lote).`;

      const apiKey = import.meta.env.VITE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key não configurada. Contate o administrador do sistema.");
      }

      const response = await fetch("/api-nvidia/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "z-ai/glm-5.1",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMessage
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error("Erro de resposta da API da Nvidia.");
      }

      const resData = await response.json();
      const replyContent = resData.choices?.[0]?.message?.content || "Desculpe, não consegui processar a resposta.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "❌ Ocorreu um erro ao conectar ao servidor da Nvidia NIM. Por favor, tente novamente em alguns instantes." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showIntro && (
          <HologramIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <motion.div 
        className={`space-y-6 ${showIntro ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100 transition-opacity duration-1000'}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="backdrop-blur-md bg-card/80 border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bruto Global</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{formatCurrency(totalGross, 'PYG')}</div>
                <p className="text-xs text-muted-foreground mt-1">Comissões brutas geradas</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="bg-gradient-to-br from-accent/90 to-accent text-accent-foreground border-none shadow-accent/20 shadow-xl backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Comissões de Vendas</CardTitle>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold drop-shadow-sm">{formatCurrency(totalNet, 'PYG')}</div>
                <p className="text-xs opacity-80 mt-1">Líquido a pagar por venda</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="backdrop-blur-md bg-card/80 border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissões Assessorias</CardTitle>
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success drop-shadow-sm">{formatCurrency(totalAssessoria, 'PYG')}</div>
                <p className="text-xs text-muted-foreground mt-1">Líquido a pagar por assessoria</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos Gerenciais */}
        {commissions && commissions.length > 0 && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
            <Card className="backdrop-blur-md bg-card/80 border-white/10 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-transparent via-muted/20 to-transparent border-b border-white/5">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Composição por Corretor
                  </div>
                  <button 
                    onClick={() => setShowChartData(!showChartData)} 
                    className="text-xs bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors border"
                  >
                    {showChartData ? "Ver Gráfico" : "Ver Tabela de Dados"}
                  </button>
                </CardTitle>
                <CardDescription>Segmentação das comissões: Venda, Assessoria e Hierarquia</CardDescription>
              </CardHeader>
              <CardContent>
                {showChartData ? (
                  <div className="h-[300px] w-full overflow-y-auto pr-1">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-muted text-muted-foreground sticky top-0">
                        <tr>
                          <th className="p-2 font-semibold">Função / Colaborador</th>
                          <th className="p-2 font-semibold text-right">Comissão Imóvel</th>
                          <th className="p-2 font-semibold text-right">Comissão Assessoria</th>
                          <th className="p-2 font-semibold text-right">Total Geral</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {chartDataAgent.map((d: { name: string, Venda: number, Assessoria: number, Total: number }) => (
                          <tr key={d.name} className="hover:bg-muted/30">
                            <td className="p-2 font-medium">{d.name}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(d.Venda, 'PYG')}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(d.Assessoria, 'PYG')}</td>
                            <td className="p-2 text-right font-bold text-accent">{formatCurrency(d.Total, 'PYG')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataAgent} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: '600' }} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                        <Tooltip trigger="click" formatter={(value: number) => formatCurrency(value, 'PYG')} cursor={{ fill: '#f1f5f9' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="Venda" name="Comissão Venda (Imóvel)" stackId="a" fill="#ea580c" radius={[0, 0, 0, 0]} maxBarSize={30} />
                        <Bar dataKey="Assessoria" name="Comissão Assessoria" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabela de Comissões */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden backdrop-blur-md bg-card/80 border-white/10 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-transparent via-muted/20 to-transparent border-b border-white/5">
              <CardTitle>Últimas Comissões Registradas</CardTitle>
              <CardDescription>Clique em uma linha para ver os detalhes da cotação e cálculo.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {commissions && commissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left cursor-pointer whitespace-nowrap">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Identificação PROP</th>
                        <th className="px-4 py-3 font-medium">Imóvel (Referência)</th>
                        <th className="px-4 py-3 font-medium">Agente (Faixa)</th>
                        <th className="px-4 py-3 font-medium text-right">Valor Venda</th>
                        <th className="px-4 py-3 font-medium text-right border-l text-accent font-bold bg-accent/5">Comissão Total</th>
                        <th className="px-4 py-3 font-medium text-right border-l">Total Agente</th>
                        <th className="px-4 py-3 font-medium text-right border-l">Total Supervisor</th>
                        <th className="px-4 py-3 font-medium text-right border-l">Total Gerente</th>
                        <th className="px-4 py-3 font-medium text-center border-l">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {commissions.slice(0, 10).map((c) => {
                        const details = getCommissionDetails(c);
                        return (
                          <tr 
                            key={c.id} 
                            onClick={() => setSelectedCommission(c)} 
                            className="hover:bg-muted/50 cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-3 group-hover:pl-5 transition-all duration-300">
                              <span className="text-xs bg-accent/15 text-accent border border-accent/25 px-2 py-0.5 rounded font-mono font-bold">
                                {c.property?.code || (c.property_id ? `PROP-${c.property_id.split('-')[0].slice(0, 4).toUpperCase()}` : "PROP-000")}
                              </span>
                            </td>
                            <td className="px-4 py-3 capitalize">
                              <div className="font-medium text-foreground">
                                {c.property?.title || c.property_type.replace('_', ' ')}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                {c.property?.code || "PROP-000"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground flex items-center gap-1.5">
                                <span>{c.agent?.full_name || 'Desconhecido'}</span>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 font-semibold text-accent">
                                Faixa: {details.inferredFaixa}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-medium text-foreground">{formatCurrency(details.saleValueUSD, 'USD')}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {formatCurrency(details.saleValuePYG, 'PYG')}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right border-l font-bold text-accent bg-accent/5">
                              {formatCurrency(
                                c.net_commission_agent_pyg +
                                (c.assessoria_agent_pyg || 0) +
                                (c.supervisor_commission_pyg || 0) +
                                (c.assessoria_supervisor_pyg || 0) +
                                (c.manager_commission_pyg || 0) +
                                (c.assessoria_manager_pyg || 0),
                                'PYG'
                              )}
                            </td>
                            <td className="px-4 py-3 text-right border-l">
                              <div className="font-semibold text-foreground">
                                {formatCurrency(c.net_commission_agent_pyg + (c.assessoria_agent_pyg || 0), 'PYG')}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                Imóvel: {formatCurrency(c.net_commission_agent_pyg, 'PYG').replace('Gs ', '')} | Ass.: {c.has_assessoria ? formatCurrency(c.assessoria_agent_pyg || 0, 'PYG').replace('Gs ', '') : '0'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right border-l">
                              <div className="font-semibold text-foreground flex flex-col items-end gap-0.5">
                                <span>{formatCurrency((c.supervisor_commission_pyg || 0) + (c.assessoria_supervisor_pyg || 0), 'PYG')}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                Imóvel: {formatCurrency(c.supervisor_commission_pyg || 0, 'PYG').replace('Gs ', '')} | Ass.: {c.has_assessoria ? formatCurrency(c.assessoria_supervisor_pyg || 0, 'PYG').replace('Gs ', '') : '0'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right border-l">
                              <div className="font-semibold text-foreground flex flex-col items-end gap-0.5">
                                <span>{formatCurrency((c.manager_commission_pyg || 0) + (c.assessoria_manager_pyg || 0), 'PYG')}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                Imóvel: {formatCurrency(c.manager_commission_pyg || 0, 'PYG').replace('Gs ', '')} | Ass.: {c.has_assessoria ? formatCurrency(c.assessoria_manager_pyg || 0, 'PYG').replace('Gs ', '') : '0'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center border-l">
                              <Badge variant={c.status === 'pago' ? 'default' : 'outline'} className={c.status === 'pago' ? 'bg-success text-white border-transparent' : 'text-muted-foreground'}>
                                {c.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">Nenhuma comissão registrada ainda.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de Detalhes da Comissão */}
        <Dialog open={!!selectedCommission} onOpenChange={(open) => !open && setSelectedCommission(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Comissão</DialogTitle>
              <DialogDescription>Extrato detalhado dos cálculos e conversões realizadas</DialogDescription>
            </DialogHeader>
            {selectedCommission && (() => {
              const details = getCommissionDetails(selectedCommission);
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Agente</div>
                      <div className="font-medium">{selectedCommission.agent?.full_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Imóvel</div>
                      <div className="font-medium capitalize">{selectedCommission.property_type.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <Badge variant="outline">{selectedCommission.status}</Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Mês Ref.</div>
                      <div className="font-medium">{new Date(selectedCommission.month_reference).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/50 dark:bg-slate-900/10">
                    <h4 className="font-semibold text-sm border-b pb-2 text-foreground">
                      Valores Consolidados da Transação (Antes das Distribuições)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-card border rounded-lg shadow-sm">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Valor do Imóvel (Lote)</div>
                        <div className="font-bold text-base text-foreground">{formatCurrency(details.saleValuePYG, 'PYG')}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(details.saleValueUSD, 'USD')}</div>
                      </div>
                      <div className="p-3 bg-card border rounded-lg shadow-sm">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Assessoria Comercial (3%)</div>
                        <div className="font-bold text-base text-foreground text-success">{formatCurrency(selectedCommission.assessoria_base_pyg || (details.saleValuePYG * 0.03), 'PYG')}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency((selectedCommission.assessoria_base_pyg || (details.saleValuePYG * 0.03)) / details.exchangeRate, 'USD')}</div>
                      </div>
                      <div className="p-3 bg-card border rounded-lg shadow-sm border-accent/20 bg-accent/5">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Valor Total da Venda (Contrato)</div>
                        <div className="font-extrabold text-base text-accent">{formatCurrency(details.saleValuePYG + (selectedCommission.assessoria_base_pyg || (details.saleValuePYG * 0.03)), 'PYG')}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">{formatCurrency(details.saleValueUSD + ((selectedCommission.assessoria_base_pyg || (details.saleValuePYG * 0.03)) / details.exchangeRate), 'USD')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-sm border-b pb-2">Informações Cambiais da Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between py-1 border-b border-border/50 md:border-b-0 md:pr-4 md:border-r"><span className="text-muted-foreground">Moeda do Registro:</span><span className="font-bold text-foreground">{selectedCommission.sale_currency}</span></div>
                      <div className="flex justify-between py-1 border-b border-border/50 md:border-b-0 md:px-4 md:border-r"><span className="text-muted-foreground">Cotação USD/PYG:</span><span className="font-bold text-accent">Gs. {details.exchangeRate.toLocaleString('es-PY')}</span></div>
                      <div className="flex justify-between py-1 border-b border-border/50 md:border-b-0 md:pl-4"><span className="text-muted-foreground">Data da Venda:</span><span className="font-bold text-foreground">{new Date(selectedCommission.created_at || selectedCommission.month_reference).toLocaleDateString('pt-BR')}</span></div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/50 dark:bg-slate-900/10">
                    <h4 className="font-semibold text-sm border-b pb-2 text-foreground">
                      Distribuição das Comissões (Valores Líquidos a Receber)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                          <tr>
                            <th className="px-3 py-2 font-medium">Beneficiário / Função</th>
                            <th className="px-3 py-2 font-medium text-right">Comissão Imóvel</th>
                            <th className="px-3 py-2 font-medium text-right">Comissão Assessoria</th>
                            <th className="px-3 py-2 font-medium text-right text-accent font-bold">Total a Pagar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-muted/30">
                            <td className="px-3 py-2">
                              <div className="font-medium">{selectedCommission.agent?.full_name}</div>
                              <div className="text-[10px] text-muted-foreground">Corretor • Faixa: {details.inferredFaixa}</div>
                            </td>
                            <td className="px-3 py-2 text-right">{formatCurrency(selectedCommission.net_commission_agent_pyg, 'PYG')}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(selectedCommission.assessoria_agent_pyg || 0, 'PYG')}</td>
                            <td className="px-3 py-2 text-right font-bold text-accent">{formatCurrency(selectedCommission.net_commission_agent_pyg + (selectedCommission.assessoria_agent_pyg || 0), 'PYG')}</td>
                          </tr>
                          {(selectedCommission.supervisor_commission_pyg > 0 || (selectedCommission.assessoria_supervisor_pyg || 0) > 0) && (
                            <tr className="hover:bg-muted/30">
                              <td className="px-3 py-2">
                                <div className="font-medium">Supervisor</div>
                                <div className="text-[10px] text-muted-foreground">Supervisor • 1.40%</div>
                              </td>
                              <td className="px-3 py-2 text-right">{formatCurrency(selectedCommission.supervisor_commission_pyg || 0, 'PYG')}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(selectedCommission.assessoria_supervisor_pyg || 0, 'PYG')}</td>
                              <td className="px-3 py-2 text-right font-bold text-accent">{formatCurrency((selectedCommission.supervisor_commission_pyg || 0) + (selectedCommission.assessoria_supervisor_pyg || 0), 'PYG')}</td>
                            </tr>
                          )}
                          {(selectedCommission.manager_commission_pyg > 0 || (selectedCommission.assessoria_manager_pyg || 0) > 0) && (
                            <tr className="hover:bg-muted/30">
                              <td className="px-3 py-2">
                                <div className="font-medium">Gerente</div>
                                <div className="text-[10px] text-muted-foreground">Gerente • 2.00%</div>
                              </td>
                              <td className="px-3 py-2 text-right">{formatCurrency(selectedCommission.manager_commission_pyg || 0, 'PYG')}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(selectedCommission.assessoria_manager_pyg || 0, 'PYG')}</td>
                              <td className="px-3 py-2 text-right font-bold text-accent">{formatCurrency((selectedCommission.manager_commission_pyg || 0) + (selectedCommission.assessoria_manager_pyg || 0), 'PYG')}</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-muted/30 border-t font-semibold">
                          <tr>
                            <td className="px-3 py-3">Total Distribuído</td>
                            <td className="px-3 py-3 text-right">
                              {formatCurrency(
                                selectedCommission.net_commission_agent_pyg + 
                                (selectedCommission.supervisor_commission_pyg || 0) + 
                                (selectedCommission.manager_commission_pyg || 0), 'PYG'
                              )}
                            </td>
                            <td className="px-3 py-3 text-right">
                              {formatCurrency(
                                (selectedCommission.assessoria_agent_pyg || 0) + 
                                (selectedCommission.assessoria_supervisor_pyg || 0) + 
                                (selectedCommission.assessoria_manager_pyg || 0), 'PYG'
                              )}
                            </td>
                            <td className="px-3 py-3 text-right text-accent font-bold">
                              {formatCurrency(
                                selectedCommission.net_commission_agent_pyg + (selectedCommission.assessoria_agent_pyg || 0) +
                                (selectedCommission.supervisor_commission_pyg || 0) + (selectedCommission.assessoria_supervisor_pyg || 0) +
                                (selectedCommission.manager_commission_pyg || 0) + (selectedCommission.assessoria_manager_pyg || 0), 'PYG'
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Botão Flutuante do Chat */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-accent to-amber-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none border border-accent/20 group"
          title="Falar com a IA"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isChatOpen ? <X className="h-6 w-6 animate-in spin-in-90 duration-300" /> : <div className="relative"><MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" /><span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-success rounded-full border-2 border-card animate-pulse" /></div>}
        </motion.button>

        {/* Janela de Chat da IA */}
        {isChatOpen && (
          <div className="fixed bottom-24 right-6 w-[380px] h-[520px] max-h-[80vh] max-w-[calc(100vw-2rem)] bg-card border border-border/80 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-border/10">
              <div className="flex items-center gap-2.5">
                <div className="relative"><div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent"><Sparkles className="h-4 w-4" /></div><span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-success rounded-full border-2 border-slate-900 animate-pulse" /></div>
                <div><div className="font-bold text-sm tracking-wide">Hut AI</div><div className="text-[10px] text-success font-medium tracking-wider uppercase">Online • Assistente</div></div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 dark:bg-slate-950/20">
              {messages.map((m, idx) => (
                <div key={idx} className={cn("flex flex-col max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm border", m.role === "user" ? "ml-auto bg-accent text-white border-accent/20 rounded-tr-none" : "mr-auto bg-card text-foreground border-border rounded-tl-none")}>
                  <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
                </div>
              ))}
              {isTyping && (
                <div className="mr-auto bg-card text-foreground border border-border rounded-2xl rounded-tl-none px-3.5 py-2.5 text-sm shadow-sm flex items-center gap-1.5"><span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" /><span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" /><span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" /></div>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="p-3 bg-card border-t border-border/80 flex items-center gap-2">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Pergunte ao assistente da Hut..." className="flex-1 bg-muted dark:bg-slate-900 border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/60" disabled={isTyping} />
              <button type="submit" disabled={!inputValue.trim() || isTyping} className="h-9 w-9 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:opacity-50 transition-all shadow-sm shrink-0"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
