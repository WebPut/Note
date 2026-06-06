// Global function to update the storage counter display
window.updateStorageCounter = function() {
    const storageSpan = document.getElementById('storageAmount');
    if (!storageSpan) return;

    // Open the same IndexedDB
    const request = indexedDB.open('NotesAppDB', 1);
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const getAll = store.getAll();
        
        getAll.onsuccess = function() {
            const notes = getAll.result;
            // Calculate total size in bytes
            let totalBytes = 0;
            notes.forEach(note => {
                // Stringify the whole note object (id, text, timestamp)
                const noteStr = JSON.stringify(note);
                totalBytes += new Blob([noteStr]).size;
            });
            
            // Convert to KB or MB
            let displayValue, unit;
            if (totalBytes < 1024) {
                displayValue = totalBytes;
                unit = 'B';
            } else if (totalBytes < 1024 * 1024) {
                displayValue = (totalBytes / 1024).toFixed(1);
                unit = 'KB';
            } else {
                displayValue = (totalBytes / (1024 * 1024)).toFixed(1);
                unit = 'MB';
            }
            storageSpan.textContent = `${displayValue} ${unit}`;
        };
        
        getAll.onerror = function() {
            storageSpan.textContent = 'error';
        };
    };
    
    request.onerror = function() {
        if (storageSpan) storageSpan.textContent = '?';
    };
};

// Also run once when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.updateStorageCounter());
} else {
    window.updateStorageCounter();
}
