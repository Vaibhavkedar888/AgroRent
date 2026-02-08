import api from './axios';

const EquipmentService = {
    getAllEquipment: async (category, lat, lng) => {
        const response = await api.get('/api/public/equipment', {
            params: { category, lat, lng }
        });
        return response.data;
    },

    getEquipmentById: async (id) => {
        const response = await api.get(`/api/public/equipment/${id}`);
        return response.data;
    },

    addEquipment: async (equipmentData) => {
        const formData = new FormData();
        // Append all fields to FormData for file upload support
        Object.keys(equipmentData).forEach(key => {
            formData.append(key, equipmentData[key]);
        });

        const response = await api.post('/api/owner/equipment', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }); // Need to create/verify this endpoint
        return response.data;
    },

    updateEquipment: async (id, equipmentData, isAdmin = false) => {
        const formData = new FormData();
        Object.keys(equipmentData).forEach(key => {
            if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
                formData.append(key, equipmentData[key]);
            }
        });

        const baseUrl = isAdmin ? '/api/admin' : '/api/owner';
        const response = await api.put(`${baseUrl}/equipment/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteEquipment: async (id) => {
        const response = await api.delete(`/api/owner/equipment/${id}`);
        return response.data;
    },

    // Farmer specific
    bookEquipment: async (bookingData) => {
        const response = await api.post('/api/farmer/booking', bookingData);
        return response.data;
    }
};

export default EquipmentService;
