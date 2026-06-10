import { useState, useEffect, useMemo } from 'react';
import { Users, MapPin, CheckCircle, Send, Globe, ChevronRight } from 'lucide-react';

const alumniRegions = [
  { id: 'jatim', name: 'Jawa Timur & Madura', count: 1240, coordinator: 'H. Moh. Anas, S.Ag.', contact: '0812-xxxx-xxxx', color: 'bg-emerald-500' },
  { id: 'jateng', name: 'Jawa Tengah & DIY', count: 480, coordinator: 'H. Khoirul Huda, M.Pd.', contact: '0857-xxxx-xxxx', color: 'bg-amber-500' },
  { id: 'jabar', name: 'Jawa Barat, Banten & DKI', count: 350, coordinator: 'H. Ahmad Syauqi, Lc.', contact: '0813-xxxx-xxxx', color: 'bg-blue-500' },
  { id: 'luar-jawa', name: 'Luar Jawa & Luar Negeri', count: 180, coordinator: 'Ust. Abdul Hamid, S.Th.I.', contact: '0821-xxxx-xxxx', color: 'bg-purple-500' }
];

const mockNearbyAlumni = [
  { id: 1, name: 'M. Yusuf Al-Hafidz', yearIn: 2017, yearOut: 2021, status: '30juz', statusLabel: '30 Juz (Bil-Hifdhi)', subdistrict: 'Mojoroto', lat: -7.8185, lng: 112.0075, whatsapp: '6281234567890' },
  { id: 2, name: 'Fatimah Az-Zahra', yearIn: 2019, yearOut: 2023, status: '30juz', statusLabel: '30 Juz (Bil-Hifdhi)', subdistrict: 'Bandar Lor', lat: -7.8080, lng: 112.0080, whatsapp: '6281234567891' },
  { id: 3, name: 'Ahmad Fauzi', yearIn: 2016, yearOut: 2020, status: 'qiraah', statusLabel: "Qira'ah Sab'ah", subdistrict: 'Kampung Dalem', lat: -7.8210, lng: 112.0250, whatsapp: '6281234567892' },
  { id: 4, name: 'Zainal Abidin', yearIn: 2014, yearOut: 2018, status: 'riyadloh', statusLabel: 'Riyadloh 41 Hari', subdistrict: 'Pesantren', lat: -7.8350, lng: 112.0550, whatsapp: '6281234567893' },
  { id: 5, name: 'Siti Aminah', yearIn: 2018, yearOut: 2022, status: 'binnadhor', statusLabel: 'Selesai Bin-Nadhor', subdistrict: 'Ngronggo', lat: -7.8480, lng: 112.0350, whatsapp: '6281234567894' },
  { id: 6, name: 'Budi Santoso', yearIn: 2015, yearOut: 2019, status: '30juz', statusLabel: '30 Juz (Bil-Hifdhi)', subdistrict: 'Gampengrejo', lat: -7.7650, lng: 112.0120, whatsapp: '6281234567895' },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

  // Nearby states
  const [activeTab, setActiveTab] = useState('distribution'); // 'distribution' or 'nearby'
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [coords, setCoords] = useState(null);
  const [detectionRadius, setDetectionRadius] = useState(10); // default 10km

  const selectedRegionData = alumniRegions.find(r => r.id === activeRegion);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.whatsapp) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', yearIn: '', yearOut: '', status: '30juz', city: '', whatsapp: '' });
      }, 5000);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setIsNearbyActive(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Add minor noise for privacy masking
          const offsetLat = (Math.random() - 0.5) * 0.006;
          const offsetLng = (Math.random() - 0.5) * 0.006;
          setTimeout(() => {
            setCoords({ lat: latitude + offsetLat, lng: longitude + offsetLng });
            setIsScanning(false);
          }, 2500);
        },
        (error) => {
          console.warn('GPS access denied, falling back to pesantren coords:', error);
          setTimeout(() => {
            setCoords({ lat: -7.82284, lng: 112.01162 });
            setIsScanning(false);
          }, 2500);
        }
      );
    } else {
      setTimeout(() => {
        setCoords({ lat: -7.82284, lng: 112.01162 });
        setIsScanning(false);
      }, 2500);
    }
  };

  const filteredAlumni = useMemo(() => {
    if (!coords) return [];
    return mockNearbyAlumni
      .map((alumni) => ({
        ...alumni,
        distance: calculateDistance(coords.lat, coords.lng, alumni.lat, alumni.lng),
      }))
      .filter((alumni) => alumni.distance <= detectionRadius)
      .sort((a, b) => a.distance - b.distance);
  }, [coords, detectionRadius]);

  useEffect(() => {
    if (!isNearbyActive || !coords) return;

    let map = null;

    const initMap = () => {
      const L = window.L;
      if (!L) return;

      const container = L.DomUtil.get('nearby-map');
      if (container && container._leaflet_id) {
        container._leaflet_id = null;
      }

      map = L.map('nearby-map').setView([coords.lat, coords.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-4 h-4 rounded-full bg-secondary border-2 border-white shadow-md animate-ping absolute"></div>
               <div class="w-3.5 h-3.5 rounded-full bg-secondary border-2 border-white shadow-md z-10 relative"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const alumniIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-md"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker([coords.lat, coords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Lokasi Anda (Simulasi/GPS)</b>')
        .openPopup();

      const circle = L.circle([coords.lat, coords.lng], {
        color: '#cfa152',
        fillColor: '#cfa152',
        fillOpacity: 0.1,
        radius: detectionRadius * 1000
      }).addTo(map);

      filteredAlumni.forEach(alumni => {
        L.marker([alumni.lat, alumni.lng], { icon: alumniIcon })
          .addTo(map)
          .bindPopup(`<b>${alumni.name}</b><br/>Angkatan: ${alumni.yearOut}<br/>Jarak: ${alumni.distance.toFixed(1)} km`);
      });

      map.fitBounds(circle.getBounds());
    };

    const loadLeaflet = () => {
      if (window.L) {
        initMap();
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.L) {
            clearInterval(interval);
            initMap();
          }
        }, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isNearbyActive, coords, detectionRadius, filteredAlumni]);

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
            <h3 className="text-display-md text-primary">
              "Sambung Sanad, Khidmah Tanpa Batas"
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Hubungan santri dengan Masyayikh tidak akan pernah putus meski raga telah meninggalkan gerbang pesantren. Keberkahan ilmu mengalir dari sejauh mana jalinan silaturahim dan khidmah kepada almamater tetap terawat.
            </p>
            <p className="text-text-muted text-sm leading-relaxed">
              **Himpunan Alumni Ma'unah Sari (HAMAS)** merupakan wadah resmi silaturahim, sinergi, dan kolaborasi bagi seluruh alumni penghafal Al-Qur'an PTQ Ma'unah Sari Kediri. Kami mengajak seluruh alumni untuk mendaftarkan diri ke dalam **Database Alumni Nasional** guna memetakan sebaran dakwah, mendukung program pembangunan pondok, serta memudahkan agenda silaturahim akbar/korwil.
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
            {/* Tabs Selector */}
            <div className="flex items-center gap-4 border-b border-primary/10 pb-3">
              <button
                onClick={() => setActiveTab('distribution')}
                className={`text-sm md:text-base font-display font-bold pb-2 transition-all cursor-pointer ${
                  activeTab === 'distribution'
                    ? 'text-primary border-b-2 border-secondary'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                Peta Sebaran Wilayah
              </button>
              <button
                onClick={() => setActiveTab('nearby')}
                className={`text-sm md:text-base font-display font-bold pb-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'nearby'
                    ? 'text-primary border-b-2 border-secondary'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                <span>Alumni Terdekat (Nearby)</span>
                <span className="bg-secondary/25 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">Baru</span>
              </button>
            </div>

            {/* Tab 1: Sebaran Wilayah */}
            {activeTab === 'distribution' && (
              <div className="space-y-6 animate-fade-in">
                {/* Simulated Heatmap Map (SVG) */}
                <div className="relative w-full h-48 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/5 overflow-hidden">
                  <svg className="w-full h-full max-w-md opacity-25" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 70 L90 120 L80 130 L30 80 Z" fill="currentColor" className="text-primary" />
                    <path d="M100 140 L210 150 L210 145 L100 135 Z" fill="currentColor" className="text-primary" />
                    <path d="M110 60 L160 50 L180 80 L160 110 L120 100 Z" fill="currentColor" className="text-primary" />
                    <path d="M210 70 L240 60 L240 75 L220 85 L245 105 L235 110 L210 90 Z" fill="currentColor" className="text-primary" />
                    <path d="M330 90 L380 90 L390 110 L370 120 L330 110 Z" fill="currentColor" className="text-primary" />
                  </svg>

                  <button 
                    onClick={() => setActiveRegion('jatim')}
                    className={`absolute top-[138px] left-[135px] w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'jatim' ? 'ring-2 ring-emerald-500 bg-emerald-500/50 scale-110' : ''}`}
                    title="Jawa Timur"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 z-10"></span>
                  </button>

                  <button 
                    onClick={() => setActiveRegion('jateng')}
                    className={`absolute top-[133px] left-[105px] w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'jateng' ? 'ring-2 ring-amber-500 bg-amber-500/50 scale-110' : ''}`}
                    title="Jawa Tengah & DIY"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 z-10"></span>
                  </button>

                  <button 
                    onClick={() => setActiveRegion('jabar')}
                    className={`absolute top-[125px] left-[78px] w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-125 ${activeRegion === 'jabar' ? 'ring-2 ring-blue-500 bg-blue-500/50 scale-110' : ''}`}
                    title="Jawa Barat, Banten & DKI"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping absolute"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 z-10"></span>
                  </button>

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
                        className={`flex items-center justify-between p-3 rounded-lg border text-left transition-standard focus:outline-none focus-ring ${
                          activeRegion === region.id
                            ? 'border-secondary bg-primary/5 shadow-sm'
                            : 'border-primary/5 bg-bg-surface hover:border-primary/20'
                        }`}
                      >
                        <div className="space-y-1 shrink-0">
                          <span className="block text-xs font-bold text-primary leading-none">{region.name}</span>
                          <span className="block text-[10px] text-text-muted">{region.count} Huffadh</span>
                        </div>
                        <ChevronRight className={`icon-xs text-secondary transition-transform ${activeRegion === region.id ? 'translate-x-1' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Alumni Terdekat */}
            {activeTab === 'nearby' && (
              <div className="space-y-6 animate-fade-in">
                {!isNearbyActive ? (
                  <div className="text-center py-8 px-4 bg-primary/5 rounded-xl border border-primary/5 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
                      <MapPin className="w-6 h-6 text-secondary animate-bounce" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="font-display font-bold text-sm text-primary">Cari Alumni di Sekitar Anda</h4>
                      <p className="text-text-muted text-xs leading-relaxed">
                        Temukan alumni PTQ Ma'unah Sari terdekat dari lokasi Anda saat ini untuk silaturahim atau kolaborasi regional.
                      </p>
                    </div>
                    <button
                      onClick={startScanning}
                      className="btn-primary hover-glow !py-2 !px-4 text-xs focus-ring"
                    >
                      Aktifkan Deteksi Radar
                    </button>
                    <p className="text-[10px] text-text-muted leading-relaxed max-w-sm mx-auto">
                      * Privasi Terjaga: Lokasi Anda dan alumni lainnya dikaburkan acak sejauh ~500m hingga 1km. Anda harus mengizinkan akses GPS browser.
                    </p>
                  </div>
                ) : isScanning ? (
                  <div className="text-center py-8 px-4 bg-primary/5 rounded-xl border border-primary/5 space-y-6">
                    <div className="relative w-40 h-40 mx-auto rounded-full bg-primary/10 border-2 border-secondary/30 flex items-center justify-center overflow-hidden">
                      <div className="absolute w-30 h-30 rounded-full border border-secondary/15"></div>
                      <div className="absolute w-20 h-20 rounded-full border border-secondary/15"></div>
                      <div className="absolute w-10 h-10 rounded-full border border-secondary/15"></div>
                      <div className="absolute w-full h-[1px] bg-secondary/10"></div>
                      <div className="absolute h-full w-[1px] bg-secondary/10"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-secondary/5 to-secondary/25 animate-spin origin-center"></div>
                      <div className="z-10 text-center">
                        <Globe className="w-8 h-8 text-secondary mx-auto animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-xs text-primary animate-pulse">Memindai Lokasi GPS...</h4>
                      <p className="text-text-muted text-[10px]">Silakan izinkan akses lokasi jika diminta oleh browser.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/5">
                      <div className="text-left space-y-1">
                        <span className="text-[9px] font-bold text-secondary tracking-widest uppercase block text-left">Radar Filter</span>
                        <div className="text-xs text-text-muted">
                          Terdeteksi <strong>{filteredAlumni.length} alumni</strong> dalam radius <strong>{detectionRadius} km</strong>
                        </div>
                      </div>
                      
                      {/* Radius Slider */}
                      <div className="flex items-center gap-3 text-xs w-full sm:w-auto shrink-0">
                        <span className="font-semibold text-text-muted shrink-0">Jarak:</span>
                        <input
                          type="range"
                          min="3"
                          max="25"
                          step="1"
                          value={detectionRadius}
                          onChange={(e) => setDetectionRadius(Number(e.target.value))}
                          className="accent-secondary w-full sm:w-32 cursor-pointer"
                        />
                        <span className="font-bold text-primary shrink-0 w-8">{detectionRadius} km</span>
                      </div>
                    </div>

                    {/* Leaflet Map Container */}
                    <div className="relative">
                      <div id="nearby-map" className="w-full h-72 rounded-xl border border-primary/10 shadow-sm z-10" />
                      
                      <style>{`
                        .leaflet-container {
                          font-family: var(--font-body) !important;
                          border-radius: 0.75rem;
                        }
                        .leaflet-bar a {
                          color: var(--color-primary) !important;
                        }
                        .custom-div-icon {
                          background: none !important;
                          border: none !important;
                        }
                      `}</style>
                    </div>

                    {/* Controls Footer */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-text-muted italic">* Marker disamarkan demi privasi.</span>
                      <button
                        onClick={() => {
                          setIsNearbyActive(false);
                          setCoords(null);
                        }}
                        className="text-text-muted hover:text-error-base font-bold underline transition-colors cursor-pointer"
                      >
                        Matikan Radar & Bersihkan Lokasi
                      </button>
                    </div>

                    {/* Nearby Alumni List Cards */}
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-sm text-primary text-left">Daftar Alumni di Sekitar Anda</h4>
                      {filteredAlumni.length === 0 ? (
                        <div className="text-center py-6 text-xs text-text-muted bg-bg-base rounded-xl border border-primary/5">
                          Tidak ditemukan alumni dalam radius {detectionRadius} km. Coba perbesar jangkauan radius filter.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredAlumni.map((alumni) => (
                            <div
                              key={alumni.id}
                              className="bg-bg-surface border border-primary/5 hover:border-secondary/20 rounded-xl p-4 shadow-sm flex items-start gap-3 transition-standard hover:shadow-md text-left"
                            >
                              <div className="bg-primary/5 p-2 rounded-lg text-primary shrink-0">
                                <Users className="w-4 h-4 text-secondary" />
                              </div>
                              <div className="space-y-1 w-full min-w-0">
                                <div className="flex justify-between items-center gap-2">
                                  <span className="font-bold text-xs text-primary truncate">{alumni.name}</span>
                                  <span className="bg-secondary/15 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                    {alumni.distance.toFixed(1)} km
                                  </span>
                                </div>
                                <div className="text-[10px] text-text-muted space-y-0.5">
                                  <div>Status: <strong>{alumni.statusLabel}</strong></div>
                                  <div>Angkatan: {alumni.yearIn} - {alumni.yearOut}</div>
                                  <div>Kecamatan: {alumni.subdistrict}</div>
                                </div>
                                
                                <a
                                  href={`https://wa.me/${alumni.whatsapp}?text=Assalamualaikum%20Kang/Neng%20${encodeURIComponent(alumni.name)},%20saya%20alumni%20PTQ%20Ma'unah%20Sari%20juga.%20Salam%20silaturahim.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-secondary hover:text-primary transition-colors animate-fade-in"
                                >
                                  Hubungi via WhatsApp
                                  <Send className="w-3 h-3 text-secondary" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  className="btn-primary w-full focus-ring"
                >
                  Kirim Data Alumni
                  <Send className="icon-xs text-primary" />
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
