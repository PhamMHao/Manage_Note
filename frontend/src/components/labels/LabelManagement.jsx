import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../../features/labels/labelsSlice';
import { toast } from 'react-hot-toast';

const LabelManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#4f46e5'
  });
  const [editingLabel, setEditingLabel] = useState(null);

  const dispatch = useDispatch();
  const { labels, isLoading } = useSelector((state) => state.labels);

  useEffect(() => {
    dispatch(getLabels());
  }, [dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingLabel) {
        await dispatch(updateLabel({ id: editingLabel._id, labelData: formData })).unwrap();
        toast.success('Label updated successfully');
      } else {
        await dispatch(createLabel(formData)).unwrap();
        toast.success('Label created successfully');
      }
      setFormData({ name: '', color: '#4f46e5' });
      setEditingLabel(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save label');
    }
  };

  const onEdit = (label) => {
    setEditingLabel(label);
    setFormData({
      name: label.name,
      color: label.color
    });
  };

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      try {
        await dispatch(deleteLabel(id)).unwrap();
        toast.success('Label deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete label');
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Labels</h2>

      <form onSubmit={onSubmit} className="mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Label name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={onChange}
            className="w-12 h-10"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {editingLabel ? 'Update' : 'Create'}
          </button>
          {editingLabel && (
            <button
              type="button"
              onClick={() => {
                setEditingLabel(null);
                setFormData({ name: '', color: '#4f46e5' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {labels.map((label) => (
          <div
            key={label._id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <span>{label.name}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(label)}
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
                onClick={() => onDelete(label._id)}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelManagement; 