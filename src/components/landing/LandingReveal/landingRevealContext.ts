import { createContext, useContext } from 'react';

export type LandingRevealContextValue = {
  parentVisible: boolean;
  parentVisibleAt: number | null;
};

export const LandingRevealContext = createContext<LandingRevealContextValue>({
  parentVisible: false,
  parentVisibleAt: null,
});

export function useLandingRevealParent() {
  return useContext(LandingRevealContext);
}
