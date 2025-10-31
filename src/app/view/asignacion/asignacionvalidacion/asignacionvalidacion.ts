import { Component, OnInit } from '@angular/core';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { CursoService } from '../../../core/services/curso.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { DisponibilidadDocenteResponse, Horario, Modalidad, Turno } from '../../../core/models/disponibilidad.model';
import { AsignacionResponse, AsignacionCursoDocenteResponse } from '../../../core/models/asignacion.model';
import { CursoModel } from '../../../core/models/Curso.model';
import { Docente } from '../../../core/models/docente.model';
import { CarreraModel } from '../../../core/models/carrera.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asignacionvalidacion',
  standalone: true,
  templateUrl: './asignacionvalidacion.html',
  styleUrls: ['./asignacionvalidacion.scss'],
  imports: [CommonModule]
})
export class Asignacionvalidacion implements OnInit {

  asignaciones: AsignacionResponse[] = [];
  cursosPorAsignacion: { [key: number]: AsignacionCursoDocenteResponse[] } = {};

  cursosMap: { [id: number]: CursoModel } = {};
  docentesMap: { [id: number]: Docente } = {};
  carrerasMap: { [id: number]: CarreraModel } = {};

  mostrarModal = false;
  docenteSeleccionadoId: number | null = null;

  modalidadSeleccionada: Modalidad = 'PRESENCIAL';
  turnoSeleccionado: Turno | null = null;

  dias: string[] = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  disponibilidadSeleccionada: { [dia: string]: { [bloque: string]: boolean } } = {};

  constructor(
    private asignacionService: AsignacionService,
    private disponibilidadService: DisponibilidadService,
    private cursoService: CursoService,
    private docenteService: DocenteService,
    private carreraService: CarreraService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarAsignaciones();
  }

  cargarCatalogos() {
    this.cursoService.getAll().subscribe(cursos => {
      console.log("✅ Cursos recibidos:", cursos);
      this.cursosMap = cursos.reduce((acc, c) => ({ ...acc, [c.id!]: c }), {});
    }, err => console.error("❌ Error cursos:", err));

    this.docenteService.listar().subscribe(docentes => {
      console.log("✅ Docentes recibidos:", docentes);
      this.docentesMap = docentes.reduce((acc, d) => ({ ...acc, [d.id!]: d }), {});
    }, err => console.error("❌ Error docentes:", err));

    this.carreraService.listar().subscribe(carreras => {
      console.log("✅ Carreras recibidas:", carreras);
      this.carrerasMap = carreras.reduce((acc, c) => ({ ...acc, [c.id!]: c }), {});
    }, err => console.error("❌ Error carreras:", err));
  }

  cargarAsignaciones() {
    this.asignacionService.getAll().subscribe(asignaciones => {
      console.log("✅ Asignaciones recibidas:", asignaciones);
      this.asignaciones = asignaciones.filter(a => a.estado);
      this.asignaciones.forEach(a => this.cargarRelaciones(a.id));
    }, err => console.error("❌ Error asignaciones:", err));
  }

  cargarRelaciones(asignacionId: number) {
  this.asignacionService.getRelaciones(asignacionId).subscribe(relaciones => {
    console.log(`📌 Relaciones asignación ${asignacionId}:`, relaciones);

    // Filtrar solo cursos con docente asignado
    this.cursosPorAsignacion[asignacionId] = relaciones
      .filter(r => r.docente_id)
      .map(r => ({
        ...r,
        activo: !!r.activo,    // inicializamos activo
        es_bloque: r.es_bloque ?? false
      }));
  }, err => console.error(`❌ Error relaciones ${asignacionId}:`, err));
}


  abrirModal(docente_id: number, modalidad: string) {
    this.docenteSeleccionadoId = docente_id;
    this.modalidadSeleccionada = modalidad as Modalidad;

    // ✅ Aquí seteamos turno por defecto = Mañana
    this.turnoSeleccionado = 'Mañana';

    this.inicializarDisponibilidad();
    this.mostrarModal = true;
    this.obtenerDisponibilidades();
  }


  cerrarModal() {
    this.mostrarModal = false;
    this.docenteSeleccionadoId = null;
    this.turnoSeleccionado = null;
    this.inicializarDisponibilidad();
  }

  inicializarDisponibilidad() {
    this.disponibilidadSeleccionada = {};
    this.dias.forEach(dia => this.disponibilidadSeleccionada[dia] = {});
  }

