import { openDB } from 'idb';
import axios from 'axios';

const DB_NAME = 'SpidoNoteOfflineDB';
const STORE_NAME = 'pendingSync';
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZfDz7TmytH0pVH_fiaquHKquSabIn0okZsm3bwSKUexlN37OtYwCkKeTivFwx05Qr/exec";

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const queueForSync = async (data) => {
    const db = await initDB();
    await db.add(STORE_NAME, {
        ...data,
        timestamp: new Date().toISOString()
    });
    console.log('Data queued for sync:', data);
};

export const getPendingSyncCount = async () => {
    const db = await initDB();
    const count = await db.count(STORE_NAME);
    return count;
};

export const syncData = async () => {
    if (!navigator.onLine) {
        console.log('Still offline, skipping sync...');
        return false;
    }

    const db = await initDB();
    const pendingItems = await db.getAll(STORE_NAME);

    if (pendingItems.length === 0) {
        return true;
    }

    console.log(`Attempting to sync ${pendingItems.length} items...`);
    let successCount = 0;

    for (const item of pendingItems) {
        try {
            // Remove the 'id' and 'timestamp' added for local storage before sending
            const { id, timestamp, ...payload } = item;
            
            await axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(payload), {
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                }
            });

            // If successful, remove from IndexedDB
            await db.delete(STORE_NAME, id);
            successCount++;
        } catch (error) {
            console.error('Failed to sync item:', item, error);
            // Stop syncing if we hit an error (e.g., internet dropped again)
            break;
        }
    }

    console.log(`Sync complete. Success: ${successCount}/${pendingItems.length}`);
    return successCount === pendingItems.length;
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('Connection restored! Triggering auto-sync...');
        syncData();
    });
}
