import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
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

  asignaciones: Asignacion[] = [];
  docentes: Docente[] = [];
  loading = true;

  ngOnInit(): void {
    Promise.all([
      this.asignacionService.listar().toPromise(),
      this.docenteService.listar().toPromise()
    ])
    .then(([asignaciones, docentes]) => {
      this.docentes = docentes || [];

      // Inicializamos docentes por cada asignación y curso
      this.asignaciones = (asignaciones || []).map(asig => {
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
        return asig;
      });

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
}
