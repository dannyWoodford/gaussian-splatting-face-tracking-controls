import React, { createContext, useContext, useMemo, ReactNode, useState } from 'react';

type CanvasContextType = {
	isDev: boolean;
	canvasLoaded: boolean;
	setCanvasLoaded: (canvasLoaded: boolean) => void;
	hideOverlay: boolean;
	setHideOverlay: (hideOverlay: boolean) => void;
	sceneCount: number;
	sceneIndex: number;
	setSceneIndex: (sceneIndex: number) => void;
	scrollNumber: number;
	setScrollNumber: (scrollNumber: number) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
	children: ReactNode;
}

const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
	const isDev = process.env.NODE_ENV === 'development';
	const [canvasLoaded, setCanvasLoaded] = useState(false);
	const [hideOverlay, setHideOverlay] = useState(false);
	
	const sceneCount = 3;
	const [sceneIndex, setSceneIndex] = useState(0);

	// ____ Simulate OrbitControl Zoom _________________________________________________________________________________
	const [scrollNumber, setScrollNumber] = useState(7)

	const value = useMemo(() => ({ isDev, canvasLoaded, setCanvasLoaded, hideOverlay, setHideOverlay, sceneIndex, setSceneIndex, sceneCount, scrollNumber, setScrollNumber }), [isDev, canvasLoaded, hideOverlay, sceneIndex, scrollNumber]);

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
