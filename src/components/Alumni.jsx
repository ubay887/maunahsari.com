import React, { useState } from 'react';
import { Users, MapPin, Search, Calendar, Award, CheckCircle, Send, Globe, ChevronRight } from 'lucide-react';

const alumniRegions = [
  { id: 'jatim', name: 'Jawa Timur & Madura', count: 1240, coordinator: 'H. Moh. Anas, S.Ag.', contact: '0812-xxxx-xxxx', color: 'bg-emerald-500' },
  { id: 'jateng', name: 'Jawa Tengah & DIY', count: 480, coordinator: 'H. Khoirul Huda, M.Pd.', contact: '0857-xxxx-xxxx', color: 'bg-amber-500' },
  { id: 'jabar', name: 'Jawa Barat, Banten & DKI', count: 350, coordinator: 'H. Ahmad Syauqi, Lc.', contact: '0813-xxxx-xxxx', color: 'bg-blue-500' },
  { id: 'luar-jawa', name: 'Luar Jawa & Luar Negeri', count: 180, coordinator: 'Ust. Abdul Hamid, S.Th.I.', contact: '0821-xxxx-xxxx', color: 'bg-purple-500' }
];

export default function Alumni() {
  const [activeRegion, setActiveRegion] = useState('jatim');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    yearIn: '',
    yearOut: '',
    status: '30juz',
    city: '',
    whatsapp: ''
  });

  const selectedRegionData = alumniRegions.find(r => r.id === activeRegion);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.whatsapp) {
      setIsSubmitted(true);
      // Reset form after submission
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', yearIn: '', yearOut: '', status: '30juz', city: '', whatsapp: '' });
      }, 5000);
    }
  };

  return (
    <div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-12 text-left">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          IKATAN KELUARGA ALUMNI
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Himpunan Alumni Ma'unah Sari (HAMAS)
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
      </div>

      {/* Narration and Form Section */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Narration / Invitation */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-secondary tracking-wider uppercase block">
              Menjaga Sanad Keilmuan & Ukhuwah
            </span>
            <h3 className="font-display text-xl md:text-2xl font-bold text-primary">
              "Sambung Sanad, Khidmah Tanpa Batas"
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Hubungan santri dengan Masyayikh tidak akan pernah putus meski raga telah meninggalkan gerbang pesantren. Keberkahan ilmu mengalir dari sejauh mana jalinan silaturahim dan khidmah kepada almamater tetap terawat.
            </p>
            <p className="text-text-muted text-sm leading-relaxed">
              **Himpunan Alumni Ma'unah Sari (HAMAS)** merupakan wadah resmi silaturahim, sinergi, dan kolaborasi bagi seluruh alumni penghafal Al-Qur'an PPTQ Ma'unah Sari Kediri. Kami mengajak seluruh alumni untuk mendaftarkan diri ke dalam **Database Alumni Nasional** guna memetakan sebaran dakwah, mendukung program pembangunan pondok, serta memudahkan agenda silaturahim akbar/korwil.
            </p>
            <div className="border-t border-primary/10 pt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block font-display text-2xl font-bold text-primary">2.250+</span>
                <span className="block text-[9px] text-text-muted uppercase font-semibold">Total Alumni</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-bold text-primary">4</span>
                <span className="block text-[9px] text-text-muted uppercase font-semibold">Wilayah Besar</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-bold text-primary">1967 M</span>
                <span className="block text-[9px] text-text-muted uppercase font-semibold">Cikal Bakal</span>
              </div>
            </div>
          </div>

          {/* Heatmap & Distribution Panel */}
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-primary/10 pb-3">
              <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <Globe className="w-5 h-5 text-secondary" /> Peta Sebaran Alumni
              </h3>
              <span className="text-[10px] text-text-muted uppercase font-bold">Interaktif</span>
            </div>

            {/* Simulated Heatmap Map (SVG) */}
            <div className="relative w-full h-48 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/5 overflow-hidden">
              {/* Abstract Indonesia Map Drawing in SVG */}
              <svg className="w-full h-full max-w-md opacity-25" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sumatra */}
                <path d="M40 70 L90 120 L80 130 L30 80 Z" fill="currentColor" className="text-primary" />
                {/* Jawa */}
                <path d="M100 140 L210 150 L210 145 L100 135 Z" fill="currentColor" className="text-primary" />
                {/* Kalimantan */}
                <path d="M110 60 L160 50 L180 80 L160 110 L120 100 Z" fill="currentColor" className="text-primary" />
                {/* Sulawesi */}
                <path d="M210 70 L240 60 L240 75 L220 85 L245 105 L235 110 L210 90 Z" fill="currentColor" className="text-primary" />
                {/* Papua */}
                <path d="M330 90 L380 90 L390 110 L370 120 L330 110 Z" fill="currentColor" className="text-primary" />
              </svg>

              {/* Glowing Pulse Nodes for Heatmap Density */}
              {/* Jatim (Kediri Hotspot - Dense) */}
              <button 
                onClick={() => setActiveRegion('jatim')}
                className={`absolute top-[138px] left-[135px] w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'jatim' ? 'ring-2 ring-emerald-500 bg-emerald-500/50 scale-110' : ''}`}
                title="Jawa Timur"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 z-10"></span>
              </button>

              {/* Jateng (DIY/Jateng - Medium) */}
              <button 
                onClick={() => setActiveRegion('jateng')}
                className={`absolute top-[133px] left-[105px] w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'jateng' ? 'ring-2 ring-amber-500 bg-amber-500/50 scale-110' : ''}`}
                title="Jawa Tengah & DIY"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 z-10"></span>
              </button>

              {/* Jabar (DKI/Banten/Jabar - Medium) */}
              <button 
                onClick={() => setActiveRegion('jabar')}
                className={`absolute top-[125px] left-[78px] w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'jabar' ? 'ring-2 ring-blue-500 bg-blue-500/50 scale-110' : ''}`}
                title="Jawa Barat, Banten & DKI"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 z-10"></span>
              </button>

              {/* Luar Jawa (Sumatra/Kalimantan - Low) */}
              <button 
                onClick={() => setActiveRegion('luar-jawa')}
                className={`absolute top-[75px] left-[135px] w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'luar-jawa' ? 'ring-2 ring-purple-500 bg-purple-500/50 scale-110' : ''}`}
                title="Luar Jawa"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 z-10"></span>
              </button>

              <div className="absolute bottom-2 left-3 text-[10px] text-text-muted bg-bg-surface/80 px-2 py-0.5 rounded-md font-semibold backdrop-blur-sm">
                * Klik titik koordinat untuk melihat detail wilayah sebaran
              </div>
            </div>

            {/* Regional Stats detail board */}
            <div className="bg-primary/5 border border-primary/5 rounded-xl p-4 grid sm:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">KORWIL / WILAYAH</span>
                <h4 className="font-display text-lg font-bold text-primary">{selectedRegionData.name}</h4>
                <div className="flex gap-2 items-center mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedRegionData.color}`}></span>
                  <span className="text-xs font-semibold text-text-muted">{selectedRegionData.count} Alumni Terdaftar</span>
                </div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-primary/10 pt-3 sm:pt-0 sm:pl-4 text-xs space-y-1 text-text-muted">
                <div><strong>Koordinator Korwil:</strong> {selectedRegionData.coordinator}</div>
                <div><strong>Kontak Korwil:</strong> {selectedRegionData.contact}</div>
                <div className="text-[10px] italic text-text-muted mt-1">*Silakan hubungi korwil terdekat untuk agenda regional.</div>
              </div>
            </div>

            {/* List breakdown of regions */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-primary uppercase block">Konsentrasi Sebaran Alumni</span>
              <div className="grid grid-cols-2 gap-4">
                {alumniRegions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all duration-300 ${
                      activeRegion === region.id
                        ? 'border-secondary bg-primary/5 shadow-sm'
                        : 'border-primary/5 bg-bg-surface hover:border-primary/20'
                    }`}
                  >
                    <div className="space-y-1 shrink-0">
                      <span className="block text-xs font-bold text-primary leading-none">{region.name}</span>
                      <span className="block text-[10px] text-text-muted">{region.count} Huffadh</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-secondary transition-transform ${activeRegion === region.id ? 'translate-x-1' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Registration Form */}
        <div className="md:col-span-5">
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 sticky top-24">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider block">KHIDMAH ALUMNI</span>
              <h3 className="font-display text-xl font-bold text-primary">Registrasi Database</h3>
              <p className="text-xs text-text-muted mt-1">
                Lengkapi berkas database alumni untuk pendataan dakwah nasional HAMAS.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm">Registrasi Berhasil!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Syukron Jamilan, data alumni Anda telah berhasil diverifikasi oleh admin HAMAS. Silaturahim Anda tersambung dalam rantai sanad berkah almamater.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label htmlFor="name" className="block font-semibold text-text-muted">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Ahmad Fauzi Al-Hafidz"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-bg-base text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="yearIn" className="block font-semibold text-text-muted">Tahun Masuk</label>
                    <input
                      type="number"
                      id="yearIn"
                      name="yearIn"
                      placeholder="Contoh: 2018"
                      value={formData.yearIn}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-primary/10 rounded-lg bg-bg-base text-primary focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="yearOut" className="block font-semibold text-text-muted">Tahun Keluar</label>
                    <input
                      type="number"
                      id="yearOut"
                      name="yearOut"
                      placeholder="Contoh: 2022"
                      value={formData.yearOut}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-primary/10 rounded-lg bg-bg-base text-primary focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="block font-semibold text-text-muted">Status Program Terakhir</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-primary/10 rounded-lg bg-bg-base text-primary focus:outline-none focus:border-secondary transition-colors"
                  >
                    <option value="30juz">Selesai Setoran 30 Juz (Bil-Hifdhi)</option>
                    <option value="binnadhor">Selesai Bin-Nadhor</option>
                    <option value="qiraah">Qira'ah Sab'ah</option>
                    <option value="riyadloh">Riyadloh 41 Hari</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="city" className="block font-semibold text-text-muted">Domisili Kota Saat Ini</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kediri / Jakarta Timur"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-bg-base text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="whatsapp" className="block font-semibold text-text-muted">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-bg-base text-primary focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 glossy-gold text-primary font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  Kirim Data Alumni
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="text-[10px] text-text-muted border-t border-primary/10 pt-3 space-y-1">
              <div>* HAMAS menjamin kerahasiaan data alumni.</div>
              <div>* Data hanya digunakan untuk keperluan internal silaturahim alumni dan pendataan program dakwah almamater.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
