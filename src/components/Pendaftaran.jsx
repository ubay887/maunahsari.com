import React from 'react';
import { Download, ExternalLink, ShieldCheck, ClipboardList, Send, Milestone } from 'lucide-react';
import psbBanner from '../assets/psb_banner.jpg';

export default function Pendaftaran() {
  const alur = [
    'Calon santri mengisi formulir pendaftaran secara daring (online) sesuai dengan ketentuan.',
    'Calon santri hadir di pondok pesantren pada waktu yang telah ditentukan.',
    'Calon santri melakukan penyelesaian biaya administrasi di kantor pondok pesantren.',
    'Calon santri bersama orang tua atau wali melaksanakan sowan kepada pengasuh pondok sebagai bagian dari proses pendaftaran.'
  ];

  const syarat = [
    'Calon santri mengisi formulir pendaftaran sesuai dengan ketentuan yang berlaku.',
    'Calon santri wajib diantar oleh orang tua atau wali pada saat proses pendaftaran.',
    'Menyerahkan fotokopi ijazah terakhir sebanyak 2 (dua) lembar.',
    'Menyerahkan fotokopi Kartu Keluarga (KK) sebanyak 2 (dua) lembar.',
    'Menyerahkan pas foto berwarna ukuran 3×4 sebanyak 2 (dua) lembar.',
    'Menyerahkan nomor kontak orang tua atau wali yang dapat dihubungi.',
    'Calon santri bersedia untuk taat dan patuh terhadap seluruh peraturan yang berlaku di Pondok Pesantren.'
  ];

  return (
    <div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Penerimaan Santri Baru
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          PSB TA 2026/2027
        </h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto">
          Pendaftaran dibuka bagi santri putra dan putri secara daring (online) maupun luring (offline) hingga kuota terpenuhi.
        </p>
      </div>

      {/* Banner Poster */}
      <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-md border border-primary/5 bg-bg-surface p-2">
        <img
          src={psbBanner}
          alt="Poster Resmi Pendaftaran Santri Baru PPTQ Ma'unah Sari"
          className="w-full h-auto object-contain rounded-xl"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid md:grid-cols-2 gap-8 text-left">
        {/* Left Column: Alur & Syarat */}
        <div className="space-y-8">
          {/* Alur */}
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Milestone className="w-5 h-5 text-secondary" /> Alur Pendaftaran
            </h3>
            <ol className="space-y-4">
              {alur.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-xs leading-relaxed text-text-muted">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-secondary font-bold shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Syarat */}
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-secondary" /> Syarat & Berkas
            </h3>
            <ul className="space-y-3">
              {syarat.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs leading-relaxed text-text-muted">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Actions (Biaya & Formulir) */}
        <div className="space-y-8">
          {/* Rincian Biaya */}
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Download className="w-5 h-5 text-secondary" /> Rincian Biaya Administrasi
            </h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Silakan unduh dokumen panduan dan rincian pembiayaan administrasi pendaftaran santri baru melalui tautan di bawah ini:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <a
                href="https://drive.google.com/file/d/1Sfs6EcAzYpryACiCOrx4sXUWYtY46C3Q/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 glossy-emerald text-bg-surface rounded-lg text-xs font-bold transition-all cursor-pointer focus:outline-none"
              >
                Unduh Biaya Putra
                <Download className="w-4 h-4" />
              </a>
              <a
                href="https://drive.google.com/file/d/1FYcClryJVb7sqIb8Ph2XhZFAwNRxR6H3/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer focus:outline-none"
              >
                Unduh Biaya Putri
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Formulir Pendaftaran */}
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Send className="w-5 h-5 text-secondary" /> Formulir Pendaftaran Online
            </h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Pendaftaran secara daring dapat dilakukan dengan mengisi Google Form resmi di bawah ini sesuai jenis kelamin calon santri:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <a
                href="https://forms.gle/5ZkMT3buNXGpgRHX6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 glossy-gold text-primary font-bold rounded-lg text-xs transition-all cursor-pointer focus:outline-none"
              >
                Form Pendaftaran Putra
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://forms.gle/mr9fBiMJHQQMfrPC9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 glossy-emerald text-bg-surface font-bold rounded-lg text-xs transition-all cursor-pointer focus:outline-none"
              >
                Form Pendaftaran Putri
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="text-[11px] text-text-muted border-t border-primary/10 pt-3 mt-2">
              * Khusus pendaftaran santri nduduk (putra), pendaftaran dapat dilakukan secara langsung di kantor pondok pesantren.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
