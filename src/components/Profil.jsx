import React, { useState } from 'react';
import { BookOpen, User, MapPin, Award, BookOpenCheck } from 'lucide-react';

export default function Profil() {
  const [activeTab, setActiveTab] = useState('sejarah');

  return (
    <div className="py-8 md:py-12 px-4 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Mengenal Lebih Dekat
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Profil Pesantren
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center border-b border-primary/10">
        {[
          { id: 'sejarah', label: 'Sejarah & Lokasi', icon: BookOpen },
          { id: 'pendiri', label: 'Pendiri', icon: User },
          { id: 'pengasuh', label: 'Pengasuh', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-2.5 px-2.5 md:px-6 text-xs md:text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 cursor-pointer focus:outline-none ${
                activeTab === tab.id
                  ? 'border-secondary text-primary'
                  : 'border-transparent text-text-muted hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm text-left">
        {/* TAB 1: Sejarah & Lokasi */}
        {activeTab === 'sejarah' && (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-primary border-b border-primary/10 pb-2">
              Sejarah Berdiri Pesantren
            </h3>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>
                Pesantren Tahfidhul Qur'an Ma'unah Sari merupakan lembaga pendidikan Islam di Kota Kediri yang didirikan pada tahun 1967 M oleh **Simbah KH. M. Mubassyir Mundzir bin KH. M. Imam Bachri**. Nasab beliau, jika dirunut, bersambung hingga Rasulullah saw. melalui jalur Sayyidina Husain.
              </p>
              <p>
                Pada masa awal perkembangannya, pesantren ini lebih mengkhususkan pada bidang tasawuf, terutama mengistiqamahkah shalat berjamaah, wirid, dan zikir. Seiring berjalannya waktu, pesantren ini bertransformasi menjadi Pesantren Tahfidhul Qur'an dengan hadirnya **Simbah Nyai Hj. Zuhriyyah Munawwir Al-Hafizhah** binti Al-Muqri Al-Hafidz KH. R. Munawwir Krapyak Yogyakarta yang menjadi istri muassis PTQ Ma'unah Sari pada tahun 1973.
              </p>
              <p>
                Eksistensi beliau menambah corak Qur'ani dalam lingkup pesantren ini yang awalnya lebih bertendensi kepada ranah tasawuf, namun tanpa memudarkan nilai-nilai spiritual tasawuf tersebut. Keberadaan beliau bahkan menambah corak pendidikan pesantren, serta meningkatkan kualitas dan kuantitas santri PTQ Ma'unah Sari dari waktu ke waktu.
              </p>
            </div>

            <h3 className="font-display text-2xl font-bold text-primary border-b border-primary/10 pb-2 pt-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" /> Lokasi Geografis
            </h3>
            <div className="text-text-muted text-sm space-y-2">
              <p>
                Secara geografis, PTQ Ma'unah Sari terletak di sebelah barat sungai Brantas yang beralamatkan di:
              </p>
              <address className="bg-bg-base p-4 rounded-xl not-italic font-semibold text-primary border border-primary/5">
                Jl. KH. Agus Salim No.8, Bandar Kidul, Kec. Mojoroto, Kota Kediri, Jawa Timur 64118
              </address>
              <p className="text-xs">
                Pesantren ini telah berafiliasi dengan **RMI (Rabithah Ma'had Al-Islamiyyah)**, salah satu lembaga Nahdlatul Ulama (NU) yang membidangi asosiasi pesantren bermanhaj Ahlussunnah wal Jama'ah An-Nahdliyyah.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Pendiri */}
        {activeTab === 'pendiri' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider block">Mengenal Muassis</span>
              <h3 className="font-display text-2xl font-bold text-primary">
                KH. Muhammad Mubassyir Mundzir Bin KH. Imam Bachri
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 bg-bg-base/50 p-4 rounded-xl border border-primary/5 text-xs text-text-muted">
              <div><strong className="text-primary">Nama Kecil:</strong> Ibnu Mundzir</div>
              <div><strong className="text-primary">Anak Ke:</strong> 5 dari 6 Bersaudara</div>
              <div><strong className="text-primary">Lahir:</strong> Nganjuk, 11-06-1409 H / 1919 M</div>
              <div><strong className="text-primary">Wafat:</strong> 1989 M</div>
            </div>

            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <span className="block font-bold text-primary text-xs uppercase tracking-wider border-b border-primary/10 pb-1">Riwayat & Karakter</span>
              <p>
                Ketika masih dalam kandungan ibunya, ayah Gus Ib atau Mbah Mundzir, yaitu KH. Imam Bachri, bermimpi melihat seekor macan putih yang besar, gagah, dan penuh wibawa. Mimpi tersebut diyakini sebagai gambaran tentang Mbah Mundzir di masa hidupnya.
              </p>
              <p>
                Beliau dikenal sebagai sosok ulama yang zuhud, sangat disiplin, dan tegas dalam menerapkan serta mengamalkan ajaran agama Islam. Mbah Mundzir juga dikenal sebagai ahli dalam menjaga shalat agar selalu istiqamah dilaksanakan secara berjamaah dan tepat waktu.
              </p>
              <p>
                Pada tahun 1967, Mbah Mundzir secara resmi memangku Ma'unah Sari, yang kemudian menjadi cikal bakal berdirinya Pondok Pesantren Ma'unah Sari. Sejak beliau mulai memangku Masjid Ma'unah Sari, para santri mulai berdatangan dan secara resmi nyantri kepada beliau.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Pengasuh */}
        {activeTab === 'pengasuh' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider block">Pengasuh Periode 1990 - Sekarang</span>
              <h3 className="font-display text-2xl font-bold text-primary">
                KH. R. Abdul Hamid Abdul Qodir
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Lahir di Bantul, Krapyak, 30 April 1959 M | Putra dari KH. R. Abdul Qodir Munawwir & Nyai Hj. R. A. Salimah Nawawi
              </p>
            </div>

            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <span className="block font-bold text-primary text-xs uppercase tracking-wider border-b border-primary/10 pb-1">Biografi Singkat</span>
              <p>
                Beliau merupakan cucu dari KH. M. Munawwir, pendiri Pondok Pesantren Krapyak Yogyakarta. Beliau menempuh pendidikan formal selama 13 tahun di Krapyak, lalu meneruskan menghafal Al-Qur'an hingga khatam di Ponpes Sunan Pandan Aran, Sleman, Yogyakarta, di bawah asuhan KH. Mufid Mas'ud.
              </p>
              <p>
                Selanjutnya, beliau belajar di Ponpes Al-Falah Ploso, Kediri (1980-1985), lalu ke Ponpes Cidahu, Pandeglang, Banten (1985-1987) di bawah asuhan Abuya KH. Dimyati Amin. Beliau juga mendalami Qira'ah Sab'ah di bawah bimbingan KH. R. M. Najib Abdul Qodir. Sesuai wasiat KH. M. Mubassyir Mundzir sebelum wafat pada tahun 1989, tongkat estafet pengasuh diamanatkan kepada beliau.
              </p>
            </div>

            {/* Works and Organizations */}
            <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-primary/10">
              <div className="space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <BookOpenCheck className="w-4 h-4 text-secondary" /> Karya Tulis
                </span>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside">
                  <li>Al-Ma'unah Fii Tafsiri Suratil Fatihah</li>
                  <li>Setetes Embun Penyejuk Hati: Biografi KH. M. Mubassyir Mundzir</li>
                  <li>Daftar Kandungan Al-Qur'an (Terjemah Fazlurrahman)</li>
                  <li>Buku Panduan Riyadloh Al-Qur'an "41 Khataman"</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4 text-secondary" /> Aktivitas Organisasi
                </span>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside">
                  <li>Rais Syuriah PCNU Kota Kediri (2016-Sekarang)</li>
                  <li>Wakil Ketua MUI Kota Kediri (2021-Sekarang)</li>
                  <li>Salah Satu Pengasuh PP Al-Munawwir Krapyak (2022-Sekarang)</li>
                  <li>Mustasyar PWNU Yogyakarta (2024-Sekarang)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
