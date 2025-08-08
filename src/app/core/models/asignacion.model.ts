import { CursoModel } from './Curso.model';
import { Docente } from './docente.model';

export interface AsignacionBase {
  carreraid: number;
  plan: string;
  ciclo: string;
  modalidad: string;
  cantidad_secciones: number;
  secciones_asignadas: number;
  estado?: boolean;
}

export interface AsignacionCreate extends AsignacionBase {
  curso_ids: number[];
  docente_ids?: number[];
}

export interface AsignacionUpdate extends AsignacionBase {
  curso_ids?: number[];
  docente_ids?: number[];
}

export interface AsignacionEstadoUpdate {
  estado: boolean;
}

export interface AsignacionDelete {
  id: number;
}

export interface Asignacion extends AsignacionBase {
  id: number;
  fecha_asignacion: string;         // ISO string
  fecha_modificada?: string;
  cursos?: CursoModel[];            // Anidado desde el backend
  docentes?: Docente[];             // Anidado desde el backend
}
