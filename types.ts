export enum View {
  DATA_INPUT = 'DATA_INPUT',
  CONFIGURATION = 'CONFIGURATION',
  TIMETABLE = 'TIMETABLE',
  RESULTS = 'RESULTS',
}

export enum Page {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  LOGIN = 'LOGIN',
  APP = 'APP',
}

export enum Algorithm {
  GENETIC_ALGORITHM = 'GENETIC_ALGORITHM',
  SIMULATED_ANNEALING = 'SIMULATED_ANNEALING',
}

export interface Department {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  departmentId: string;
  students: number;
  units: number;
}

export interface Room {
  id: string;
  capacity: number;
}

export interface Constraint {
  id: string;
  description: string;
  type: 'Hard' | 'Soft';
  enabled: boolean;
}

export interface AlgorithmParameters {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  generations: number;
  initialTemperature: number;
  coolingRate: number;
}

export interface TimetableEntry {
  course: Course;
  room: Room;
  day: string;
  timeSlot: string;
}

export type Timetable = TimetableEntry[];

export interface GenerationResult {
  timetable: Timetable;
  metrics: {
    generationTime: number; // in ms
    hardConstraintViolations: number;
    softConstraintViolations: number;
    fitnessHistory: { iteration: number; fitness: number }[];
  };
}

export interface AppState {
  departments: Department[];
  courses: Course[];
  rooms: Room[];
  constraints: Constraint[];
  startingDate: string;
  algorithm: Algorithm;
  params: AlgorithmParameters;
  isGenerating: boolean;
  generationProgress: number;
  generationResult: GenerationResult | null;
  isAuthenticated: boolean;
  currentPage: Page;
  activeView: View;
}
