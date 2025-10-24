import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { Usuario } from '../../core/models/usuario.model';
import { Rol } from '../../core/models/rol.model';
import { AsignacionService } from '../../core/services/asignacion.service';
import { AsignacionResponse } from '../../core/models/asignacion.model';

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
  calleTipo = 'Av.';
  calleNombre = '';
  calleNumero = '';
  ciudad = '';
  departamento = '';

  // Contacto
  telefono = '';
  contactoNombre = '';
  contactoNumero = '';
  correoAlternativo = '';

  // Admin
  todosUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroUsuario = '';
  usuarioSeleccionado?: Usuario;
  roles: Rol[] = [];
  rolSeleccionadoId?: number;

  // Modal roles
  modalGestionRolesVisible = false;
  modalActualizarRolesVisible = false;

  // Para crear un nuevo rol
  nuevoRolNombre = '';
  rolEditar?: Rol;

  // Nuevos: para docentes y administradores/coordinadores
  cursosAsignados: AsignacionResponse[] = [];
  asignaciones: AsignacionResponse[] = [];

  nuevoCodDocente = ''; // campo temporal para ingresar el código
  mensajeCodigo = '';   // mensaje de confirmación o error

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private asignacionService: AsignacionService
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
              const rolNombre = r.nombre.toLowerCase();

              if (rolNombre === 'administrador') {
                this.cargarUsuarios();
                this.cargarRoles();
                this.cargarAsignaciones();
              }

              if (rolNombre === 'coordinador') {
                this.cargarAsignaciones();
              }

              if (rolNombre === 'docente') {
                this.cargarCursosAsignados(user.id);
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
      error: (err: unknown) => {
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

    this.usuarioService.actualizar(this.usuario.id, payload).subscribe({
      next: (u) => (this.usuario = u),
      error: (err: unknown) => console.error(err)
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
      error: (err: unknown) => console.error(err)
    });
  }

  /** Roles */
  cargarRoles() {
    this.rolService.getAll().subscribe({
      next: (roles) => (this.roles = roles),
      error: (err: unknown) => console.error(err)
    });
  }

  filtrarUsuarios() {
    const filtro = this.filtroUsuario.toLowerCase();
    this.usuariosFiltrados = this.todosUsuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(filtro) ||
        u.correo.toLowerCase().includes(filtro)
    );
  }

  onUsuarioChange() {
    this.rolSeleccionadoId = this.usuarioSeleccionado?.rolid;
  }

  actualizarRol() {
    if (!this.usuarioSeleccionado || !this.rolSeleccionadoId) return;
    this.usuarioService
      .actualizar(this.usuarioSeleccionado.id, { rolid: this.rolSeleccionadoId })
      .subscribe({
        next: (u) => {
          this.usuarioSeleccionado = u;
          this.cargarUsuarios();
          this.filtrarUsuarios();
        },
        error: (err: unknown) => console.error(err)
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
      error: (err: unknown) => console.error(err)
    });
  }

  editarRol(rol: Rol) {
    this.rolEditar = { ...rol };
  }

  actualizarRolExistente() {
    if (!this.rolEditar) return;
    this.rolService
      .update(this.rolEditar.id, { nombre: this.rolEditar.nombre })
      .subscribe({
        next: () => {
          this.rolEditar = undefined;
          this.cargarRoles();
        },
        error: (err: unknown) => console.error(err)
      });
  }

  /** Nuevos métodos usando AsignacionService */
  cargarCursosAsignados(docenteId: number) {
    this.asignacionService.getAll().subscribe({
      next: (cursos: AsignacionResponse[]) => {
        // ⚠️ Ajusta esta parte si tu backend devuelve relaciones con docente_id
        this.cursosAsignados = cursos.filter(
          (c: any) => c.docente_id === docenteId
        );
      },
      error: (err: unknown) => console.error(err)
    });
  }

  cargarAsignaciones() {
    this.asignacionService.getAll().subscribe({
      next: (asigs: AsignacionResponse[]) => (this.asignaciones = asigs),
      error: (err: unknown) => console.error(err)
    });
  }

  /** Abrir/ cerrar modales */
  toggleModalGestionRoles() {
    this.modalGestionRolesVisible = !this.modalGestionRolesVisible;
  }

  toggleModalActualizarRoles() {
    this.modalActualizarRolesVisible = !this.modalActualizarRolesVisible;
  }

  actualizarCodigoDocente() {
    if (!this.usuario || !this.usuario.id) return;
    if (!this.nuevoCodDocente.trim()) {
      this.mensajeCodigo = 'Por favor ingrese un código válido.';
      return;
    }

    this.usuarioService.actualizarCodigoDocente(this.usuario.id, this.nuevoCodDocente)
      .subscribe({
        next: (u) => {
          this.usuario = u;
          this.mensajeCodigo = 'Código docente actualizado correctamente ✅';
          this.nuevoCodDocente = '';
        },
        error: (err) => {
          console.error(err);
          this.mensajeCodigo = 'Error al actualizar el código docente ❌';
        }
      });
  }

}
