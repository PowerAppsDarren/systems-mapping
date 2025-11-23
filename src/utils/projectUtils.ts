import { v4 as uuidv4 } from 'uuid';
import type { Project, PhaseStatus } from '../types';

/**
 * Creates a new empty project with default values
 */
export function createEmptyProject(title: string = 'Untitled Project'): Project {
  const now = new Date().toISOString();
  const defaultStatus: PhaseStatus = 'unlocked';

  return {
    id: uuidv4(),
    title,
    description: '',
    createdAt: now,
    modifiedAt: now,
    currentPhase: 'frame',

    framePhase: {
      context: '',
      problemStatement: '',
      researchQuestions: [],
      goals: [],
      status: defaultStatus,
    },

    explorePhase: {
      mainVariable: {
        name: '',
        definition: '',
      },
      variables: [],
      clusters: [],
      notes: '',
      status: 'locked',
    },

    mapPhase: {
      variables: [],
      connections: [],
      feedbackLoops: [],
      regions: [],
      status: 'locked',
    },

    reflectPhase: {
      insights: '',
      regionStories: [],
      coreSystemsStory: '',
      stakeholderFeedback: [],
      status: 'locked',
    },

    leveragePhase: {
      systemVision: '',
      analysisMarkers: [],
      leveragePoints: [],
      status: 'locked',
    },
  };
}

/**
 * Checks if a phase is complete based on its required fields
 */
export function isPhaseComplete(project: Project, phase: string): boolean {
  switch (phase) {
    case 'frame':
      return (
        project.framePhase.context.trim().length > 0 &&
        project.framePhase.problemStatement.trim().length > 0 &&
        project.framePhase.researchQuestions.length > 0
      );

    case 'explore':
      return (
        project.explorePhase.mainVariable.name.trim().length > 0 &&
        project.explorePhase.mainVariable.definition.trim().length > 0 &&
        project.explorePhase.variables.length > 0
      );

    case 'map':
      return (
        project.mapPhase.variables.length > 0 &&
        project.mapPhase.connections.length > 0
      );

    case 'reflect':
      return (
        project.reflectPhase.insights.trim().length > 0 &&
        project.reflectPhase.coreSystemsStory.trim().length > 0
      );

    case 'leverage':
      return (
        project.leveragePhase.systemVision.trim().length > 0 &&
        project.leveragePhase.leveragePoints.length > 0
      );

    default:
      return false;
  }
}

/**
 * Updates the project's modified timestamp
 */
export function touchProject(project: Project): Project {
  return {
    ...project,
    modifiedAt: new Date().toISOString(),
  };
}

/**
 * Validates project data structure
 */
export function validateProject(data: any): data is Project {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.createdAt === 'string' &&
    typeof data.modifiedAt === 'string' &&
    typeof data.currentPhase === 'string' &&
    data.framePhase &&
    data.explorePhase &&
    data.mapPhase &&
    data.reflectPhase &&
    data.leveragePhase
  );
}
