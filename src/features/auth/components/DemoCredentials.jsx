/**
 * DemoCredentials — Helper UI that shows demo credentials and provides
 * an auto-fill button for quick login testing.
 *
 * @param {{ variant: 'santri' | 'alumni', onFill: (variant: 'santri' | 'alumni') => void }} props
 */
export function DemoCredentials({ variant, onFill }) {
  if (variant === 'santri') {
    return (
      <div className="border-t border-primary/10 pt-4 text-left space-y-2.5">
        <span className="text-[10px] font-bold text-secondary tracking-wider uppercase block">
          Asisten Kredensial Uji Coba:
        </span>
        <div className="bg-primary/5 p-3 rounded-lg space-y-1.5 border border-primary/5">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Gunakan kredensial santri baru default atau selesaikan pendaftaran santri baru untuk mendapatkan kode unik:
          </p>
          <div className="text-[10px] text-primary bg-card p-2 rounded border border-primary/5 font-mono space-y-0.5">
            <div>NIK: <strong>3506123456789001</strong></div>
            <div>No. Reg: <strong>MS-2026-0042</strong></div>
          </div>
          <button
            type="button"
            onClick={() => onFill('santri')}
            className="min-h-11 min-w-11 w-full text-center py-2 px-2 bg-secondary/15 hover:bg-secondary/25 text-primary rounded text-[10px] font-bold transition-colors cursor-pointer"
          >
            Gunakan Akun Demo Calon Santri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-primary/10 pt-4 text-left space-y-2.5">
      <span className="text-[10px] font-bold text-secondary tracking-wider uppercase block">
        Asisten Kredensial Uji Coba:
      </span>
      <div className="bg-primary/5 p-3 rounded-lg space-y-1.5 border border-primary/5">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Gunakan kredensial alumni terdaftar HAMAS untuk mengakses portal keanggotaan:
        </p>
        <div className="text-[10px] text-primary bg-card p-2 rounded border border-primary/5 font-mono space-y-0.5">
          <div>Surel: <strong>alumni@maunahsari.com</strong></div>
          <div>Sandi: <strong>alumni123</strong></div>
        </div>
        <button
          type="button"
          onClick={() => onFill('alumni')}
          className="min-h-11 min-w-11 w-full text-center py-2 px-2 bg-secondary/15 hover:bg-secondary/25 text-primary rounded text-[10px] font-bold transition-colors cursor-pointer"
        >
          Gunakan Akun Demo Alumni HAMAS
        </button>
      </div>
    </div>
  );
}
