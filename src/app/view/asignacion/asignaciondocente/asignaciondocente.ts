import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CursoService } from '../../../core/services/curso.service';
import { AsignacionResponse } from '../../../core/models/asignacion.model';
import { Docente } from '../../../core/models/docente.model';
import { CursoModel } from '../../../core/models/Curso.model';
import { CarreraService } from '../../../core/services/carrera.service';
import { CarreraModel } from '../../../core/models/carrera.model'; 


interface CursoAsignacion {
  id: number;
  asignacion_id: number;
  curso_id: number;
  seccion: number;
  nombreCurso: string;
  horas: number;
  docente?: Docente;
  docenteIdTemp?: number | null;
  es_bloque?: boolean;
  bloque?: string | null;
  duplica_horas?: boolean;
  comentario?: string | null;
  disponibilidad?: string | null;
  activo?: boolean;
}

@Component({
  selector: 'app-asignacion-docente',
  standalone: true,
  templateUrl: './asignaciondocente.html',
  styleUrls: ['./asignaciondocente.scss'],
  imports: [CommonModule, FormsModule]
})
export class Asignaciondocente implements OnInit {
  asignaciones: AsignacionResponse[] = [];
  docentes: Docente[] = [];
  cursosPorAsignacion: { [asignacionId: number]: CursoAsignacion[] } = {};
  seleccion: { [clave: string]: number | null } = {};
  alerta: { tipo: 'success' | 'danger' | 'info' | null; mensaje: string } = { tipo: null, mensaje: '' };
  carrerasMap: { [id: number]: string } = {};


