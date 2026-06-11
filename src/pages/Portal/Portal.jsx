import { useAuth } from '@/features/auth';
import { SantriDashboard } from '@/features/santri-portal';
import { AlumniDashboard } from '@/features/alumni-portal';

export default function PortalPage() {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) {
    return null;
  }

  return userRole === 'santri' ? <SantriDashboard /> : <AlumniDashboard />;
}
