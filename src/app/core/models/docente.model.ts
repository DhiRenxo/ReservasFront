export interface Docente {
  id: number;
  nombre: string;
  codigo: string;
  estado: boolean;
  tipocontrato: string;
  horassemanal: number;
  horasactual?: number;
  horastemporales?: number;
  horastotales?: number;
  horasdejara?: number;
  observaciones?: string;
}
