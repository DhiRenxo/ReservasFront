import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CursoService } from '../../../core/services/curso.service';
import { AsignacionResponse } from '../../../core/models/asignacion.model';
import { Docente } from '../../../core/models/docente.model';
import { CursoModel } from '../../../core/models/Curso.model';

interface CursoAsignacion {
  asignacion_id: number;
  curso_id: number;
  seccion: number;
  nombreCurso: string;
  horas: number;
  docente?: Docente;
  docenteIdTemp?: number | null;

  // 🔹 Nuevos campos de la relación
  es_bloque?: boolean;
  bloque?: string | null;
  duplica_horas?: boolean;
  comentario?: string | null;
  disponibilidad?: string | null;
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

  constructor(
    private asignacionService: AsignacionService,
    private docenteService: DocenteService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
    this.cargarDocentes();
  }

  cargarAsignaciones(carreraId?: number) {
    this.asignacionService.getAll().subscribe(res => {
      this.asignaciones = res.filter(a =>
        a.estado && (!carreraId || a.carreraid === carreraId)
      );
    });
  }

  cargarDocentes() {
    this.docenteService.listar().subscribe(res => {
      this.docentes = res.filter(d => d.estado);
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
            asignacion_id: r.asignacion_id,
            curso_id: r.curso_id,
            seccion: r.seccion,
            nombreCurso: cursosMap[r.curso_id]?.nombre || `Curso ${r.curso_id}`,
            horas: cursosMap[r.curso_id]?.horas || 0,
            docente: docenteAsignado,
            docenteIdTemp: this.seleccion[clave] || docenteAsignado?.id || null,

            // 🔹 campos de bloques, comentarios y disponibilidad
            es_bloque: r.es_bloque,
            bloque: r.bloque,
            duplica_horas: r.duplica_horas,
            comentario: r.comentario,
            disponibilidad: r.disponibilidad
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
      alert(`✅ Docente actualizado para el curso ${curso.nombreCurso} - sección ${curso.seccion}`);
    });
  }

  /** 🔹 Guardar los campos de bloque/comentario/disponibilidad */
  guardarRelacion(curso: CursoAsignacion) {
    this.asignacionService.actualizarRelacion(curso.asignacion_id, {
      curso_id: curso.curso_id,
      seccion: curso.seccion,
      es_bloque: curso.es_bloque,
      bloque: curso.bloque,
      duplica_horas: curso.duplica_horas,
      comentario: curso.comentario,
      disponibilidad: curso.disponibilidad,
      docente_id: curso.docenteIdTemp || null
    }).subscribe(() => {
      alert(`✅ Relación actualizada para ${curso.nombreCurso} (Sección ${curso.seccion})`);
    });
  }

  recalcularHoras(docente: Docente) {
    this.asignacionService.recalcularHorasDocente(docente.id!).subscribe(res => {
      docente.horasactual = res.horasactual;
      docente.horastemporales = res.horastemporales;
      alert(`🔄 Horas recalculadas para ${docente.nombre}`);
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
          alert(`✅ Se agregó la sección ${nuevaCantidad} a la asignación`);
        });
      });
  }

  quitarSeccion(asig: AsignacionResponse) {
    if (asig.cantidad_secciones <= 1) {
      alert("⚠️ No puedes tener menos de 1 sección");
      return;
    }

    const ultimaSeccion = asig.cantidad_secciones;

    this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: ultimaSeccion - 1 })
      .subscribe(updated => {
        asig.cantidad_secciones = updated.cantidad_secciones;
        this.asignacionService.deleteSeccion(asig.id, ultimaSeccion).subscribe(() => {
          this.cargarCursos(asig);
          alert(`❌ Se eliminó la sección ${ultimaSeccion} de la asignación`);
        });
      });
  }

  desactivarAsignacion(asig: AsignacionResponse) {
    if (!confirm("❌ ¿Seguro que deseas desactivar esta asignación?")) return;

    this.asignacionService.updateEstado(asig.id, { estado: false }).subscribe(updated => {
      asig.estado = false;
      alert("🚫 Asignación desactivada correctamente");
    });
  }
}
