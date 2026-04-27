import { JsonStorage } from './utils/storage.js';
import type { DbSchema } from './models/types.js';

const initialData: DbSchema = {
  users: [],
  assignments: [],
  progress: []
};

export const db = new JsonStorage<DbSchema>('db.json', initialData);
