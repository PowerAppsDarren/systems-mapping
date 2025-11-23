import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import './FramePhase.css';

interface PlaceholderPhaseProps {
  title: string;
  description: string;
  previousPhase?: string;
}

export function PlaceholderPhase({ title, description, previousPhase }: PlaceholderPhaseProps) {
  const navigate = useNavigate();
  const { currentProject } = useProject();

  if (!currentProject) {
    navigate('/');
    return null;
  }

  return (
    <Layout showPhaseNavigation>
      <div className="phase-page">
        <div className="phase-header">
          <h1>{title}</h1>
          <p className="phase-description">{description}</p>
        </div>

        <div className="phase-content">
          <section className="phase-section">
            <div className="section-header">
              <h2>Coming Soon</h2>
            </div>
            <div className="help-text">
              <p>
                This phase is currently under development. The full functionality will be available
                soon.
              </p>
            </div>
          </section>

          <div className="phase-actions">
            {previousPhase && (
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/project/${previousPhase}`)}
              >
                ← Back to {previousPhase.charAt(0).toUpperCase() + previousPhase.slice(1)}
              </button>
            )}
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
