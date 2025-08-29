import { Component, OnInit } from '@angular/core';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { CursoService } from '../../../core/services/curso.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { 
  DisponibilidadDocente, 
  DisponibilidadDocenteCreate, 
  DisponibilidadDocenteUpdate, 
  Horario, 
  Modalidad, 
  Turno 
} from '../../../core/models/disponibilidad.model';
import { AsignacionResponse, AsignacionCursoDocenteResponse } from '../../../core/models/asignacion.model';
import { CursoModel } from '../../../core/models/Curso.model';
import { Docente } from '../../../core/models/docente.model';
import { CarreraModel } from '../../../core/models/carrera.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-asignacionvalidacion',
  templateUrl: './asignacionvalidacion.html',
  styleUrls: ['./asignacionvalidacion.scss'],
  imports: [CommonModule, FormsModule]
})
export class Asignacionvalidacion implements OnInit {  
  asignaciones: AsignacionResponse[] = [];
  cursosPorAsignacion: { [key: number]: AsignacionCursoDocenteResponse[] } = {};

  cursosMap: { [id: number]: CursoModel } = {};
  docentesMap: { [id: number]: Docente } = {};
  carrerasMap: { [id: number]: CarreraModel } = {};

  mostrarModal: boolean = false;
  docenteSeleccionadoId: number | null = null;
  tieneDisponibilidad: boolean = false;

  modalidadSeleccionada: Modalidad = 'PRESENCIAL';
  turnoSeleccionado: Turno | null = null;

  dias: string[] = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  bloques: string[] = [];
  disponibilidadSeleccionada: { [dia: string]: { [bloque: string]: boolean } } = {};



  constructor(
    private asignacionService: AsignacionService,
    private disponibilidadService: DisponibilidadService,
    private cursoService: CursoService,
    private docenteService: DocenteService,
    private carreraService: CarreraService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarAsignaciones();
  }


  cargarCatalogos() {
    this.cursoService.getAll().subscribe(cursos => {
      this.cursosMap = cursos.reduce((acc, c) => ({ ...acc, [c.id!]: c }), {});
    });
    this.docenteService.listar().subscribe(docentes => {
      this.docentesMap = docentes.reduce((acc, d) => ({ ...acc, [d.id!]: d }), {});
    });
    this.carreraService.listar().subscribe(carreras => {
      this.carrerasMap = carreras.reduce((acc, c) => ({ ...acc, [c.id!]: c }), {});
    });
  }

  cargarAsignaciones() {
    this.asignacionService.getAll().subscribe(asignaciones => {
      this.asignaciones = asignaciones.filter(a => a.estado); 
      this.asignaciones.forEach(a => this.cargarRelaciones(a.id));
    });
  }

  cargarRelaciones(asignacionId: number) {
    this.asignacionService.getRelaciones(asignacionId).subscribe(relaciones => {
      this.cursosPorAsignacion[asignacionId] = relaciones.filter(r => r.docente_id);
    });
  }

