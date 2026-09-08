/**
 * Traduz mensagens de erro do Supabase/PostgreSQL para português.
 * Centraliza todas as mensagens de erro do sistema.
 */

const ERROR_MAP: Record<string, string> = {
  // Auth
  'Invalid login credentials':               'Email ou senha inválidos.',
  'Email not confirmed':                     'Email não confirmado. Verifique sua caixa de entrada.',
  'User already registered':                 'Este email já está cadastrado.',
  'Password should be at least 6 characters':'A senha deve ter pelo menos 6 caracteres.',
  'Email rate limit exceeded':               'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'Token has expired or is invalid':         'Sessão expirada. Faça login novamente.',
  'Unable to validate email address':        'Endereço de email inválido.',
  'Signup is disabled':                      'Cadastro desabilitado neste momento.',
  'unexpected_failure':                      'Falha inesperada no servidor. Tente novamente.',
  'invalid_credentials':                     'Credenciais inválidas. Verifique email e senha.',
  'email_not_confirmed':                     'Email não confirmado. Verifique sua caixa de entrada.',
  'over_email_send_rate_limit':              'Limite de envio de emails atingido. Tente mais tarde.',
  'user_not_found':                          'Usuário não encontrado.',
  'weak_password':                           'Senha muito fraca. Use letras, números e símbolos.',
  'provider is not enabled':                 'Login com Google ainda não está habilitado no Supabase. Use email e senha ou solicite a ativação do provedor Google.',
  'Unsupported provider':                    'Login com Google ainda não está habilitado no Supabase. Use email e senha ou solicite a ativação do provedor Google.',

  // PostgreSQL / Supabase
  'duplicate key value violates unique constraint "users_phone_key"':
    'Este telefone já está cadastrado em outro usuário.',
  'duplicate key value violates unique constraint "users_email_key"':
    'Este email já está cadastrado.',
  'duplicate key value violates unique constraint':
    'Já existe um registro com esses dados. Verifique as informações.',
  'violates foreign key constraint':
    'Operação inválida: registro relacionado não encontrado.',
  'violates not-null constraint':
    'Campo obrigatório não preenchido.',
  'value too long for type character varying':
    'Um dos campos excede o tamanho máximo permitido.',
  'invalid input syntax for type uuid':
    'Identificador inválido.',
  'permission denied':
    'Sem permissão para realizar esta operação.',
  'insufficient_privilege':
    'Privilégios insuficientes para esta operação.',
  'function gen_salt':
    'Erro interno de configuração do servidor. Contate o suporte.',
  'connection refused':
    'Não foi possível conectar ao servidor. Verifique sua conexão.',
  'JWT expired':
    'Sessão expirada. Faça login novamente.',
  'JWTExpired':
    'Sessão expirada. Faça login novamente.',
  'new row violates row-level security':
    'Operação não permitida pela política de segurança.',
  'tenant não encontrado':
    'Empresa não encontrada no sistema.',

  // RPC provision_tenant
  'Tenant':
    'Empresa não encontrada no sistema.',

  // Rede
  'Failed to fetch':
    'Falha na conexão. Verifique sua internet e tente novamente.',
  'NetworkError':
    'Erro de rede. Verifique sua conexão com a internet.',
  'TypeError: Failed to fetch':
    'Falha na conexão com o servidor.',
  'Load failed':
    'Falha ao carregar. Verifique sua conexão e tente novamente.',
};

/**
 * Traduz uma mensagem de erro para português.
 * Procura por correspondências parciais no mapa de erros.
 */
export function translateError(error: unknown): string {
  const raw = extractMessage(error);
  if (!raw) return 'Erro desconhecido. Tente novamente.';

  // Busca exata
  if (ERROR_MAP[raw]) return ERROR_MAP[raw];

  // Busca parcial (a mensagem contém uma das chaves)
  for (const [key, translated] of Object.entries(ERROR_MAP)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) {
      return translated;
    }
  }

  // Fallback: retorna a mensagem original com prefixo
  return raw;
}

function extractMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const e = error as Record<string, unknown>;
    return (
      (typeof e.message === 'string' ? e.message : '') ||
      (typeof e.error_description === 'string' ? e.error_description : '') ||
      (typeof e.msg === 'string' ? e.msg : '') ||
      JSON.stringify(error)
    );
  }
  return String(error);
}
