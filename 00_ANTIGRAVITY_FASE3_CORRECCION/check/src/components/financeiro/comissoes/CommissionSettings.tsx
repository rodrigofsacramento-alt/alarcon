import { useCommissionRules } from "@/hooks/use-commissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
export function CommissionSettings() {
  const {
    data: rules,
    isLoading
  } = useCommissionRules();
  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando regras...</div>;
  const vendaRules = rules?.filter(r => r.rule_type === 'venda') || [];
  const assessoriaRules = rules?.filter(r => r.rule_type === 'assessoria') || [];
  const bonusRules = rules?.filter(r => r.rule_type === 'bonus') || [];
  const fixoRules = rules?.filter(r => r.rule_type === 'salario_fixo') || [];
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regras de Venda (Imóveis e Lotes)</CardTitle>
          <CardDescription>Faixas progressivas baseadas no valor acumulado da venda em USD.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Faixa (USD)</th>
                  <th className="pb-3 font-medium text-right">Agente</th>
                  <th className="pb-3 font-medium text-right">Supervisor</th>
                  <th className="pb-3 font-medium text-right">Gerente</th>
                </tr>
              </thead>
              <tbody>
                {vendaRules.map(r => <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3">
                      De {formatCurrency(r.min_value, 'USD')} 
                      {r.max_value ? ` até ${formatCurrency(r.max_value, 'USD')}` : ' em diante'}
                    </td>
                    <td className="py-3 text-right font-medium text-accent">{r.percentage_agent}%</td>
                    <td className="py-3 text-right">{r.percentage_supervisor}%</td>
                    <td className="py-3 text-right">{r.percentage_manager}%</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Assessoria</CardTitle>
          <CardDescription>Faixas progressivas baseadas no valor bruto de assessoria em PYG.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Faixa (PYG)</th>
                  <th className="pb-3 font-medium text-right">Agente</th>
                  <th className="pb-3 font-medium text-right">Supervisor</th>
                  <th className="pb-3 font-medium text-right">Gerente</th>
                </tr>
              </thead>
              <tbody>
                {assessoriaRules.map(r => <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3">
                      De {formatCurrency(r.min_value, 'PYG')} 
                      {r.max_value ? ` até ${formatCurrency(r.max_value, 'PYG')}` : ' em diante'}
                    </td>
                    <td className="py-3 text-right font-medium text-accent">{r.percentage_agent}%</td>
                    <td className="py-3 text-right">{r.percentage_supervisor}%</td>
                    <td className="py-3 text-right">{r.percentage_manager}%</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bônus Cumulativo</CardTitle>
            <CardDescription>Premiações extras ao atingir metas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {bonusRules.map(r => <li key={r.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="text-sm">Ao atingir {formatCurrency(r.min_value, 'PYG')}</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    + {formatCurrency(r.fixed_bonus_amount || 0, 'PYG')}
                  </Badge>
                </li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salário Fixo</CardTitle>
            <CardDescription>Garantia mínima caso não alcance metas.</CardDescription>
          </CardHeader>
          <CardContent>
            {fixoRules.map(r => <div key={r.id} className="text-2xl font-bold text-foreground">
                {formatCurrency(r.fixed_bonus_amount || 0, 'PYG')}
              </div>)}
            <p className="text-sm text-muted-foreground mt-2">Valor pago mensalmente caso as comissões variáveis fiquem abaixo deste teto.</p>
          </CardContent>
        </Card>
      </div>
    </div>;
}