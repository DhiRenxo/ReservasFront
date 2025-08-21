import { Docente } from '../models/docente.model';


export interface AsignacionBase {
  carreraid: number;
  plan: string;
  ciclo: string;
  modalidad?: string;
  cantidad_secciones: number;
  secciones_asignadas?: number;
  estado?: boolean;
  fecha_inicio?: string | null;

}

export interface AsignacionCreate extends AsignacionBase {}

export interface AsignacionUpdate {
  plan?: string;
  ciclo?: string;
  modalidad?: string;
  cantidad_secciones?: number;
  secciones_asignadas?: number;
  estado?: boolean;
  fecha_inicio?: string | null;

}

export interface AsignacionUpdateSecciones {
  cantidad_secciones: number;
}

export interface AsignacionUpdateEstado {
  estado: boolean;
}

export interface AsignacionResponse extends AsignacionBase {
  id: number;
  fecha_asignacion: string;
  fecha_modificada: string;
}

export interface AsignacionCursoDocenteBase {
  asignacion_id: number;
  curso_id: number;
  docente_id: number;
}

export interface AsignacionCursoDocenteCreate extends AsignacionCursoDocenteBase {}

export interface AsignacionCursoDocenteResponse extends AsignacionCursoDocenteBase {
  id: number;
}

export interface DocenteUpdate {
  curso_id: number;
  docente_id: number;
}

export interface CursosUpdate {
  curso_ids: number[]; 
}

