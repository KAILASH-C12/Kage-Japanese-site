import { createContext, useContext } from 'react';

export type CursorVariant = 'default' | 'interactive' | 'text' | 'button' | 'object3d' | 'hidden';

interface CursorContextValue {
  setCursorVariant: (variant: CursorVariant) => void;
  setCursorLabel: (label: string) => void;
}

export const CursorContext = createContext<CursorContextValue>({
  setCursorVariant: () => {},
  setCursorLabel: () => {},
});

export function useCursor() {
  return useContext(CursorContext);
}
