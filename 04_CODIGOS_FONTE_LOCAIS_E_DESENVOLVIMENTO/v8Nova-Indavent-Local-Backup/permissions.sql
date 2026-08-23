-- 1. Desabilitar RLS nas tabelas fantasmas para garantir acesso total
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts DISABLE ROW LEVEL SECURITY;

-- 2. Garantir permissões de leitura/escrita para a chave anon (frontend)
GRANT ALL ON public.tenants TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.conversations TO anon, authenticated, service_role;
GRANT ALL ON public.whatsapp_sessions TO anon, authenticated, service_role;
GRANT ALL ON public.whatsapp_messages TO anon, authenticated, service_role;
GRANT ALL ON public.whatsapp_contacts TO anon, authenticated, service_role;
