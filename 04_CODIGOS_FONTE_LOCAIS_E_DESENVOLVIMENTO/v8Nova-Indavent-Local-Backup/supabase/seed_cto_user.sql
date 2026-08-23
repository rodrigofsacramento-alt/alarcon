-- Script para criação do usuário CTO (Desenvolvedor)
INSERT INTO public.internal_users (username, name, password, role)
VALUES ('cto.ahut', 'Desenvolvedor Ahut (CTO)', 'Ahut@2026CTO', 'cto')
ON CONFLICT (username) 
DO UPDATE SET 
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = 'cto';
