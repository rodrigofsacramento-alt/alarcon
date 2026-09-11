import { useState, useMemo } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useSAFinancialTransactions,
  useSAFinancialSummary,
  useCreateSAFinancialTransaction,
  useUpdateSAFinancialTransaction,
  useDeleteSAFinancialTransaction,
  useTenants,
  useAsaasPayments,
  useCreateAsaasCharge,
  SA_INCOME_CATEGORIES,
  SA_EXPENSE_CATEGORIES,
  type SAFinancialTransaction,
  type AsaasPayment,
} from '@/hooks/use-super-admin';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Filter,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Building2,
  Loader2,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatDate(date: string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
}

type TransactionFormData = {
  type: 'income' | 'expense';
  category: string;
  subcategory: string;
  description: string;
  amount: string;
  transaction_date: string;
  reference: string;
  tenant_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

const defaultFormData: TransactionFormData = {
  type: 'income',
  category: '',
  subcategory: '',
  description: '',
  amount: '',
  transaction_date: format(new Date(), 'yyyy-MM-dd'),
  reference: '',
  tenant_id: '',
  status: 'confirmed',
};

export default function SuperAdminFinancial() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'asaas'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<SAFinancialTransaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(defaultFormData);
  const [dateFilter, setDateFilter] = useState<'current' | 'last' | 'all'>('current');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showAsaasModal, setShowAsaasModal] = useState(false);
  const [asaasForm, setAsaasForm] = useState({
    tenant_id: '',
    value: '',
    billing_type: 'BOLETO',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    if (dateFilter === 'current') {
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    }
    if (dateFilter === 'last') {
      const lastMonth = subMonths(now, 1);
      return {
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    }
    return {};
  }, [dateFilter]);

  const filters = useMemo(() => ({
    type: activeTab === 'all' || activeTab === 'asaas' ? undefined : activeTab,
    ...dateRange,
  }), [activeTab, dateRange]);

  const { data: transactions = [], isLoading } = useSAFinancialTransactions(filters);
  const { data: summary } = useSAFinancialSummary(dateRange);
  const { data: tenantsData } = useTenants();
  const tenants = tenantsData?.data ?? [];
  const createMutation = useCreateSAFinancialTransaction();
  const updateMutation = useUpdateSAFinancialTransaction();
  const deleteMutation = useDeleteSAFinancialTransaction();
  const asaasPaymentsQuery = useAsaasPayments();
  const createAsaasCharge = useCreateAsaasCharge();

  const categories = formData.type === 'income' ? SA_INCOME_CATEGORIES : SA_EXPENSE_CATEGORIES;

  const handleOpenCreate = (type: 'income' | 'expense') => {
    setEditingTransaction(null);
    setFormData({ ...defaultFormData, type });
    setShowModal(true);
  };

  const handleOpenEdit = (transaction: SAFinancialTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      description: transaction.description,
      amount: (transaction.amount_cents / 100).toFixed(2),
      transaction_date: transaction.transaction_date,
      reference: transaction.reference || '',
      tenant_id: transaction.tenant_id || '',
      status: transaction.status,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast({ title: 'Transação excluída com sucesso' });
      setDeleteTarget(null);
    } catch (e) {
      toast({ title: 'Erro ao excluir', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(formData.amount.replace(',', '.')) * 100);

    if (isNaN(amountCents) || amountCents <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe um valor maior que zero.', variant: 'destructive' });
      return;
    }

    const payload = {
      type: formData.type,
      category: formData.category,
      subcategory: formData.subcategory || null,
      description: formData.description,
      amount_cents: amountCents,
      transaction_date: formData.transaction_date,
      reference: formData.reference || null,
      tenant_id: formData.tenant_id || null,
      status: formData.status,
    };

    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, ...payload });
        toast({ title: 'Transação atualizada com sucesso' });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Transação criada com sucesso' });
      }
      setShowModal(false);
      setFormData(defaultFormData);
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: translateError(e), variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Empresa', 'Status', 'Referência'];
    const rows = transactions.map(t => [
      t.transaction_date,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category,
      t.description,
      (t.amount_cents / 100).toFixed(2),
      t.tenant?.name || '',
      t.status,
      t.reference || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Financeiro</h1>
            <p className="text-slate-400 text-sm">
              Controle de receitas e despesas do SaaS
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAsaasModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cobrança Asaas
            </Button>
            <Button
              onClick={() => handleOpenCreate('income')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
            <Button
              onClick={() => handleOpenCreate('expense')}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(summary?.totalIncome || 0)}
              </div>
              <p className="text-xs text-slate-500">
                {dateFilter === 'current' ? 'Este mês' : dateFilter === 'last' ? 'Mês passado' : 'Total'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">
                {formatCurrency(summary?.totalExpense || 0)}
              </div>
              <p className="text-xs text-slate-500">
                {dateFilter === 'current' ? 'Este mês' : dateFilter === 'last' ? 'Mês passado' : 'Total'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Resultado Líquido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(summary?.netResult || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(summary?.netResult || 0)}
              </div>
              <p className="text-xs text-slate-500">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Transações
              </CardTitle>
              <Activity className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary?.transactionCount || 0}
              </div>
              <p className="text-xs text-slate-500">
                Lançamentos confirmados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
                Todas
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:bg-emerald-600">
                Receitas
              </TabsTrigger>
              <TabsTrigger value="expense" className="data-[state=active]:bg-rose-600">
                Despesas
              </TabsTrigger>
              <TabsTrigger value="asaas" className="data-[state=active]:bg-blue-600">
                Asaas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="current">Este mês</SelectItem>
                <SelectItem value="last">Mês passado</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={exportCSV}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Clique em "Nova Receita" ou "Nova Despesa" para começar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400">Tipo</TableHead>
                    <TableHead className="text-slate-400">Categoria</TableHead>
                    <TableHead className="text-slate-400">Descrição</TableHead>
                    <TableHead className="text-slate-400">Empresa</TableHead>
                    <TableHead className="text-slate-400 text-right">Valor</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-slate-300">
                        {formatDate(t.transaction_date)}
                      </TableCell>
                      <TableCell>
                        {t.type === 'income' ? (
                          <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                            Receita
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-600/20 text-rose-400 border-rose-600/30">
                            <ArrowDownCircle className="h-3 w-3 mr-1" />
                            Despesa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {[...SA_INCOME_CATEGORIES, ...SA_EXPENSE_CATEGORIES].find(c => c.value === t.category)?.label || t.category}
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-[200px] truncate">
                        {t.description}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {t.tenant?.name ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {t.tenant.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount_cents)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.status === 'confirmed'
                              ? 'border-emerald-600/50 text-emerald-400'
                              : t.status === 'pending'
                              ? 'border-amber-600/50 text-amber-400'
                              : 'border-slate-600 text-slate-400'
                          }
                        >
                          {t.status === 'confirmed' ? 'Confirmado' : t.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(t)}
                              className="text-slate-300 focus:bg-slate-700"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(t.id)}
                              className="text-rose-400 focus:bg-slate-700 focus:text-rose-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Asaas Charges Table */}
        {activeTab === 'asaas' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              {asaasPaymentsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (asaasPaymentsQuery.data ?? []).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma cobrança Asaas encontrada</p>
                  <p className="text-sm">Clique em "Cobrança Asaas" para gerar uma nova cobrança</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-400">Empresa</TableHead>
                      <TableHead className="text-slate-400">Tipo</TableHead>
                      <TableHead className="text-slate-400">Vencimento</TableHead>
                      <TableHead className="text-slate-400 text-right">Valor</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(asaasPaymentsQuery.data ?? []).map((p: AsaasPayment & { tenants?: { name: string } }) => (
                      <TableRow key={p.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-slate-300">
                          {p.tenants?.name || '—'}
                        </TableCell>
                        <TableCell className="text-slate-300">{p.billing_type}</TableCell>
                        <TableCell className="text-slate-300">
                          {p.due_date ? formatDate(p.due_date) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-white">
                          {formatCurrency(p.value_cents)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              p.status === 'RECEIVED'
                                ? 'border-emerald-600/50 text-emerald-400'
                                : p.status === 'PENDING'
                                ? 'border-amber-600/50 text-amber-400'
                                : p.status === 'OVERDUE'
                                ? 'border-rose-600/50 text-rose-400'
                                : 'border-slate-600 text-slate-400'
                            }
                          >
                            {p.status === 'RECEIVED' ? 'Recebido' : p.status === 'PENDING' ? 'Pendente' : p.status === 'OVERDUE' ? 'Vencido' : p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.invoice_url && (
                            <a
                              href={p.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Fatura
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {formData.type === 'income' ? (
                  <>
                    <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                    {editingTransaction ? 'Editar Receita' : 'Nova Receita'}
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-5 w-5 text-rose-500" />
                    {editingTransaction ? 'Editar Despesa' : 'Nova Despesa'}
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Preencha os dados da transação financeira
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria *</Label>
                  <Select
                    value={formData.category || undefined}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-white focus:bg-slate-700 focus:text-white">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Valor (R$) *</Label>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Descrição *</Label>
                <Input
                  placeholder="Descreva a transação"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Data *</Label>
                  <Input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as typeof formData.status })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="confirmed" className="text-white focus:bg-slate-700 focus:text-white">Confirmado</SelectItem>
                      <SelectItem value="pending" className="text-white focus:bg-slate-700 focus:text-white">Pendente</SelectItem>
                      <SelectItem value="cancelled" className="text-white focus:bg-slate-700 focus:text-white">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'income' && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Empresa relacionada</Label>
                  <Select
                    value={formData.tenant_id || undefined}
                    onValueChange={(v) => setFormData({ ...formData, tenant_id: v })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Nenhuma (opcional)" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-white focus:bg-slate-700 focus:text-white">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Referência</Label>
                <Input
                  placeholder="Nº nota fiscal, ID do pagamento, etc."
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className={formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingTransaction ? 'Salvar Alterações' : 'Criar Transação'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Asaas Charge Modal */}
        <Dialog open={showAsaasModal} onOpenChange={setShowAsaasModal}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Gerar Cobrança Asaas
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Crie uma cobrança no Asaas para o tenant selecionado
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const val = parseFloat(asaasForm.value.replace(',', '.'));
                if (isNaN(val) || val <= 0) {
                  toast({ title: 'Valor inválido', description: 'Informe um valor maior que zero.', variant: 'destructive' });
                  return;
                }
                if (!asaasForm.tenant_id) {
                  toast({ title: 'Empresa obrigatória', description: 'Selecione uma empresa.', variant: 'destructive' });
                  return;
                }
                try {
                  await createAsaasCharge.mutateAsync({
                    tenant_id: asaasForm.tenant_id,
                    value: val,
                    billing_type: asaasForm.billing_type,
                    due_date: asaasForm.due_date,
                    description: asaasForm.description || undefined,
                  });
                  toast({ title: 'Cobrança gerada com sucesso' });
                  setShowAsaasModal(false);
                  setAsaasForm({
                    tenant_id: '',
                    value: '',
                    billing_type: 'BOLETO',
                    due_date: format(new Date(), 'yyyy-MM-dd'),
                    description: '',
                  });
                } catch (e) {
                  toast({ title: 'Erro ao gerar cobrança', description: translateError(e), variant: 'destructive' });
                }
              }}
              className="space-y-4"
            >
                <div className="space-y-2">
                  <Label className="text-slate-300">Valor (R$) * <span className="text-xs text-slate-500">(mín. R$ 5,00)</span></Label>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={asaasForm.value}
                    onChange={(e) => setAsaasForm({ ...asaasForm, value: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo *</Label>
                  <Select
                    value={asaasForm.billing_type}
                    onValueChange={(v) => setAsaasForm({ ...asaasForm, billing_type: v })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="BOLETO" className="text-white focus:bg-slate-700 focus:text-white">Boleto</SelectItem>
                      <SelectItem value="PIX" className="text-white focus:bg-slate-700 focus:text-white">PIX</SelectItem>
                      <SelectItem value="CREDIT_CARD" className="text-white focus:bg-slate-700 focus:text-white">Cartão de Crédito</SelectItem>
                      <SelectItem value="UNDEFINED" className="text-white focus:bg-slate-700 focus:text-white">Indefinido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Vencimento *</Label>
                <Input
                  type="date"
                  value={asaasForm.due_date}
                  onChange={(e) => setAsaasForm({ ...asaasForm, due_date: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Descrição</Label>
                <Input
                  placeholder="Descrição da cobrança"
                  value={asaasForm.description}
                  onChange={(e) => setAsaasForm({ ...asaasForm, description: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAsaasModal(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createAsaasCharge.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createAsaasCharge.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Gerar Cobrança
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </SuperAdminLayout>
  );
}
