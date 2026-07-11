import { supabase } from '@/lib/@supabase';

export const login = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
    });

    if (error) {
        throw error;
    }

    return data;
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
};

export const me = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return data.user;
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session;
};
