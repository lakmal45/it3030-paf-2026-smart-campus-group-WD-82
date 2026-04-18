import axios from "axios";

const API_URL = "http://localhost:8081/api/user";

// Configure axios to include credentials (cookies for session)
axios.defaults.withCredentials = true;

export const getMe = async () => {
    try {
        const response = await axios.get(`${API_URL}/me`);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to fetch user data";
    }
};

export const updateProfile = async (updateData) => {
    try {
        const response = await axios.put(`${API_URL}/me`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to update profile";
    }
};

export const changePassword = async (oldPassword, newPassword) => {
    try {
        const response = await axios.put(`${API_URL}/me/password`, { oldPassword, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to change password";
    }
};

export const deleteAccount = async () => {
    try {
        const response = await axios.delete(`${API_URL}/me`);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to delete account";
    }
};

export const updateNotificationPrefs = async (prefs) => {
    try {
        const response = await axios.put(`${API_URL}/me/notifications`, prefs);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to update notification preferences";
    }
};
