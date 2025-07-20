import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const getLandingStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/landing/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching landing stats:', error);
        throw error;
    }
};