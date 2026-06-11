import { useState, useEffect, useMemo } from 'react';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Send from 'lucide-react/dist/esm/icons/send';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Check from 'lucide-react/dist/esm/icons/check';
import User from 'lucide-react/dist/esm/icons/user';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Award from 'lucide-react/dist/esm/icons/award';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import { IslamicRosette, OrnamentalCorner } from '@/components/ui/IslamicPattern';

const alumniRegions = [
  { id: 'jatim', name: 'Jawa Timur & Madura', count: 1240, coordinator: 'H. Moh. Anas, S.Ag.', contact: '0812-xxxx-xxxx', color: 'bg-emerald-500' },
  { id: 'jateng', name: 'Jawa Tengah & DIY', count: 480, coordinator: 'H. Khoirul Huda, M.Pd.', contact: '0857-xxxx-xxxx', color: 'bg-amber-500' },
  { id: 'jabar', name: 'Jawa Barat, Banten & DKI', count: 350, coordinator: 'H. Ahmad Syauqi, Lc.', contact: '0813-xxxx-xxxx', color: 'bg-blue-500' },
  { id: 'luar-jawa', name: 'Luar Jawa & Luar Negeri', count: 180, coordinator: 'Ust. Abdul Hamid, S.Th.I.', contact: '0821-xxxx-xxxx', color: 'bg-purple-500' }
];

