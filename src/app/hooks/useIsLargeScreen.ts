import { useEffect, useState } from 'react';

export const useIsLargeScreen = (breakpoint = 1280) => {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsLarge(window.innerWidth >= breakpoint);
    checkScreen(); 
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, [breakpoint]);

  return isLarge;
};
