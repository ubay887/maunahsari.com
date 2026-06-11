import { useState, useCallback } from 'react';
import { DEFAULT_ALUMNI_DATA } from '../data/alumniMockData';

export function useAlumniProfile() {
  const [alumniData, setAlumniData] = useState(DEFAULT_ALUMNI_DATA);

  const updateProfile = useCallback((updates) => {
    setAlumniData(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleRadar = useCallback((enabled) => {
    setAlumniData(prev => ({ ...prev, allowRadar: enabled }));
  }, []);

  const updateGPS = useCallback((latitude, longitude) => {
    setAlumniData(prev => ({ ...prev, latitude, longitude }));
  }, []);

  return { alumniData, updateProfile, toggleRadar, updateGPS };
}
