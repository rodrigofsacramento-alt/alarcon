"use client";

import { useSearchParams } from "next/navigation";
import ProductScrollCanvas from "@/components/ProductScrollCanvas";
import { Printer, CheckCircle, Package, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function ProposalContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '0000';
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Componente 3D (Oculto na Impressão via classe print:hidden) */}
      <ProductScrollCanvas />

      {/* 2. Botão Flutuante de Impressão (Oculto na Impressão) */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center gap-2 font-medium"
        >
          <Printer size={20} />
          <span>Salvar PDF</span>
        </button>
      </div>

      {/* 3. Conteúdo da Proposta Comercial (Visível na Tela e na Impressão) */}
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white shadow-xl sm:rounded-2xl sm:my-12 print:shadow-none print:my-0 print:py-0 print:px-0">
        
        {/* Cabeçalho da Proposta */}
        <header className="flex justify-between items-start border-b border-slate-200 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Proposta Comercial</h1>
            <p className="text-slate-500 font-medium">#{id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600">NOVA INDAVENT</h2>
            <p className="text-sm text-slate-500 mt-1">Exaustores Eólicos de Alta Performance</p>
            <p className="text-sm text-slate-500">contato@indavent.com.br</p>
          </div>
        </header>

        {/* Informações do Cliente */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-6 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preparado Para</p>
            <h3 className="text-lg font-bold text-slate-900">RAIMUNDO FERREIRA DE OLIVEIRA</h3>
            <p className="text-sm text-slate-600 mt-1">CNPJ: 160.421.098-20</p>
            <p className="text-sm text-slate-600">João Silva (Comprador) - (11) 99999-9999</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condições Gerais</p>
            <h3 className="text-lg font-bold text-slate-900">Validade: 05/06/2026</h3>
            <p className="text-sm text-slate-600 mt-1">Pagamento: À VISTA (PIX / Transferência)</p>
            <p className="text-sm text-slate-600">Prazo de Entrega: A combinar</p>
          </div>
        </section>

        {/* Tabela de Produtos */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Package className="text-blue-600" /> Itens da Proposta
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">Produto / Descrição</th>
                  <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider w-24 text-center">Qtd</th>
                  <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider w-32 text-right">Valor Unit.</th>
                  <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider w-32 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-900">Exaustor Eólico Translúcido - Ø 60cm</p>
                    <p className="text-sm text-slate-500 mt-1">Modelo industrial de alta vazão com chapéu em policarbonato translúcido. Aletas em Alumínio.</p>
                  </td>
                  <td className="py-5 px-6 text-center font-medium">10</td>
                  <td className="py-5 px-6 text-right text-slate-600">R$ 500,00</td>
                  <td className="py-5 px-6 text-right font-bold text-slate-900">R$ 5.000,00</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-900">Frete Logístico Transportadora</p>
                    <p className="text-sm text-slate-500 mt-1">Entrega para São Paulo - SP</p>
                  </td>
                  <td className="py-5 px-6 text-center font-medium">1</td>
                  <td className="py-5 px-6 text-right text-slate-600">R$ 350,00</td>
                  <td className="py-5 px-6 text-right font-bold text-slate-900">R$ 350,00</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Total */}
          <div className="flex justify-end mt-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 w-full md:w-80 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Subtotal</span>
                <span>R$ 5.350,00</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
                <span className="text-slate-300">Descontos</span>
                <span className="text-green-400">- R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total a Pagar</span>
                <span className="text-blue-400">R$ 5.350,00</span>
              </div>
            </div>
          </div>
        </section>

        {/* Botão de Aceite Digital (Oculto na impressão) */}
        <section className="mt-16 text-center print:hidden border-t border-slate-200 pt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Pronto para iniciar seu projeto?</h3>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">Clique no botão abaixo para dar o aceite digital nesta proposta e garantir a reserva dos seus produtos imediatamente.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 font-bold text-lg inline-flex items-center gap-3">
            <CheckCircle /> Aprovar Proposta Oficial
          </button>
        </section>
        
        {/* Assinatura (Apenas para Impressão) */}
        <section className="hidden print:block mt-24 text-center">
          <div className="flex justify-around">
            <div className="w-64 border-t border-slate-800 pt-2 mt-12">
              <p className="font-bold text-sm">Nova Indavent</p>
              <p className="text-xs text-slate-500">Departamento Comercial</p>
            </div>
            <div className="w-64 border-t border-slate-800 pt-2 mt-12">
              <p className="font-bold text-sm">Cliente / Comprador</p>
              <p className="text-xs text-slate-500">Assinatura / Carimbo</p>
            </div>
          </div>
        </section>

      </main>

      {/* Estilos Globais de Impressão */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            margin: 1.5cm;
          }
        }
      `}} />
    </div>
  );
}

export default function DynamicProposalPage() {
  return (
    <Suspense fallback={<div>Carregando proposta...</div>}>
      <ProposalContent />
    </Suspense>
  );
}
