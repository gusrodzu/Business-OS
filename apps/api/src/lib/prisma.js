import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

export function createPrismaClient(options={}) {
  const connectionString=process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required for Prisma PostgreSQL connections.');
  if (!/^postgres(ql)?:\/\//i.test(connectionString)) throw new Error('PrismaPg requires a direct PostgreSQL connection string.');
  // PrismaPg uses pg.Pool; preserve the previous 5s connection timeout expectation.
  const adapter=new PrismaPg({connectionString,connectionTimeoutMillis:5000});
  return new PrismaClient({adapter,...options});
}

const globalForPrisma=globalThis;
export const prisma=globalForPrisma.__erpPrisma || createPrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn','error'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.__erpPrisma=prisma;
