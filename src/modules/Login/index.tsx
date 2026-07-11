import { Link } from '@tanstack/react-router';
import { useTheme } from '@/context/ThemeContext';
import { LoginForm } from '@/components/LoginForm';

function Login() {
    const { isDarkTheme } = useTheme();

    return (
        <div className="grid h-full lg:grid-cols-2">
            <div className="relative hidden bg-black dark:bg-white lg:flex flex-col justify-between p-10">
                <Link className="outline-hidden focus-visible:outline-ring rounded-md w-fit" to="/login">
                    <img
                        className="h-7 w-fi"
                        src={isDarkTheme ? '/images/logo-black.svg' : '/images/logo-white.svg'}
                        alt="Phenomenon logo"
                    />
                </Link>
                <h3 className="text-background text-lg">Where big ideas meet bold execution</h3>
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-col justify-center items-center gap-2 lg:hidden">
                    <Link
                        to="/login"
                        className="outline-hidden focus-visible:outline-ring flex items-center gap-2 font-medium rounded-md w-fit"
                    >
                        <img
                            className="h-7 w-fit"
                            src={isDarkTheme ? '/images/logo-white.svg' : '/images/logo-black.svg'}
                            alt="Phenomenon logo"
                        />
                    </Link>
                    <h3 className="text-md">Where big ideas meet bold execution</h3>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}

export { Login };
