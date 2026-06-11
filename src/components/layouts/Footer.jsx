import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Heart from 'lucide-react/dist/esm/icons/heart';
import sealLogo from '@/assets/images/logos/seal_logo.png';
import { useNavigation } from '@/contexts/NavigationContext';

export default function Footer() {
  const { navigate } = useNavigation();
  const currentYear = new Date().getFullYear();

  const handleNav = (page) => {
    navigate(page);
  };

  return (
    <footer className="bg-primary text-white border-t-4 border-secondary shadow-inner mt-auto">
      {/* Upper Grid Area */}
      <div className="container-custom py-12 grid gap-8 md:grid-cols-12">
        {/* Info Column */}
        <div className="md:col-span-5 text-left space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={sealLogo}
              alt="Logo Arab PTQ Ma'unah Sari"
              className="w-16 h-16 object-contain rounded-full bg-card p-1 shadow-md border border-secondary/20"
            />
            <div>
              <span className="block font-display text-lg font-bold text-white tracking-wider leading-none">
                PTQ Ma'unah Sari
              </span>
              <span className="block text-[10px] text-secondary font-semibold uppercase tracking-wider mt-1.5">
                Pesantren Tahfidhul Qur'an
              </span>
            </div>
          </div>
          <p className="text-xs text-white/70 max-w-sm leading-relaxed">
            Lembaga pendidikan Tahfidhul Qur'an berafiliasi dengan Rabithah Ma'had Al-Islamiyyah (RMI) Nahdlatul Ulama yang mendidik santri putra-putri berwawasan Ahlussunnah wal Jama'ah An-Nahdliyyah.
          </p>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 text-left space-y-3">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Akses Cepat</h4>
          <ul className="text-xs space-y-2">
            <li>
              <button onClick={() => handleNav('beranda')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Beranda
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('profil')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Profil Pesantren
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('pendaftaran')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Pendaftaran (PSB)
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('login')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Masuk Portal (Santri & Alumni)
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('putra')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Pondok Putra
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('putri')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Pondok Putri
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('alumni')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Alumni (HAMAS)
              </button>
            </li>
          </ul>
        </div>

        {/* Contact/Address Column */}
        <div className="md:col-span-4 text-left space-y-3">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Sekretariat</h4>
          <div className="text-xs text-white/70 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="icon-xs text-secondary shrink-0 mt-0.5" />
              <span>
                Jl. KH. Agus Salim No.8, Bandar Kidul, Kec. Mojoroto, Kota Kediri, Jawa Timur 64118
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="icon-xs text-secondary shrink-0" />
              <span>0812-4530-6020 (Putra)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="icon-xs text-secondary shrink-0" />
              <span>0856-4571-7767 (Putri)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social / Copyright Area */}
      <div className="bg-[#092c1b] py-6 border-t border-white/10">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-white/50">
            &copy; {currentYear} PTQ Ma'unah Sari. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-1 text-white/40">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> untuk Para Huffadh Al-Qur'an
          </div>
        </div>
      </div>
    </footer>
  );
}
