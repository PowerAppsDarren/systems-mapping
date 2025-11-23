// Core data types for the System Mapping Toolkit

export type PhaseType = 'frame' | 'explore' | 'map' | 'reflect' | 'leverage';

export type PhaseStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

// Frame Phase Types
export interface ResearchQuestion {
  id: string;
  text: string;
  createdAt: string;
}

export interface SystemGoal {
  id: string;
  text: string;
  priority?: number;
  createdAt: string;
}

export interface FramePhase {
  context: string;
  problemStatement: string;
  researchQuestions: ResearchQuestion[];
  goals: SystemGoal[];
  status: PhaseStatus;
}

// Explore Phase Types
export interface MainVariable {
  name: string;
  definition: string;
}

export interface Variable {
  id: string;
  name: string;
  description?: string;
  clusterId?: string;
  createdAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  color: string;
  variables: string[]; // Array of variable IDs
  createdAt: string;
}

export interface ExplorePhase {
  mainVariable: MainVariable;
  variables: Variable[];
  clusters: Cluster[];
  notes: string;
  status: PhaseStatus;
}

// Map Phase Types
export interface MapVariable {
  id: string;
  variableId: string; // Reference to Variable from Explore phase
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: Record<string, any>;
}

export type ConnectionPolarity = 'positive' | 'negative';

export interface Connection {
  id: string;
  source: string; // Variable ID
  target: string; // Variable ID
  polarity: ConnectionPolarity;
  label?: string;
  style?: Record<string, any>;
}

export type FeedbackLoopType = 'reinforcing' | 'balancing';

export interface FeedbackLoop {
  id: string;
  name: string;
  type: FeedbackLoopType;
  variables: string[]; // Ordered array of variable IDs in the loop
  description?: string;
  style?: Record<string, any>;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  variables: string[]; // Array of variable IDs in this region
  color: string;
  backgroundColor?: string;
  description?: string;
  createdAt: string;
}

export interface MapPhase {
  variables: MapVariable[];
  connections: Connection[];
  feedbackLoops: FeedbackLoop[];
  regions: Region[];
  status: PhaseStatus;
}

// Reflect Phase Types
export interface RegionStory {
  id: string;
  regionId: string;
  dynamics: string;
  feedbackLoops: string[]; // Array of feedback loop IDs referenced
  createdAt: string;
}

export interface StakeholderFeedback {
  id: string;
  stakeholder: string;
  feedback: string;
  date: string;
  category?: 'resonates' | 'inaccurate' | 'missing_perspective';
}

export interface ReflectPhase {
  insights: string;
  regionStories: RegionStory[];
  coreSystemsStory: string;
  stakeholderFeedback: StakeholderFeedback[];
  status: PhaseStatus;
}

// Leverage Phase Types
export type AnalysisMarkerType =
  | 'ripple_effect'
  | 'frozen_area'
  | 'potential_for_change'
  | 'positive_change_happening';

export interface AnalysisMarker {
  id: string;
  type: AnalysisMarkerType;
  variableId?: string;
  feedbackLoopId?: string;
  regionId?: string;
  notes: string;
  createdAt: string;
}

export interface LeveragePoint {
  id: string;
  name: string;
  description: string;
  locationRef: {
    type: 'variable' | 'feedback_loop' | 'region';
    id: string;
  };
  shortTermInfluence: string;
  longTermImpact: string;
  brainstormingQuestions: string[];
  priority?: number;
  feasibilityScore?: number;
  impactScore?: number;
  createdAt: string;
}

export interface LeveragePhase {
  systemVision: string;
  analysisMarkers: AnalysisMarker[];
  leveragePoints: LeveragePoint[];
  status: PhaseStatus;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  currentPhase: PhaseType;

  framePhase: FramePhase;
  explorePhase: ExplorePhase;
  mapPhase: MapPhase;
  reflectPhase: ReflectPhase;
  leveragePhase: LeveragePhase;
}

// Phase information for navigation
export interface PhaseInfo {
  id: PhaseType;
  name: string;
  description: string;
  order: number;
}

export const PHASES: PhaseInfo[] = [
  {
    id: 'frame',
    name: 'Frame',
    description: 'Define context, problems, and research questions',
    order: 1,
  },
  {
    id: 'explore',
    name: 'Explore',
    description: 'Identify and organize system variables',
    order: 2,
  },
  {
    id: 'map',
    name: 'Map',
    description: 'Visualize relationships and feedback loops',
    order: 3,
  },
  {
    id: 'reflect',
    name: 'Reflect',
    description: 'Synthesize insights and create narratives',
    order: 4,
  },
  {
    id: 'leverage',
    name: 'Leverage',
    description: 'Identify points for positive change',
    order: 5,
  },
];
