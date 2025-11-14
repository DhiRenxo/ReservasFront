import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { RolService } from '../../core/services/rol.service';
import { Rol } from '../../core/models/rol.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  isCollapsed = false;
  isMobile = false;
  sidebarOpen = false;   
  showOverlay = false;
  usuario!: Usuario;
  roles: Rol[] = [];

  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @HostListener('window:resize')

  menu = [
    { label: 'Home', icon: 'fas fa-home', route: '/app/home' },
    { label: 'Usuarios', icon: 'fas fa-users', route: '/app/usuarios' },
    { label: 'Docentes', icon: 'fas fa-chalkboard-teacher', route: '/app/docente' },
    {
      label: 'Asignación', icon: 'fas fa-random', expanded: false, items: [
        { label: 'AsignacionCreacion', icon: 'fas fa-plus-circle', route: '/app/asignacion-creacion' },
        { label: 'AsignacionDocente', icon: 'fas fa-user-tie', route: '/app/asignacion-docente' },
        { label: 'AsignacionValidacion', icon: 'fas fa-check-circle', route: '/app/asignacion-validacion' }
      ]
    },
    { label: 'Ambiente', icon: 'fas fa-building', route: '/app/ambiente' },
    {
      label: 'Sección Académica', icon: 'fas fa-graduation-cap', expanded: false, items: [
        { label: 'Curso', icon: 'fas fa-book', route: '/app/curso' },
        { label: 'Sección', icon: 'fas fa-graduation-cap', route: '/app/seccion' },
        { label: 'Escuela', icon: 'fas fa-university', route: '/app/carrera' }
      ]
    },
    { label: 'Reportes', icon: 'fas fa-file-alt', route: '/reporte' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    this.detectarPantalla();
    window.addEventListener('resize', () => this.detectarPantalla());

    const userId = this.authService.getUserIdFromToken();

    this.rolService.getAll().subscribe({ next: r => this.roles = r });
    if (userId) {
      this.usuarioService.obtener(userId).subscribe({ next: u => this.usuario = u });
    }
  }

  detectarPantalla() {
    this.isMobile = window.innerWidth < 1024;

    if (this.isMobile) {
      this.isCollapsed = false; 
      this.sidebarOpen = false;   // cerrado por defecto en móvil
    } else {
      this.sidebarOpen = true;    // siempre abierto en desktop
    }
  }
  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  closeSidebarMobile() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  autoCloseOnMobile() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  obtenerRolTexto(rolid: number): string {
    const rol = this.roles.find(r => r.id === rolid);
    return rol ? rol.nombre : 'Usuario';
  }
}
