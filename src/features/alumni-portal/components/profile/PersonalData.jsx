import User from 'lucide-react/dist/esm/icons/user';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Home from 'lucide-react/dist/esm/icons/home';
import Phone from 'lucide-react/dist/esm/icons/phone';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

export function PersonalData({ alumniData }) {
  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
      <h4 className="font-display font-bold text-sm text-primary border-b border-primary/10 pb-3 text-left">
        Data Pribadi Terdaftar
      </h4>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Cell 1: Nama Lengkap */}
        <div className="bg-card border border-primary/5 hover:border-secondary/30 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm flex gap-3.5 items-center text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-secondary shrink-0">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Nama Lengkap
            </span>
            <span className="text-primary font-bold text-xs truncate block">{alumniData.name}</span>
          </div>
        </div>

        {/* Cell 2: Tahun Nyantri */}
        <div className="bg-card border border-primary/5 hover:border-secondary/30 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm flex gap-3.5 items-center text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-secondary shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Tahun Nyantri
            </span>
            <span className="text-primary font-bold text-xs block">
              {alumniData.yearIn} s/d {alumniData.yearOut}
            </span>
          </div>
        </div>

        {/* Cell 3: Domisili Kota */}
        <div className="bg-card border border-primary/5 hover:border-secondary/30 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm flex gap-3.5 items-center text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-secondary shrink-0">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Domisili Kota
            </span>
            <span className="text-primary font-bold text-xs block">{alumniData.city}</span>
          </div>
        </div>

        {/* Cell 4: Alamat Detail */}
        <div className="bg-card border border-primary/5 hover:border-secondary/30 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm flex gap-3.5 items-center text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-secondary shrink-0">
            <Home className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Alamat Detail
            </span>
            <span className="text-primary font-bold text-xs truncate block">{alumniData.address}</span>
          </div>
        </div>

        {/* Cell 5: Nomor WhatsApp */}
        <div className="bg-card border border-primary/5 hover:border-secondary/30 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm flex gap-3.5 items-center text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-secondary shrink-0">
            <Phone className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Nomor WhatsApp
            </span>
            <span className="text-primary font-bold text-xs font-mono block">{alumniData.phone}</span>
          </div>
        </div>

        {/* Cell 6: Status Keanggotaan */}
        <div className="bg-card border border-primary/5 hover:border-secondary/30 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm flex gap-3.5 items-center text-left">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle className="w-4.5 h-4.5 fill-emerald-100" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Status Keanggotaan
            </span>
            <span className="text-emerald-700 font-bold text-xs block">
              {alumniData.status} (Verified)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
