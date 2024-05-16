import './css/main.scss'
import './js/3d/Scene'

import { CanvasProvider } from './context/CanvasContext'
import CanvasContainer from './js/CanvasContainer'

function App() {
  return (
		<div className="App">
			<CanvasProvider>
				<CanvasContainer />
			</CanvasProvider>
			</div>
  );
}

export default App;
