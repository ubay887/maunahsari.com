import { useState, useCallback } from 'react';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import { ALUMNI_EVENTS } from '../../data/eventsMockData';
import { EventCard } from './EventCard';

export function EventList({ children }) {
  const [rsvpEvents, setRsvpEvents] = useState({});

  const handleRsvp = useCallback((eventId) => {
    setRsvpEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  }, []);

  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
      <h4 className="font-display font-bold text-sm text-primary border-b border-primary/10 pb-3 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-secondary" /> Kalender Kegiatan & Reuni HAMAS
      </h4>

      <div className="space-y-4">
        {children ||
          ALUMNI_EVENTS.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRsvped={!!rsvpEvents[event.id]}
              onRsvp={handleRsvp}
            />
          ))}
      </div>
    </div>
  );
}
