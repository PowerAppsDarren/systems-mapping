import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import { downloadProject } from '../utils/storage';
import { formatDistanceToNow } from 'date-fns';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { allProjects, createProject, loadProject, deleteProject } = useProject();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      createProject(newProjectTitle.trim());
      setShowNewProjectModal(false);
      setNewProjectTitle('');
      navigate('/project/frame');
    }
  };

  const handleOpenProject = (projectId: string) => {
    loadProject(projectId);
    const project = allProjects.find((p) => p.id === projectId);
    if (project) {
      navigate(`/project/${project.currentPhase}`);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId);
    }
  };

  const handleExportProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = allProjects.find((p) => p.id === projectId);
    if (project) {
      downloadProject(project);
    }
  };

  return (
    <Layout>
      <div className="home-page">
        <div className="home-header">
          <div>
            <h1>System Mapping Projects</h1>
            <p>Create and manage your system mapping projects</p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowNewProjectModal(true)}
          >
            + New Project
          </button>
        </div>

        {allProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h2>No projects yet</h2>
            <p>
              Get started by creating your first system mapping project. You'll be guided through
              a structured five-phase process to analyze complex systems and identify leverage points
              for positive change.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowNewProjectModal(true)}
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {allProjects
              .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
              .map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className="project-card-header">
                    <h3>{project.title}</h3>
                    <div className="project-actions">
                      <button
                        className="btn-icon"
                        onClick={(e) => handleExportProject(project.id, e)}
                        title="Export project"
                      >
                        ⬇
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        title="Delete project"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="project-meta">
                    <span className="project-current-phase">
                      Current phase: <strong>{project.currentPhase}</strong>
                    </span>
                    <span className="project-date">
                      Modified {formatDistanceToNow(new Date(project.modifiedAt), { addSuffix: true })}
                    </span>
                  </div>

                  {project.framePhase.problemStatement && (
                    <p className="project-description">
                      {project.framePhase.problemStatement.substring(0, 150)}
                      {project.framePhase.problemStatement.length > 150 ? '...' : ''}
                    </p>
                  )}

                  <div className="project-progress">
                    <div className="progress-label">Progress</div>
                    <div className="progress-bar">
                      {['frame', 'explore', 'map', 'reflect', 'leverage'].map((phase) => {
                        const phaseKey = `${phase}Phase` as keyof typeof project;
                        const phaseData = project[phaseKey];
                        const isCompleted =
                          typeof phaseData === 'object' &&
                          phaseData !== null &&
                          'status' in phaseData &&
                          phaseData.status === 'completed';

                        return (
                          <div
                            key={phase}
                            className={`progress-segment ${isCompleted ? 'completed' : ''}`}
                            title={phase}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {showNewProjectModal && (
          <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Project</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <label htmlFor="project-title">Project Title</label>
                <input
                  id="project-title"
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g., Healthcare System Analysis"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject();
                    }
                  }}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateProject}
                  disabled={!newProjectTitle.trim()}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
