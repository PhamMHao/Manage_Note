import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createNote, updateNote } from '../../features/notes/notesSlice';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';

const NoteEditor = ({ note = null, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    isPasswordProtected: false,
    password: '',
    backgroundColor: '#ffffff'
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        isPinned: note.isPinned || false,
        isPasswordProtected: note.isPasswordProtected || false,
        password: '',
        backgroundColor: note.backgroundColor || '#ffffff'
      });
    }
  }, [note]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (note) {
        await dispatch(updateNote({ id: note._id, noteData: formData })).unwrap();
        toast.success('Note updated successfully');
      } else {
        await dispatch(createNote(formData)).unwrap();
        toast.success('Note created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save note');
    }
  };

  // Auto-save functionality
  const debouncedSave = debounce(async (data) => {
    if (note) {
      try {
        await dispatch(updateNote({ id: note._id, noteData: data })).unwrap();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, 1000);

  useEffect(() => {
    if (note && formData.content) {
      debouncedSave(formData);
    }
    return () => debouncedSave.cancel();
  }, [formData, note]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="Title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <textarea
            name="content"
            value={formData.content}
            onChange={onChange}
            placeholder="Write your note here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
          />
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={onCheckboxChange}
              className="mr-2"
            />
            Pin note
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPasswordProtected"
              checked={formData.isPasswordProtected}
              onChange={onCheckboxChange}
              className="mr-2"
            />
            Password protect
          </label>

          {formData.isPasswordProtected && (
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Enter password"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <input
            type="color"
            name="backgroundColor"
            value={formData.backgroundColor}
            onChange={onChange}
            className="w-12 h-8"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {note ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor; 