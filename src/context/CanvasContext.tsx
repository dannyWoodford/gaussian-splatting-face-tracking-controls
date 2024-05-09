import React, { createContext, useContext, useMemo, ReactNode, useState } from 'react';

type CanvasContextType = {
  isDev: boolean;
	canvasLoaded: boolean;
	setCanvasLoaded: (canvasLoaded: boolean) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ReactNode;
}

const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const isDev = process.env.NODE_ENV === 'development';
	const [canvasLoaded, setCanvasLoaded] = useState(false);

	const value = useMemo(() => ({ isDev, canvasLoaded, setCanvasLoaded }), [isDev, canvasLoaded]);

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

export { CanvasContext, CanvasProvider, useCanvas };
