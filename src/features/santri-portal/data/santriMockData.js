// src/features/santri-portal/data/santriMockData.js

export const DEFAULT_SANTRI_DATA = {
  name: "Achmad Shodiqul Wa'di",
  nik: "3506123456789001",
  regNo: "MS-2026-0042",
  program: "Bil-Hifdhi 30 Juz (Hafalan Al-Qur'an)",
  pondok: "Pondok Putra (Pusat)",
  dateRegistered: "10 Juni 2026",
  status: "Lolos Berkas & Menunggu Sowan/Tes",
  schedule: {
    day: "Ahad",
    date: "21 Juni 2026",
    time: "08:30 WIB s/d Selesai",
    location: "Kantor Pusat PTQ Ma'unah Sari Kediri",
    examiner: "KH. R. Abdul Hamid Abdul Qodir",
    notes: "Membawa fotokopi KK, ijazah terakhir/SKL, dan pas foto 3x4 berwarna (2 lembar)."
  }
};

/**
 * Loads santri data from localStorage, merging with defaults.
 * If the user completed the registration form (Pendaftaran),
 * their data is stored under 'registeredSantri' key.
 *
 * @returns {object} Santri data object with all required fields
 */
export function loadSantriData() {
  const saved = typeof window !== 'undefined'
    ? localStorage.getItem('registeredSantri')
    : null;

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SANTRI_DATA,
        name: parsed.name,
        nik: parsed.nik,
        regNo: parsed.regNo,
        program: parsed.programLabel || DEFAULT_SANTRI_DATA.program,
        pondok: parsed.pondokLabel || DEFAULT_SANTRI_DATA.pondok,
        dateRegistered: parsed.dateRegistered || DEFAULT_SANTRI_DATA.dateRegistered,
      };
    } catch (e) {
      console.error("Error parsing saved santri data", e);
    }
  }
  return DEFAULT_SANTRI_DATA;
}
