import api from './axios';

const ReviewService = {
    getEquipmentReviews: async (equipmentId) => {
        const response = await api.get(`/api/public/equipment/${equipmentId}/reviews`);
        return response.data;
    },

    addReview: async (reviewData) => {
        const response = await api.post('/api/farmer/reviews', reviewData);
        return response.data;
    },

    deleteReview: async (reviewId) => {
        const response = await api.delete(`/api/admin/reviews/${reviewId}`);
        return response.data;
    }
};

export default ReviewService;
