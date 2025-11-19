import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
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
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  isCollapsed = signal(false);
  isMobile = signal(false);
  sidebarOpen = signal(false);

  usuario = signal<Usuario | null>(null);
  roles = signal<Rol[]>([]);

  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

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
    private rolService: RolService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.detectarPantalla();
    window.addEventListener('resize', () => this.detectarPantalla());

    const userId = this.authService.getUserIdFromToken();

    this.rolService.getAll().subscribe({ next: r => this.roles.set(r) });
    if (userId) {
      this.usuarioService.obtener(userId).subscribe({ next: u => this.usuario.set(u) });
    }
  }

  detectarPantalla() {
    this.isMobile.set(window.innerWidth < 1024);

    if (this.isMobile()) {
      this.isCollapsed.set(false);
      this.sidebarOpen.set(false); // cerrado por defecto en móvil
    } else {
      this.sidebarOpen.set(true); // siempre abierto en desktop
    }
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen.set(!this.sidebarOpen());
    } else {
      this.isCollapsed.set(!this.isCollapsed());
    }
  }

  closeSidebarMobile() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  autoCloseOnMobile() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  obtenerRolTexto(rolid: number): string {
    const rol = this.roles().find(r => r.id === rolid);
    return rol ? rol.nombre : 'Usuario';
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
