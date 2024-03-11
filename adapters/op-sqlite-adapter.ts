import * as FileSystem from 'expo-file-system';
import { OPSQLiteConnection, open } from '@op-engineering/op-sqlite';
import { DBAdapter, ResultSet, TransactionCallback } from '../interface/db_adapter';

const DB_NAME = 'op-sqlite';
const dir = FileSystem.documentDirectory;

export class OPSqliteAdapter implements DBAdapter {
  private _db: OPSQLiteConnection | null;

  constructor() {
    this._db = null;
  }

  // Only to be used after init()
  get db() {
    return this._db as OPSQLiteConnection;
  }

  async init() {
    const dbPath = dir + `${DB_NAME}.db`;

    try {
      const { exists } = await FileSystem.getInfoAsync(dbPath);
      if (exists) {
        console.log('deleting db file');
        await FileSystem.deleteAsync(dbPath);
      }
    } catch (e) {
      // Ignore
    }
    const DB_CONFIG = {
      name: DB_NAME,
      location: dir!
    };

    console.log(`Setup db`);
    this._db = open(DB_CONFIG);

    this.db.execute('DELETE FROM t1');
    this.db.execute('DELETE FROM t2');
    this.db.execute('DELETE FROM t3');

    this.db.execute(
      'CREATE TABLE IF NOT EXISTS t1(id INTEGER PRIMARY KEY, a INTEGER, b INTEGER, c TEXT)');
    this.db.execute(
      'CREATE TABLE IF NOT EXISTS t2(id INTEGER PRIMARY KEY, a INTEGER, b INTEGER, c TEXT)');

    this.db.execute(
      'CREATE TABLE IF NOT EXISTS t3(id INTEGER PRIMARY KEY, a INTEGER, b INTEGER, c TEXT)');
    this.db.execute('CREATE INDEX IF NOT EXISTS i3a ON t3(a)');
    this.db.execute('CREATE INDEX IF NOT EXISTS i3b ON t3(b)');

    console.log(`Setup done`);
  }

  async executeSync(sql: string, params?: any[]): Promise<ResultSet> {
    const results = this.db.execute(sql, params);
    return {
      rows: results.rows?._array ?? []
    };
  }

  async execute(sql: string, params?: any[]): Promise<ResultSet> {
    const results = await this.db.executeAsync(sql, params);
    return {
      rows: results.rows?._array ?? []
    };
  }

  async transaction(callback: TransactionCallback): Promise<void> {
    return this.db.transaction(async (context) => {
      // call the callback, but map the transaction context
      return callback({
        execute: async (sql: string, params: []) => {
          const result = await context.executeAsync(sql, params);
          return {
            rows: result.rows?._array ?? []
          };
        },
        commit: () => {
          const result = context.commit();
          return {
            rows: result.rows?._array ?? []
          };
        },
        rollback: () => {
          const result = context.rollback();
          return {
            rows: result.rows?._array ?? []
          };
        }
      });
    });
  }

  async close(): Promise<void> {
    this.db.close();
  }
}