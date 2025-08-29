import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { Usuario } from '../../core/models/usuario.model';
import { Rol } from '../../core/models/rol.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  usuario?: Usuario;
  rol?: Rol;
  cargando = true;

  // Dirección
  calleTipo: string = 'Av.';
  calleNombre: string = '';
  calleNumero: string = '';
  ciudad: string = '';
  departamento: string = '';

  // Contacto
  telefono: string = '';
  contactoNombre: string = '';
  contactoNumero: string = '';
  correoAlternativo: string = '';

  // Admin
  todosUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroUsuario: string = '';
  usuarioSeleccionado?: Usuario;
  roles: Rol[] = [];
  rolSeleccionadoId?: number;

  // Modal roles
  modalGestionRolesVisible = false;
  modalActualizarRolesVisible = false;

  // Para crear un nuevo rol
  nuevoRolNombre: string = '';
  rolEditar?: Rol;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('usuario_id'));
    if (!userId) {
      this.cargando = false;
      return;
    }

    this.usuarioService.obtener(userId).subscribe({
      next: (user) => {
        this.usuario = user;
        if (user.rolid) {
          this.rolService.obtener(user.rolid).subscribe({
            next: (r) => {
              this.rol = r;
              if (r.nombre.toLowerCase() === 'administrador') {
                this.cargarUsuarios();
                this.cargarRoles();
              }
            }
          });
        }

        this.calleTipo = user.calle_tipo || 'Av.';
        this.calleNombre = user.calle_nombre || '';
        this.calleNumero = user.calle_numero || '';
        this.ciudad = user.ciudad || '';
        this.departamento = user.departamento || '';

        this.telefono = user.telefono || '';
        this.contactoNombre = user.contacto_nombre || '';
        this.contactoNumero = user.contacto_numero || '';
        this.correoAlternativo = user.correo_alternativo || '';

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  enviarDatos() {
    if (!this.usuario) return;
    const payload = {
      calle_tipo: this.calleTipo,
      calle_nombre: this.calleNombre,
      calle_numero: this.calleNumero,
      ciudad: this.ciudad,
      departamento: this.departamento,
      telefono: this.telefono,
      contacto_nombre: this.contactoNombre,
      contacto_numero: this.contactoNumero,
      correo_alternativo: this.correoAlternativo
    };

    this.usuarioService.actualizar(this.usuario.id, payload)
      .subscribe({
        next: (u) => this.usuario = u,
        error: (err) => console.error(err)
      });
  }

  /** Usuarios */
  cargarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (users) => {
        this.todosUsuarios = users;
        this.usuariosFiltrados = users;
        if (users.length > 0) {
          this.usuarioSeleccionado = users[0];
          this.rolSeleccionadoId = this.usuarioSeleccionado.rolid;
        }
      },
      error: (err) => console.error(err)
    });
  }

  /** Roles */
  cargarRoles() {
    this.rolService.getAll().subscribe({
      next: (roles) => this.roles = roles,
      error: (err) => console.error(err)
    });
  }

  filtrarUsuarios() {
    const filtro = this.filtroUsuario.toLowerCase();
    this.usuariosFiltrados = this.todosUsuarios.filter(u =>
      u.nombre.toLowerCase().includes(filtro) ||
      u.correo.toLowerCase().includes(filtro)
    );
  }

  onUsuarioChange() {
    this.rolSeleccionadoId = this.usuarioSeleccionado?.rolid;
  }

  actualizarRol() {
    if (!this.usuarioSeleccionado || !this.rolSeleccionadoId) return;
    this.usuarioService.actualizar(this.usuarioSeleccionado.id, { rolid: this.rolSeleccionadoId })
      .subscribe({
        next: (u) => {
          this.usuarioSeleccionado = u;
          this.cargarUsuarios();
          this.filtrarUsuarios();
        },
        error: (err) => console.error(err)
      });
  }

  /** Gestión de roles */
  crearRol() {
    if (!this.nuevoRolNombre.trim()) return;
    this.rolService.create({ nombre: this.nuevoRolNombre }).subscribe({
      next: (r) => {
        this.roles.push(r);
        this.nuevoRolNombre = '';
        this.cargarRoles();
      },
      error: (err) => console.error(err)
    });
  }

  editarRol(rol: Rol) {
    this.rolEditar = { ...rol };
  }

  actualizarRolExistente() {
    if (!this.rolEditar) return;
    this.rolService.update(this.rolEditar.id, { nombre: this.rolEditar.nombre }).subscribe({
      next: (r) => {
        this.rolEditar = undefined;
        this.cargarRoles();
      },
      error: (err) => console.error(err)
    });
  }

  /** Abrir/ cerrar modales */
  toggleModalGestionRoles() {
    this.modalGestionRolesVisible = !this.modalGestionRolesVisible;
  }

  toggleModalActualizarRoles() {
    this.modalActualizarRolesVisible = !this.modalActualizarRolesVisible;
  }
}
