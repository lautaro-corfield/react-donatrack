export interface Supervisor {
  id: string;
  email: string;
  createdAt: string;
  activo?: boolean;
}

export interface CreateSupervisorDTO {
  email: string;
}

export interface SupervisoresState {
  supervisores: Supervisor[];
  isLoading: boolean;
  error: string | null;
  fetchSupervisores: () => Promise<Supervisor[]>;
  createSupervisor: (data: CreateSupervisorDTO) => Promise<Supervisor>;
  clearError: () => void;
}
