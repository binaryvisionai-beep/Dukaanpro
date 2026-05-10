import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortest = Math.min(width, height);
    const isTablet = shortest >= 768;
    const isDesktop = width >= 1100;
    const isSmallCoverScreen = width <= 380;
    const isFoldable = width >= 540 && width < 900;
    const columns = isDesktop ? 4 : isTablet ? 3 : 1;
    return {
      width,
      height,
      isTablet,
      isDesktop,
      isSmallCoverScreen,
      isFoldable,
      columns,
      contentMaxWidth: isDesktop ? 1280 : isTablet ? 980 : 760,
      horizontalPadding: isSmallCoverScreen ? 12 : 16,
    };
  }, [width, height]);
}
