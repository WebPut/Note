// main.js - entry point, only calls methods from NotesDB and DOM updates

import { NotesDB } from './NotesDB.js';

// DOM elements
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesListContainer');

// Initialize database
const db = new NotesDB();

// Helper: render all notes from DB
async function renderNotes() {
    const notes = await db.getAllNotes();
    if (notes.length === 0) {
        notesContainer.innerHTML = '<div class="placeholder-msg">✨ Your notes will show up here</div>';
        return;
    }
    // Build HTML for each note
    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <div class="note-content">
                <div class="note-text">${escapeHtml(note.text)}</div>
                <div class="note-time">${note.timestamp}</div>
            </div>
            <button class="delete-note" data-id="${note.id}">✖</button>
        </div>
    `).join('');
    
    // Attach delete event listeners to each delete button
    document.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            await db.deleteNote(id);
            await renderNotes(); // re-render after deletion
        });
    });
}

// Helper: escape HTML to avoid injection
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Add a new note from input field
async function addNoteFromInput() {
    const text = noteInput.value.trim();
    if (text === "") return;
    
    const now = new Date();
    const timestamp = now.toLocaleString(); // e.g., "6/6/2026, 2:30:45 PM"
    
    await db.addNote(text, timestamp);
    noteInput.value = "";   // clear input
    await renderNotes();    // refresh list
}

// Event listener: Enter key
noteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addNoteFromInput();
    }
});

// Initial load: open DB and show existing notes
(async function init() {
    await db.open();
    await renderNotes();
})();
