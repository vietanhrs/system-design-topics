export type Priority = 'P0' | 'P1' | 'P2';

export interface ExampleSection {
  scenario: string;
  architecture: string[];
  flow: string[];
  tradeoffs: string[];
  failureModes: string[];
}

export interface ExerciseSection {
  prompt: string;
  tasks: string[];
  expected: string[];
}

export interface Subsection {
  id: string;
  title: string;
  summary: string;
  priority: Priority;
  duration: string;
  tags: string[];
  theory: string[];
  fastTrack: string[];
  example: ExampleSection;
  exercise: ExerciseSection;
}

export interface Level {
  id: string;
  order: number;
  title: string;
  tagline: string;
  outcome: string;
  subsections: Subsection[];
}

export interface WorkbookContent {
  title: string;
  subtitle: string;
  repoUrl?: string;
  levels: Level[];
}

