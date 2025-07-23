export interface CursoModel {
  id?: number;
  codigo: string;
  nombre: string;
  horas: number;
  ciclo: string;
  plan: string;
  carreid: number;
  estado?: boolean; 
}
