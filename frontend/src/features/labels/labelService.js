import axios from 'axios';

const API_URL = '/api/labels/';

// Get user labels
const getLabels = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Create new label
const createLabel = async (labelData) => {
    const response = await axios.post(API_URL, labelData);
    return response.data;
};

// Update label
const updateLabel = async (id, labelData) => {
    const response = await axios.put(API_URL + id, labelData);
    return response.data;
};

// Delete label
const deleteLabel = async (id) => {
    const response = await axios.delete(API_URL + id);
    return response.data;
};

const labelService = {
    getLabels,
    createLabel,
    updateLabel,
    deleteLabel
};

export default labelService; 