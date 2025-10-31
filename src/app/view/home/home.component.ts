import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { Usuario } from '../../core/models/usuario.model';
import { Rol } from '../../core/models/rol.model';
import { AsignacionService } from '../../core/services/asignacion.service';
import { AsignacionResponse } from '../../core/models/asignacion.model';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { 
  DisponibilidadDocenteResponse, 
  DisponibilidadDocenteCreate,
  Modalidad,
  Turno,
  Horario
} from '../../core/models/disponibilidad.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  usuario?: Usuario;
  rol?: Rol;
  cargando = true;

  calleTipo = 'Av.';
  calleNombre = '';
  calleNumero = '';
  ciudad = '';
  departamento = '';

  telefono = '';
  contactoNombre = '';
  contactoNumero = '';
  correoAlternativo = '';
  mostrarOpciones = false;

  todosUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroUsuario = '';
  usuarioSeleccionado?: Usuario;
  roles: Rol[] = [];
  rolSeleccionadoId?: number;

  modalGestionRolesVisible = false;
  modalActualizarRolesVisible = false;
  nuevoRolNombre = '';
  rolEditar?: Rol;

  cursosAsignados: any[] = [];
  asignaciones: AsignacionResponse[] = [];
  docenteId?: number;
  disponibilidades: DisponibilidadDocenteResponse[] = [];

  turnos: Turno[] = ['Mañana','Tarde','Noche'];
  dias: string[] = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  modalidades: Modalidad[] = ['PRESENCIAL', 'DISTANCIA', 'SEMIPRESENCIAL'];

  bloquesPorTurno: { [key in Turno]: string[] } = {
    Mañana: ['07:15-08:00','08:00-08:45','08:45-09:30','09:30-10:15','10:15-11:00','11:00-11:45','11:45-12:30','12:30-13:15'],
    Tarde: ['13:15-14:00','14:00-14:45','14:45-15:30','15:30-16:15','16:15-17:00','17:00-17:45'],
    Noche: ['18:00-18:45','18:45-19:30','19:30-20:15','20:15-21:00','21:00-21:45','21:45-22:30']
  };

  disponibilidadTabla: { [dia: string]: { [bloque: string]: boolean } } = {};

  modalidadSeleccionada: Modalidad = 'PRESENCIAL';
  turnoSeleccionado: Turno = 'Mañana';
  modalDisponibilidadVisible = false;



  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private asignacionService: AsignacionService,
    private disponibilidadService: DisponibilidadService
  ) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('usuario_id'));
    if (!userId) { 
      this.cargando = false; 
      return; 
    }
    this.usuarioService.obtener(userId).subscribe({
      next: (user: Usuario) => {
        this.usuario = user;
        this.cargarRolUsuario(user);
        this.cargarDatosUsuario(user);
      },
      error: (err: any) => { this.cargando = false; }
    });
  }

  private cargarRolUsuario(user: Usuario) {
    if (!user.rolid) return;
    this.rolService.obtener(user.rolid).subscribe({
      next: (r: Rol) => {
        this.rol = r;
        const rolNombre = r.nombre.toLowerCase();
        if (rolNombre === 'administrador') { 
          this.cargarUsuarios(); 
          this.cargarRoles(); 
          this.cargarAsignaciones(); 
        }
        if (rolNombre === 'coordinador') this.cargarAsignaciones();
        if (rolNombre === 'docente') { 
          this.cargarCursosAsignados(user.correo); 
          this.obtenerIdDocenteYDisponibilidad(user.correo); 
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  private cargarDatosUsuario(user: Usuario) {
    this.calleTipo = user.calle_tipo || 'Av.';
    this.calleNombre = user.calle_nombre || '';
    this.calleNumero = user.calle_numero || '';
    this.ciudad = user.ciudad || '';
    this.departamento = user.departamento || '';
    this.telefono = user.telefono || '';
    this.contactoNombre = user.contacto_nombre || '';
    this.contactoNumero = user.contacto_numero || '';
    this.correoAlternativo = user.correo_alternativo || '';
    this.mostrarOpciones = !!(this.contactoNombre || this.contactoNumero || this.correoAlternativo);
  }

  enviarDatos(): void {
    if (!this.usuario) return;
    const payload = {
      calle_tipo: this.calleTipo,
      calle_nombre: this.calleNombre,
      calle_numero: this.calleNumero,
      ciudad: this.ciudad,
      departamento: this.departamento,
      telefono: this.telefono,
      contacto_nombre: this.mostrarOpciones ? this.contactoNombre || null : null,
      contacto_numero: this.mostrarOpciones ? this.contactoNumero || null : null,
      correo_alternativo: this.mostrarOpciones ? this.correoAlternativo || null : null
    };
    this.usuarioService.actualizar(this.usuario.id, payload).subscribe({
      next: (u: Usuario) => { this.usuario = u; alert('✅ Información actualizada correctamente'); },
      error: () => {}
    });
  }

  obtenerIdDocenteYDisponibilidad(correo: string) {
    this.asignacionService.obtenerCursosDocente(correo).subscribe({
      next: (data: any[]) => { 
        if (data.length && data[0].docente_id) { 
          this.docenteId = data[0].docente_id; 
          this.cargarDisponibilidadDocente(); 
        } 
      },
      error: () => {}
    });
  }

  cargarDisponibilidadDocente() {
    if (!this.docenteId) return;
    this.disponibilidadService.getByDocente(this.docenteId, this.modalidadSeleccionada, this.turnoSeleccionado)
      .subscribe({
        next: (res: DisponibilidadDocenteResponse[]) => { 
          this.disponibilidades = res; 
          this.inicializarDisponibilidadTabla();
          this.disponibilidades.forEach(d => {
            d.horarios.forEach(h => {
              const key = `${h.hora_inicio}-${h.hora_fin}`;
              if(this.disponibilidadTabla[d.dia]) this.disponibilidadTabla[d.dia][key] = true;
            });
          });
        },
        error: () => {}
      });
  }

  inicializarDisponibilidadTabla() {
    this.disponibilidadTabla = {};
    this.dias.forEach(dia => {
      this.disponibilidadTabla[dia] = {};
      this.bloquesPorTurno[this.turnoSeleccionado].forEach(bloque => {
        this.disponibilidadTabla[dia][bloque] = false;
      });
    });
  }

  toggleBloque(dia: string, bloque: string, checked: boolean) {
    if (!this.disponibilidadTabla[dia]) this.disponibilidadTabla[dia] = {};
    this.disponibilidadTabla[dia][bloque] = checked;
  }


  horariosPorTurnoYModalidad(turno: Turno, modalidad: Modalidad): string[] {
    return this.bloquesPorTurno[turno] || [];
  }

  checkHorario(dia: string, bloque: string): boolean {
    return this.disponibilidadTabla[dia]?.[bloque] || false;
  }

  toggleHorario(dia: string, bloque: string, event: any) {
    const checked = event.target.checked;
    if (!this.disponibilidadTabla[dia]) this.disponibilidadTabla[dia] = {};
    this.disponibilidadTabla[dia][bloque] = checked;
  }

  cargarUsuarios() { 
    this.usuarioService.listar().subscribe({ 
      next: (users: Usuario[]) => { this.todosUsuarios = users; this.usuariosFiltrados = users; }, 
      error: () => {} 
    }); 
  }

  cargarRoles() { 
    this.rolService.getAll().subscribe({ 
      next: (roles: Rol[]) => this.roles = roles, 
      error: () => {} 
    }); 
  }

  cargarCursosAsignados(correo: string) { 
    this.asignacionService.obtenerCursosDocente(correo).subscribe({ 
      next: (data: any[]) => this.cursosAsignados = data, 
      error: () => {} 
    }); 
  }

  cargarAsignaciones() { 
    this.asignacionService.getAll().subscribe({ 
      next: (asigs: AsignacionResponse[]) => this.asignaciones = asigs, 
      error: () => {} 
    }); 
  }

  toggleModalGestionRoles() { this.modalGestionRolesVisible = !this.modalGestionRolesVisible; }
  toggleModalActualizarRoles() { this.modalActualizarRolesVisible = !this.modalActualizarRolesVisible; }

  filtrarUsuarios() { 
    this.usuariosFiltrados = this.todosUsuarios.filter(u => 
      u.nombre.toLowerCase().includes(this.filtroUsuario.toLowerCase()) || 
      u.correo.toLowerCase().includes(this.filtroUsuario.toLowerCase())
    ); 
  }

  onUsuarioChange() { this.rolSeleccionadoId = this.usuarioSeleccionado?.rolid; }

  actualizarRol() { 
    if (!this.usuarioSeleccionado || !this.rolSeleccionadoId) return; 
    this.usuarioService.actualizar(this.usuarioSeleccionado.id, { rolid: this.rolSeleccionadoId }).subscribe({ 
      next: (u: Usuario) => { this.usuarioSeleccionado = u; this.cargarUsuarios(); this.filtrarUsuarios(); }, 
      error: () => {} 
    }); 
  }

  crearRol() { 
    if (!this.nuevoRolNombre.trim()) return; 
    this.rolService.create({ nombre: this.nuevoRolNombre }).subscribe({ 
      next: (r: Rol) => { this.roles.push(r); this.nuevoRolNombre = ''; this.cargarRoles(); }, 
      error: () => {} 
    }); 
  }

  editarRol(rol: Rol) { this.rolEditar = { ...rol }; }
  actualizarRolExistente() { 
    if (!this.rolEditar) return; 
    this.rolService.update(this.rolEditar.id, { nombre: this.rolEditar.nombre }).subscribe({ 
      next: () => { this.rolEditar = undefined; this.cargarRoles(); }, 
      error: () => {} 
    }); 
  }

  formatearFecha(fecha?: string | null): string { return fecha ? new Date(fecha).toLocaleDateString() : '-'; }

  abrirModalDisponibilidad() {
    if (!this.docenteId) {
      alert('Docente aún no definido');
      return;
    }

    this.modalDisponibilidadVisible = true;
    this.inicializarDisponibilidadTabla();

    this.disponibilidadService.getByDocente(
      this.docenteId,
      this.modalidadSeleccionada,
      this.turnoSeleccionado
    ).subscribe({
      next: (res: DisponibilidadDocenteResponse[]) => {
        this.disponibilidades = res;
        this.disponibilidades.forEach(d => {
          if (!this.disponibilidadTabla[d.dia]) this.disponibilidadTabla[d.dia] = {};
          d.horarios.forEach(h => {
            const key = `${h.hora_inicio.substring(0,5)}-${h.hora_fin.substring(0,5)}`;
            this.disponibilidadTabla[d.dia][key] = true;
          });
        });
      },
      error: () => {}
    });
  }


  cerrarModalDisponibilidad() {
    this.modalDisponibilidadVisible = false;
    this.inicializarDisponibilidadTabla();
  }

  guardarDisponibilidadCompleta() {
    if (!this.docenteId) return;

    const payloadDias: DisponibilidadDocenteCreate[] = this.dias.map(dia => {
      const bloquesSeleccionados = Object.keys(this.disponibilidadTabla[dia])
        .filter(b => this.disponibilidadTabla[dia][b]);

      const horarios: Horario[] = bloquesSeleccionados.map(b => {
        const [hora_inicio, hora_fin] = b.split('-');
        return { hora_inicio, hora_fin };
      });

      return {
        dia,
        modalidad: this.modalidadSeleccionada,
        turno: this.turnoSeleccionado,
        horarios
      };
    });

    payloadDias.forEach(payload => {
      this.disponibilidadService.createOrUpdate(payload).subscribe({ error: () => {} });
    });

    alert('✅ Disponibilidad guardada/actualizada correctamente');
  }

    // Devuelve los turnos que se muestran según la modalidad
  get turnosFiltrados(): Turno[] {
    if (this.modalidadSeleccionada === 'DISTANCIA') {
      return ['Noche'];
    } else if (this.modalidadSeleccionada === 'SEMIPRESENCIAL') {
      return ['Mañana', 'Tarde', 'Noche']; // Se puede ajustar si quieres solo "Noche + otros"
    }
    return this.turnos; // PRESENCIAL
  }

  // Devuelve los bloques del turno actual según modalidad
  get bloquesPorTurnoActual(): string[] {
    if (this.modalidadSeleccionada === 'DISTANCIA' || this.modalidadSeleccionada === 'SEMIPRESENCIAL') {
      // Bloques noche 7:30 a 10:30
      return ['19:30-20:15', '20:15-21:00', '21:00-21:45','21:45-22:30' ];
    }
    return this.bloquesPorTurno[this.turnoSeleccionado];
  }

  get cursosPresenciales() {
    return this.cursosAsignados?.filter(
      c => c.modalidad === 'PRESENCIAL' && c.estado
    ) || [];
  }

  get cursosSemiPresenciales() {
    return this.cursosAsignados?.filter(
      c => c.modalidad === 'SEMIPRESENCIAL' && c.estado
    ) || [];
  }

  get cursosDistancia() {
    return this.cursosAsignados?.filter(
      c => c.modalidad === 'DISTANCIA' && c.estado
    ) || [];
  }

  get tieneCursosActivos() {
    return this.cursosAsignados?.some(c => c.estado);
  }



}
