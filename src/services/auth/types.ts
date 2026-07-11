import type { User } from '@supabase/supabase-js';

export type AuthenticatedState = {
    isAuthenticated: true;
    user: User;
};

export type UnauthenticatedState = {
    isAuthenticated: false;
    user: null;
};

export type AuthContext = AuthenticatedState | UnauthenticatedState;