  obtenerDisponibilidades() {
    if (!this.docenteSeleccionadoId || !this.turnoSeleccionado) return;

    this.disponibilidadService
      .getDisponibilidadesDocente(this.docenteSeleccionadoId, this.modalidadSeleccionada, this.turnoSeleccionado)
      .subscribe(
        disponibilidades => {
          console.log("✅ Disponibilidades desde API:", disponibilidades);

          disponibilidades.forEach(d => {
            d.horarios.forEach((h: Horario) => {

              const inicio = h.hora_inicio.slice(0, 5).replace(/^0/, ''); // "07:15" → "7:15"
              const fin = h.hora_fin.slice(0, 5).replace(/^0/, '');       // "08:00" → "8:00"

              const bloque = `${inicio}-${fin}`;

              if (!this.disponibilidadSeleccionada[d.dia]) {
                this.disponibilidadSeleccionada[d.dia] = {};
              }

              this.disponibilidadSeleccionada[d.dia][bloque] = true;
            });
          });

          console.log("📌 disponibilidadSeleccionada:", this.disponibilidadSeleccionada);
        }
      );
  }


  seleccionarModalidad(modalidad: Modalidad) {
    console.log("🎯 seleccionarModalidad:", modalidad);
    this.modalidadSeleccionada = modalidad;
    this.turnoSeleccionado = null;
    this.inicializarDisponibilidad();
    this.obtenerDisponibilidades();
  }

  seleccionarTurno(turno: Turno) {
    console.log("🎯 seleccionarTurno:", turno);
    this.turnoSeleccionado = turno;
    this.inicializarDisponibilidad();
    this.obtenerDisponibilidades();
  }

  generarBloques(turno: Turno): string[] {
    const bloques = {
      Mañana: [
        '7:15-8:00','8:00-8:45','8:45-9:30','9:30-10:15',
        '10:15-11:00','11:00-11:45','11:45-12:30','12:30-13:15'
      ],
      Tarde: [
        '13:15-14:00','14:00-14:45','14:45-15:30','15:30-16:15',
        '16:15-17:00','17:00-17:45'
      ],
      Noche: [
        '18:00-18:45','18:45-19:30','19:30-20:15','20:15-21:00',
        '21:00-21:45','21:45-22:30'
      ]
    };

    return bloques[turno];
  }

  getTurnosDisponibles(): Turno[] {
    if (this.modalidadSeleccionada === 'PRESENCIAL') return ['Mañana', 'Tarde', 'Noche'];
    if (this.modalidadSeleccionada === 'DISTANCIA') return ['Noche'];
    if (this.modalidadSeleccionada === 'SEMIPRESENCIAL') return ['Noche'];
    return [];
  }

  enviarCorreos(asignacionId: number) {
    if (!confirm("¿Seguro que deseas notificar a los docentes asignados?")) return;

    this.notificacionService.enviarNotificacionAsignacion(asignacionId)
      .subscribe({
        next: (resp) => {
          console.log("✅ Notificación enviada:", resp);
          alert(`✅ Correos enviados a ${resp.docentes_notificados} docente(s).`);
        },
        error: (err) => {
          console.error("❌ Error al enviar correos:", err);
          alert("❌ Error al enviar correos");
        }
      });
  }

  checkBloqueActivo(docente_id: number | undefined): boolean {
    if (!docente_id) return false;
    
    // Aquí hacemos la consulta de disponibilidad según tu lógica actual
    // Ejemplo: revisar si el docente tiene algún bloque activo en su disponibilidad
    let horasActivas = 0;

    for (const dia of this.dias) {
      const bloques = this.disponibilidadSeleccionada[dia] || {};
      for (const bloque in bloques) {
        if (bloques[bloque]) {
          horasActivas++;
        }
      }
    }

    // Devuelve true si tiene al menos 1 bloque activo
    return horasActivas > 0;
  }


  toggleBloque(curso: AsignacionCursoDocenteResponse) {
  if (!curso.es_bloque || !curso.bloque) return; // solo bloques válidos

  if (curso.activo) {
    this.asignacionService.desactivarBloque(curso.id).subscribe({
      next: () => {
        curso.activo = false;
        alert(`Se desactivó el bloque ${curso.bloque} en ${this.cursosMap[curso.curso_id]?.nombre}`);
      },
      error: err => console.error("ERROR desactivarBloque", err)
    });
  } else {
    this.asignacionService.activarBloque(curso.id, curso.bloque as 'A' | 'B').subscribe({
      next: res => {
        curso.activo = res.activo;
        // desactivar otros bloques del mismo curso y sección
        this.cursosPorAsignacion[curso.asignacion_id].forEach(c => {
          if (c.curso_id === curso.curso_id && c.seccion === curso.seccion && c.id !== curso.id) {
            c.activo = false;
          }
        });
        alert(`Se activó el bloque ${curso.bloque} en ${this.cursosMap[curso.curso_id]?.nombre}`);
      },
      error: err => console.error("ERROR activarBloque", err)
    });
  }
}



}
