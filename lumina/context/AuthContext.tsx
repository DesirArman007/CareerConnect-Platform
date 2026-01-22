import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

export interface User {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
    title?: string;
    savedJobs?: string[];
}

interface AuthContextType {
    user: User | null;
    savedJobs: string[];
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (data: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleSaveJob: (jobId: string) => void;
    isJobSaved: (jobId: string) => boolean;
}


interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: any;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [savedJobs, setSavedJobs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Correctly fetch authenticated user
    const fetchUserData = async (): Promise<boolean> => {
        try {
            const response = await auth.getUser() as ApiResponse<User>;

            // console.log('Fetched user data:', response);

            if (response?.success === true && response.data) {
                const userData = response.data;

                setUser(userData);
                setSavedJobs(Array.isArray(userData.savedJobs) ? userData.savedJobs : []);
                return true;
            }

            return false;
        } catch (error) {
            // console.log('Failed to fetch user:', error);
            setUser(null);
            setSavedJobs([]);
            return false;
        }
    };

    // ✅ Check auth on app mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            await fetchUserData();
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        // console.log('Attempting login...');
        const response = await auth.login(credentials);
        // console.log('Login response:', response);

        if (response?.success === true) {
            // Give browser time to store cookie
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to fetch user, but DO NOT fail login if this breaks
            try {
                const success = await fetchUserData();
                if (!success) {
                    console.warn('Login succeeded, but getUser failed (cookie not ready yet)');
                }
            } catch (err) {
                console.warn('Ignoring getUser error after login:', err);
            }

            return; // ✅ LOGIN SUCCESS
        }

        throw new Error('Login failed');
    };


    // ✅ Register (does NOT log user in - they need to login separately)
    const register = async (data: { name: string; email: string; password: string }) => {
        // console.log('Attempting registration...');
        const response = await auth.register(data);
        // console.log('Register response:', response);

        if (response?.success === true) {
            // Registration successful - do NOT call fetchUserData
            // User needs to login separately after registration
            return response;
        }

        throw new Error('Registration failed');
    };

    // ✅ Logout
    const logout = async () => {
        try {
            await auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        setSavedJobs([]);
    };

    // ✅ Update profile
    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        try {
            const updatedUser = await auth.updateUser(data);
            if (updatedUser && typeof updatedUser === 'object') {
                setUser(updatedUser);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            setUser({ ...user, ...data });
        }
    };

    // ✅ Save / unsave jobs
    const toggleSaveJob = async (jobId: string) => {
        if (!user) return;

        const newSavedJobs = savedJobs.includes(jobId)
            ? savedJobs.filter(id => id !== jobId)
            : [...savedJobs, jobId];

        setSavedJobs(newSavedJobs);

        try {
            await auth.updateUser({ savedJobs: newSavedJobs });
        } catch (error) {
            console.error('Failed to sync saved jobs:', error);
            setSavedJobs(savedJobs);
        }
    };

    const isJobSaved = (jobId: string) => savedJobs.includes(jobId);

    return (
        <AuthContext.Provider
            value={{
                user,
                savedJobs,
                isLoading,
                login,
                register,
                logout,
                updateProfile,
                toggleSaveJob,
                isJobSaved
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
