function getDeviceID() {
    let deviceID = localStorage.getItem('deviceID');
    if (!deviceID) {
        deviceID = 'device-' + Math.random().toString(36).substr(2, 16);
        localStorage.setItem('deviceID', deviceID);
    }
    return deviceID;
}

class IndexedDBHelper {
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('deviceID', 'deviceID', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async addClickRecord(deviceID, buttonID) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({ deviceID, buttonID, timestamp: new Date() });

            request.onsuccess = resolve;
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getClickRecords(deviceID) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('deviceID');
            const request = index.getAll(deviceID);

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
