"use client";

import { useWhatsAppSession, useStartWhatsAppSession, useDisconnectWhatsAppSession } from "@/hooks/use-whatsapp";
// Removido import do Button do shadcn/ui
import { RefreshCcw, QrCode, PowerOff } from "lucide-react";

export function WhatsAppConnect() {
  const { data: session, isLoading } = useWhatsAppSession();
  const startSession = useStartWhatsAppSession();
  const disconnectSession = useDisconnectWhatsAppSession();

  if (isLoading) return <div className="flex h-full items-center justify-center p-8">Carregando sessão...</div>;

  const handleConnect = () => {
    startSession.mutate({});
  };

  const handleDisconnect = () => {
    disconnectSession.mutate();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm max-w-md w-full flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <QrCode size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Conectar WhatsApp</h2>
        
        {!session || session.status === 'disconnected' || session.status === 'error' ? (
          <>
            <p className="text-slate-500 mb-8">
              {session?.last_error ? (
                <span className="text-red-500">{session.last_error}</span>
              ) : (
                "Para começar a atender seus clientes diretamente pelo sistema, você precisa conectar o seu WhatsApp."
              )}
            </p>
            <button onClick={handleConnect} disabled={startSession.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md transition-colors flex justify-center items-center font-medium">
              {startSession.isPending ? <RefreshCcw className="mr-2 animate-spin" /> : "Gerar QR Code"}
            </button>
          </>
        ) : session.status === 'connecting' ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <RefreshCcw className="animate-spin text-emerald-500 w-12 h-12" />
            <p className="text-slate-500">Iniciando motor do WhatsApp...</p>
          </div>
        ) : session.status === 'qr_ready' && session.qr_code ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-500">Escaneie o código abaixo com o seu WhatsApp para conectar.</p>
            <div className="bg-white p-4 rounded-xl border flex items-center justify-center">
              {session.qr_code.startsWith('data:image') ? (
                <img 
                  src={session.qr_code} 
                  alt="QR Code" 
                  className="w-64 h-64 object-contain select-none" 
                  style={{ filter: 'none', colorScheme: 'light' }}
                  data-darkreader-inline-invert="false"
                />
              ) : (
                <p className="text-red-500 text-sm font-bold">QR Code inválido</p>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Expira em: {new Date(session.qr_expires_at!).toLocaleTimeString()}
            </p>
          </div>
        ) : session.status === 'connected' ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <p className="text-green-600 font-medium text-lg">WhatsApp Conectado com Sucesso!</p>
            <button onClick={handleDisconnect} disabled={disconnectSession.isPending} className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium">
              <PowerOff className="mr-2 h-4 w-4" /> Desconectar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
