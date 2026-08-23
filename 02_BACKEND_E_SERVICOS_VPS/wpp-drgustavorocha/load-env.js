import dotenv from 'dotenv';
import path from 'node:path';
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
//# sourceMappingURL=load-env.js.map