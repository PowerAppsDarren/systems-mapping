import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Project, PhaseType } from '../types';
import { createEmptyProject, touchProject, isPhaseComplete } from '../utils/projectUtils';
import {
  getAllProjects,
  saveProject as saveProjectToStorage,
  deleteProject as deleteProjectFromStorage,
  getCurrentProjectId,
  setCurrentProject as setCurrentProjectInStorage,
  clearCurrentProject,
} from '../utils/storage';

interface ProjectContextType {
  // Current project state
  currentProject: Project | null;
  allProjects: Project[];

  // Project management
  createProject: (title: string) => void;
  loadProject: (id: string) => void;
  saveProject: () => void;
  deleteProject: (id: string) => void;
  updateProject: (updates: Partial<Project>) => void;

  // Phase management
  goToPhase: (phase: PhaseType) => void;
  completePhase: (phase: PhaseType) => void;

  // Auto-save
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [autoSave, setAutoSave] = useState(true);

  // Load all projects and current project on mount
  useEffect(() => {
    const projects = getAllProjects();
    setAllProjects(projects);

    const currentId = getCurrentProjectId();
    if (currentId) {
      const project = projects.find((p) => p.id === currentId);
      if (project) {
        setCurrentProject(project);
      } else {
        clearCurrentProject();
      }
    }
  }, []);

  // Auto-save current project when it changes
  useEffect(() => {
    if (autoSave && currentProject) {
      const timer = setTimeout(() => {
        saveProjectToStorage(currentProject);
        setAllProjects(getAllProjects());
      }, 1000); // Debounce auto-save by 1 second

      return () => clearTimeout(timer);
    }
  }, [currentProject, autoSave]);

  const createProject = useCallback((title: string) => {
    const newProject = createEmptyProject(title);
    setCurrentProject(newProject);
    setCurrentProjectInStorage(newProject.id);
    saveProjectToStorage(newProject);
    setAllProjects(getAllProjects());
  }, []);

  const loadProject = useCallback((id: string) => {
    const projects = getAllProjects();
    const project = projects.find((p) => p.id === id);
    if (project) {
      setCurrentProject(project);
      setCurrentProjectInStorage(id);
    }
  }, []);

  const saveProject = useCallback(() => {
    if (currentProject) {
      saveProjectToStorage(currentProject);
      setAllProjects(getAllProjects());
    }
  }, [currentProject]);

  const deleteProject = useCallback((id: string) => {
    deleteProjectFromStorage(id);
    setAllProjects(getAllProjects());

    if (currentProject?.id === id) {
      setCurrentProject(null);
      clearCurrentProject();
    }
  }, [currentProject]);

  const updateProject = useCallback((updates: Partial<Project>) => {
    if (currentProject) {
      const updatedProject = touchProject({
        ...currentProject,
        ...updates,
      });
      setCurrentProject(updatedProject);
    }
  }, [currentProject]);

  const goToPhase = useCallback((phase: PhaseType) => {
    if (currentProject) {
      updateProject({ currentPhase: phase });
    }
  }, [currentProject, updateProject]);

  const completePhase = useCallback((phase: PhaseType) => {
    if (!currentProject) return;

    const phaseKey = `${phase}Phase` as keyof Project;
    const phaseData = currentProject[phaseKey];

    if (typeof phaseData === 'object' && phaseData !== null && 'status' in phaseData) {
      const isComplete = isPhaseComplete(currentProject, phase);

      if (isComplete) {
        const updatedPhaseData = {
          ...phaseData,
          status: 'completed' as const,
        };

        // Unlock next phase
        let nextPhaseData = null;
        let nextPhaseKey = null;

        switch (phase) {
          case 'frame':
            nextPhaseKey = 'explorePhase';
            nextPhaseData = { ...currentProject.explorePhase, status: 'unlocked' as const };
            break;
          case 'explore':
            nextPhaseKey = 'mapPhase';
            nextPhaseData = { ...currentProject.mapPhase, status: 'unlocked' as const };
            break;
          case 'map':
            nextPhaseKey = 'reflectPhase';
            nextPhaseData = { ...currentProject.reflectPhase, status: 'unlocked' as const };
            break;
          case 'reflect':
            nextPhaseKey = 'leveragePhase';
            nextPhaseData = { ...currentProject.leveragePhase, status: 'unlocked' as const };
            break;
        }

        const updates: any = {
          [phaseKey]: updatedPhaseData,
        };

        if (nextPhaseKey && nextPhaseData) {
          updates[nextPhaseKey] = nextPhaseData;
        }

        updateProject(updates);
      }
    }
  }, [currentProject, updateProject]);

  const value: ProjectContextType = {
    currentProject,
    allProjects,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    updateProject,
    goToPhase,
    completePhase,
    autoSave,
    setAutoSave,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
