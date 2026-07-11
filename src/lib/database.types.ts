export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    first_name: string | null;
                    last_name: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    first_name?: string | null;
                    last_name?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    first_name?: string | null;
                    last_name?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<never, never>;
        Functions: Record<never, never>;
        Enums: Record<never, never>;
        CompositeTypes: Record<never, never>;
    };
};
