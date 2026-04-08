import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const connectionString = this.configService.get<string>('DATABASE_URL');
    this.pool = new Pool({ connectionString, max: 10 });
    this.logger.log('Database Connection Pool initialized.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query(sql: string, params?: unknown[]) {
    return this.pool.query(sql, params);
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
