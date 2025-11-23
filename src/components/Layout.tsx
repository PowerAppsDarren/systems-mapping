import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { PhaseNavigation } from './PhaseNavigation';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  showPhaseNavigation?: boolean;
}

export function Layout({ children, showPhaseNavigation = false }: LayoutProps) {
  const navigate = useNavigate();
  const { currentProject, saveProject } = useProject();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSave = () => {
    saveProject();
    // Show a brief save confirmation
    const button = document.querySelector('.save-btn');
    if (button) {
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = 'Save';
      }, 1500);
    }
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <button className="logo-button" onClick={handleLogoClick}>
              <h1 className="app-title">System Mapping Toolkit</h1>
            </button>
            {currentProject && (
              <span className="project-title">{currentProject.title}</span>
            )}
          </div>
          <div className="header-right">
            {currentProject && (
              <>
                <button className="btn btn-outline btn-sm save-btn" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/')}
                >
                  Projects
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showPhaseNavigation && currentProject && <PhaseNavigation />}

      <main className="layout-main">{children}</main>

      <footer className="layout-footer">
        <div className="footer-content">
          <p>
            System Mapping Toolkit - A structured approach to systems thinking and analysis
          </p>
          <p className="footer-note">
            Auto-save enabled • All data stored locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
