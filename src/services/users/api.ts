import { supabase } from '@/lib/@supabase';

export const getUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        throw error;
    }
    return data;
};

export const getUser = async (id: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) {
        throw error;
    }
    return data;
};
