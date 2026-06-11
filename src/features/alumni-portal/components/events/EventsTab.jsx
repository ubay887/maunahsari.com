import { EventList } from './EventList';

export function EventsTab({ children }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {children || <EventList />}
    </div>
  );
}
