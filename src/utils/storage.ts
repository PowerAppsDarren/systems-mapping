import type { Project } from '../types';
import { validateProject } from './projectUtils';

const STORAGE_KEY = 'system-mapping-projects';
const CURRENT_PROJECT_KEY = 'system-mapping-current-project';

/**
 * Gets all projects from local storage
 */
export function getAllProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const projects = JSON.parse(stored);
    return Array.isArray(projects) ? projects.filter(validateProject) : [];
  } catch (error) {
    console.error('Error loading projects from storage:', error);
    return [];
  }
}

/**
 * Gets a single project by ID
 */
export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * Saves a project to local storage
 */
export function saveProject(project: Project): void {
  try {
    const projects = getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project to storage:', error);
    throw new Error('Failed to save project');
  }
}

/**
 * Deletes a project from local storage
 */
export function deleteProject(id: string): void {
  try {
    const projects = getAllProjects();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear current project if it was deleted
    const currentId = getCurrentProjectId();
    if (currentId === id) {
      clearCurrentProject();
    }
  } catch (error) {
    console.error('Error deleting project from storage:', error);
    throw new Error('Failed to delete project');
  }
}

/**
 * Gets the ID of the currently active project
 */
export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

/**
 * Sets the currently active project
 */
export function setCurrentProject(id: string): void {
  localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

/**
 * Clears the currently active project
 */
export function clearCurrentProject(): void {
  localStorage.removeItem(CURRENT_PROJECT_KEY);
}

/**
 * Exports a project as JSON
 */
export function exportProjectAsJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Imports a project from JSON
 */
export function importProjectFromJson(json: string): Project {
  try {
    const project = JSON.parse(json);
    if (!validateProject(project)) {
      throw new Error('Invalid project data');
    }
    return project;
  } catch (error) {
    console.error('Error importing project:', error);
    throw new Error('Failed to import project. Invalid JSON format.');
  }
}

/**
 * Downloads a project as a JSON file
 */
export function downloadProject(project: Project): void {
  const json = exportProjectAsJson(project);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
