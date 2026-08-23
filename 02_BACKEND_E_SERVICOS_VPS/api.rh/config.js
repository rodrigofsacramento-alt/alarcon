import 'dotenv/config';

const config = {
  app: {
    name: 'Análise Comportamental',
    debug: process.env.DEBUG === 'true',
    port: parseInt(process.env.PORT || '8000'),
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    expirationHours: parseInt(process.env.JWT_EXPIRATION_HOURS || '24'),
  },
  cors: {
    origins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },
};

export default config;
