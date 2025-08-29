export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  foto_url?: string;
  email_verificado?: boolean;
  estado?: boolean;
  rolid: number;
  fechacreacion?: string;
  fechaactualizacion?: string;
  calle_tipo?: string;    // Ej: Av., Jr., Psj.
  calle_nombre?: string;  // Nombre de la calle
  calle_numero?: string;  // Número de la calle
  ciudad?: string;
  departamento?: string;
  telefono?: string;
  contacto_nombre?: string;
  contacto_numero?: string;
  correo_alternativo?: string;
}
