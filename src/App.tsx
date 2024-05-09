import './css/main.scss'
import './js/3d/Scene'

import { CanvasProvider } from './context/CanvasContext'
import CanvasContainer from './js/CanvasContainer'


function App() {
  return (
		<div className="App">
			<CanvasProvider>
				<header className="App-header">
					<p>
						R3F--typescript--scss--Starter_Template
					</p>
				</header>

				<CanvasContainer />
			</CanvasProvider>
			</div>
  );
}

export default App;
