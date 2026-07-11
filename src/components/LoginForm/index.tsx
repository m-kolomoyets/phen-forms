import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loginMutationOptions } from '@/services/auth/queries';
import { Button } from '@/components/ui/Button';

function LoginForm() {
    const { mutate: login, isPending } = useMutation(loginMutationOptions());

    return (
        <div className="p-6 md:p-8 w-full max-w-md">
            <div className="flex flex-col items-center text-center mb-6">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">Sign in to your account</p>
            </div>
            <Button
                type="button"
                className="w-full"
                isLoading={isPending}
                onClick={() => {
                    login(undefined, {
                        onError(error) {
                            toast.error(error.message);
                        },
                    });
                }}
            >
                Sign in with Google
            </Button>
        </div>
    );
}

export { LoginForm };
