/* db.js - gestione unica localStorage per tasks e note */
const DB = {
    TASKS_KEY: "tasks",
    NOTES_KEY: "diary_notes",

    getTasks() {
        try {
            const raw = localStorage.getItem(this.TASKS_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch { return []; }
    },

    saveTasks(tasks) {
        localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    },

    getNotes() {
        try {
            const raw = localStorage.getItem(this.NOTES_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    saveNoteFor(dateKey, text) {
        const notes = this.getNotes();
        if (text?.trim()) notes[dateKey] = text.trim();
        else delete notes[dateKey];
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    },

    loadNoteFor(dateKey) {
        const notes = this.getNotes();
        return notes[dateKey] || "";
    }
};
