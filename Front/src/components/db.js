// db.js
import { openDB } from 'idb';

const DB_NAME = 'MyDatabase';
const STORE_NAME = 'images';

const initDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
    },
  });
  return db;
};

export const saveImage = async (image) => {
  const db = await initDB();
  await db.add(STORE_NAME, { image });
};

export const getImages = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const deleteImage = async (id) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const clearImages = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
