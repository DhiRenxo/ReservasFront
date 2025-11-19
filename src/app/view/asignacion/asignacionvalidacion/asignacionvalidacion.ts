import { Component, OnInit, ChangeDetectionStrategy, computed, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsignacionService } from '../../../core/services/asignacion.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { CursoService } from '../../../core/services/curso.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import type { DisponibilidadDocenteResponse, Horario, Modalidad, Turno } from '../../../core/models/disponibilidad.model';
import type { AsignacionResponse, AsignacionCursoDocenteResponse } from '../../../core/models/asignacion.model';
import type { CursoModel } from '../../../core/models/Curso.model';
import type { Docente } from '../../../core/models/docente.model';
import type { CarreraModel } from '../../../core/models/carrera.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMail, lucideEye, lucideLock, lucideCalendar, lucideLockOpen } from '@ng-icons/lucide';


export const MODALIDADES: Record<string, Modalidad> = {
  PRESENCIAL: 'PRESENCIAL',
  DISTANCIA: 'DISTANCIA',
  SEMIPRESENCIAL: 'SEMIPRESENCIAL'
};

@Component({
  selector: 'app-asignacionvalidacion',
  standalone: true,
  imports: [NgIconComponent, CommonModule],
  providers: [provideIcons({ lucideMail, lucideEye, lucideLock, lucideCalendar, lucideLockOpen })],
  templateUrl: './asignacionvalidacion.html',
  styleUrls: ['./asignacionvalidacion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Asignacionvalidacion implements OnInit {

  // --- Servicios ---
  private asignacionService = inject(AsignacionService);
  private disponibilidadService = inject(DisponibilidadService);
  private cursoService = inject(CursoService);
  private docenteService = inject(DocenteService);
  private carreraService = inject(CarreraService);
  private notificacionService = inject(NotificacionService);

  // --- Señales ---
  asignaciones: WritableSignal<AsignacionResponse[]> = signal([]);
  cursosPorAsignacion: WritableSignal<Record<number, AsignacionCursoDocenteResponse[]>> = signal({});
  cursosMap: WritableSignal<Record<number, CursoModel>> = signal({});
  docentesMap: WritableSignal<Record<number, Docente>> = signal({});
  carrerasMap: WritableSignal<Record<number, CarreraModel>> = signal({});

  MODALIDADES = MODALIDADES;

  // --- Modal & UI ---
  mostrarModal: WritableSignal<boolean> = signal(false);
  docenteSeleccionadoId: WritableSignal<number | null> = signal(null);
  modalidadSeleccionada: WritableSignal<Modalidad> = signal('PRESENCIAL');
  turnoSeleccionado: WritableSignal<Turno | null> = signal(null);

  dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  disponibilidadSeleccionada: WritableSignal<Record<string, Record<string, boolean>>> = signal({});

  // --- Computed ---
  turnosDisponibles = computed(() => {
    const m = this.modalidadSeleccionada();
    if (m === 'PRESENCIAL') return ['Mañana','Tarde','Noche'] as Turno[];
    return ['Noche'] as Turno[];
  });

  // --- Inicialización ---
  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarAsignaciones();
    this.inicializarDisponibilidad();
  }

  // --- Carga de datos ---
  cargarCatalogos() {
    this.cursoService.getAll().subscribe({
      next: cursos => this.cursosMap.set(Object.fromEntries(cursos.map(c => [c.id!, c]))),
      error: err => console.error('Error cursos', err)
    });
    this.docenteService.listar().subscribe({
      next: docentes => this.docentesMap.set(Object.fromEntries(docentes.map(d => [d.id!, d]))),
      error: err => console.error('Error docentes', err)
    });
    this.carreraService.listar().subscribe({
      next: carreras => this.carrerasMap.set(Object.fromEntries(carreras.map(c => [c.id!, c]))),
      error: err => console.error('Error carreras', err)
    });
  }

  cargarAsignaciones() {
    this.asignacionService.getAll().subscribe({
      next: asigs => {
        const filtradas = asigs.filter(a => a.estado);
        this.asignaciones.set(filtradas);
        filtradas.forEach(a => this.cargarRelaciones(a.id));
      },
      error: err => console.error('Error asignaciones', err)
    });
  }

  cargarRelaciones(asignacionId: number) {
    this.asignacionService.getRelaciones(asignacionId).subscribe({
      next: relaciones => {
        const filtradas = relaciones.filter(r => r.docente_id).map(r => ({ ...r, activo: !!r.activo, es_bloque: r.es_bloque ?? false }));
        const curr = { ...this.cursosPorAsignacion() };
        curr[asignacionId] = filtradas;
        this.cursosPorAsignacion.set(curr);
      },
      error: err => console.error(`Error relaciones ${asignacionId}`, err)
    });
  }

  // --- Modal & Disponibilidad ---
  abrirModal(docente_id: number, modalidad: Modalidad) {
    this.docenteSeleccionadoId.set(docente_id);
    this.modalidadSeleccionada.set(modalidad);
    this.turnoSeleccionado.set('Mañana');
    this.inicializarDisponibilidad();
    this.mostrarModal.set(true);
    this.obtenerDisponibilidades();
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.docenteSeleccionadoId.set(null);
    this.turnoSeleccionado.set(null);
    this.inicializarDisponibilidad();
  }

  inicializarDisponibilidad() {
    const base: Record<string, Record<string, boolean>> = {};
    this.dias.forEach(d => base[d] = {});
    this.disponibilidadSeleccionada.set(base);
  }

  obtenerDisponibilidades() {
    const docenteId = this.docenteSeleccionadoId();
    const turno = this.turnoSeleccionado();
    const modalidad = this.modalidadSeleccionada();
    if (!docenteId || !turno) return;

    this.disponibilidadService.getDisponibilidadesDocente(docenteId, modalidad, turno)
      .subscribe({
        next: disponibilidades => {
          const nuevo = { ...this.disponibilidadSeleccionada() };
          disponibilidades.forEach(d => {
            (d.horarios || []).forEach((h: Horario) => {
              const inicio = h.hora_inicio.slice(0,5).replace(/^0/, '');
              const fin = h.hora_fin.slice(0,5).replace(/^0/, '');
              const bloque = `${inicio}-${fin}`;
              if (!nuevo[d.dia]) nuevo[d.dia] = {};
              nuevo[d.dia][bloque] = true;
            });
          });
          this.disponibilidadSeleccionada.set(nuevo);
        },
        error: err => console.error('Error disponibilidades', err)
      });
  }

  seleccionarModalidad(valor: Modalidad) {
    this.modalidadSeleccionada.set(valor);
    this.turnoSeleccionado.set(null);
    this.inicializarDisponibilidad();
  }

  seleccionarTurno(turno: Turno) {
    this.turnoSeleccionado.set(turno);
    this.inicializarDisponibilidad();
    this.obtenerDisponibilidades();
  }

  generarBloques(turno: Turno, modalidad: string): string[] {
    const bloquesEspeciales = ['19:30-20:15','20:15-21:00','21:00-21:45','21:45-22:30'];
    if (modalidad !== 'PRESENCIAL') return bloquesEspeciales;

    const bloquesPresenciales: Record<Turno, string[]> = {
      Mañana: ['7:15-8:00','8:00-8:45','8:45-9:30','9:30-10:15','10:15-11:00','11:00-11:45','11:45-12:30','12:30-13:15'],
      Tarde: ['13:15-14:00','14:00-14:45','14:45-15:30','15:30-16:15','16:15-17:00','17:00-17:45'],
      Noche: ['18:00-18:45','18:45-19:30','19:30-20:15','20:15-21:00','21:00-21:45','21:45-22:30']
    };
    return bloquesPresenciales[turno] ?? [];
  }

  enviarCorreos(asignacionId: number) {
    if (!confirm('¿Seguro que deseas notificar a los docentes asignados?')) return;
    this.notificacionService.enviarNotificacionAsignacion(asignacionId).subscribe({
      next: resp => alert(`✅ Correos enviados a ${resp.docentes_notificados} docente(s).`),
      error: err => { console.error('Error enviar correos', err); alert('❌ Error al enviar correos'); }
    });
  }

  toggleBloque(curso: AsignacionCursoDocenteResponse) {
    if (!curso.es_bloque || !curso.bloque) return;

    if (curso.activo) {
      this.asignacionService.desactivarBloque(curso.id).subscribe({ next: () => curso.activo = false, error: err => console.error(err) });
    } else {
      this.asignacionService.activarBloque(curso.id, curso.bloque as 'A'|'B').subscribe({
        next: res => {
          curso.activo = res.activo;
          const arr = this.cursosPorAsignacion()[curso.asignacion_id] || [];
          arr.forEach(c => { if (c.curso_id === curso.curso_id && c.seccion === curso.seccion && c.id !== curso.id) c.activo = false; });
          alert(`Se activó el bloque ${curso.bloque} en ${this.cursosMap()[curso.curso_id]?.nombre}`);
        },
        error: err => console.error(err)
      });
    }
  }

  trackByAsignacion(index: number, item: AsignacionResponse) { return item.id; }
  trackByCurso(index: number, item: AsignacionCursoDocenteResponse) { return item.id; }
}