  abrirModal(docente_id: number, modalidad: string) {
    this.docenteSeleccionadoId = docente_id;
    this.modalidadSeleccionada = modalidad as Modalidad;
    this.turnoSeleccionado = null;
    this.bloques = [];
    this.mostrarModal = true;

    this.inicializarDisponibilidad();

    // 👇 ahora pedimos disponibilidades filtrando por modalidad (y opcional turno)
    this.disponibilidadService.getByDocente(docente_id, this.modalidadSeleccionada).subscribe(disponibilidades => {
      this.tieneDisponibilidad = disponibilidades.length > 0;

      if (this.tieneDisponibilidad) {
        disponibilidades.forEach(d => {
          d.horarios.forEach((h: Horario) => {
            const bloque = `${h.hora_inicio}-${h.hora_fin}`;
            this.disponibilidadSeleccionada[d.dia] = this.disponibilidadSeleccionada[d.dia] || {};
            this.disponibilidadSeleccionada[d.dia][bloque] = true;
          });
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.docenteSeleccionadoId = null;
    this.turnoSeleccionado = null;
    this.bloques = [];
    this.tieneDisponibilidad = false;
  }

  inicializarDisponibilidad() {
    this.disponibilidadSeleccionada = {};
    this.dias.forEach(dia => this.disponibilidadSeleccionada[dia] = {});
  }

    generarBloques(turno: Turno, dia?: string): string[] {
      const bloques = {
        Mañana: [
          '7:15-8:00','08:00-08:45','08:45-09:30','09:30-10:15',
          '10:15-11:00','11:00-11:45','11:45-12:30','12:30-13:15'
        ],
        Tarde: [
          '13:15-14:00','14:00-14:45','14:45-15:30',
          '15:30-16:15','16:15-17:00','17:00-17:45'
        ],
        Noche: [
          '18:00-18:45','18:45-19:30','19:30-20:15',
          '20:15-21:00','21:00-21:45','21:45-22:30'
        ]
      };

      // --- PRESENCIAL ---
      if (this.modalidadSeleccionada === 'PRESENCIAL') {
        return bloques[turno];
      }

      // --- DISTANCIA ---
      if (this.modalidadSeleccionada === 'DISTANCIA') {
        if (turno === 'Noche') {
          return ['19:30-20:15','20:15-21:00','21:00-21:45','21:45-22:30']; // bloque único
        }
        return [];
      }

      // --- SEMIPRESENCIAL ---
      if (this.modalidadSeleccionada === 'SEMIPRESENCIAL') {
        if (dia === 'Domingo') {
          // Domingo solo turno mañana
          return turno === 'Mañana' ? bloques.Mañana : [];
        }
        if (dia === 'Sábado') {
          // Sábado todos los turnos disponibles
          return bloques[turno];
        }
        // Lunes a Viernes solo turno noche
        return turno === 'Noche' ? bloques.Noche : [];
      }

      return [];
    }


  seleccionarTurno(turno: Turno) {
    this.turnoSeleccionado = turno;
    this.bloques = this.generarBloques(turno);
    this.inicializarDisponibilidad();

    if (!this.docenteSeleccionadoId) return;

    this.disponibilidadService
      .getByDocente(this.docenteSeleccionadoId, this.modalidadSeleccionada, turno)
      .subscribe(disponibilidades => {
        this.tieneDisponibilidad = disponibilidades.length > 0;

        disponibilidades.forEach(d => {
          if (d.horarios && d.horarios.length > 0) {
            d.horarios.forEach((h: Horario) => {
              const bloque = `${h.hora_inicio}-${h.hora_fin}`;
              this.disponibilidadSeleccionada[d.dia][bloque] = true;
            });
          }
        });
      });
  }



  toggleBloque(dia: string, bloque: string) {
      this.disponibilidadSeleccionada[dia][bloque] = !this.disponibilidadSeleccionada[dia][bloque];
    }

    private obtenerSeleccionados(): DisponibilidadDocenteCreate[] {
    return this.dias.map(dia => {
      const bloquesDia = Object.keys(this.disponibilidadSeleccionada[dia])
        .filter(b => this.disponibilidadSeleccionada[dia][b]);

      const horarios: Horario[] = bloquesDia.map(b => {
        const [inicio, fin] = b.split('-');
        return { hora_inicio: inicio, hora_fin: fin };
      });

      return {
        docente_id: this.docenteSeleccionadoId!,
        dia,
        modalidad: this.modalidadSeleccionada,
        turno: this.turnoSeleccionado!,
        horarios
      };
    });
  }


  async guardarDisponibilidad() {
    if (!this.docenteSeleccionadoId || !this.turnoSeleccionado) return;

    const seleccionadosCreate = this.obtenerSeleccionados();

    const seleccionadosUpdate: DisponibilidadDocenteUpdate[] = seleccionadosCreate.map(d => ({
      dia: d.dia,
      horarios: d.horarios // puede ser [] si no seleccionó nada
    }));

    try {
      await firstValueFrom(
        this.disponibilidadService.upsertByDocente(
          this.docenteSeleccionadoId,
          this.modalidadSeleccionada,
          this.turnoSeleccionado,
          seleccionadosUpdate
        )
      );
      alert('✅ Disponibilidad actualizada correctamente');
      this.cerrarModal();
    } catch (error) {
      console.error(error);
      alert('❌ Error al actualizar disponibilidad');
    }
  }




  eliminarDisponibilidad(dia: string) {
    if (!this.disponibilidadSeleccionada[dia]) return;
    Object.keys(this.disponibilidadSeleccionada[dia]).forEach(b => {
      this.disponibilidadSeleccionada[dia][b] = false;
    });
  }


  // Devuelve turnos válidos según modalidad y día
  getTurnosDisponibles(dia?: string): Turno[] {
    if (this.modalidadSeleccionada === 'PRESENCIAL') {
      return ['Mañana', 'Tarde', 'Noche'];
    }

    if (this.modalidadSeleccionada === 'DISTANCIA') {
      return ['Noche'];
    }

    if (this.modalidadSeleccionada === 'SEMIPRESENCIAL') {
      if (dia === 'Sábado') {
        return ['Mañana', 'Tarde', 'Noche'];
      }
      if (dia === 'Domingo') {
        return ['Mañana'];
      }
      return ['Noche'];
    }

    return [];
  }

  seleccionarModalidad(modalidad: Modalidad) {
    this.modalidadSeleccionada = modalidad;
    this.turnoSeleccionado = null;
    this.bloques = [];
    this.inicializarDisponibilidad();

    if (this.docenteSeleccionadoId) {
      this.disponibilidadService.getByDocente(this.docenteSeleccionadoId, modalidad).subscribe(disponibilidades => {
        this.tieneDisponibilidad = disponibilidades.length > 0;

        if (this.tieneDisponibilidad) {
          disponibilidades.forEach(d => {
            d.horarios.forEach((h: Horario) => {
              const bloque = `${h.hora_inicio}-${h.hora_fin}`;
              this.disponibilidadSeleccionada[d.dia] = this.disponibilidadSeleccionada[d.dia] || {};
              this.disponibilidadSeleccionada[d.dia][bloque] = true;
            });
          });
        }
      });
    }
  }



}
