import logoImg from '@/assets/images/logos/seal_logo.png';

export function VirtualIDCard({ alumniData }) {
  return (
    <div className="bg-gradient-to-br from-primary to-[#072416] text-white rounded-2xl p-5 md:p-7 shadow-lg relative overflow-hidden border border-secondary/20 card-interactive card-tilt w-full">
      {/* Ornamental corners */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-secondary/60 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-secondary/60 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-secondary/60 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-secondary/60 rounded-br-sm pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-48 sm:h-52">
        {/* Header Card */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Logo PTQ Ma'unah Sari"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-card rounded-full p-0.5"
            />
            <div className="text-left">
              <span className="block font-display text-xs sm:text-sm font-bold tracking-wider leading-none text-white">
                HAMAS
              </span>
              <span className="block text-[7px] sm:text-[8px] font-bold text-secondary uppercase tracking-widest mt-0.5">
                KARTU ANGGOTA ALUMNI
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[7px] sm:text-[8px] text-white/50 font-mono">
              SEJAK Wisuda {alumniData.yearOut}
            </span>
            <span className="block text-[8px] sm:text-[9px] font-bold text-secondary font-mono leading-none mt-0.5">
              {alumniData.memberNo}
            </span>
          </div>
        </div>

        {/* Middle Card with QR Code */}
        <div className="flex justify-between items-center gap-4 py-2">
          <div className="flex gap-3 items-center min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-secondary overflow-hidden bg-primary/20 flex items-center justify-center text-secondary font-display text-xl sm:text-2xl font-bold shrink-0">
              {alumniData.avatar ? (
                <img
                  src={alumniData.avatar}
                  alt={`Foto profil ${alumniData.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                alumniData.name.replace("H. M. ", "").charAt(0)
              )}
            </div>
            <div className="text-left space-y-1 min-w-0">
              <h4 className="font-display font-bold text-sm sm:text-base text-white leading-tight truncate">
                {alumniData.name}
              </h4>
              <div className="text-[9px] sm:text-[10px] text-white/70 font-mono truncate">
                Program: {alumniData.program}
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/70 font-mono">
                Angkatan: {alumniData.yearIn}-{alumniData.yearOut}
              </div>
              <span className="inline-block bg-secondary/20 text-secondary text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-secondary/35">
                Verified Huffadh
              </span>
            </div>
          </div>

          {/* SVG QR Code */}
          <div className="hidden xs:block bg-white/10 border border-secondary/35 p-1 rounded-lg backdrop-blur-xs shrink-0 self-center">
            <svg className="w-11 h-11 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="6" height="6" strokeWidth="2" />
              <rect x="16" y="2" width="6" height="6" strokeWidth="2" />
              <rect x="2" y="16" width="6" height="6" strokeWidth="2" />
              <rect x="4" y="4" width="2" height="2" fill="currentColor" stroke="none" />
              <rect x="18" y="4" width="2" height="2" fill="currentColor" stroke="none" />
              <rect x="4" y="18" width="2" height="2" fill="currentColor" stroke="none" />
              <path d="M10 2h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm2 4h2v2h-2zm4-4h2v2h-2zm-6 8h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2h-2zm4 0h2v2h-2z" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>

        {/* Footer Card */}
        <div className="flex justify-between items-end text-[8px] sm:text-[9px] text-white/40 border-t border-white/10 pt-3 font-mono">
          <span>PTQ Ma'unah Sari Kediri</span>
          <span className="text-secondary font-bold uppercase tracking-wide">
            Sambung Sanad, Khidmah Tanpa Batas
          </span>
        </div>
      </div>
    </div>
  );
}
