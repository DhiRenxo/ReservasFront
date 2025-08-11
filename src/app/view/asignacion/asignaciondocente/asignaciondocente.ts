import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CursoService } from '../../../core/services/curso.service';
import { Asignacion, AsignacionUpdate } from '../../../core/models/asignacion.model';
import { Docente } from '../../../core/models/docente.model';

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

  asignaciones: Asignacion[] = [];
  docentes: Docente[] = [];
  loading = true;

  ngOnInit(): void {
    Promise.all([
      this.asignacionService.listar().toPromise(),
      this.docenteService.listar().toPromise()
    ])
    .then(async ([asignaciones, docentes]) => {
      this.docentes = docentes || [];

      // Traer cursos filtrados para cada asignación
      for (const asig of asignaciones || []) {
        const cursos = await this.cursoService
          .getByFiltro(asig.carreraid, asig.plan, asig.ciclo)
          .toPromise();

        asig.cursos = cursos || [];

        // Inicializar docentes por cada curso
        if (!asig.docentes) {
          asig.docentes = [];
        }
        if (asig.docentes.length < (asig.cursos?.length || 0)) {
          const faltantes = (asig.cursos?.length || 0) - asig.docentes.length;
          for (let i = 0; i < faltantes; i++) {
            asig.docentes.push({
              id: 0,
              nombre: '',
              codigo: '',
              estado: true,
              tipocontrato: '',
              horassemanal: 0
            });
          }
        }
      }

      this.asignaciones = asignaciones || [];
      this.loading = false;
    })
    .catch(err => {
      console.error('Error al cargar datos:', err);
      this.loading = false;
    });
  }

  guardarCambios(asignacion: Asignacion): void {
    const updateData: AsignacionUpdate = {
      carreraid: asignacion.carreraid,
      plan: asignacion.plan,
      ciclo: asignacion.ciclo,
      modalidad: asignacion.modalidad,
      cantidad_secciones: asignacion.cantidad_secciones,
      secciones_asignadas: asignacion.secciones_asignadas,
      estado: asignacion.estado,
      curso_ids: asignacion.cursos?.map(c => c.id!) || [],
      docente_ids: asignacion.docentes?.map(d => d.id) || []
    };

    this.asignacionService.actualizar(asignacion.id, updateData).subscribe({
      next: () => {
        alert(`Asignación ${asignacion.id} actualizada con éxito`);
      },
      error: (err) => {
        console.error(err);
        alert(`Error al actualizar asignación ${asignacion.id}`);
      }
    });
  }

  /**
   * Evento que se dispara al cambiar el docente en el select
   */
  onDocenteChange(asig: Asignacion, index: number) {
    // Nos aseguramos que asig.docentes esté inicializado
    if (!asig.docentes) {
      asig.docentes = [];
    }

    // Si la posición no existe, la inicializamos
    if (!asig.docentes[index]) {
      asig.docentes[index] = {
        id: 0,
        nombre: '',
        codigo: '',
        estado: true,
        tipocontrato: '',
        horassemanal: 0,
        horasactual: 0,
      };
    }

    const docenteId = asig.docentes[index].id;
    console.log(`Fila ${index}: ID de docente seleccionado ->`, docenteId);

    if (docenteId && docenteId > 0) {
      this.docenteService.obtener(docenteId).subscribe({
        next: (docente) => {
          console.log(
            `Fila ${index}: Docente encontrado ->`,
            docente.nombre,
            '| Horas semanales ->',
            docente.horassemanal,
            '| Horas actual ->',
            docente.horasactual
          );
          asig.docentes![index].horassemanal = docente.horassemanal;
          asig.docentes![index].horasactual = docente.horasactual ?? 0; // con ! porque ya validamos
        },
        error: (err) => {
          console.error(`Fila ${index}: Error obteniendo docente`, err);
        }
      });
    } else {
      asig.docentes![index].horassemanal = 0;
      asig.docentes![index].horasactual = 0; // también seguro
    }
  }

}
