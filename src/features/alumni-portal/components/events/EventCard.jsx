import { memo } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';

const CATEGORY_STYLES = {
  silaturahim: 'bg-secondary/15 text-primary border border-secondary/20',
  semaan: 'bg-primary/10 text-primary border border-primary/20',
  khidmat: 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20',
  khataman: 'bg-amber-500/10 text-amber-800 border border-amber-500/20',
};

const parseIndoDate = (dateStr) => {
  if (!dateStr) return { day: '12', month: 'JUN' };
  const parts = dateStr.split(' ');
  const day = parts[0] || '12';
  const month = (parts[1] || 'Jun').substring(0, 3).toUpperCase();
  return { day, month };
};

export const EventCard = memo(function EventCard({ event, isRsvped, onRsvp }) {
  const categoryStyle = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.silaturahim;
  const { day, month } = parseIndoDate(event.date);

  return (
    <div className="border border-primary/10 rounded-2xl p-4 bg-card/60 backdrop-blur-xs flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between text-xs hover:border-secondary/35 hover:shadow-md transition-all duration-300">
      
      {/* Date & Details block */}
      <div className="flex gap-4 items-center min-w-0 flex-1 text-left">
        {/* Left Side: Premium Ticket Date Block */}
        <div className="bg-gradient-to-b from-primary to-[#062416] text-white border border-secondary/30 rounded-xl w-14 h-14 flex flex-col justify-center items-center text-center shrink-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/80" />
          <span className="text-base font-bold font-mono text-secondary leading-none pt-1">{day}</span>
          <span className="text-[8px] font-bold tracking-widest uppercase mt-0.5 text-white/80">{month}</span>
        </div>

        {/* Center: Event Details */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${categoryStyle} text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider`}>
              {event.category}
            </span>
          </div>
          <h5 className="font-bold text-primary text-sm leading-tight truncate">{event.title}</h5>
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="truncate">{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          {event.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>

      {/* RSVP Button */}
      <div className="shrink-0 flex items-center justify-stretch sm:justify-end">
        <button
          onClick={() => onRsvp(event.id)}
          className={`py-2 px-4 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer border w-full sm:w-auto text-center flex items-center justify-center gap-1 shadow-sm ${
            isRsvped
              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
              : 'btn-primary'
          }`}
          style={{ minHeight: '40px' }}
        >
          {isRsvped ? '✓ Anda Akan Hadir' : 'RSVP Kehadiran'}
        </button>
      </div>
    </div>
  );
});
