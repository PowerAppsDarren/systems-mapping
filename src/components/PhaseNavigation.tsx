import { useNavigate, useLocation } from 'react-router-dom';
import { PHASES, type PhaseType } from '../types';
import { useProject } from '../context/ProjectContext';
import './PhaseNavigation.css';

export function PhaseNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject } = useProject();

  if (!currentProject) return null;

  const handlePhaseClick = (phaseId: PhaseType) => {
    const phaseKey = `${phaseId}Phase` as keyof typeof currentProject;
    const phaseData = currentProject[phaseKey];

    // Check if phase is unlocked
    if (typeof phaseData === 'object' && phaseData !== null && 'status' in phaseData) {
      if (phaseData.status !== 'locked') {
        navigate(`/project/${phaseId}`);
      }
    }
  };

  const getPhaseStatus = (phaseId: PhaseType) => {
    const phaseKey = `${phaseId}Phase` as keyof typeof currentProject;
    const phaseData = currentProject[phaseKey];

    if (typeof phaseData === 'object' && phaseData !== null && 'status' in phaseData) {
      return phaseData.status;
    }
    return 'locked';
  };

  const isCurrentPhase = (phaseId: PhaseType) => {
    return location.pathname.includes(`/project/${phaseId}`);
  };

  return (
    <nav className="phase-navigation">
      <div className="phase-navigation-inner">
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const isCurrent = isCurrentPhase(phase.id);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';

          return (
            <div key={phase.id} className="phase-nav-item-wrapper">
              <button
                className={`phase-nav-item ${isCurrent ? 'current' : ''} ${
                  isLocked ? 'locked' : ''
                } ${isCompleted ? 'completed' : ''}`}
                onClick={() => handlePhaseClick(phase.id)}
                disabled={isLocked}
                title={phase.description}
              >
                <div className="phase-number">{phase.order}</div>
                <div className="phase-info">
                  <div className="phase-name">{phase.name}</div>
                  <div className="phase-status-indicator">
                    {isCompleted && <span className="status-badge completed">✓</span>}
                    {isLocked && <span className="status-badge locked">🔒</span>}
                    {!isLocked && !isCompleted && status === 'in_progress' && (
                      <span className="status-badge in-progress">●</span>
                    )}
                  </div>
                </div>
              </button>
              {index < PHASES.length - 1 && (
                <div className={`phase-connector ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
