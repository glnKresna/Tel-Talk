import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('state') === 'register');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { loginUser, registerUser, isLoading, error: firebaseError } = useAuthStore();
  const navigate = useNavigate();

  // Watch for Firebase errors and map them to the correct input box
  useEffect(() => {
    if (firebaseError) {
      const lowerError = firebaseError.toLowerCase();

    if (lowerError.includes('email-already-in-use')) {
        setErrors({ email: 'Email ini sudah terdaftar!' });
    }

      if (lowerError.includes('password') || lowerError.includes('kredensial')) {
        setErrors({ password: 'Password salah. Coba lagi.' });
      } else if (lowerError.includes('email') || lowerError.includes('user not found')) {
        setErrors({ email: 'Email tidak terdaftar atau salah.' });
      } else {
        setErrors({ general: firebaseError });
      }
    }
  }, [firebaseError]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email tidak boleh kosong';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password tidak boleh kosong';
      isValid = false;
    } else if (isRegister) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);

      if (password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
        isValid = false;
      } else if (!hasUpperCase || !hasNumber) {
        newErrors.password = 'Harus mengandung minimal 1 huruf kapital dan 1 angka';
        isValid = false;
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password tidak boleh kosong';
        isValid = false;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isRegister) {
      await registerUser(email, password);
    } else {
      await loginUser(email, password);
    }

    const { currUser } = useAuthStore.getState();
    if (currUser) navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] flex">
      
      {/* Left Column: The Form */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            {isRegister ? 'Sign-up' : 'Login'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* EMAIL INPUT */}
            <div>
              <input
                type="text" // Removed type="email" so we can handle validation with our custom logic
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined }); // Clear error as they type
                }}
                placeholder="Email"
                className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all
                  ${errors.email 
                    ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/[0.02]' 
                    : 'border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.04]'}`}
              />
              {/* WARNING MESSAGE POPPING DOWN */}
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="Password"
                className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all
                  ${errors.password 
                    ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/[0.02]' 
                    : 'border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.04]'}`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD (ONLY ON SIGNUP) */}
            {isRegister && (
              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="Konfirmasi password"
                  className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all
                    ${errors.confirmPassword 
                      ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/[0.02]' 
                      : 'border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.04]'}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* FORGOT PASSWORD LINK */}
            {!isRegister && (
              <div className="flex justify-start mt-1">
                <button type="button" className="text-xs text-zinc-500 hover:text-violet-400 transition-colors">
                  Lupa password?
                </button>
              </div>
            )}

            {/* GENERAL FIREBASE ERRORS (e.g. "Too many requests") */}
            {errors.general && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-4">
                {errors.general}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold py-3.5 rounded-xl transition-all mt-6"
            >
              {isLoading ? 'Loading...' : isRegister ? 'Daftar' : 'Login'}
            </button>
          </form>

          {/* Social Login Separator */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]"></div>
            <span className="text-xs text-zinc-500">atau lanjutkan dengan</span>
            <div className="flex-1 h-px bg-white/[0.06]"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-medium py-3 rounded-xl transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <p className="text-center text-sm text-zinc-500 mt-8">
            {isRegister ? 'Punya akun? ' : 'Belum punya akun? '}

            <button
              type="button" // Prevents any accidental form submissions
              onClick={() => {
                setIsRegister(!isRegister);
                
                // Buat reset form state saat toggle antara login/register:
                setErrors({});
                setPassword(''); 
                setConfirmPassword('');
              }}
              className="text-white hover:text-violet-400 font-medium transition-colors"
            >
              {isRegister ? 'Login' : 'buat secara gratis'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Column: Image Placeholder */}
      <div className="hidden md:flex w-[55%] bg-[#16161f] border-l border-white/[0.06] items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
        <svg className="w-32 h-32 text-white/[0.03] relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h14l-4-5z"/>
        </svg>
      </div>

    </div>
  );
}