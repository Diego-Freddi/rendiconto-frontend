import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 992);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { 
    isMobile, 
    isTablet, 
    isDesktop: !isMobile && !isTablet,
    // Utility functions per classi comuni
    getFlexDirection: () => isMobile ? 'flex-column' : 'row',
    getTextAlign: () => isMobile ? 'center' : 'left',
    getButtonClass: () => isMobile ? 'd-grid gap-2' : 'btn-group',
    getColClass: (mobile = 12, desktop = 6) => `col-${mobile} col-md-${desktop}`
  };
}; 