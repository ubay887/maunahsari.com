import { memo, useCallback } from 'react';

const TABS = [
  { id: 'profile', label: 'Profil & Kartu HAMAS' },
  { id: 'syahadah', label: 'Layanan Syahadah Digital' },
  { id: 'events', label: 'Agenda Kegiatan & Khidmat' },
];

const TabButton = memo(function TabButton({ label, variant, onClick }) {
  const isActive = variant === 'active';

  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
        isActive
          ? 'bg-primary text-white shadow-md'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
      }`}
      style={{ minHeight: '38px' }}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </button>
  );
});

export function AlumniTabNav({ activeTab, onTabChange }) {
  const handleProfileClick = useCallback(() => onTabChange('profile'), [onTabChange]);
  const handleSyahadahClick = useCallback(() => onTabChange('syahadah'), [onTabChange]);
  const handleEventsClick = useCallback(() => onTabChange('events'), [onTabChange]);

  const handlers = {
    profile: handleProfileClick,
    syahadah: handleSyahadahClick,
    events: handleEventsClick,
  };

  return (
    <nav className="flex bg-primary/5 p-1.5 rounded-xl border border-primary/5 gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none px-4 md:px-1.5" aria-label="Alumni dashboard tabs">
      {TABS.map((tab) => (
        <TabButton
          key={tab.id}
          label={tab.label}
          variant={activeTab === tab.id ? 'active' : 'inactive'}
          onClick={handlers[tab.id]}
        />
      ))}
    </nav>
  );
}
