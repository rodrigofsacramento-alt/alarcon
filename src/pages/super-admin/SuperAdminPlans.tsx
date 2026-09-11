import { useState } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { usePlans, useCreatePlan, useUpdatePlan, type Plan } from '@/hooks/use-super-admin';
import {
  Layers, Plus, Edit2, Star, Check, X, Loader2, DollarSign,
  Users, Building2, TrendingUp, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

type FormData = {
  name: string; description: string;
  price_monthly: string; price_yearly: string;
  max_agents: string; max_properties: string; max_leads: string;
  features: string; is_active: boolean; is_popular: boolean;
};

const emptyForm: FormData = {
  name: '', description: '',
  price_monthly: '', price_yearly: '',
  max_agents: '5', max_properties: '50', max_leads: '200',
  features: '', is_active: true, is_popular: false,
};

export default function SuperAdminPlans() {
  const { data: plans = [], isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Plan) => {
    setEditingPlan(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price_monthly: String(p.price_monthly),
      price_yearly: String(p.price_yearly),
      max_agents: String(p.max_agents),
      max_properties: String(p.max_properties),
      max_leads: String(p.max_leads),
      features: Array.isArray(p.features) ? p.features.join('\n') : '',
      is_active: p.is_active,
      is_popular: p.is_popular,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price_monthly) {
      toast({ title: 'Preencha nome e preço mensal', variant: 'destructive' });
      return;
    }
    const payload: Partial<Plan> = {
      name: form.name,
      description: form.description || null,
      price_monthly: parseFloat(form.price_monthly),
      price_yearly: parseFloat(form.price_yearly) || 0,
      max_agents: parseInt(form.max_agents) || 5,
      max_properties: parseInt(form.max_properties) || 50,
      max_leads: parseInt(form.max_leads) || 200,
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
      is_active: form.is_active,
      is_popular: form.is_popular,
    };
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...payload });
        toast({ title: 'Plano atualizado com sucesso' });
      } else {
        await createPlan.mutateAsync(payload);
        toast({ title: 'Plano criado com sucesso' });
      }
      setShowModal(false);
    } catch (e: unknown) {
      toast({ title: 'Erro ao salvar plano', description: translateError(e), variant: 'destructive' });
    }
  };

  const toggleActive = async (p: Plan) => {
    try {
      await updatePlan.mutateAsync({ id: p.id, is_active: !p.is_active });
      toast({ title: `Plano ${!p.is_active ? 'ativado' : 'desativado'}` });
    } catch (e: unknown) {
      toast({ title: 'Erro ao alterar status do plano', description: translateError(e), variant: 'destructive' });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Planos</h1>
            <p className="text-slate-400 text-sm mt-1">Gerencie os planos de assinatura do SaaS</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" /> Novo Plano
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-slate-900/60 border rounded-2xl overflow-hidden transition-all ${
                  plan.is_popular
                    ? 'border-violet-500/40 shadow-lg shadow-violet-500/10'
                    : 'border-slate-700/50'
                } ${!plan.is_active ? 'opacity-60' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-500 via-violet-400 to-violet-500" />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white">{plan.name}</h3>
                        {plan.is_popular && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs text-violet-300 font-medium">
                            <Star className="w-2.5 h-2.5" /> Popular
                          </span>
                        )}
                        {!plan.is_active && (
                          <span className="px-2 py-0.5 bg-slate-700/50 rounded-full text-xs text-slate-400">Inativo</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(plan)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(plan)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        {plan.is_active
                          ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                          : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">{formatCurrency(plan.price_monthly)}</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <Users className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-semibold">
                        {plan.max_agents >= 999 ? '∞' : plan.max_agents}
                      </p>
                      <p className="text-slate-500 text-[10px]">Corretores</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-semibold">
                        {plan.max_properties >= 9999 ? '∞' : plan.max_properties}
                      </p>
                      <p className="text-slate-500 text-[10px]">Imóveis</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-semibold">
                        {plan.max_leads >= 9999 ? '∞' : plan.max_leads}
                      </p>
                      <p className="text-slate-500 text-[10px]">Leads</p>
                    </div>
                  </div>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="space-y-1.5">
                      {(plan.features as string[]).slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                    <span>Anual: {formatCurrency(plan.price_yearly)}</span>
                    <span>{plan.price_yearly > 0 ? `${Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}% off` : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-base font-semibold text-white">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome do Plano *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  placeholder="Ex: Professional" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Descrição</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  placeholder="Ideal para corretoras em crescimento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Preço Mensal (R$) *</label>
                  <input value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: e.target.value }))} type="number"
                    className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    placeholder="397" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Preço Anual (R$)</label>
                  <input value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: e.target.value }))} type="number"
                    className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    placeholder="3970" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Máx. Corretores</label>
                  <input value={form.max_agents} onChange={e => setForm(f => ({ ...f, max_agents: e.target.value }))} type="number"
                    className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Máx. Imóveis</label>
                  <input value={form.max_properties} onChange={e => setForm(f => ({ ...f, max_properties: e.target.value }))} type="number"
                    className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Máx. Leads/mês</label>
                  <input value={form.max_leads} onChange={e => setForm(f => ({ ...f, max_leads: e.target.value }))} type="number"
                    className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Funcionalidades (uma por linha)</label>
                <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4}
                  className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                  placeholder={"Até 10 corretores\nRelatórios avançados\nExportação PDF/Excel"} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-slate-300">Plano ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_popular} onChange={e => setForm(f => ({ ...f, is_popular: e.target.checked }))}
                    className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-slate-300">Marcar como popular</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={createPlan.isPending || updatePlan.isPending}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {(createPlan.isPending || updatePlan.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPlan ? 'Salvar' : 'Criar plano'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
