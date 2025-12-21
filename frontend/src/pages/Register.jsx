import RegisterForm from '../components/RegisterForm';
import { Link } from 'react-router-dom';

// =================================================================================================
// Register Page Component
// -------------------------------------------------------------------------------------------------
// A simple wrapper page for the Register Form.
// =================================================================================================

function Register() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <RegisterForm />
                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
