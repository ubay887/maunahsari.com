import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import Download from 'lucide-react/dist/esm/icons/download';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import Send from 'lucide-react/dist/esm/icons/send';
import Milestone from 'lucide-react/dist/esm/icons/milestone';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Printer from 'lucide-react/dist/esm/icons/printer';
import LogIn from 'lucide-react/dist/esm/icons/log-in';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Info from 'lucide-react/dist/esm/icons/info';
import { IslamicRosette, OrnamentalCorner } from '@/components/ui/IslamicPattern';

const registrationWaves = [
  {
    id: 'reguler-putra',
    name: "PSB Reguler Gelombang 1 (Putra)",
    status: "open", // 'open', 'full', 'upcoming'
    target: "putra",
    dates: "1 Juni - 30 Juni 2026",
    quotaTotal: 50,
    quotaFilled: 38,
    description: "Program Tahfidhul Qur'an Bil-Hifdhi 30 Juz, Bin-Nadhor, dan Qira'ah Sab'ah khusus asrama putra.",
    defaultProgram: "30juz",
    pondokLabel: "Pondok Putra (Pusat)"
  },
  {
    id: 'reguler-putri',
    name: "PSB Reguler Gelombang 1 (Putri)",
    status: "open",
    target: "putri",
    dates: "1 Juni - 30 Juni 2026",
    quotaTotal: 40,
    quotaFilled: 32,
    description: "Program Tahfidhul Qur'an Bil-Hifdhi 30 Juz, Bin-Nadhor, dan Qira'ah Sab'ah khusus asrama putri.",
    defaultProgram: "30juz",
    pondokLabel: "Pondok Putri (Lil-Banat)"
  },
  {
    id: 'riyadloh-putra-gel1',
    name: "PSB Riyadloh Khusus (Putra)",
    status: "full",
    target: "putra",
    dates: "1 Mei - 31 Mei 2026",
    quotaTotal: 15,
    quotaFilled: 15,
    description: "Program Riyadloh Spiritual & Khidmah 41 Hari khusus santri putra angkatan pertama.",
    defaultProgram: "riyadloh",
    pondokLabel: "Pondok Putra (Pusat)"
  },
  {
    id: 'riyadloh-gel2',
    name: "PSB Riyadloh Khusus Gelombang 2",
    status: "upcoming",
    target: "bersama",
    dates: "1 Juli - 15 Juli 2026",
    quotaTotal: 20,
    quotaFilled: 0,
    description: "Pendaftaran program riyadloh spiritual angkatan kedua untuk santri putra dan putri.",
    defaultProgram: "riyadloh",
    pondokLabel: "Pondok Putra / Putri"
  }
];

