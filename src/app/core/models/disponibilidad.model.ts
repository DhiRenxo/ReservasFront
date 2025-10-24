// models/disponibilidad.model.ts
export interface Horario {
  hora_inicio: string; // formato "HH:MM"
  hora_fin: string;
}

export interface DisponibilidadDocenteBase {
  dia: string;
  modalidad: string;
  turno: string;
  horarios: Horario[];
}

export interface DisponibilidadDocenteCreate extends DisponibilidadDocenteBase {}

export interface DisponibilidadDocenteUpdate {
  dia?: string;
  modalidad?: string;
  turno?: string;
  horarios?: Horario[];
}

export interface DisponibilidadDocenteResponse extends DisponibilidadDocenteBase {
  id: number;
  docente_id: number;
}

export type Modalidad = 'PRESENCIAL' | 'DISTANCIA' | 'SEMIPRESENCIAL';
export type Turno = 'Mañana' | 'Tarde' | 'Noche';
