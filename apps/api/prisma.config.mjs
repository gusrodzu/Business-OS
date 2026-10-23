import 'dotenv/config';
import {defineConfig, env} from 'prisma/config';

// Prisma 7 reads CLI connection settings here, never in the schema.
// DIRECT_DATABASE_URL is intended for migrations when DATABASE_URL is pooled.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {path: 'prisma/migrations'},
  datasource: {url: process.env.DIRECT_DATABASE_URL || env('DATABASE_URL')},
});
