import { VirtualIDCard } from './VirtualIDCard';
import { PersonalData } from './PersonalData';
import { RadarSettings } from './RadarSettings';

export function ProfileTab({ alumniData, onToggleRadar, onUpdateGPS, onUpdateProfile }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <VirtualIDCard alumniData={alumniData} />
      <PersonalData alumniData={alumniData} />
      <RadarSettings
        alumniData={alumniData}
        onToggleRadar={onToggleRadar}
        onUpdateGPS={onUpdateGPS}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
}
