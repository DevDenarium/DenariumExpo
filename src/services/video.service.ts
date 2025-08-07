import axios from 'axios';
import { getAuthToken } from './educational.service';


const API_BASE_URL = 'http://192.168.100.4:3000';

export const VideoService = {
    getSignedUrl: async (contentId: string): Promise<string> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/educational/content/${contentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return response.data.videoUrl;
        } catch (error) {
            console.error('Error getting signed URL:', error);
            throw error;
        }
    },

    checkAccess: async (contentId: string): Promise<boolean> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/educational/content/${contentId}/check-access`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return response.data.hasAccess;
        } catch (error) {
            console.error('Error checking access:', error);
            return false;
        }
    },
};
