import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  reloadAttempted: boolean;
}

/**
 * ChunkErrorBoundary
 * Captura falhas de carregamento de chunks lazy (Vite code-split). Quando o
 * browser tentou importar um chunk antigo que o deploy já apagou do servidor
 * (cache de 1 ano + immutable), a rota falharia e a tela ficaria em branco até
 * o usuário apertar F5. Este boundary detecta isso e recarrega a página UMA
 * vez automaticamente, rebaixando o index.html novo com os hashes corretos.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, reloadAttempted: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true, reloadAttempted: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = String(error && error.message || error).toLowerCase();
    const isChunkError =
      /failed to fetch dynamically imported module/i.test(msg) ||
      /importing a module script failed/i.test(msg) ||
      /loading chunk .* failed/i.test(msg) ||
      /failed to fetch dynamic import/i.test(msg) ||
      /unable to fetch dynamically imported module/i.test(msg) ||
      /unexpected token/i.test(msg); // SyntaxError tipico de chunk desatualizado
    console.error('[ChunkErrorBoundary] erro capturado:', error, errorInfo);

    // Se for erro de chunk e ainda nao tentamos recarregar, auto-reload.
    if (isChunkError && !this.state.reloadAttempted) {
      this.state.reloadAttempted = true;
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } else if (!isChunkError) {
      // Erro nao relacionado a chunk: apenas limpa o erro para nao travar a UI.
      this.setState({ hasError: false, reloadAttempted: false });
    }
  }

  public render() {
    // Enquanto aguarda o reload, mostra um fallback leve (sem tela branca).
    if (this.state.hasError && this.state.reloadAttempted) {
      return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: '#05070a' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Recarregando atualização…</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ChunkErrorBoundary;