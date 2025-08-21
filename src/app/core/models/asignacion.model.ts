// src/app/models/asignacion.model.ts

export interface AsignacionBase {
  carreraid: number;
  plan: string;
  ciclo: string;
  modalidad?: string;
  cantidad_secciones: number;
  secciones_asignadas?: number;
  estado?: boolean;
  fecha_inicio?: Date;
}

export interface AsignacionCreate extends AsignacionBase {}

export interface AsignacionUpdate {
  plan?: string;
  ciclo?: string;
  modalidad?: string;
  cantidad_secciones?: number;
  secciones_asignadas?: number;
  estado?: boolean;
  fecha_inicio?: Date;
}

export interface AsignacionUpdateSecciones {
  cantidad_secciones: number;
}

export interface AsignacionUpdateEstado {
  estado: boolean;
}

export interface AsignacionResponse extends AsignacionBase {
  id: number;
  fecha_asignacion: Date;
  fecha_modificada: Date;
}

// -------- Relación AsignaciónCursoDocente --------
export interface AsignacionCursoDocenteBase {
  asignacion_id: number;
  curso_id: number;
  docente_id: number;
}

export interface AsignacionCursoDocenteCreate extends AsignacionCursoDocenteBase {}

export interface AsignacionCursoDocenteResponse extends AsignacionCursoDocenteBase {
  id: number;
}
