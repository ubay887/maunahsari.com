import { useEffect } from 'react';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider, useAuth } from '@/features/auth';
import { Router } from '@/router';
import Header from '@/components/layouts/Header';
import Hero from '@/components/layouts/Hero';
import Footer from '@/components/layouts/Footer';
import AuthLayout from '@/components/layouts/AuthLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { SkipToContent } from '@/components/ui/SkipToContent';

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationProvider>
  );
}

function AppContent() {
  const { currentPath, navigate } = useNavigation();
  const { isLoggedIn, userRole } = useAuth();

  // Redirect and Access Control Logic
  useEffect(() => {
    if (currentPath === '/portal/santri') {
      if (!isLoggedIn) {
        navigate('login');
      } else if (userRole !== 'santri') {
        navigate('portal-alumni');
      }
    } else if (currentPath === '/portal/alumni') {
      if (!isLoggedIn) {
        navigate('login');
      } else if (userRole !== 'alumni') {
        navigate('portal-santri');
      }
    } else if (currentPath === '/login') {
      if (isLoggedIn) {
        navigate(userRole === 'santri' ? 'portal-santri' : 'portal-alumni');
      }
    }
  }, [currentPath, isLoggedIn, userRole, navigate]);

  if (currentPath === '/login') {
    return (
      <AuthLayout>
        <Router />
      </AuthLayout>
    );
  }

  if (currentPath === '/portal/santri' || currentPath === '/portal/alumni') {
    return (
      <DashboardLayout>
        <Router />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <SkipToContent />
      <Header />
      {currentPath === '/' && <Hero />}
      <main id="main-content" className="flex-grow">
        <Router />
      </main>
      <Footer />
    </div>
  );
}
