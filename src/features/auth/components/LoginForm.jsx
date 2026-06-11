import { useState, useEffect } from 'react';
import User from 'lucide-react/dist/esm/icons/user';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Mail from 'lucide-react/dist/esm/icons/mail';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import logoImg from '@/assets/images/logos/seal_logo.png';
import { OrnamentalCorner, IslamicRosette } from '@/components/ui/IslamicPattern';
import { useAuth } from '../hooks/useAuth';
import { PortalSelector } from './PortalSelector';
import { DemoCredentials } from './DemoCredentials';

// Demo credentials for validation
const DEMO_SANTRI = { nik: '3506123456789001', regNo: 'MS-2026-0042' };
const DEMO_ALUMNI = { email: 'alumni@maunahsari.com', password: 'alumni123' };

export function LoginForm() {
  const { login } = useAuth();

  // Portal toggle state
  const [activePortal, setActivePortal] = useState('santri');

  // Form field states
  const [nik, setNik] = useState(() => {
    const savedSantri = localStorage.getItem('registeredSantri');
    if (savedSantri) {
      try {
        const parsed = JSON.parse(savedSantri);
        if (parsed.autoFillLogin) {
          return parsed.nik || '';
        }
      } catch {
        // ignore
      }
    }
    return '';
  });

  const [regNo, setRegNo] = useState(() => {
    const savedSantri = localStorage.getItem('registeredSantri');
    if (savedSantri) {
      try {
        const parsed = JSON.parse(savedSantri);
        if (parsed.autoFillLogin) {
          return parsed.regNo || '';
        }
      } catch {
        // ignore
      }
    }
    return '';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI states
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill cleanup from localStorage if user just registered
  useEffect(() => {
    const savedSantri = localStorage.getItem('registeredSantri');
    if (savedSantri) {
      try {
        const parsed = JSON.parse(savedSantri);
        if (parsed.autoFillLogin) {
          localStorage.setItem(
            'registeredSantri',
            JSON.stringify({ ...parsed, autoFillLogin: false })
          );
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Clear errors when switching portal
  const handlePortalChange = (variant) => {
    setActivePortal(variant);
    setErrorMsg('');
  };

  // Fill demo credentials
  const handleFillDemo = (variant) => {
    setErrorMsg('');
    if (variant === 'santri') {
      setNik(DEMO_SANTRI.nik);
      setRegNo(DEMO_SANTRI.regNo);
    } else {
      setEmail(DEMO_ALUMNI.email);
      setPassword(DEMO_ALUMNI.password);
    }
  };

  // Form submission with validation
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (activePortal === 'santri') {
        const cleanNik = nik.trim();
        const cleanReg = regNo.trim().toUpperCase();

        // Check against demo credentials or localStorage-saved data
        const savedSantri = localStorage.getItem('registeredSantri');
        let validNik = DEMO_SANTRI.nik;
        let validRegNo = DEMO_SANTRI.regNo;

        if (savedSantri) {
          try {
            const parsed = JSON.parse(savedSantri);
            validNik = parsed.nik || validNik;
            validRegNo = parsed.regNo || validRegNo;
          } catch {
            // Use defaults
          }
        }

        if (cleanNik === validNik && (cleanReg === validRegNo || cleanReg === 'MS-2026-0042')) {
          login('santri');
        } else {
          setErrorMsg(
            'NIK atau Nomor Registrasi tidak cocok. Gunakan akun demo atau daftarkan diri terlebih dahulu.'
          );
        }
      } else {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password;

        if (cleanEmail === DEMO_ALUMNI.email && cleanPass === DEMO_ALUMNI.password) {
          login('alumni');
        } else {
          setErrorMsg(
            'Surel atau Kata Sandi salah. Gunakan akun demo (alumni@maunahsari.com / alumni123).'
          );
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-card border border-primary/5 rounded-2xl shadow-lg relative overflow-hidden animate-fade-in">
      {/* Ornamental corners */}
      <OrnamentalCorner position="top-left" size="md" />
      <OrnamentalCorner position="top-right" size="md" />
      <OrnamentalCorner position="bottom-left" size="md" />
      <OrnamentalCorner position="bottom-right" size="md" />

      {/* Background watermark */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] flex items-center justify-center">
        <IslamicRosette size="xl" />
      </div>

      <div className="p-6 sm:p-8 relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={logoImg}
            alt="Logo Resmi PTQ Ma'unah Sari"
            className="w-16 h-16 mx-auto object-contain rounded-full bg-background p-1 border border-secondary/10 shadow-sm"
          />
          <h3 className="font-display text-xl text-primary font-bold">
            Portal Masuk Terpadu
          </h3>
          <p className="text-xs text-muted-foreground">
            PTQ Ma'unah Sari Bandar Kidul Kediri
          </p>
        </div>

        {/* Portal selector */}
        <PortalSelector variant={activePortal} onChange={handlePortalChange} />

        {/* Error message */}
        {errorMsg && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2 animate-bounce-subtle"
            role="alert"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
          {activePortal === 'santri' ? (
            <>
              {/* NIK Input */}
              <div className="space-y-1">
                <label htmlFor="nik-input" className="block font-semibold text-muted-foreground">
                  NIK Calon Santri (16 Digit)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="nik-input"
                    type="text"
                    maxLength={16}
                    required
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Masukkan 16 digit NIK Anda"
                    className="w-full min-h-11 pl-9 pr-3 py-3 border border-primary/10 rounded-lg bg-background text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              {/* Registration Number Input */}
              <div className="space-y-1">
                <label htmlFor="reg-input" className="block font-semibold text-muted-foreground">
                  Nomor Registrasi (Contoh: MS-2026-0042)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="reg-input"
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Masukkan Nomor Registrasi"
                    className="w-full min-h-11 pl-9 pr-3 py-3 border border-primary/10 rounded-lg bg-background text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Email Input */}
              <div className="space-y-1">
                <label htmlFor="email-input" className="block font-semibold text-muted-foreground">
                  Alamat Surel (Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumni@maunahsari.com"
                    className="w-full min-h-11 pl-9 pr-3 py-3 border border-primary/10 rounded-lg bg-background text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="pass-input" className="font-semibold text-muted-foreground">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    className="min-h-11 min-w-11 text-[10px] text-secondary hover:underline font-semibold cursor-pointer flex items-center justify-center"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="pass-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-11 pl-9 pr-3 py-3 border border-primary/10 rounded-lg bg-background text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center min-h-11 py-3! font-bold text-sm shadow-md transition-all focus-ring disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Menghubungkan...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Masuk Portal <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            )}
          </button>
        </form>

        {/* Demo credentials helper */}
        <DemoCredentials variant={activePortal} onFill={handleFillDemo} />
      </div>
    </div>
  );
}
