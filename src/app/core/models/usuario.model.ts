export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  foto_url?: string | null;
  email_verificado?: boolean | null;
  estado?: boolean | null;
  rolid: number;
  fechacreacion?: string | null;
  fechaactualizacion?: string | null;
  calle_tipo?: string | null;
  calle_nombre?: string | null;
  calle_numero?: string | null;
  ciudad?: string | null;
  departamento?: string | null;
  telefono?: string | null;

  contacto_nombre?: string | null;
  contacto_numero?: string | null;
  correo_alternativo?: string | null;

  cod_docente?: string | null;
}
