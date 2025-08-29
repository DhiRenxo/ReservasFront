export type Modalidad = 'PRESENCIAL' | 'SEMIPRESENCIAL' | 'DISTANCIA';
export type Turno = 'Mañana' | 'Tarde' | 'Noche';

export interface Horario {
  hora_inicio: string; // formato "HH:mm"
  hora_fin: string;    // formato "HH:mm"
}

export interface DisponibilidadDocente {
  id?: number;
  docente_id: number;
  dia: string;
  modalidad: Modalidad;
  turno: Turno;
  horarios: Horario[];   // <-- ahora es un array
}

export interface DisponibilidadDocenteCreate {
  docente_id: number;
  dia: string;
  modalidad: Modalidad;
  turno: Turno;
  horarios: Horario[];   // <-- requerido para crear
}

export interface DisponibilidadDocenteUpdate {
  dia?: string;
  modalidad?: Modalidad;
  turno?: Turno;
  horarios?: Horario[];  // <-- opcional en update
}

// Opcional: estructuras para UI de selección de bloques
export interface BloqueHorario {
  inicio: string;
  fin: string;
  seleccionado: boolean;
}

export interface DisponibilidadDia {
  dia: string;
  bloques: BloqueHorario[];
}
