import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { CarreraModel } from '../../../core/models/carrera.model';
import { CursoService } from '../../../core/services/curso.service';
import { CursoModel } from '../../../core/models/Curso.model';
import { AsignacionCreate, AsignacionResponse } from '../../../core/models/asignacion.model';
declare var bootstrap: any;

interface CursoModal extends CursoModel {
  selected: boolean;
}

@Component({
  selector: 'app-asignacion-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacioncreate.html'
})
export class AsignacionCreateComponent implements OnInit {
  asignaciones: AsignacionResponse[] = [];
  carreras: CarreraModel[] = [];
  carreraMap: { [key: number]: string } = {};
  ciclos: string[] = ['1','2','3','4','5','6','7','8','9','10'];
  cursosModal: CursoModal[] = [];
  modalData: AsignacionResponse | null = null;

  asignacion: AsignacionCreate = { carreraid: 0, plan: '', ciclo: '', modalidad: '', cantidad_secciones: 1, estado: true, fecha_inicio: '' };
  editMode: boolean = false;
  selectedId: number | null = null;

  constructor(private asignacionService: AsignacionService, private carreraService: CarreraService, private cursoService: CursoService) {}

  ngOnInit(): void {
    this.getAsignaciones();
    this.getCarreras();
  }

  getAsignaciones() {
    this.asignacionService.getAll().subscribe({
      next: (data) => (this.asignaciones = data),
      error: (err) => console.error('Error al obtener asignaciones', err)
    });
  }

  getCarreras() {
    this.carreraService.listar().subscribe({
      next: (data) => {
        this.carreras = data;
        this.carreraMap = data.reduce((acc, carrera) => { acc[carrera.id] = carrera.nombre; return acc; }, {} as { [key: number]: string });
      },
      error: (err) => console.error('Error al obtener carreras', err)
    });
  }

  createAsignacion() {
    this.asignacionService.create(this.asignacion).subscribe({
      next: () => { this.getAsignaciones(); this.resetForm(); },
      error: (err) => console.error('Error al crear asignación', err)
    });
  }

  editAsignacion(asig: AsignacionResponse) {
    this.asignacion = { 
      carreraid: asig.carreraid, 
      plan: asig.plan, 
      ciclo: asig.ciclo, 
      modalidad: asig.modalidad, 
      cantidad_secciones: asig.cantidad_secciones, 
      estado: asig.estado, 
      fecha_inicio: asig.fecha_inicio ? asig.fecha_inicio.split('T')[0] : '' 
    };
    this.editMode = true;
    this.selectedId = asig.id;
  }

  updateAsignacion() {
    if (!this.selectedId) return;

    // Convertir la fecha al formato que espera el backend (ISO datetime)
    const payload = {
      ...this.asignacion,
      fecha_inicio: this.asignacion.fecha_inicio 
        ? new Date(this.asignacion.fecha_inicio).toISOString() 
        : null
    };

    this.asignacionService.update(this.selectedId, payload).subscribe({
      next: () => { 
        this.getAsignaciones(); 
        this.resetForm(); 
      },
      error: (err) => {
        console.error('Error al actualizar asignación', err);
      }
    });
  }

  deleteAsignacion(id: number) {
    if (!confirm('¿Seguro de eliminar esta asignación?')) return;
    this.asignacionService.delete(id).subscribe({ next: () => this.getAsignaciones(), error: (err) => console.error('Error al eliminar asignación', err) });
  }

  resetForm() {
    this.asignacion = { carreraid: 0, plan: '', ciclo: '', modalidad: '', cantidad_secciones: 0, estado: true, fecha_inicio: new Date().toISOString().split('T')[0] };
    this.editMode = false;
    this.selectedId = null;
  }

  openModal(asig: AsignacionResponse) {
    this.modalData = asig;
    this.cursoService.getByFiltro(asig.carreraid, asig.plan ?? '', asig.ciclo ?? '', asig.modalidad ?? '').subscribe({
      next: (data) => {
        this.cursosModal = data.map(c => ({ ...c, selected: false }));
        const modalElement = document.getElementById('cursoModal');
        if (modalElement) { const modal = new bootstrap.Modal(modalElement); modal.show(); }
      },
      error: (err) => { console.error('Error al cargar cursos', err); this.cursosModal = []; }
    });
  }

  toggleEstado(asig: AsignacionResponse) {
    const nuevoEstado = !asig.estado;
    this.asignacionService.updateEstado(asig.id, { estado: nuevoEstado }).subscribe({
      next: () => { asig.estado = nuevoEstado; },
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }

  actualizarCursos() {
    if (!this.modalData) return;
    const cursosSeleccionadosIds: number[] = this.cursosModal
      .filter(c => c.selected && c.id !== undefined)
      .map(c => c.id as number);
    if (cursosSeleccionadosIds.length === 0) { alert('Seleccione al menos un curso'); return; }
    this.asignacionService.actualizarCursos(this.modalData.id, { curso_ids: cursosSeleccionadosIds }).subscribe({
      next: () => {
        this.cursosModal = this.cursosModal.map(c => ({ ...c, selected: cursosSeleccionadosIds.includes(c.id!) }));
        alert('Cursos actualizados correctamente');
      },
      error: (err) => { console.error('Error al actualizar cursos', err); alert('Error al actualizar cursos'); }
    });
  }
}
