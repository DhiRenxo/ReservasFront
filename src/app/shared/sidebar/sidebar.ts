import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, RouterModule } from '@angular/router';
import { RolService } from '../../core/services/rol.service';
import { Rol } from '../../core/models/rol.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  isCollapsed = false;
  usuario!: Usuario;
  roles: Rol[] = [];


  menu = [
    { label: 'Análisis', icon: 'fas fa-chart-bar', route: '/analisis' },
    { label: 'Usuarios', icon: 'fas fa-users', route: '/app/usuarios' },
    { label: 'Reserva', icon: 'fas fa-calendar-alt', route: '/reserva' },
    { label: 'Docentes', icon: 'fas fa-chalkboard-teacher', route: '/app/docente' },
    { label: 'Asignación', icon: 'fas fa-random', route: '/asignacion' },
    { label: 'Horario', icon: 'fas fa-clock', route: '/horario' },
    { label: 'Ambiente', icon: 'fas fa-building', route: '/ambiente' },
    {
      label: 'Sección Académica', icon: 'fas fa-graduation-cap', expanded: false, items: [
        { label: 'Curso', icon: 'fas fa-book', route: '/app/curso' },
        { label: 'Sección', icon: 'fas fa-graduation-cap', route: '/app/seccion' },
        { label: 'Escuela', icon: 'fas fa-university', route: '/app/carrera'}
      ]
    },
    { label: 'Reportes', icon: 'fas fa-file-alt', route: '/reporte' }
  ];


  constructor(private usuarioService: UsuarioService, private authService: AuthService, private rolService: RolService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromToken();

    this.rolService.getAll().subscribe({
      next: (rolesData) => this.roles = rolesData,
      error: (err) => console.error('Error al cargar los roles', err)
    });

    if (userId) {
      this.usuarioService.obtener(userId).subscribe({
        next: (data) => this.usuario = data,
        error: (err) => console.error('Error al cargar el usuario', err)
      });
    }
  }

  collapseSidebar() {
    this.isCollapsed = true;
  }

  expandSidebar() {
    this.isCollapsed = false;
  }

  obtenerRolTexto(rolid: number): string {
    const rol = this.roles.find(r => r.id === rolid);
    return rol ? rol.nombre : 'Usuario';
  }

}
