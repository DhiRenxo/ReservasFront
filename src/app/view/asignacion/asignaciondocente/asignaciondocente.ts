import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CursoService } from '../../../core/services/curso.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { AsignacionDocenteService } from '../../../core/services/asignaciondocente.service';
import { Asignacion, AsignacionUpdate } from '../../../core/models/asignacion.model';
import { Docente } from '../../../core/models/docente.model';
import { CarreraModel } from '../../../core/models/carrera.model';

@Component({
  selector: 'app-asignaciondocente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignaciondocente.html'
})
export class Asignaciondocente implements OnInit {
  private asignacionService = inject(AsignacionService);
  private docenteService = inject(DocenteService);
  private cursoService = inject(CursoService);
  private carreraService = inject(CarreraService);
  private asignacionDocenteService = inject(AsignacionDocenteService);

  asignaciones: Asignacion[] = [];
  docentes: Docente[] = [];
  carreras: CarreraModel[] = [];
  loading = true;
  currentIndex = 0;

  ngOnInit(): void {
    Promise.all([
      this.asignacionService.listar().toPromise(),
      this.docenteService.listar().toPromise(),
      this.carreraService.listar().toPromise()
    ])
      .then(([asignaciones, docentes, carreras]) => {
        this.docentes = docentes || [];
        this.asignaciones = asignaciones || [];
        this.carreras = carreras || [];
        this.loading = false;
      })
      .catch(err => {
        console.error('Error al cargar datos:', err);
        this.loading = false;
      });
  }

  get asignacionActual(): Asignacion | undefined {
    return this.asignaciones[this.currentIndex];
  }

  getCarreraNombre(carreraId: number): string {
    const carrera = this.carreras.find(c => c.id === carreraId);
    return carrera ? carrera.nombre : '';
  }

  cargarCursos(asig: Asignacion) {
    // Evitar recarga si ya están
    if (asig.cursos && asig.cursos.length > 0) {
      this.ajustarDocentes(asig);
      return;
    }

    this.cursoService.getByFiltro(asig.carreraid, asig.plan, asig.ciclo)
      .subscribe(cursos => {
        asig.cursos = cursos || [];
        this.ajustarDocentes(asig);
      });
  }

  private ajustarDocentes(asig: Asignacion) {
    const totalSlots = (asig.cursos?.length || 0) * (asig.cantidad_secciones || 1);
    if (!asig.docentes) asig.docentes = [];

    if (asig.docentes.length < totalSlots) {
      const faltantes = totalSlots - asig.docentes.length;
      for (let i = 0; i < faltantes; i++) {
        asig.docentes.push({
          id: 0,
          nombre: '',
          codigo: '',
          estado: true,
          tipocontrato: '',
          horassemanal: 0,
          horasactual: 0,
          horastemporales: 0
        });
      }
    } else if (asig.docentes.length > totalSlots) {
      asig.docentes = asig.docentes.slice(0, totalSlots);
    }
  }

  guardarCambios(asignacion: Asignacion): void {
    const curso_ids: number[] = [];
    const docente_ids: number[] = [];

    asignacion.cursos?.forEach(curso => {
      for (let s = 0; s < asignacion.cantidad_secciones; s++) {
        curso_ids.push(curso.id!);
      }
    });

    asignacion.docentes?.forEach(doc => {
      docente_ids.push(doc.id || 0);
    });

    const updateData: AsignacionUpdate = {
      carreraid: asignacion.carreraid,
      plan: asignacion.plan,
      ciclo: asignacion.ciclo,
      fecha_inicio: asignacion.fecha_inicio,
      modalidad: asignacion.modalidad,
      cantidad_secciones: asignacion.cantidad_secciones,
      secciones_asignadas: asignacion.secciones_asignadas,
      estado: asignacion.estado,
      curso_ids,
      docente_ids
    };

    this.asignacionService.actualizar(asignacion.id, updateData).subscribe({
      next: () => alert(`Asignación ${asignacion.id} actualizada con éxito`),
      error: (err) => {
        console.error(err);
        alert(`Error al actualizar asignación ${asignacion.id}`);
      }
    });
  }

  onDocenteChange(asig: Asignacion, index: number) {
    const docenteId = asig.docentes?.[index]?.id || 0;
    if (docenteId > 0) {
      this.docenteService.obtener(docenteId).subscribe({
        next: (docente) => {
          Object.assign(asig.docentes![index], {
            horassemanal: docente.horassemanal,
            horasactual: docente.horasactual ?? 0
          });

          this.asignacionDocenteService.getHorasDocente(docenteId).subscribe({
            next: (resp) => {
              asig.docentes![index].horastemporales = resp.horastemporales;
            },
            error: (err) => console.error(`Error obteniendo horas temporales:`, err)
          });
        },
        error: (err) => console.error(`Error obteniendo docente:`, err)
      });
    } else if (asig.docentes && asig.docentes[index]) {
      Object.assign(asig.docentes[index], {
        horassemanal: 0,
        horasactual: 0,
        horastemporales: 0
      });
    }
  }

  guardarCantidadSecciones(asignacion: Asignacion): void {
    this.asignacionService.actualizarCantidadSecciones(asignacion.id, {
      cantidad_secciones: asignacion.cantidad_secciones
    }).subscribe({
      next: () => alert(`Cantidad de secciones actualizada para la asignación #${asignacion.id}`),
      error: (err) => {
        console.error(err);
        alert(`Error al actualizar cantidad de secciones`);
      }
    });
  }

  anterior() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.cargarCursos(this.asignacionActual!);
    }
  }

  siguiente() {
    if (this.currentIndex < this.asignaciones.length - 1) {
      this.currentIndex++;
      this.cargarCursos(this.asignacionActual!);
    }
  }
}
