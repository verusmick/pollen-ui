import { useEffect, useState, useCallback } from 'react';

export const useIsLargeScreen = (breakpoint = 1280) => {
  const [isLarge, setIsLarge] = useState(false);

  const checkScreen = useCallback(() => {
    setIsLarge(window.innerWidth >= breakpoint);
  }, [breakpoint]);

  useEffect(() => {
    checkScreen(); 
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, [checkScreen]);

  return isLarge;
};
