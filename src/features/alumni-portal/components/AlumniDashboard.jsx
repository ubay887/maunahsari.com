import { useState } from 'react';
import { useAlumniProfile } from '../hooks/useAlumniProfile';
import { AlumniTabNav } from './AlumniTabNav';
import { ProfileTab } from './profile/ProfileTab';
import { SyahadahTab } from './syahadah/SyahadahTab';
import { EventsTab } from './events/EventsTab';
import IslamicPattern from '@/components/ui/IslamicPattern';

export function AlumniDashboard() {
  const { alumniData, updateProfile, toggleRadar, updateGPS } = useAlumniProfile();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="w-full space-y-8 animate-fade-in text-left">
      {/* Welcome Section */}
      <div className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden text-center md:text-left">
        {/* Islamic Ornament Watermark */}
        <div className="absolute inset-y-0 right-0 w-36 opacity-[0.03] sm:opacity-[0.05] pointer-events-none z-0">
          <IslamicPattern variant="geometric" opacity={1} />
        </div>

        <div className="space-y-1 relative z-10">
          <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">
            Portal Anggota HAMAS
          </span>
          <h3 className="font-display text-xl md:text-2xl text-primary font-bold">
            Selamat Datang, {alumniData.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            No. Anggota: {alumniData.memberNo} | Angkatan Wisuda: {alumniData.yearOut}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <AlumniTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <ProfileTab
          alumniData={alumniData}
          onToggleRadar={toggleRadar}
          onUpdateGPS={updateGPS}
          onUpdateProfile={updateProfile}
        />
      )}
      {activeTab === 'syahadah' && (
        <SyahadahTab alumniData={alumniData} />
      )}
      {activeTab === 'events' && (
        <EventsTab />
      )}
    </div>
  );
}
