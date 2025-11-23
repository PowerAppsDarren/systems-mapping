import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { Home } from './pages/Home';
import { FramePhase } from './pages/FramePhase';
import { ExplorePhase } from './pages/ExplorePhase';
import { MapPhase } from './pages/MapPhase';
import { ReflectPhase } from './pages/ReflectPhase';
import { LeveragePhase } from './pages/LeveragePhase';

function App() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/frame" element={<FramePhase />} />
          <Route path="/project/explore" element={<ExplorePhase />} />
          <Route path="/project/map" element={<MapPhase />} />
          <Route path="/project/reflect" element={<ReflectPhase />} />
          <Route path="/project/leverage" element={<LeveragePhase />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProjectProvider>
    </BrowserRouter>
  );
}

export default App;
