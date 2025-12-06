import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import 'dotenv/config';

const { Client } = pkg;

const DB_PROVIDER = 'DRIZZLE_DB';

@Global()
@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useFactory: async () => {
        // using connection string is simplest:
        const connectionString = process.env.DATABASE_URL!;
        // create node-postgres client
        const client = new Client({ connectionString });
        await client.connect();
        const db = drizzle(client);
        return db;
      },
    },
  ],
  exports: [DB_PROVIDER],
})
export class DatabaseModule {}

export { DB_PROVIDER };