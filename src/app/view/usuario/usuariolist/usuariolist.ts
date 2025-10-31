import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Rol } from '../../../core/models/rol.model';
import { RouterModule } from '@angular/router';
import { Usuarioform } from '../usuarioform/usuarioform';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';


@Component({
  selector: 'app-usuariolist',
  standalone: true,
  imports: [CommonModule, RouterModule, Usuarioform, FormsModule],
  templateUrl: './usuariolist.html',
  styleUrls: ['./usuariolist.css'],
})
export class Usuariolist implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  mostrarModal = false;
  usuarioEditandoId: number | null = null;
  filtroTexto: string = '';
  filtroFecha: string = '';
  filtroEstado: string = '';
  usuariosOriginales: Usuario[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.cargarUsuarios(); 
      },
      error: (err) => console.error('Error al obtener roles', err),
    });
  }
  filtrar(): void {
    this.usuarios = this.usuariosOriginales.filter(usuario => {
      const coincideTexto =
        usuario.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const coincideFecha = this.filtroFecha
        ? formatDate(usuario.fechacreacion || '', 'yyyy-MM-dd', 'en-US') === this.filtroFecha
        : true;

      const coincideEstado =
        this.filtroEstado === ''
          ? true
          : usuario.estado === (this.filtroEstado === 'true');

      return coincideTexto && coincideFecha && coincideEstado;
    });
  }



  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuariosOriginales = data;
        this.filtrar();
      },
      error: (err) => console.error('Error al listar usuarios', err),
    });
  }

  obtenerNombreRol(rolid: number): string {
    const rol = this.roles.find((r) => r.id === rolid);
    return rol ? rol.nombre : 'Sin rol';
  }

  abrirModal(id?: number): void {
    this.usuarioEditandoId = id ?? null;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioEditandoId = null;
    this.cargarUsuarios();
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usuarioService.eliminar(id).subscribe(() => this.cargarUsuarios());
    }
  }

  formatearFecha(fecha?: string | null): string {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString();
}


  



}
