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
  nombreCurso: string;
  horas: number;
  docente?: Docente;
  docenteIdTemp?: number | null; // docente temporal seleccionado
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
  seleccion: { [clave: string]: number | null } = {}; // docente temporal seleccionado

  constructor(
    private asignacionService: AsignacionService,
    private docenteService: DocenteService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
    this.cargarDocentes();
  }

  cargarAsignaciones() {
    this.asignacionService.getAll().subscribe(res => {
      this.asignaciones = res.filter(a => a.estado);
    });
  }

  cargarDocentes() {
    this.docenteService.listar().subscribe(res => {
      this.docentes = res.filter(d => d.estado);
      // Inicializamos horas temporales a 0
      this.docentes.forEach(d => d.horastemporales = 0);
    });
  }

  cargarCursos(asig: AsignacionResponse) {
    this.asignacionService.getRelaciones(asig.id).subscribe(relaciones => {
      const cursoIds = relaciones.map(r => r.curso_id);

      this.cursoService.getAll().subscribe(cursos => {
        const cursosMap = cursos
          .filter(c => cursoIds.includes(c.id!))
          .reduce((acc, c) => { acc[c.id!] = c; return acc; }, {} as { [id: number]: CursoModel });

        const cursosDuplicados: CursoAsignacion[] = [];

        relaciones.forEach(r => {
          for (let i = 0; i < asig.cantidad_secciones; i++) {
            const docenteAsignado = this.docentes.find(d => d.id === r.docente_id);

            cursosDuplicados.push({
              asignacion_id: r.asignacion_id,
              curso_id: r.curso_id,
              nombreCurso: cursosMap[r.curso_id]?.nombre || `Curso ${r.curso_id}`,
              horas: cursosMap[r.curso_id]?.horas || 0,
              docente: docenteAsignado,
              docenteIdTemp: docenteAsignado?.id || null
            });

            // Si ya hay un docente asignado, lo mostramos y sumamos horas temporales
            if (docenteAsignado) {
              const key = `${r.curso_id}_${i}`;
              this.seleccion[key] = docenteAsignado.id;
              docenteAsignado.horastemporales = (docenteAsignado.horastemporales || 0) + (cursosMap[r.curso_id]?.horas || 0);
            }
          }
        });

        this.cursosPorAsignacion[asig.id] = cursosDuplicados;
      });
    });
  }

  seleccionarDocente(clave: string, docenteId: number | null, curso: CursoAsignacion) {
    const docenteAnteriorId = this.seleccion[clave];

    if (docenteAnteriorId) {
      const docenteAnterior = this.docentes.find(d => d.id === docenteAnteriorId);
      if (docenteAnterior) {
        docenteAnterior.horastemporales = (docenteAnterior.horastemporales || 0) - curso.horas;
      }
    }

    if (docenteId) {
      const docenteNuevo = this.docentes.find(d => d.id === docenteId);
      if (docenteNuevo) {
        docenteNuevo.horastemporales = (docenteNuevo.horastemporales || 0) + curso.horas;
      }
      curso.docenteIdTemp = docenteId;
    } else {
      curso.docenteIdTemp = null;
    }

    this.seleccion[clave] = docenteId;
  }

  guardarDocente(curso: CursoAsignacion, index: number) {
    const key = `${curso.curso_id}_${index}`;
    const docenteId = this.seleccion[key];
    if (!docenteId) return;

    this.asignacionService.actualizarDocenteCurso(curso.asignacion_id, {
      curso_id: curso.curso_id,
      docente_id: docenteId
    }).subscribe(res => {
      alert(`Docente actualizado para el curso ${curso.nombreCurso}`);

      // Actualizamos horas actuales y temporales del docente
      const docente = this.docentes.find(d => d.id === docenteId);
      if (docente) {
        docente.horasactual = (docente.horasactual || 0) + curso.horas;
        docente.horastemporales = (docente.horastemporales || 0) - curso.horas;
        curso.docente = docente;
      }
    });
  }

  tieneCursos(asignacionId: number): boolean {
    return (this.cursosPorAsignacion[asignacionId]?.length || 0) > 0;
  }
}
