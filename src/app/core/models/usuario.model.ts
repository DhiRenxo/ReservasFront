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
}