export default function Pendaftaran() {
  const { navigate } = useNavigation();
  const [selectedWave, setSelectedWave] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Registration Form States
  const [formData, setFormData] = useState({
    // Step 1: Data Calon Santri
    fullName: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'putra', // 'putra' or 'putri'
    lastEducation: 'SMP/MTs',
    address: '',
    
    // Step 2: Data Orang Tua / Wali
    fatherName: '',
    motherName: '',
    parentOccupation: 'Pegawai Swasta',
    whatsapp: '',
    
    // Step 3: Program & Berkas
    pondok: 'Pondok Putra (Pusat)', 
    program: '30juz', 
    kkFile: null,
    ijazahFile: null,
    photoFile: null,

    // Step 4: Persetujuan
    agreedToRules: false
  });

  // Upload progress simulation states
  const [uploadProgress, setUploadProgress] = useState({
    kk: null,
    ijazah: null,
    photo: null
  });

  // Validation Error States
  const [validationErrors, setValidationErrors] = useState({});

  // Generated Registration Info
  const [regNo, setRegNo] = useState('');
  const [dateRegistered, setDateRegistered] = useState('');

  // Info Sidebar data
  const alur = [
    'Pilih gelombang aktif sesuai asrama & program yang Anda tuju.',
    'Isi formulir online secara lengkap melalui 4 langkah wizard.',
    'Simpan Nomor Registrasi Anda untuk memantau status di Portal Masuk.',
    'Hadir di pesantren Kediri untuk seleksi lisan & sowan pengasuh.'
  ];

  const syarat = [
    'Scan Kartu Keluarga (KK) & Scan Ijazah/SKL terakhir.',
    'Pas foto berwarna ukuran 3x4.',
    'Nomor WhatsApp wali santri yang aktif.',
    'Diantar orang tua/wali saat sowan pengasuh.'
  ];

  // When a wave is selected, initialize form fields based on the wave config
  const handleSelectWave = (wave) => {
    setSelectedWave(wave);
    setStep(1);
    setFormData(prev => ({
      ...prev,
      gender: wave.target === 'bersama' ? 'putra' : wave.target,
      pondok: wave.pondokLabel,
      program: wave.defaultProgram,
      fullName: '',
      nik: '',
      birthPlace: '',
      birthDate: '',
      address: '',
      fatherName: '',
      motherName: '',
      parentOccupation: 'Pegawai Swasta',
      whatsapp: '',
      kkFile: null,
      ijazahFile: null,
      photoFile: null,
      agreedToRules: false
    }));
    setUploadProgress({ kk: null, ijazah: null, photo: null });
    setValidationErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Simulate file upload with progress bar
  const simulateUpload = (fieldType, fileName) => {
    setUploadProgress(prev => ({ ...prev, [fieldType]: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadProgress(prev => ({ ...prev, [fieldType]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setFormData(prev => ({ ...prev, [`${fieldType}File`]: fileName }));
      }
    }, 150);
  };

  const handleFileChange = (e, fieldType) => {
    const file = e.target.files[0];
    if (file) {
      simulateUpload(fieldType, file.name);
    }
  };

  // Validate form steps
  const validateStep = (currentStep) => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Nama Lengkap wajib diisi';
      if (!formData.nik.trim() || formData.nik.length !== 16) errors.nik = 'NIK harus berjumlah 16 digit angka';
      if (!formData.birthPlace.trim()) errors.birthPlace = 'Tempat lahir wajib diisi';
      if (!formData.birthDate) errors.birthDate = 'Tanggal lahir wajib diisi';
      if (!formData.address.trim()) errors.address = 'Alamat lengkap wajib diisi';
    } else if (currentStep === 2) {
      if (!formData.fatherName.trim()) errors.fatherName = 'Nama Ayah wajib diisi';
      if (!formData.motherName.trim()) errors.motherName = 'Nama Ibu wajib diisi';
      if (!formData.whatsapp.trim() || formData.whatsapp.length < 9) errors.whatsapp = 'Nomor WhatsApp tidak valid';
    } else if (currentStep === 3) {
      if (!formData.kkFile) errors.kkFile = 'Harap unggah scan Kartu Keluarga';
      if (!formData.ijazahFile) errors.ijazahFile = 'Harap unggah scan Ijazah / SKL';
      if (!formData.photoFile) errors.photoFile = 'Harap unggah Pas Foto Calon Santri';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreedToRules) {
      setValidationErrors({ agreedToRules: 'Anda harus menyetujui peraturan pondok pesantren' });
      return;
    }

    setIsSubmitting(true);

    // Simulate database submission
    setTimeout(() => {
      const generatedNo = `MS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      
      setRegNo(generatedNo);
      setDateRegistered(currentDate);

      // Translate program code to label
      const programLabels = {
        '30juz': "Bil-Hifdhi 30 Juz (Hafalan Al-Qur'an)",
        'binnadhor': "Bin-Nadhor (Membaca Al-Qur'an Al-Karim)",
        'qiraah': "Qira'ah Sab'ah (Riwayat Qira'at Tujuh)",
        'riyadloh': "Riyadloh 41 Hari (Santri Khidmah Khusus)"
      };

      // Save to localStorage so login portal can access it
      const registeredData = {
        name: formData.fullName,
        nik: formData.nik,
        regNo: generatedNo,
        programLabel: programLabels[formData.program],
        pondokLabel: formData.pondok,
        dateRegistered: currentDate,
        autoFillLogin: true
      };

      localStorage.setItem('registeredSantri', JSON.stringify(registeredData));

      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  // Render Step 1: Data Diri Calon Santri
  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in text-left">
      <h4 className="text-heading-md text-primary font-bold border-b border-primary/10 pb-2">
        Langkah 1: Profil Calon Santri
      </h4>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="fullName" className="block font-semibold text-muted-foreground">Nama Lengkap (Sesuai Ijazah)</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Contoh: Achmad Shodiqul Wa'di"
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors ${
              validationErrors.fullName ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.fullName && <p className="text-[10px] text-error">{validationErrors.fullName}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="nik" className="block font-semibold text-muted-foreground">NIK Calon Santri (16 Digit KK)</label>
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
          {validationErrors.nik && <p className="text-[10px] text-error">{validationErrors.nik}</p>}
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-muted-foreground">Jenis Kelamin</label>
          {selectedWave?.target !== 'bersama' ? (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-primary text-xs font-bold uppercase">
              {formData.gender === 'putra' ? 'Putra (Laki-laki)' : 'Putri (Perempuan)'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender: 'putra', pondok: 'Pondok Putra (Pusat)' }))}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  formData.gender === 'putra'
                    ? 'bg-primary text-secondary border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-primary/10 hover:border-primary/20'
                }`}
              >
                Putra
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender: 'putri', pondok: 'Pondok Putri (Lil-Banat)' }))}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  formData.gender === 'putri'
                    ? 'bg-primary text-secondary border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-primary/10 hover:border-primary/20'
                }`}
              >
                Putri
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="birthPlace" className="block font-semibold text-muted-foreground">Tempat Lahir</label>
          <input
            type="text"
            id="birthPlace"
            name="birthPlace"
            required
            value={formData.birthPlace}
            onChange={handleInputChange}
            placeholder="Contoh: Kediri"
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors ${
              validationErrors.birthPlace ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.birthPlace && <p className="text-[10px] text-error">{validationErrors.birthPlace}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="birthDate" className="block font-semibold text-muted-foreground">Tanggal Lahir</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            required
            value={formData.birthDate}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors font-mono ${
              validationErrors.birthDate ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.birthDate && <p className="text-[10px] text-error">{validationErrors.birthDate}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="lastEducation" className="block font-semibold text-muted-foreground">Pendidikan Terakhir / Sedang Ditempuh</label>
          <select
            id="lastEducation"
            name="lastEducation"
            value={formData.lastEducation}
            onChange={handleInputChange}
            className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="SD/MI">SD / MI (Sederajat)</option>
            <option value="SMP/MTs">SMP / MTs (Sederajat)</option>
            <option value="SMA/MA">SMA / MA / SMK (Sederajat)</option>
            <option value="Kuliah/Universitas">D3 / S1 (Perguruan Tinggi)</option>
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="address" className="block font-semibold text-muted-foreground">Alamat Lengkap Rumah (RT/RW, Desa, Kec, Kab/Kota)</label>
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Contoh: Jl. KH. Agus Salim No.8, Bandar Kidul, Mojoroto, Kota Kediri, Jawa Timur"
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors resize-none ${
              validationErrors.address ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.address && <p className="text-[10px] text-error">{validationErrors.address}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary focus-ring"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="icon-xs" />
        </button>
      </div>
    </div>
  );

  // Render Step 2: Data Orang Tua / Wali
  const renderStep2 = () => (
    <div className="space-y-4 animate-fade-in text-left">
      <h4 className="text-heading-md text-primary font-bold border-b border-primary/10 pb-2">
        Langkah 2: Data Orang Tua / Wali
      </h4>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="fatherName" className="block font-semibold text-muted-foreground">Nama Lengkap Ayah Kandung</label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            required
            value={formData.fatherName}
            onChange={handleInputChange}
            placeholder="Contoh: H. Abdul Qodir"
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors ${
              validationErrors.fatherName ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.fatherName && <p className="text-[10px] text-error">{validationErrors.fatherName}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="motherName" className="block font-semibold text-muted-foreground">Nama Lengkap Ibu Kandung</label>
          <input
            type="text"
            id="motherName"
            name="motherName"
            required
            value={formData.motherName}
            onChange={handleInputChange}
            placeholder="Contoh: Nyai Hj. Halimah"
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors ${
              validationErrors.motherName ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.motherName && <p className="text-[10px] text-error">{validationErrors.motherName}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="parentOccupation" className="block font-semibold text-muted-foreground">Pekerjaan Orang Tua</label>
          <select
            id="parentOccupation"
            name="parentOccupation"
            value={formData.parentOccupation}
            onChange={handleInputChange}
            className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
            <option value="Pegawai Swasta">Karyawan Swasta</option>
            <option value="Wiraswasta">Wiraswasta / Pengusaha</option>
            <option value="Petani/Nelayan">Petani / Nelayan</option>
            <option value="Guru/Dosen">Guru / Dosen</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="whatsapp" className="block font-semibold text-muted-foreground">Nomor WhatsApp Aktif Wali</label>
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
            placeholder="Contoh: 08123456789"
            className={`w-full p-3 border rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors font-mono ${
              validationErrors.whatsapp ? 'border-error' : 'border-primary/10'
            }`}
          />
          {validationErrors.whatsapp && <p className="text-[10px] text-error">{validationErrors.whatsapp}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          className="py-2.5 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-xs font-bold text-primary transition-standard flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="icon-xs" />
          <span>Kembali</span>
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary focus-ring"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="icon-xs" />
        </button>
      </div>
    </div>
  );

  // Render Step 3: Pilihan Program & Berkas
  const renderStep3 = () => (
    <div className="space-y-5 animate-fade-in text-left">
      <h4 className="text-heading-md text-primary font-bold border-b border-primary/10 pb-2">
        Langkah 3: Program & Berkas Syarat
      </h4>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block font-semibold text-muted-foreground">Unit Asrama Pondok</label>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-primary text-xs font-bold">
            {formData.pondok}
          </div>
          <p className="text-[10px] text-muted-foreground italic">* Ditentukan otomatis berdasarkan asrama gelombang pilihan.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="program" className="block font-semibold text-muted-foreground">Program Pendidikan Al-Qur'an</label>
          {selectedWave?.defaultProgram === 'riyadloh' ? (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-primary text-xs font-bold">
              Riyadloh 41 Hari (Spiritual Khidmah Khusus)
            </div>
          ) : (
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              className="w-full p-3 border border-primary/10 rounded-lg bg-background text-primary text-xs focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="30juz">Bil-Hifdhi 30 Juz (Hafalan Al-Qur'an)</option>
              <option value="binnadhor">Bin-Nadhor (Membaca Al-Qur'an Al-Karim)</option>
              <option value="qiraah">Qira'ah Sab'ah (Riwayat Qira'at Tujuh)</option>
            </select>
          )}
        </div>

        <div className="sm:col-span-2 space-y-3 pt-2">
          <span className="text-xs font-bold text-primary uppercase block">Unggah Berkas Persyaratan (Simulasi)</span>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {/* KK File */}
            <div className="border border-primary/10 rounded-xl p-4 bg-background/30 space-y-2 flex flex-col justify-between">
              <div className="space-y-1 text-left">
                <span className="block font-semibold text-xs text-primary">Scan Kartu Keluarga (KK)</span>
                <span className="block text-[9px] text-muted-foreground">Format: PDF/JPG (Maks. 2MB)</span>
              </div>
              
              {uploadProgress.kk !== null && uploadProgress.kk < 100 && (
                <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full transition-all" style={{ width: `${uploadProgress.kk}%` }} />
                </div>
              )}

              {formData.kkFile ? (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[10px] flex items-center justify-between border border-emerald-100 font-mono">
                  <span className="truncate max-w-[100px]">{formData.kkFile}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-primary/20 hover:border-primary text-primary rounded-lg text-[10px] font-bold transition-colors cursor-pointer bg-card">
                  <Upload className="w-3.5 h-3.5 text-secondary" />
                  <span>Unggah KK</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'kk')}
                  />
                </label>
              )}
              {validationErrors.kkFile && <p className="text-[9px] text-error font-semibold">{validationErrors.kkFile}</p>}
            </div>

            {/* Ijazah File */}
            <div className="border border-primary/10 rounded-xl p-4 bg-background/30 space-y-2 flex flex-col justify-between">
              <div className="space-y-1 text-left">
                <span className="block font-semibold text-xs text-primary">Scan Ijazah / SKL</span>
                <span className="block text-[9px] text-muted-foreground">Format: PDF/JPG (Maks. 2MB)</span>
              </div>

              {uploadProgress.ijazah !== null && uploadProgress.ijazah < 100 && (
                <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full transition-all" style={{ width: `${uploadProgress.ijazah}%` }} />
                </div>
              )}

              {formData.ijazahFile ? (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[10px] flex items-center justify-between border border-emerald-100 font-mono">
                  <span className="truncate max-w-[100px]">{formData.ijazahFile}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-primary/20 hover:border-primary text-primary rounded-lg text-[10px] font-bold transition-colors cursor-pointer bg-card">
                  <Upload className="w-3.5 h-3.5 text-secondary" />
                  <span>Unggah Ijazah</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'ijazah')}
                  />
                </label>
              )}
              {validationErrors.ijazahFile && <p className="text-[9px] text-error font-semibold">{validationErrors.ijazahFile}</p>}
            </div>

            {/* Pas Foto File */}
            <div className="border border-primary/10 rounded-xl p-4 bg-background/30 space-y-2 flex flex-col justify-between">
              <div className="space-y-1 text-left">
                <span className="block font-semibold text-xs text-primary">Pas Foto Berwarna 3x4</span>
                <span className="block text-[9px] text-muted-foreground">Format: JPG/PNG (Maks. 1MB)</span>
              </div>

              {uploadProgress.photo !== null && uploadProgress.photo < 100 && (
                <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full transition-all" style={{ width: `${uploadProgress.photo}%` }} />
                </div>
              )}

              {formData.photoFile ? (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[10px] flex items-center justify-between border border-emerald-100 font-mono">
                  <span className="truncate max-w-[100px]">{formData.photoFile}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-primary/20 hover:border-primary text-primary rounded-lg text-[10px] font-bold transition-colors cursor-pointer bg-card">
                  <Upload className="w-3.5 h-3.5 text-secondary" />
                  <span>Unggah Foto</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'photo')}
                  />
                </label>
              )}
              {validationErrors.photoFile && <p className="text-[9px] text-error font-semibold">{validationErrors.photoFile}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          className="py-2.5 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-xs font-bold text-primary transition-standard flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="icon-xs" />
          <span>Kembali</span>
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary focus-ring"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="icon-xs" />
        </button>
      </div>
    </div>
  );

  // Render Step 4: Ringkasan & Persetujuan
  const renderStep4 = () => {
    const programNames = {
      '30juz': "Bil-Hifdhi 30 Juz (Hafalan Al-Qur'an)",
      'binnadhor': "Bin-Nadhor (Membaca Al-Qur'an Al-Karim)",
      'qiraah': "Qira'ah Sab'ah (Riwayat Qira'at Tujuh)",
      'riyadloh': "Riyadloh 41 Hari (Santri Khidmah Khusus)"
    };

    return (
      <div className="space-y-6 animate-fade-in text-left">
        <h4 className="text-heading-md text-primary font-bold border-b border-primary/10 pb-2">
          Langkah 4: Tinjauan Ulang & Persetujuan
        </h4>

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/5 space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <h5 className="font-bold text-primary border-b border-primary/10 pb-1 sm:col-span-2">Data Calon Santri</h5>
            <div>
              <span className="block text-[10px] text-muted-foreground">Nama Lengkap</span>
              <strong className="text-primary">{formData.fullName}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">NIK (KTP/KK)</span>
              <strong className="text-primary font-mono">{formData.nik}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">TTL</span>
              <strong className="text-primary">{formData.birthPlace}, {formData.birthDate}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Jenis Kelamin / Pendidikan</span>
              <strong className="text-primary uppercase">{formData.gender} / {formData.lastEducation}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10px] text-muted-foreground">Alamat Tinggal</span>
              <strong className="text-primary">{formData.address}</strong>
            </div>

            <h5 className="font-bold text-primary border-b border-primary/10 pb-1 sm:col-span-2 pt-2">Data Orang Tua / Wali</h5>
            <div>
              <span className="block text-[10px] text-muted-foreground">Nama Ayah / Ibu</span>
              <strong className="text-primary">{formData.fatherName} / {formData.motherName}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Pekerjaan / HP Wali</span>
              <strong className="text-primary">{formData.parentOccupation} / <span className="font-mono">{formData.whatsapp}</span></strong>
            </div>

            <h5 className="font-bold text-primary border-b border-primary/10 pb-1 sm:col-span-2 pt-2">Pilihan Program & Dokumen</h5>
            <div>
              <span className="block text-[10px] text-muted-foreground">Unit Asrama</span>
              <strong className="text-primary">{formData.pondok}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Program Pembelajaran</span>
              <strong className="text-primary">{programNames[formData.program]}</strong>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3 font-mono text-[10px] pt-1">
              <div className="bg-emerald-50 text-emerald-800 py-1 px-2 rounded border border-emerald-100">
                <span>✓ KK: {formData.kkFile}</span>
              </div>
              <div className="bg-emerald-50 text-emerald-800 py-1 px-2 rounded border border-emerald-100">
                <span>✓ Ijazah: {formData.ijazahFile}</span>
              </div>
              <div className="bg-emerald-50 text-emerald-800 py-1 px-2 rounded border border-emerald-100">
                <span>✓ Foto: {formData.photoFile}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              name="agreedToRules"
              checked={formData.agreedToRules}
              onChange={handleInputChange}
              className="accent-secondary mt-0.5 shrink-0"
            />
            <span className="text-[11px] leading-relaxed text-muted-foreground">
              Saya menyatakan bahwa seluruh data di atas adalah benar. Calon santri berjanji bersedia menaati seluruh tata tertib, peraturan administrasi, serta bersedia diantar sowan menghadap pengasuh ketika proses seleksi.
            </span>
          </label>
          {validationErrors.agreedToRules && <p className="text-[10px] text-error font-semibold">{validationErrors.agreedToRules}</p>}
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="py-2.5 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-xs font-bold text-primary transition-standard flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="icon-xs" />
            <span>Kembali</span>
          </button>
          <button
            type="submit"
            className="btn-primary hover-glow focus-ring"
          >
            <span>Kirim Pendaftaran</span>
            <Send className="icon-xs text-primary" />
          </button>
        </div>
      </div>
    );
  };

  // Render Success Screen
  const renderSuccessScreen = () => {
    return (
      <div className="max-w-2xl w-full mx-auto bg-card border border-primary/5 rounded-2xl p-6 sm:p-10 shadow-lg text-center relative overflow-hidden animate-scale-in">
        <OrnamentalCorner position="top-left" size="md" />
        <OrnamentalCorner position="top-right" size="md" />
        <OrnamentalCorner position="bottom-left" size="md" />
        <OrnamentalCorner position="bottom-right" size="md" />

        <div className="absolute inset-0 opacity-[0.015] pointer-events-none flex items-center justify-center">
          <IslamicRosette size="xl" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800 animate-bounce">
            <CheckCircle className="w-10 h-10 text-emerald-700" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-secondary tracking-widest uppercase block">REGISTRASI BERHASIL DITERIMA</span>
            <h3 className="font-display text-2xl text-primary font-bold">Syukron Jamilan, Pendaftaran Selesai!</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Berkas administrasi calon santri atas nama <strong>{formData.fullName}</strong> telah masuk ke dalam antrean sistem verifikasi PTQ Ma'unah Sari.
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Nomor Registrasi Calon Santri</span>
              <div className="text-2xl font-bold font-mono text-primary tracking-wider">{regNo}</div>
            </div>
            
            <div className="border-t border-primary/10 pt-3 grid grid-cols-2 gap-2 text-left text-[11px] text-muted-foreground">
              <div>NIK Pendaftar: <strong>{formData.nik}</strong></div>
              <div>Tanggal Daftar: <strong>{dateRegistered}</strong></div>
              <div className="col-span-2">Unit Pondok: <strong>{formData.pondok}</strong></div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-2.5 text-[10px] text-left flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>PENTING:</strong> Catat Nomor Registrasi dan NIK Anda. Kredensial ini digunakan untuk masuk ke portal pemantauan status seleksi dan mencetak bukti ujian.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
            <button
              onClick={() => navigate('login')}
              className="btn-primary flex-1 justify-center text-xs flex items-center gap-1.5 focus-ring"
            >
              <span>Masuk ke Portal Santri</span>
              <LogIn className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 border-2 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-standard flex-1 justify-center flex items-center gap-1.5 cursor-pointer focus:outline-none"
            >
              <Printer className="w-4 h-4 text-secondary" />
              <span>Simpan / Cetak Bukti</span>
            </button>
          </div>
          
          <p className="text-[9px] text-muted-foreground">
            * Layanan pendaftaran ini dienkripsi dan diamankan oleh RMI-NU Jawa Timur.
          </p>
        </div>
      </div>
    );
  };

  // Render Form Wizard Screen
  const renderFormWizard = () => {
    if (isSubmitted) return renderSuccessScreen();

    return (
      <div className="max-w-3xl w-full mx-auto space-y-6 animate-scale-in">
        {/* Header Form showing selected wave & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
          <button
            onClick={() => setSelectedWave(null)}
            className="self-start py-2 px-3 border border-primary/10 hover:bg-primary/5 text-primary rounded-lg text-xs font-bold transition-standard flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-secondary" />
            <span>Pilih Gelombang Lain</span>
          </button>
          <div className="text-left">
            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Jalur Pendaftaran Aktif</span>
            <h3 className="font-display text-base text-primary font-bold leading-tight">{selectedWave.name}</h3>
          </div>
        </div>

        {/* Step indicator */}
        <div className="bg-card border border-primary/5 rounded-xl p-4 shadow-sm flex items-center justify-between gap-2 text-xs">
          {[1, 2, 3, 4].map((stepNum) => {
            const stepLabels = ['Profil Santri', 'Data Wali', 'Berkas Syarat', 'Konfirmasi'];
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            
            return (
              <div key={stepNum} className="flex items-center gap-2 flex-1 justify-center last:flex-initial">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                  isActive 
                    ? 'bg-secondary text-primary border-secondary font-bold' 
                    : isCompleted 
                      ? 'bg-primary text-secondary border-primary' 
                      : 'bg-background text-muted-foreground border-primary/5'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span className={`hidden sm:inline font-semibold ${
                  isActive ? 'text-primary font-bold' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
                }`}>
                  {stepLabels[stepNum - 1]}
                </span>
                {stepNum < 4 && <div className="hidden sm:block h-0.5 bg-primary/10 w-full ml-2" />}
              </div>
            );
          })}
        </div>

        {/* Active form screen inside loading frame */}
        <div className="bg-card border border-primary/5 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <OrnamentalCorner position="top-left" size="sm" />
          <OrnamentalCorner position="top-right" size="sm" />
          <OrnamentalCorner position="bottom-left" size="sm" />
          <OrnamentalCorner position="bottom-right" size="sm" />

          {isSubmitting ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-primary animate-pulse">Memproses Pendaftaran Anda...</h4>
                <p className="text-muted-foreground text-xs">Menyimpan database santri baru PTQ Ma'unah Sari Kediri</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </form>
          )}
        </div>
      </div>
    );
  };

  // Render Selection & Information Main Panel (Default View)
  const renderSelectionPanel = () => {
    return (
      <div className="grid md:grid-cols-12 gap-8 items-start animate-fade-in text-left">
        {/* Left Column: Gelombang Pendaftaran Cards */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
            <Calendar className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-bold text-base text-primary">Gelombang Pendaftaran Terbuka</h3>
          </div>

          <div className="grid gap-4">
            {registrationWaves.map((wave) => {
              const isOpen = wave.status === 'open';
              const isFull = wave.status === 'full';
              const isUpcoming = wave.status === 'upcoming';
              
              // Calculate quota percentage
              const quotaPercent = wave.quotaTotal > 0 ? (wave.quotaFilled / wave.quotaTotal) * 100 : 0;
              const quotaLeft = wave.quotaTotal - wave.quotaFilled;

              return (
                <div 
                  key={wave.id}
                  className={`bg-card border rounded-2xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isOpen 
                      ? 'border-primary/5 hover:border-secondary hover:shadow-md' 
                      : 'border-primary/5 opacity-75 bg-background/30'
                  }`}
                >
                  {/* Subtle target tag watermark */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {isOpen && (
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                        Buka
                      </span>
                    )}
                    {isFull && (
                      <span className="bg-red-50 text-red-700 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-200">
                        Penuh
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="bg-amber-50 text-amber-700 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                        Segera
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      {/* Gender icon indicator */}
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block font-mono">
                        Target: {wave.target === 'putra' ? 'Khusus Putra' : wave.target === 'putri' ? 'Khusus Putri' : 'Putra & Putri'}
                      </span>
                      <h4 className="font-display font-bold text-sm text-primary leading-tight">{wave.name}</h4>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {wave.description}
                    </p>

                    {/* Dates range */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-primary/5 py-1 px-2.5 rounded-lg border border-primary/5 w-fit">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      <span>Periode: {wave.dates}</span>
                    </div>

                    {/* Quota Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>Status Kapasitas Asrama</span>
                        {isOpen && (
                          <span>Sisa: <strong>{quotaLeft}</strong> dari {wave.quotaTotal} Kursi</span>
                        )}
                        {isFull && (
                          <span className="text-red-700 font-bold">Penuh</span>
                        )}
                        {isUpcoming && (
                          <span>Kuota Terbatas: <strong>{wave.quotaTotal}</strong> Santri</span>
                        )}
                      </div>
                      
                      <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull 
                              ? 'bg-red-600' 
                              : isUpcoming 
                                ? 'bg-muted' 
                                : quotaPercent > 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-600'
                          }`} 
                          style={{ width: `${isUpcoming ? 0 : quotaPercent}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-primary/5 flex justify-end">
                    {isOpen ? (
                      <button
                        onClick={() => handleSelectWave(wave)}
                        className="btn-primary text-[10px] !py-2 !px-4 hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center gap-1 cursor-pointer focus-ring"
                      >
                        <span>Daftar Jalur Ini</span>
                        <ArrowRight className="w-3 h-3 text-primary" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="py-2 px-4 bg-background text-muted-foreground rounded-lg text-[10px] font-bold border border-primary/5 cursor-not-allowed"
                      >
                        {isFull ? 'Kuota Penuh' : 'Segera Dibuka'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Panduan & Biaya (Sidebar) */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
            <Info className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-bold text-base text-primary">Informasi & Panduan</h3>
          </div>

          {/* Rincian Biaya Administrasi */}
          <div className="bg-card border border-primary/5 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5">
              <Download className="w-4 h-4 text-secondary" /> Unduh Dokumen Pembiayaan
            </h4>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Silakan unduh dokumen panduan lengkap dan rincian biaya administrasi masuk santri baru TA 2026/2027:
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1.5">
              <a
                href="https://drive.google.com/file/d/1Sfs6EcAzYpryACiCOrx4sXUWYtY46C3Q/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-[10px] font-bold focus-ring justify-center py-2.5"
              >
                Unduh Rincian Biaya Putra
                <Download className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://drive.google.com/file/d/1FYcClryJVb7sqIb8Ph2XhZFAwNRxR6H3/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 border border-primary/20 hover:border-primary text-primary hover:bg-primary/5 rounded-lg text-[10px] font-bold transition-standard hover:scale-[1.02] focus:outline-none focus-ring cursor-pointer"
              >
                Unduh Rincian Biaya Putri
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Alur Pendaftaran */}
          <div className="bg-card border border-primary/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-secondary" /> Alur PSB Online
            </h4>
            <ol className="space-y-3">
              {alur.map((stepDesc, idx) => (
                <li key={idx} className="flex gap-2.5 text-[10px] leading-relaxed text-muted-foreground">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-secondary font-bold shrink-0 text-[8px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{stepDesc}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Syarat & Berkas */}
          <div className="bg-card border border-primary/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-xs text-primary flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-secondary" /> Syarat Administrasi
            </h4>
            <ul className="space-y-2.5">
              {syarat.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-[10px] leading-relaxed text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-10">
      {/* Header Halaman (Typographic Only, Premium Styling) */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Penerimaan Santri Baru
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          PSB TA 2026/2027
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
        <p className="text-muted-foreground text-xs max-w-lg mx-auto leading-relaxed">
          Pendaftaran terstruktur berdasarkan jalur masuk gelombang dan kapasitas sisa kuota asrama. Harap pastikan ketersediaan kuota sebelum mendaftar.
        </p>
      </div>

      {/* Main View Switcher */}
      {selectedWave ? renderFormWizard() : renderSelectionPanel()}
    </div>
  );
}
