import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { Home } from './pages/Home';
import { FramePhase } from './pages/FramePhase';
import { ExplorePhase } from './pages/ExplorePhase';
import { PlaceholderPhase } from './pages/PlaceholderPhase';

function App() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/frame" element={<FramePhase />} />
          <Route path="/project/explore" element={<ExplorePhase />} />
          <Route
            path="/project/map"
            element={
              <PlaceholderPhase
                title="Map the System"
                description="Visualize relationships, connections, and feedback loops in your system."
                previousPhase="explore"
              />
            }
          />
          <Route
            path="/project/reflect"
            element={
              <PlaceholderPhase
                title="Reflect on the System"
                description="Synthesize insights and create narratives that explain system behavior."
                previousPhase="map"
              />
            }
          />
          <Route
            path="/project/leverage"
            element={
              <PlaceholderPhase
                title="Leverage for Change"
                description="Identify points for positive intervention in your system."
                previousPhase="reflect"
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProjectProvider>
    </BrowserRouter>
  );
}

export default App;
