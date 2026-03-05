export interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  approach: string[];
  deliverables: Deliverable[];
  cautions: string[];
}

export interface Deliverable {
  name: string;
  description: string;
  sample?: string;
}

export interface Methodology {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
}
