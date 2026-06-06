// NotesDB.js - Handles all IndexedDB operations for notes
export class NotesDB {
    constructor(dbName = "NotesAppDB", storeName = "notes") {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    // Open (or create) the database
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object store with auto-incrementing id
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, {
                        keyPath: "id",
                        autoIncrement: true
                    });
                    // Index by timestamp for possible sorting later
                    store.createIndex("timestamp", "timestamp", { unique: false });
                }
            };
        });
    }

    // Add a new note
    async addNote(text, timestamp) {
        if (!this.db) await this.open();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const note = { text, timestamp };
            const request = store.add(note);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all notes, sorted by timestamp (oldest first)
    async getAllNotes() {
        if (!this.db) await this.open();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const index = store.index("timestamp");
            const request = index.openCursor();
            const notes = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    notes.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(notes);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete a note by id
    async deleteNote(id) {
        if (!this.db) await this.open();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