const mockNearbyAlumni = [
  { id: 1, name: 'M. Yusuf Al-Hafidz', yearIn: 2017, yearOut: 2021, status: '30juz', statusLabel: '30 Juz (Bil-Hifdhi)', subdistrict: 'Mojoroto', lat: -7.8185, lng: 112.0075, whatsapp: '6281234567890', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80' },
  { id: 2, name: 'Fatimah Az-Zahra', yearIn: 2019, yearOut: 2023, status: '30juz', statusLabel: '30 Juz (Bil-Hifdhi)', subdistrict: 'Bandar Lor', lat: -7.8080, lng: 112.0080, whatsapp: '6281234567891', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80' },
  { id: 3, name: 'Ahmad Fauzi', yearIn: 2016, yearOut: 2020, status: 'qiraah', statusLabel: "Qira'ah Sab'ah", subdistrict: 'Kampung Dalem', lat: -7.8210, lng: 112.0250, whatsapp: '6281234567892', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80' },
  { id: 4, name: 'Zainal Abidin', yearIn: 2014, yearOut: 2018, status: 'riyadloh', statusLabel: 'Riyadloh 41 Hari', subdistrict: 'Pesantren', lat: -7.8350, lng: 112.0550, whatsapp: '6281234567893', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&q=80' },
  { id: 5, name: 'Siti Aminah', yearIn: 2018, yearOut: 2022, status: 'binnadhor', statusLabel: 'Selesai Bin-Nadhor', subdistrict: 'Ngronggo', lat: -7.8480, lng: 112.0350, whatsapp: '6281234567894', avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop&q=80' },
  { id: 6, name: 'Budi Santoso', yearIn: 2015, yearOut: 2019, status: '30juz', statusLabel: '30 Juz (Bil-Hifdhi)', subdistrict: 'Gampengrejo', lat: -7.7650, lng: 112.0120, whatsapp: '6281234567895', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&q=80' },
];

const initialEvents = [
  {
    id: 'event-1',
    title: "Reuni Akbar & Halal bi Halal Nasional HAMAS 2026",
    category: "Silaturahim Nasional",
    date: "Ahad, 12 Juli 2026",
    time: "08:00 WIB - Selesai",
    location: "Aula Gedung Utama PPTQ Ma'unah Sari Lil-Banat Kediri",
    participants: 245,
    description: "Pertemuan akbar tahunan alumni huffadh untuk mempererat ukhuwah sanad dan sowan bersama Masyayikh."
  },
  {
    id: 'event-2',
    title: "Sema'an Al-Qur'an Jantiko Mantab & Doa Bersama Alumni",
    category: "Sema'an Al-Qur'an",
    date: "Ahad Pon, 2 Agustus 2026",
    time: "Ba'da Subuh - Selesai",
    location: "Komplek Makam KH. M. Mubassyir Mundzir, Kediri",
    participants: 180,
    description: "Majelis dzikir dan sema'an Al-Qur'an rutin alumni untuk mendoakan guru-guru pendiri pesantren."
  },
  {
    id: 'event-3',
    title: "Pelatihan Sertifikasi Metode Pengajaran Qur'an Bil-Qolam",
    category: "Edukasi & Metode",
    date: "Sabtu, 5 September 2026",
    time: "09:00 WIB - 15:00 WIB",
    location: "Gedung Aula Pondok Putra, Bandar Kidul",
    participants: 95,
    description: "Pelatihan sertifikasi metode mengajar Al-Qur'an praktis untuk alumni pengajar TPQ/Madrasah Diniyah."
  }
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  // Upgraded Alumni Registration Form States (All in one page)
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    yearIn: '',
    yearOut: '',
    status: '30juz',
    city: '',
    province: 'Jawa Timur',
    whatsapp: '',
    email: '',
    occupation: 'Pendidik / Guru Ngaji',
    workplace: '',
    instagram: '',
    allowRadar: true,
    latitude: '',
    longitude: ''
  });

  // Radar detection states
  const [isRadarActive, setIsRadarActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [coords, setCoords] = useState(null);
  const [detectionRadius, setDetectionRadius] = useState(10); // default 10km

  // Events list & RSVP state
  const [events, setEvents] = useState(initialEvents);
  const [rsvpEvents, setRsvpEvents] = useState({});

  // Validation Error States
  const [validationErrors, setValidationErrors] = useState({});

  const selectedRegionData = alumniRegions.find(r => r.id === activeRegion);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRsvpEvent = (eventId) => {
    const isRsvpd = rsvpEvents[eventId];
    
    // Toggle RSVP state
    setRsvpEvents(prev => ({ ...prev, [eventId]: !isRsvpd }));
    
    // Dynamically update participant count
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          participants: isRsvpd ? evt.participants - 1 : evt.participants + 1
        };
      }
      return evt;
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Detailed validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama lengkap wajib diisi';
    if (!formData.nik.trim() || formData.nik.length !== 16) errors.nik = 'NIK harus berjumlah 16 digit angka';
    if (!formData.yearIn) errors.yearIn = 'Tahun masuk wajib diisi';
    if (!formData.yearOut) errors.yearOut = 'Tahun keluar wajib diisi';
    if (!formData.whatsapp.trim() || formData.whatsapp.length < 9) errors.whatsapp = 'Nomor WhatsApp tidak valid';
    if (!formData.email.trim()) errors.email = 'Alamat email wajib diisi';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1800);
  };

  const startScanning = () => {
    setIsScanning(true);
    setIsRadarActive(true);

    // Simulated coordinates near Kediri for demo
    const simulatedLat = -7.82284 + (Math.random() - 0.5) * 0.003;
    const simulatedLng = 112.01162 + (Math.random() - 0.5) * 0.003;

    setTimeout(() => {
      setCoords({ lat: simulatedLat, lng: simulatedLng });
      setIsScanning(false);
    }, 2000);
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

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isRadarActive || !coords) return;

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
        const avatarUrl = alumni.avatar || '';
        const initials = alumni.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        
        // Custom styling for the marker icon: dynamic circular image or initials
        const markerHtml = avatarUrl
          ? `<div class="w-8 h-8 rounded-full overflow-hidden border-2 border-primary bg-card shadow-md hover:scale-110 transition-transform duration-200">
               <img src="${avatarUrl}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full bg-primary flex items-center justify-center text-white text-[8px] font-bold\\'>${initials}</div>'" />
             </div>`
          : `<div class="w-8 h-8 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center text-white text-[8px] font-bold hover:scale-110 transition-transform duration-200">
               ${initials}
             </div>`;

        const alumniIcon = L.divIcon({
          className: 'custom-div-icon-alumni',
          html: markerHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        // Popup content with profile photo align
        const avatarHtml = avatarUrl 
          ? `<img src="${avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-primary/10 inline-block mr-2 align-middle" onerror="this.style.display='none'" />` 
          : `<div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center inline-block mr-2 align-middle text-primary text-[10px] font-bold">${initials}</div>`;
        
        const popupContent = `
          <div class="flex items-center gap-2 p-1 text-left">
            ${avatarHtml}
            <div class="leading-snug">
              <div class="font-bold text-xs text-primary">${alumni.name}</div>
              <div class="text-[9px] text-muted-foreground">Angkatan: ${alumni.yearIn}-${alumni.yearOut}</div>
              <div class="text-[9px] text-muted-foreground">Jarak: ${alumni.distance.toFixed(1)} km</div>
            </div>
          </div>
        `;

        L.marker([alumni.lat, alumni.lng], { icon: alumniIcon })
          .addTo(map)
          .bindPopup(popupContent);
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
  }, [isRadarActive, coords, detectionRadius, filteredAlumni]);

  // Render Peta Sebaran Wilayah Nasional
  const renderRegionalMap = () => (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
        <Globe className="w-4 h-4 text-secondary" />
        <h3 className="font-display font-bold text-sm text-primary">Peta Sebaran Wilayah Alumni</h3>
      </div>

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

        <div className="absolute bottom-2 left-3 text-[9px] text-muted-foreground bg-card/80 px-2 py-0.5 rounded font-semibold backdrop-blur-sm">
          * Klik titik koordinat untuk detail sebaran wilayah
        </div>
      </div>

      {/* Regional Stats Board */}
      <div className="bg-primary/5 border border-primary/5 rounded-xl p-4 grid sm:grid-cols-2 gap-4 items-center">
        <div>
          <span className="text-[9px] text-secondary font-bold uppercase tracking-wider block">KORWIL TERPILIH</span>
          <h4 className="font-display text-base font-bold text-primary">{selectedRegionData.name}</h4>
          <div className="flex gap-2 items-center mt-2">
            <span className={`w-2 h-2 rounded-full ${selectedRegionData.color}`}></span>
            <span className="text-xs font-semibold text-muted-foreground">{selectedRegionData.count} Alumni Terdaftar</span>
          </div>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-primary/10 pt-3 sm:pt-0 sm:pl-4 text-xs space-y-1 text-muted-foreground">
          <div><strong>Koordinator:</strong> {selectedRegionData.coordinator}</div>
          <div><strong>Kontak Korwil:</strong> {selectedRegionData.contact}</div>
        </div>
      </div>

      {/* Quick Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {alumniRegions.map(region => (
          <button
            key={region.id}
            onClick={() => setActiveRegion(region.id)}
            className={`py-2 px-3 rounded-lg border text-left text-xs font-bold transition-standard cursor-pointer ${
              activeRegion === region.id
                ? 'border-secondary bg-primary/5 text-primary'
                : 'border-primary/5 bg-card text-muted-foreground hover:border-primary/10'
            }`}
          >
            <span className="block truncate">{region.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Render Radar Alumni Terdekat (Nearby Map GPS)
  const renderRadarMap = () => (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
        <MapPin className="w-4 h-4 text-secondary" />
        <h3 className="font-display font-bold text-sm text-primary">Radar Alumni Terdekat (HAMAS GPS)</h3>
      </div>

      {!isRadarActive ? (
        <div className="text-center py-6 px-4 bg-primary/5 rounded-xl border border-primary/5 space-y-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
            <MapPin className="w-5 h-5 text-secondary animate-bounce" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="font-display font-bold text-xs text-primary">Cari Alumni di Sekitar Anda</h4>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Deteksi koordinat GPS untuk menemukan alumni penghafal Qur'an PTQ Ma'unah Sari terdekat di sekitar lokasi Anda saat ini.
            </p>
          </div>
          <button
            onClick={startScanning}
            className="btn-primary hover-glow !py-2 !px-4 text-[10px] focus-ring"
          >
            Aktifkan Deteksi Radar
          </button>
        </div>
      ) : isScanning ? (
        <div className="text-center py-8 px-4 bg-primary/5 rounded-xl border border-primary/5 space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full bg-primary/10 border border-secondary/35 flex items-center justify-center overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-secondary/25 animate-spin origin-center"></div>
            <Globe className="w-6 h-6 text-secondary mx-auto animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-display font-bold text-xs text-primary">Memindai Lokasi GPS...</h4>
            <p className="text-muted-foreground text-[9px]">Silakan izinkan akses koordinat lokasi browser Anda jika diminta.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/5">
            <div className="text-left space-y-0.5">
              <span className="text-[8px] font-bold text-secondary uppercase tracking-widest block">Radius Radar</span>
              <div className="text-[10px] text-muted-foreground">
                Terdeteksi <strong>{filteredAlumni.length} alumni</strong> dalam radius <strong>{detectionRadius} km</strong>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] w-full sm:w-auto shrink-0 justify-end">
              <span className="font-semibold text-muted-foreground">Jangkauan:</span>
              <input
                type="range"
                min="3"
                max="25"
                step="1"
                value={detectionRadius}
                onChange={(e) => setDetectionRadius(Number(e.target.value))}
                className="accent-secondary cursor-pointer w-24"
              />
              <span className="font-bold text-primary w-8">{detectionRadius} km</span>
            </div>
          </div>

          <div className="relative">
            <div id="nearby-map" className="w-full h-60 rounded-xl border border-primary/10 shadow-sm z-10" />
            <style>{`
              .leaflet-container {
                font-family: var(--font-sans) !important;
                border-radius: 0.75rem;
              }
              .leaflet-bar a {
                color: var(--color-primary) !important;
              }
              .custom-div-icon, .custom-div-icon-alumni {
                background: none !important;
                border: none !important;
              }
            `}</style>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-1">
           {filteredAlumni.map((alumni) => (
              <div
                key={alumni.id}
                className="bg-card border border-primary/5 rounded-xl p-3 shadow-sm flex items-center gap-3 text-left hover:border-secondary/20 transition-all"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/10 shrink-0 bg-primary/5 flex items-center justify-center">
                  {!imageErrors[alumni.id] && alumni.avatar ? (
                    <img 
                      src={alumni.avatar} 
                      alt={`Foto profil ${alumni.name}`} 
                      className="w-full h-full object-cover"
                      onError={() => setImageErrors(prev => ({ ...prev, [alumni.id]: true }))}
                    />
                  ) : (
                    <span className="text-primary font-bold text-xs">
                      {alumni.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 w-full min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-xs text-primary truncate">{alumni.name}</span>
                    <span className="bg-secondary/15 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {alumni.distance.toFixed(1)} km
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-tight">
                    <div>Status: <strong>{alumni.statusLabel}</strong></div>
                    <div>Angkatan: {alumni.yearIn} - {alumni.yearOut}</div>
                  </div>
                  <a
                    href={`https://wa.me/${alumni.whatsapp}?text=Assalamualaikum%20Kang/Neng%20${encodeURIComponent(alumni.name)},%20saya%20alumni%20PTQ%20Ma'unah%20Sari%20juga.%20Salam%20silaturahim.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold text-secondary hover:text-primary transition-colors"
                  >
                    Hubungi WhatsApp <Send className="w-2.5 h-2.5 text-secondary inline" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[9px] border-t border-primary/5 pt-3">
            <span className="text-muted-foreground italic">* Lokasi disamarkan acak demi privasi anggota.</span>
            <button
              onClick={() => {
                setIsRadarActive(false);
                setCoords(null);
              }}
              className="text-muted-foreground hover:text-error underline font-bold transition-colors cursor-pointer"
            >
              Matikan Deteksi GPS
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render Agenda HAMAS Bulletin Section (Public)
  const renderEventsSection = () => (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
        <Calendar className="w-4 h-4 text-secondary" />
        <h3 className="font-display font-bold text-sm text-primary">Agenda & Kegiatan Alumni HAMAS</h3>
      </div>

      <div className="grid gap-4">
        {events.map((evt) => {
          const isParticipating = rsvpEvents[evt.id];
          return (
            <div 
              key={evt.id}
              className="border border-primary/5 rounded-xl p-4 bg-background/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-xs transition-standard hover:border-secondary/10"
            >
              <div className="space-y-1.5 text-left flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-secondary/15 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    {evt.category}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    Partisipan: <strong>{evt.participants} Alumni</strong>
                  </span>
                </div>
                <h5 className="font-bold text-primary text-sm leading-snug">{evt.title}</h5>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xl">{evt.description}</p>
                
                <div className="text-[9px] text-muted-foreground space-y-0.5 pt-1 grid sm:grid-cols-2 gap-x-4">
                  <div>Hari/Tgl: <strong>{evt.date}</strong></div>
                  <div>Waktu: <strong>{evt.time}</strong></div>
                  <div className="sm:col-span-2">Tempat: <strong>{evt.location}</strong></div>
                </div>
              </div>

              <button
                onClick={() => handleRsvpEvent(evt.id)}
                className={`py-2.5 px-4 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer border shrink-0 ${
                  isParticipating
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'btn-primary'
                }`}
              >
                {isParticipating ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saya Ikut Serta</span>
                  </span>
                ) : (
                  <span>Ikuti Kegiatan</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Full-Width Focused Registration Form View
  const renderRegistrationForm = () => {
    if (isSubmitted) {
      return (
        <div className="bg-card border border-primary/5 rounded-2xl p-6 sm:p-10 shadow-lg text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden animate-scale-in">
          <OrnamentalCorner position="top-left" size="md" />
          <OrnamentalCorner position="top-right" size="md" />
          <OrnamentalCorner position="bottom-left" size="md" />
          <OrnamentalCorner position="bottom-right" size="md" />
          
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none flex items-center justify-center">
            <IslamicRosette size="xl" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800 animate-bounce">
              <CheckCircle className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-secondary tracking-widest uppercase block">REGISTRASI DATABASE BERHASIL</span>
              <h3 className="font-display text-xl text-primary font-bold">Syukron Jamilan, Data Alumni Disimpan!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                Registrasi database alumni atas nama <strong>{formData.name}</strong> telah berhasil dimasukkan ke dalam pangkalan data pusat Ikatan Alumni HAMAS.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 max-w-md mx-auto text-left text-[11px] text-muted-foreground space-y-1.5 font-mono">
              <div>Nama Lengkap: <strong>{formData.name}</strong></div>
              <div>NIK Terdaftar: <strong>{formData.nik}</strong></div>
              <div>Program Terakhir: <strong>{formData.status === '30juz' ? '30 Juz (Bil-Hifdhi)' : formData.status === 'binnadhor' ? 'Selesai Bin-Nadhor' : formData.status === 'qiraah' ? "Qira'ah Sab'ah" : 'Riyadloh 41 Hari'}</strong></div>
              <div>WhatsApp: <strong>{formData.whatsapp}</strong></div>
              <div>Email: <strong>{formData.email}</strong></div>
            </div>

            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Sanad silaturahim terhubung. Anda sekarang dapat menggunakan alamat email terdaftar untuk masuk ke Portal Kemitraan Alumni.
            </p>

            <div className="flex gap-2 justify-center pt-2 max-w-xs mx-auto">
              <button
                onClick={() => {
                  setShowRegistrationForm(false);
                  setIsSubmitted(false);
                  setFormData({ name: '', nik: '', yearIn: '', yearOut: '', status: '30juz', city: '', province: 'Jawa Timur', whatsapp: '', email: '', occupation: 'Pendidik / Guru Ngaji', workplace: '', instagram: '', allowRadar: true, latitude: '', longitude: '' });
                }}
                className="py-2.5 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary rounded-lg text-xs font-bold transition-standard flex-1 cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card border border-primary/5 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-scale-in text-left relative overflow-hidden">
        <OrnamentalCorner position="top-left" size="sm" />
        <OrnamentalCorner position="top-right" size="sm" />
        <OrnamentalCorner position="bottom-left" size="sm" />
        <OrnamentalCorner position="bottom-right" size="sm" />

        {/* Header Form focused page */}
        <div className="flex items-center justify-between border-b border-primary/10 pb-4">
          <button
            onClick={() => setShowRegistrationForm(false)}
            className="py-2 px-3 border border-primary/10 hover:bg-primary/5 text-primary rounded-lg text-xs font-bold transition-standard flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-secondary" />
            <span>Batal</span>
          </button>
          <div className="text-right">
            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block font-mono">Penyelarasan Sanad</span>
            <h3 className="font-display text-base text-primary font-bold">Registrasi Database Alumni</h3>
          </div>
        </div>

        {isSubmitting ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-secondary/35 border-t-secondary animate-spin mx-auto" />
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-xs text-primary animate-pulse">Menghubungkan Database Alumni...</h4>
              <p className="text-muted-foreground text-[10px]">Menyimpan berkas santri huffadh nasional HAMAS</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
            {/* Section 1: Profil Alumni */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5 border-b border-primary/5 pb-2">
                <User className="w-4 h-4 text-secondary" /> 1. Data Personal Alumni
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block font-semibold text-muted-foreground">Nama Lengkap (Sesuai Ijazah)</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: H. M. Yusuf Al-Hafidz"
                    className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors ${
                      validationErrors.name ? 'border-error' : 'border-primary/10'
                    }`}
                  />
                  {validationErrors.name && <p className="text-[10px] text-error font-semibold">{validationErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="nik" className="block font-semibold text-muted-foreground">NIK / No. KTP (16 Digit)</label>
                  <input
                    type="text"
                    id="nik"
                    name="nik"
                    maxLength={16}
                    required
                    value={formData.nik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFormData(prev => ({ ...prev, nik: val }));
                      if (validationErrors.nik) setValidationErrors(prev => ({ ...prev, nik: '' }));
                    }}
                    placeholder="Masukkan 16 digit NIK"
                    className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors font-mono ${
                      validationErrors.nik ? 'border-error' : 'border-primary/10'
                    }`}
                  />
                  {validationErrors.nik && <p className="text-[10px] text-error font-semibold">{validationErrors.nik}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="whatsapp" className="block font-semibold text-muted-foreground">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFormData(prev => ({ ...prev, whatsapp: val }));
                      if (validationErrors.whatsapp) setValidationErrors(prev => ({ ...prev, whatsapp: '' }));
                    }}
                    placeholder="Contoh: 081234567890"
                    className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors font-mono ${
                      validationErrors.whatsapp ? 'border-error' : 'border-primary/10'
                    }`}
                  />
                  {validationErrors.whatsapp && <p className="text-[10px] text-error font-semibold">{validationErrors.whatsapp}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block font-semibold text-muted-foreground">Alamat Email Aktif</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yusuf@email.com"
                    className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors ${
                      validationErrors.email ? 'border-error' : 'border-primary/10'
                    }`}
                  />
                  {validationErrors.email && <p className="text-[10px] text-error font-semibold">{validationErrors.email}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Data Sanad/Pendidikan */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5 border-b border-primary/5 pb-2">
                <Award className="w-4 h-4 text-secondary" /> 2. Kurikulum Sanad & Masa Pendidikan
              </h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="yearIn" className="block font-semibold text-muted-foreground">Tahun Masuk Pondok</label>
                  <input
                    type="number"
                    id="yearIn"
                    name="yearIn"
                    required
                    value={formData.yearIn}
                    onChange={handleInputChange}
                    placeholder="Contoh: 2017"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="yearOut" className="block font-semibold text-muted-foreground">Tahun Keluar / Wisuda</label>
                  <input
                    type="number"
                    id="yearOut"
                    name="yearOut"
                    required
                    value={formData.yearOut}
                    onChange={handleInputChange}
                    placeholder="Contoh: 2021"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="block font-semibold text-muted-foreground">Status Program Terakhir</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none"
                  >
                    <option value="30juz">Setoran 30 Juz (Bil-Hifdhi)</option>
                    <option value="binnadhor">Bin-Nadhor (Membaca)</option>
                    <option value="qiraah">Qira'ah Sab'ah</option>
                    <option value="riyadloh">Riyadloh 41 Hari</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Domisili & Aktivitas Kerja */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5 border-b border-primary/5 pb-2">
                <Briefcase className="w-4 h-4 text-secondary" /> 3. Domisili & Aktivitas Saat Ini
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="city" className="block font-semibold text-muted-foreground">Kabupaten / Kota Domisili</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kota Kediri"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="province" className="block font-semibold text-muted-foreground">Provinsi Domisili</label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jawa Timur"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="occupation" className="block font-semibold text-muted-foreground">Pekerjaan / Aktivitas Utama</label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none"
                  >
                    <option value="Pendidik / Guru Ngaji">Pendidik / Guru Ngaji / TPQ</option>
                    <option value="Mahasiswa / Pelajar">Mahasiswa / Santri Lanjutan</option>
                    <option value="Pegawai Swasta">Karyawan / Swasta</option>
                    <option value="Wiraswasta / Bisnis">Wiraswasta / Bisnis</option>
                    <option value="PNS / Instansi">Pegawai Negeri / PNS</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="workplace" className="block font-semibold text-muted-foreground">Nama Lembaga / Instansi / Tempat Kerja</label>
                  <input
                    type="text"
                    id="workplace"
                    name="workplace"
                    value={formData.workplace}
                    onChange={handleInputChange}
                    placeholder="Contoh: TPQ Al-Mubassyir Kediri"
                    className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="instagram" className="block font-semibold text-muted-foreground">Username Instagram / Profil Media Sosial (Opsional)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="instagram"
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="w-full pl-9 pr-3 py-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Layanan Pemetaan & Radar HAMAS GPS */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5 border-b border-primary/5 pb-2">
                <MapPin className="w-4 h-4 text-secondary" /> 4. Jejaring Pemetaan Radar GPS (Opsional)
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="allowRadar"
                    name="allowRadar"
                    checked={formData.allowRadar}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowRadar: e.target.checked }))}
                    className="accent-secondary h-4 w-4 rounded border-primary/10 mt-0.5 cursor-pointer"
                  />
                  <div className="text-left space-y-0.5">
                    <label htmlFor="allowRadar" className="font-semibold text-primary cursor-pointer">Izinkan profil saya muncul di Radar Alumni Terdekat</label>
                    <p className="text-[10px] text-muted-foreground">Profil Anda akan terlihat oleh sesama alumni huffadh dalam peta radius sekitar domisili Anda.</p>
                  </div>
                </div>

                {formData.allowRadar && (
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="font-semibold text-muted-foreground">Koordinat GPS Lokasi Domisili/Dakwah</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                setFormData(prev => ({
                                  ...prev,
                                  latitude: position.coords.latitude.toFixed(6),
                                  longitude: position.coords.longitude.toFixed(6)
                                }));
                              },
                              () => {
                                alert("Gagal mendapatkan lokasi. Pastikan izin GPS aktif di browser Anda.");
                              }
                            );
                          } else {
                            alert("Geolocation tidak didukung oleh browser Anda.");
                          }
                        }}
                        className="py-1 px-2.5 bg-secondary/15 hover:bg-secondary/25 text-primary border border-secondary/15 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-secondary" />
                        <span>Dapatkan GPS Saat Ini</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div className="space-y-1">
                        <label htmlFor="latitude" className="block text-[10px] text-muted-foreground uppercase font-semibold">Latitude</label>
                        <input
                          type="text"
                          id="latitude"
                          name="latitude"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          placeholder="-7.8228"
                          className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="longitude" className="block text-[10px] text-muted-foreground uppercase font-semibold">Longitude</label>
                        <input
                          type="text"
                          id="longitude"
                          name="longitude"
                          value={formData.longitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          placeholder="112.0116"
                          className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Syarat */}
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-muted-foreground flex gap-2">
              <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Dengan mengklik Kirim Data, saya menyatakan kesediaan mendaftar dalam Database Alumni HAMAS secara sukarela. Data ini hanya digunakan untuk koordinasi silaturahim dan pemetaan sebaran da'wah alumni PTQ Ma'unah Sari.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegistrationForm(false)}
                className="py-3 px-5 border border-primary/20 hover:bg-primary/5 text-primary font-bold rounded-lg text-xs transition-standard cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 justify-center py-3 font-bold text-xs"
              >
                <span>Kirim Data Alumni</span>
                <Send className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Render Selection & Information Main Panel (Default View)
  const renderMainAlumniView = () => {
    return (
      <div className="space-y-8 animate-fade-in text-left">
        {/* Peta Sebaran Wilayah Nasional */}
        {renderRegionalMap()}

        {/* Radar Alumni Terdekat (GPS Map) */}
        {renderRadarMap()}

        {/* CTA Card to open Registration Form */}
        <div className="bg-gradient-to-br from-primary to-[#062919] border border-secondary/20 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <IslamicRosette size="lg" />
          </div>

          <div className="space-y-1.5 relative z-10 max-w-xl">
            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block font-mono">Sambung Sanad Keberkahan</span>
            <h3 className="font-display text-lg sm:text-xl text-white font-bold leading-snug">Registrasi Pangkalan Data Alumni HAMAS</h3>
            <p className="text-white/70 text-[11px] leading-relaxed">
              Daftarkan diri Anda ke dalam database nasional Himpunan Alumni Ma'unah Sari (HAMAS) untuk memetakan syiar dakwah huffadh Qur'an di Indonesia dan memudahkan koordinasi kegiatan reuni regional.
            </p>
          </div>

          <button
            onClick={() => {
              setShowRegistrationForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-primary text-xs !py-3 !px-5 hover-glow relative z-10 cursor-pointer shrink-0 font-bold"
          >
            <span>Isi Formulir Database Alumni</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>

        {/* Public Events Bulletin */}
        {renderEventsSection()}
      </div>
    );
  };

  return (
    <div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          IKATAN KELUARGA ALUMNI
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Himpunan Alumni Ma'unah Sari (HAMAS)
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Wadah silaturahim, sinergi, dan jejaring khidmah seluruh alumni santri penghafal Al-Qur'an PTQ Ma'unah Sari Bandar Kidul Kediri.
        </p>
      </div>

      {/* Main View rendering based on showRegistrationForm state */}
      {showRegistrationForm ? renderRegistrationForm() : renderMainAlumniView()}
    </div>
  );
}
