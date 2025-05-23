//idb.js

export const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NewsDB', 3);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('news')) {
                db.createObjectStore('news', { keyPath: 'title' });
            }

            if (!db.objectStoreNames.contains('users')) {
                const userStore = db.createObjectStore('users', { keyPath: 'username' });
                userStore.createIndex('username', 'username', { unique: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveNewsToDB = async (newsArray) => {
    const db = await openDatabase();
    const tx = db.transaction('news', 'readwrite');
    const store = tx.objectStore('news');

    newsArray.forEach(news => store.put(news));

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
};

export const getNewsFromDB = async () => {
    const db = await openDatabase();
    const tx = db.transaction('news', 'readonly');
    const store = tx.objectStore('news');
    return store.getAll();
};

export const saveUsersToDB = async (usersArray) => {
    const db = await openDatabase();
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');

    usersArray.forEach(user => store.put(user));

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
};

export const getUsersFromDB = async () => {
    const db = await openDatabase();
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    return store.getAll();
};
