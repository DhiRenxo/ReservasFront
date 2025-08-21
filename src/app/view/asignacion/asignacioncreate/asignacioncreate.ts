import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import {
  AsignacionCreate,
  AsignacionResponse,
  AsignacionUpdate
} from '../../../core/models/asignacion.model';

@Component({
  selector: 'app-asignacion-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacioncreate.html'
})
export class AsignacionCreateComponent implements OnInit {
  asignaciones: AsignacionResponse[] = [];

  asignacion: AsignacionCreate = {
    carreraid: 0,
    plan: '',
    ciclo: '',
    modalidad: '',
    cantidad_secciones: 0,
    estado: true,
    fecha_inicio: new Date()
  };

  editMode: boolean = false;
  selectedId: number | null = null;

  constructor(private asignacionService: AsignacionService) {}

  ngOnInit(): void {
    this.getAsignaciones();
  }

  // 📌 Listar asignaciones
  getAsignaciones() {
    this.asignacionService.getAll().subscribe({
      next: (data) => (this.asignaciones = data),
      error: (err) => console.error('Error al obtener asignaciones', err)
    });
  }

  // 📌 Crear asignación
  createAsignacion() {
    this.asignacionService.create(this.asignacion).subscribe({
      next: () => {
        this.getAsignaciones();
        this.resetForm();
      },
      error: (err) => console.error('Error al crear asignación', err)
    });
  }

  // 📌 Cargar datos para editar
  editAsignacion(asig: AsignacionResponse) {
    this.asignacion = {
      carreraid: asig.carreraid,
      plan: asig.plan,
      ciclo: asig.ciclo,
      modalidad: asig.modalidad,
      cantidad_secciones: asig.cantidad_secciones,
      estado: asig.estado,
      fecha_inicio: asig.fecha_inicio
    };
    this.editMode = true;
    this.selectedId = asig.id;
  }

  // 📌 Actualizar asignación
  updateAsignacion() {
    if (!this.selectedId) return;

    const update: AsignacionUpdate = this.asignacion;
    this.asignacionService.update(this.selectedId, update).subscribe({
      next: () => {
        this.getAsignaciones();
        this.resetForm();
      },
      error: (err) => console.error('Error al actualizar asignación', err)
    });
  }

  // 📌 Eliminar asignación
  deleteAsignacion(id: number) {
    if (!confirm('¿Seguro de eliminar esta asignación?')) return;

    this.asignacionService.delete(id).subscribe({
      next: () => this.getAsignaciones(),
      error: (err) => console.error('Error al eliminar asignación', err)
    });
  }

  // 📌 Resetear formulario
  resetForm() {
    this.asignacion = {
      carreraid: 0,
      plan: '',
      ciclo: '',
      modalidad: '',
      cantidad_secciones: 0,
      estado: true,
      fecha_inicio: new Date()
    };
    this.editMode = false;
    this.selectedId = null;
  }
}
