import React from 'react';
import { Phone, MessageCircle, Globe } from 'lucide-react';

const Instagram = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Facebook = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Youtube = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function Narahubung() {
  const contacts = [
    {
      role: 'Kantor Putra (WA)',
      phone: '0812-4530-6020',
      link: 'https://wa.me/+6281245306020',
      desc: 'Hubungi untuk informasi asrama putra, kuota almari santri baru putra, dan koordinasi sowan putra.'
    },
    {
      role: 'Kantor Putri (WA)',
      phone: '0856-4571-7767',
      link: 'https://wa.me/+6285645717767',
      desc: 'Hubungi untuk informasi asrama putri, gelombang riyadloh berkala 3 bulanan, dan koordinasi sowan putri.'
    }
  ];

  const socialMedia = [
    { name: 'Instagram', handle: '@maunahsari', link: 'https://www.instagram.com/maunahsari', icon: Instagram, color: 'hover:text-[#e1306c]' },
    { name: 'Facebook', handle: 'PP Maunah Sari', link: 'https://www.facebook.com/ppmaunahsari', icon: Facebook, color: 'hover:text-[#1877f2]' },
    { name: 'TikTok', handle: '@maunahsari', link: 'https://www.tiktok.com/@maunahsari', icon: Globe, color: 'hover:text-[#010101]' },
    { name: 'YouTube', handle: 'Tahfidhul Qur\'an Ma\'unah Sari', link: 'https://www.youtube.com/channel/UCH3bNfhbfEJpPjm9gfGvvSQ', icon: Youtube, color: 'hover:text-[#ff0000]' }
  ];

  return (
    <div className="py-8 md:py-12 px-4 max-w-4xl mx-auto space-y-12 text-left">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Layanan Komunikasi
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Narahubung & Media Sosial
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Phone / WA Contacts */}
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold text-primary border-b border-primary/10 pb-2">
            Kontak Administrasi
          </h3>
          <div className="space-y-4">
            {contacts.map((contact, idx) => (
              <div key={idx} className="bg-bg-surface border border-primary/5 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">{contact.role}</span>
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div className="text-lg font-bold text-primary font-mono">{contact.phone}</div>
                <p className="text-xs text-text-muted leading-relaxed">{contact.desc}</p>
                <a
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 glossy-emerald text-bg-surface rounded-lg text-xs font-bold cursor-pointer transition-all focus:outline-none"
                >
                  Hubungi via WhatsApp
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media & Blog */}
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold text-primary border-b border-primary/10 pb-2">
            Media Publikasi & Sosial
          </h3>
          
          {/* Social media grid */}
          <div className="grid grid-cols-2 gap-4">
            {socialMedia.map((media, idx) => {
              const Icon = media.icon;
              return (
                <a
                  key={idx}
                  href={media.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-bg-surface border border-primary/5 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-secondary transition-all duration-300 group cursor-pointer focus:outline-none`}
                >
                  <Icon className={`w-6 h-6 text-text-muted transition-colors ${media.color} group-hover:scale-105`} />
                  <div className="mt-4 text-left">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wide">{media.name}</span>
                    <span className="block text-xs font-semibold text-primary truncate">{media.handle}</span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Majalah Maunah Sari Blogspot */}
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Warta & Karya Santri</span>
            <h4 className="font-display font-bold text-base text-primary">Majalah Dinding Ma'unah Sari</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Dapatkan info berkala, tulisan sastra, artikel keislaman, serta rubrik karya buatan santri melalui blog majalah resmi kami.
            </p>
            <a
              href="https://khobarunamaunahsari.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 glossy-gold text-primary font-bold rounded-lg text-xs cursor-pointer transition-all focus:outline-none"
            >
              Kunjungi Blog Majalah
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