  constructor(
    private asignacionService: AsignacionService,
    private docenteService: DocenteService,
    private cursoService: CursoService,
    private carreraService: CarreraService
  ) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
    this.cargarDocentes();
    this.cargarCarreras();
  }

  mostrarAlerta(tipo: 'success' | 'danger' | 'info', mensaje: string) {
    this.alerta = { tipo, mensaje };
    setTimeout(() => (this.alerta = { tipo: null, mensaje: '' }), 3000);
  }

  cargarAsignaciones(carreraId?: number) {
    this.asignacionService.getAll().subscribe(res => {
      this.asignaciones = res.filter(a => a.estado && (!carreraId || a.carreraid === carreraId));
    });
  }

  cargarDocentes() {
    this.docenteService.listar().subscribe(res => {
      this.docentes = res.filter(d => d.estado);
    });
  }

  cargarCarreras() {
    this.carreraService.listar().subscribe(res => {
      this.carrerasMap = res.reduce((acc, carrera) => {
        acc[carrera.id] = carrera.nombre;
        return acc;
      }, {} as { [id: number]: string });
    });
  }

  cargarCursos(asig: AsignacionResponse) {
    this.asignacionService.getRelaciones(asig.id).subscribe(relaciones => {
      this.cursoService.getAll().subscribe(cursos => {
        const cursosMap = cursos.reduce((acc, c) => {
          acc[c.id!] = c;
          return acc;
        }, {} as { [id: number]: CursoModel });

        const cursosAsignados: CursoAsignacion[] = [];

        relaciones.forEach(r => {
          const docenteAsignado = this.docentes.find(d => d.id === r.docente_id);
          const clave = `${r.curso_id}_${r.seccion}`;

          cursosAsignados.push({
            id: r.id,
            asignacion_id: r.asignacion_id,
            curso_id: r.curso_id,
            seccion: r.seccion,
            nombreCurso: cursosMap[r.curso_id]?.nombre || `Curso ${r.curso_id}`,
            horas: cursosMap[r.curso_id]?.horas || 0,
            docente: docenteAsignado,
            docenteIdTemp: this.seleccion[clave] || docenteAsignado?.id || null,
            es_bloque: r.es_bloque,
            bloque: r.bloque,
            duplica_horas: r.duplica_horas,
            comentario: r.comentario,
            disponibilidad: r.disponibilidad,
            activo: (r as any).activo
          });

          if (!this.seleccion[clave] && docenteAsignado) {
            this.seleccion[clave] = docenteAsignado.id;
          }
        });

        this.cursosPorAsignacion[asig.id] = cursosAsignados;
      });
    });
  }

  seleccionarDocente(clave: string, docenteId: number | null, curso: CursoAsignacion) {
    this.seleccion[clave] = docenteId;
    curso.docenteIdTemp = docenteId;
  }

  guardarDocente(curso: CursoAsignacion) {
    const clave = `${curso.curso_id}_${curso.seccion}`;
    const docenteId = this.seleccion[clave];
    if (!docenteId) return;

    this.asignacionService.actualizarDocenteCurso(curso.asignacion_id, {
      curso_id: curso.curso_id,
      seccion: curso.seccion,
      docente_id: docenteId
    }).subscribe(() => {
      const docenteNuevo = this.docentes.find(d => d.id === docenteId);
      if (docenteNuevo) {
        curso.docente = docenteNuevo;
      }
      this.mostrarAlerta('success', `Docente actualizado para ${curso.nombreCurso} - sección ${curso.seccion}`);
    });
  }

  guardarRelacion(curso: CursoAsignacion) {
    this.asignacionService.actualizarRelacion(curso.id, {
      bloque: curso.bloque,
      es_bloque: curso.es_bloque,
      duplica_horas: curso.duplica_horas
    }).subscribe({
      next: () => {
        this.mostrarAlerta('info', `Relación actualizada para ${curso.nombreCurso} (Sección ${curso.seccion})`);
      },
      error: err => console.error("ERROR guardarRelacion", err)
    });
  }

  activarBloque(curso: CursoAsignacion) {
    this.asignacionService.activarBloque(curso.id, curso.bloque as 'A' | 'B')
      .subscribe({
        next: (res: any) => {
          curso.activo = res.activo; // 👈 ya no da error
          this.cursosPorAsignacion[curso.asignacion_id].forEach(c => {
            if (c.curso_id === curso.curso_id && c.seccion === curso.seccion && c.id !== curso.id) {
              c.activo = false;
            }
          });
          this.mostrarAlerta('success', `Se activó bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: err => console.error("ERROR activarBloque", err)
      });
  }

  recalcularHoras(docente: Docente) {
    this.asignacionService.recalcularHorasDocente(docente.id!).subscribe(res => {
      docente.horasactual = res.horasactual;
      docente.horastemporales = res.horastemporales;
      this.mostrarAlerta('success', `Horas recalculadas para ${docente.nombre}`);
    });
  }

  tieneCursos(asignacionId: number): boolean {
    return (this.cursosPorAsignacion[asignacionId]?.length || 0) > 0;
  }

  agregarSeccion(asig: AsignacionResponse) {
    const nuevaCantidad = (asig.cantidad_secciones || 0) + 1;

    this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: nuevaCantidad })
      .subscribe(updated => {
        asig.cantidad_secciones = updated.cantidad_secciones;
        const cursoIdsUnicos = Array.from(
          new Set((this.cursosPorAsignacion[asig.id] || []).map(c => c.curso_id))
        );

        this.asignacionService.actualizarCursos(asig.id, {
          curso_ids: cursoIdsUnicos
        }).subscribe(() => {
          this.cargarCursos(asig);
          this.mostrarAlerta('success', `Se agregó la sección ${nuevaCantidad}`);
        });
      });
  }

  quitarSeccion(asig: AsignacionResponse) {
    if (asig.cantidad_secciones <= 1) {
      this.mostrarAlerta('danger', 'No puedes tener menos de 1 sección');
      return;
    }

    const ultimaSeccion = asig.cantidad_secciones;

    this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: ultimaSeccion - 1 })
      .subscribe(updated => {
        asig.cantidad_secciones = updated.cantidad_secciones;
        this.asignacionService.deleteSeccion(asig.id, ultimaSeccion).subscribe(() => {
          this.cargarCursos(asig);
          this.mostrarAlerta('danger', `Se eliminó la sección ${ultimaSeccion}`);
        });
      });
  }

  desactivarAsignacion(asig: AsignacionResponse) {
    this.asignacionService.updateEstado(asig.id, { estado: false }).subscribe(updated => {
      asig.estado = false;

      (this.cursosPorAsignacion[asig.id] || []).forEach(curso => {
        if (curso.activo) {
          curso.activo = false; 
          this.asignacionService.desactivarBloque(curso.id).subscribe({
            next: () => {},
            error: err => console.error("ERROR desactivarBloque", err)
          });
        }
      });

      this.mostrarAlerta('danger', 'Asignación desactivada y bloques inactivos');
    });
  }

  activarAsignacion(asig: AsignacionResponse) {
    this.asignacionService.updateEstado(asig.id, { estado: true }).subscribe(updated => {
      asig.estado = true;
      this.mostrarAlerta('success', 'Asignación activada. Los bloques permanecen inactivos');
    });
  }



  toggleBloque(curso: CursoAsignacion) {
    if (curso.activo) {
      this.asignacionService.desactivarBloque(curso.id).subscribe({
        next: () => {
          curso.activo = false;
          this.mostrarAlerta('danger', `Se desactivó el bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: (err: any) => console.error("ERROR desactivarBloque", err)
      });
    } else {
      this.asignacionService.activarBloque(curso.id, curso.bloque as 'A' | 'B').subscribe({
        next: (res: any) => {
          curso.activo = res.activo;
          this.cursosPorAsignacion[curso.asignacion_id].forEach(c => {
            if (c.curso_id === curso.curso_id && c.seccion === curso.seccion && c.id !== curso.id) {
              c.activo = false;
            }
          });
          this.mostrarAlerta('success', `Se activó bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: (err: any) => console.error("ERROR activarBloque", err)
      });
    }
  }

}
