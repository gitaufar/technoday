import { useState } from 'react';
import { Save } from 'lucide-react'; // Menggunakan ikon dari lucide-react
import ButtonBlue from '@/components/ButtonBlue'; // Menggunakan komponen tombol dari sebelumnya

// Tipe data untuk sebuah catatan
type Note = {
  id: number | string;
  author: string;
  timestamp: string;
  content: string;
};

// Tipe data untuk properti komponen utama
type LegalNotesProps = {
  notes: Note[];
  onSaveNote: (newNoteContent: string) => void; // Fungsi untuk menyimpan catatan baru
};

// Sub-komponen untuk menampilkan setiap item catatan
function NoteItem({ note }: { note: Note }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{note.timestamp}</span>
        <span>{note.author}</span>
      </div>
      <p className="mt-2 text-sm text-gray-800">{note.content}</p>
    </div>
  );
}

// Komponen Utama
export default function LegalNotes({ notes, onSaveNote }: LegalNotesProps) {
  const [newNote, setNewNote] = useState('');

  const handleSaveClick = () => {
    if (newNote.trim()) {
      onSaveNote(newNote);
      setNewNote(''); // Kosongkan textarea setelah menyimpan
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Legal Notes & Recommendations
      </h2>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Kolom Kiri: Form Tambah Catatan */}
        <div className="flex flex-col">
          <label htmlFor="new-note" className="mb-2 text-sm font-medium text-gray-700">
            Add New Note
          </label>
          <textarea
            id="new-note"
            rows={5}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Write your note here..."
          />
          <div className="mt-4">
            <ButtonBlue
              text="Save Note"
              onClick={handleSaveClick}
              iconRight={<Save size={16} />}
              disabled={!newNote.trim()}
            />
          </div>
        </div>

        {/* Kolom Kanan: Daftar Catatan Sebelumnya */}
        <div className="flex flex-col">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Previous Notes
          </h3>
          <div className="space-y-3">
            {notes.length > 0 ? (
              notes.map((note) => <NoteItem key={note.id} note={note} />)
            ) : (
              <p className="text-sm text-gray-500">No previous notes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}