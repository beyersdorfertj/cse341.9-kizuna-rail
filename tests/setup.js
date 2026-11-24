
import { afterAll, beforeAll, beforeEach, inject } from 'vitest';
import mongoose from 'mongoose';
import { closeDb, connectToDb, getDb } from '../src/db/connect.js';
import { connectToMongoose } from '../src/db/mongoose.js';
import { initializeDatabase } from '../src/db/initialize.js';

const connectionString = inject('MONGODB_TEST_URI');
const databaseName = 'kizuna-rail-test';

beforeAll(async () => {
  await connectToDb({
    connectionString,
    databaseName,
  });

  await connectToMongoose({
    connectionString,
    databaseName,
  });
});

beforeEach(async () => {
  const db = getDb();
  await db.dropDatabase();
  await initializeDatabase(db);
});

afterAll(async () => {
  await mongoose.disconnect();
  await closeDb();
});
