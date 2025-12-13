import LoginForm from '../../components/LoginForm';
import { Link } from 'react-router-dom';

function Login() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <LoginForm />
                <div className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
