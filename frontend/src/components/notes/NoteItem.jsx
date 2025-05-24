import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteNote } from '../../features/notes/notesSlice';
import { toast } from 'react-hot-toast';

const NoteItem = ({ note }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();

  const onDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteNote(note._id)).unwrap();
        toast.success('Note deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete note');
      }
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 relative"
      style={{ backgroundColor: note.backgroundColor || '#ffffff' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>

      {note.labels && note.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.labels.map((label) => (
            <span
              key={label._id}
              className="px-2 py-1 text-xs rounded-full"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {isHovered && (
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            onClick={() => {/* TODO: Implement edit */}}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-600 hover:text-red-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteItem; 