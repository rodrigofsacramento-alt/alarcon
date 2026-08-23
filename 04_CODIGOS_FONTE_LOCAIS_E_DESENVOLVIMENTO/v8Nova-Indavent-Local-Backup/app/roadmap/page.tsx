'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export default function RoadmapPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Plano de Implementação - Apexfy" />
        
        <div className="apexfy-wrapper flex-1 overflow-y-auto">
          <style dangerouslySetInnerHTML={{__html: `
            .apexfy-wrapper {
                background-color: #0a0f1c;
                color: #f8fafc;
                background-image: 
                    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
                background-attachment: fixed;
                font-family: 'Outfit', sans-serif;
                min-height: 100%;
            }
            .apexfy-container {
                max-width: 1100px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .apexfy-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 50px;
                animation: fadeInDown 0.8s ease-out;
            }
            .apexfy-hero {
                text-align: center;
                margin-bottom: 80px;
                animation: fadeIn 1.2s ease-out;
            }
            .apexfy-hero h1 {
                font-size: 56px;
                font-weight: 900;
                line-height: 1.1;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .apexfy-hero h1 .highlight {
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .apexfy-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 24px;
                margin-bottom: 80px;
                animation: slideUp 0.8s ease-out 0.3s both;
            }
            .apexfy-stat-card {
                background: rgba(17, 24, 39, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 30px;
                text-align: center;
                transition: transform 0.3s, box-shadow 0.3s;
                position: relative;
                overflow: hidden;
            }
            .apexfy-stat-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; width: 100%; height: 4px;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                opacity: 0.5;
                transition: opacity 0.3s;
            }
            .apexfy-stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border-color: rgba(59, 130, 246, 0.4);
            }
            .apexfy-stat-card:hover::before { opacity: 1; }
            .apexfy-timeline {
                position: relative;
                max-width: 900px;
                margin: 0 auto 80px auto;
            }
            .apexfy-timeline::before {
                content: '';
                position: absolute;
                top: 0; bottom: 0;
                left: 50%;
                width: 2px;
                background: rgba(255, 255, 255, 0.1);
                transform: translateX(-50%);
            }
            .apexfy-phase-card {
                display: flex;
                justify-content: flex-end;
                padding-right: 50%;
                position: relative;
                margin-bottom: 40px;
                animation: slideUp 0.8s ease-out 0.5s both;
            }
            .apexfy-phase-card:nth-child(even) {
                justify-content: flex-start;
                padding-right: 0;
                padding-left: 50%;
            }
            .apexfy-phase-content {
                width: 90%;
                background: rgba(17, 24, 39, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 30px;
                border-radius: 24px;
                position: relative;
                transition: all 0.3s;
            }
            .apexfy-phase-card:hover .apexfy-phase-content {
                border-color: #3b82f6;
                box-shadow: 0 10px 40px rgba(59, 130, 246, 0.15);
            }
            .apexfy-phase-content::before {
                content: '';
                position: absolute;
                top: 40px;
                width: 20px;
                height: 2px;
                background: rgba(255, 255, 255, 0.1);
            }
            .apexfy-phase-card:nth-child(odd) .apexfy-phase-content::before { right: -20px; }
            .apexfy-phase-card:nth-child(even) .apexfy-phase-content::before { left: -20px; }
            
            .apexfy-phase-dot {
                position: absolute;
                top: 32px;
                left: 50%;
                width: 18px;
                height: 18px;
                background: #0a0f1c;
                border: 4px solid #3b82f6;
                border-radius: 50%;
                transform: translateX(-50%);
                z-index: 2;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
            }
            
            .apexfy-cta-box {
                text-align: center;
                background: linear-gradient(to right, rgba(17, 24, 39, 0.8), rgba(15, 23, 42, 0.9));
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 60px;
                border-radius: 32px;
                position: relative;
                overflow: hidden;
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
            
            @media (max-width: 768px) {
                .apexfy-timeline::before { left: 20px; }
                .apexfy-phase-card, .apexfy-phase-card:nth-child(even) { justify-content: flex-start; padding-left: 60px; padding-right: 0; }
                .apexfy-phase-content { width: 100%; }
                .apexfy-phase-dot { left: 20px; }
                .apexfy-phase-content::before { display: none; }
            }
          `}} />

          <div className="apexfy-container">
            <header className="apexfy-header">
                <div>
                    {/* Fallback text if image not in public folder yet */}
                    <span className="font-black text-2xl tracking-tighter text-white">APEXFY<span className="text-blue-500">HUB</span></span>
                </div>
                <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    <span className="font-bold text-blue-400">Projeto: Nova Indavent</span>
                </div>
            </header>

            <section className="apexfy-hero">
                <h1>Plano Estratégico de <br/><span className="highlight">Automação & IA</span></h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mt-4">Com base no mapeamento cronometrado da equipe comercial, desenvolvemos um plano matemático para eliminar tarefas repetitivas, recuperar +3 horas produtivas diárias e impulsionar a máquina de vendas da Indavent.</p>
            </section>

            <section className="apexfy-stats-grid">
                <div className="apexfy-stat-card">
                    <div className="text-4xl font-black text-white mb-2 shadow-blue-500/50 drop-shadow-lg">+3 Horas</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Desperdiçadas p/ Ciclo</div>
                </div>
                <div className="apexfy-stat-card">
                    <div className="text-4xl font-black text-white mb-2 shadow-blue-500/50 drop-shadow-lg">1h 45m</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Gargalo: Prospecção</div>
                </div>
                <div className="apexfy-stat-card">
                    <div className="text-4xl font-black text-white mb-2 shadow-blue-500/50 drop-shadow-lg">1 Hora</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Espera Logística (Frete)</div>
                </div>
            </section>

            <h2 className="text-3xl font-black text-center text-white mb-10">Matriz de Priorização Apexfy</h2>
            <div style={{background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '24px', padding: '40px', marginBottom: '80px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 40px rgba(239, 68, 68, 0.05)'}}>
                <h3 style={{fontSize: '24px', fontWeight: '800', color: '#f87171', marginBottom: '10px', position: 'relative', zIndex: 2}}>🚨 Foco de Atuação Imediata (Top Gargalos)</h3>
                <p style={{color: '#94a3b8', marginBottom: '30px', fontSize: '16px', position: 'relative', zIndex: 2}}>Analisando os tempos mapeados no seu fluxo comercial, a implementação técnica iniciará atacando frontalmente as 4 etapas mais custosas, que juntas drenam mais de 3 horas por negociação:</p>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '15px', position: 'relative', zIndex: 2}}>
                    <div style={{background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #f87171', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h4 style={{color: '#fff', fontWeight: '700', fontSize: '18px'}}>1. Cotação de Frete (Etapa 6)</h4>
                            <span style={{color: '#94a3b8', fontSize: '14px'}}>Espera por cotações e negociação manual no WhatsApp.</span>
                        </div>
                        <div style={{textAlign: 'right', minWidth: '200px'}}>
                            <span style={{color: '#f87171', fontWeight: '800', fontSize: '20px'}}>1 Hora (Perdida)</span>
                            <div style={{color: '#10b981', fontSize: '13px', fontWeight: '800', marginTop: '5px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px'}}>→ A AUTOMATIZAR: Webhook Multi-Transportadoras</div>
                        </div>
                    </div>

                    <div style={{background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #f97316', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h4 style={{color: '#fff', fontWeight: '700', fontSize: '18px'}}>2. Prospecção + Primeiro Contato (Etapas 1 e 2)</h4>
                            <span style={{color: '#94a3b8', fontSize: '14px'}}>Pesquisa no Google e digitação de saudação "Olá tudo bem".</span>
                        </div>
                        <div style={{textAlign: 'right', minWidth: '200px'}}>
                            <span style={{color: '#f97316', fontWeight: '800', fontSize: '20px'}}>1h 45min (Perdidos)</span>
                            <div style={{color: '#10b981', fontSize: '13px', fontWeight: '800', marginTop: '5px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px'}}>→ A AUTOMATIZAR: Web Scraping + Disparo IA</div>
                        </div>
                    </div>

                    <div style={{background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #eab308', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h4 style={{color: '#fff', fontWeight: '700', fontSize: '18px'}}>3. Pré-Atendimento (Etapa 3)</h4>
                            <span style={{color: '#94a3b8', fontSize: '14px'}}>Repetição de perguntas de qualificação iniciais.</span>
                        </div>
                        <div style={{textAlign: 'right', minWidth: '200px'}}>
                            <span style={{color: '#eab308', fontWeight: '800', fontSize: '20px'}}>~1 Hora (Perdida)</span>
                            <div style={{color: '#10b981', fontSize: '13px', fontWeight: '800', marginTop: '5px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px'}}>→ A AUTOMATIZAR: Chatbot Pré-Vendedor GPT-4</div>
                        </div>
                    </div>

                    <div style={{background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #3b82f6', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h4 style={{color: '#fff', fontWeight: '700', fontSize: '18px'}}>4. Verificações Visuais (Etapas 4 e 8)</h4>
                            <span style={{color: '#94a3b8', fontSize: '14px'}}>Deslocamento físico até a produção para checar estoque.</span>
                        </div>
                        <div style={{textAlign: 'right', minWidth: '200px'}}>
                            <span style={{color: '#3b82f6', fontWeight: '800', fontSize: '20px'}}>20 a 30 Minutos</span>
                            <div style={{color: '#10b981', fontSize: '13px', fontWeight: '800', marginTop: '5px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px'}}>→ A AUTOMATIZAR: Painel Integrado de Estoque</div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-black text-center text-white mb-10">Timeline Completa (Fluxo Original x Nova Tecnologia)</h2>

            <div className="apexfy-timeline">
                {[
                    { et: '1', title: 'Prospecção', time: '1h (45 min cronometrado)', desc: 'Pesquisa manual no Google por clientes.', sol: 'Automação de Scraping inteligente no Google Maps para extração automática de leads direto para o CRM.' },
                    { et: '2', title: 'Mensagem Enviada / 1º Contato', time: '45 min (40 min cronometrado)', desc: 'Envio manual de saudações pelo WhatsApp.', sol: 'Disparos via API do WhatsApp de forma programada e padronizada para os leads prospectados.' },
                    { et: '3', title: 'Cliente Informou que Trabalha (Qualificação)', time: 'Imprevisível (~1hr)', desc: 'Fazer as próximas perguntas e entender a demanda.', sol: 'Chatbot Inteligente (IA) treinado para pré-qualificar a necessidade do cliente de forma autônoma.' },
                    { et: '4', title: 'Verificação de Estoque', time: '10 a 20 min', desc: 'Ir fisicamente até a produção para consultar disponibilidade.', sol: 'Painel de Inventário Digital em Tempo Real no CRM atualizado pelo PCP, sem necessidade de deslocamento.' },
                    { et: '5', title: 'Cadastro / Orçamento', time: '5 a 10 min', desc: 'Solicitar dados ao cliente e formalizar o documento.', sol: 'Preenchimento automático via API (Receita Federal pelo CNPJ) e Geração da Proposta em 1 clique.' },
                    { et: '6', title: 'Cotação de Frete', time: '1 Hr + Espera (Imprevisível)', desc: 'Troca de mensagens no WhatsApp com parceiros/transportadoras.', sol: 'Sistema de disparo B2B logístico: envia a cubagem em massa e capta respostas automaticamente.' },
                    { et: '7', title: 'Tempo de Negociação', time: 'Imprevisível', desc: 'Entender a necessidade e persuadir o cliente a fechar.', sol: 'Assistente IA (Copilot) sugerindo ao vendedor na tela os melhores argumentos e comparativos técnicos (Custo Zero / Térmico).' },
                    { et: '8', title: 'Prazo de Entrega / Conferência', time: '5 a 10 min', desc: 'Nova ida à produção para checar prazo e liberação.', sol: 'Lead Time (Cronograma de Fábrica) mapeado digitalmente no CRM para previsão exata, sem atrito.' },
                    { et: '9', title: 'Fechamento / Separação', time: '15 min', desc: 'Finalizar a venda, colocar no sistema e liberar separação.', sol: 'Automação que envia o pedido fechado direto para o tablet/Kanban do galpão de expedição.' },
                    { et: '10', title: 'Pós-Venda', time: '15 min (envio em 2 min)', desc: 'Verificação se o produto atendeu expectativas.', sol: 'Disparo automático após X dias de recebimento com pesquisa de satisfação para métricas de retenção.' },
                ].map((item, index) => (
                    <div className="apexfy-phase-card" key={index}>
                        <div className="apexfy-phase-dot" style={{ borderColor: index % 3 === 0 ? '#3b82f6' : index % 3 === 1 ? '#c084fc' : '#10b981' }}></div>
                        <div className="apexfy-phase-content">
                            <span style={{ 
                                display: 'inline-block', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px',
                                background: index % 3 === 0 ? 'rgba(59, 130, 246, 0.1)' : index % 3 === 1 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: index % 3 === 0 ? '#60a5fa' : index % 3 === 1 ? '#c084fc' : '#34d399',
                                border: index % 3 === 0 ? '1px solid rgba(59, 130, 246, 0.3)' : index % 3 === 1 ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                            }}>ETAPA {item.et}</span>
                            <h3 className="text-2xl font-black text-white mb-4">{item.title}</h3>
                            <p className="text-slate-400 mb-5"><strong>Tempo Manual Atual:</strong> {item.time}<br/>{item.desc}</p>
                            <div className="relative pl-6 text-sm text-slate-200">
                                <span className="absolute left-0 text-blue-500 font-bold">→</span>
                                <strong>Solução Apexfy:</strong> {item.sol}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <section className="apexfy-cta-box mb-10">
                <div style={{position: 'relative', zIndex: 1}}>
                    <h2 className="text-3xl font-black text-white mb-4">Prontos para executar?</h2>
                    <p className="text-slate-400 text-lg mb-8">
                        A infraestrutura do CRM já começou a ser configurada com o painel "Automações & IA".<br/>
                        Nosso próximo passo é plugar as chaves e conectar o fluxo.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/automations'}
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform"
                    >
                        Acessar Configuração IA
                    </button>
                </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
