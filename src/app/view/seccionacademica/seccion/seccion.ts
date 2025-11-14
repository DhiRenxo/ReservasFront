import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeccionModel } from '../../../core/models/seccion.model';
import { CarreraModel } from '../../../core/models/carrera.model';
import { SeccionService } from '../../../core/services/seccion.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-seccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `seccion.html`,
  styleUrls: []
})
export class Seccion implements OnInit {
  private seccionService = inject(SeccionService);
  private carreraService = inject(CarreraService);

  secciones: SeccionModel[] = [];
  carreras: CarreraModel[] = [];
  selectedCarreraId: number | null = null;
  nomCarrera = '';
  seccionCreada = false;

  // 👉 Agregado porque el HTML lo usa
  mostrarCrearModal: boolean = false;

  paginaActual = 1;
  elementosPorPagina = 20;
  mensajeEstado = '';
  errorEstado = '';
  Math = Math;

  filtros = {
    carreraId: null as number | null,
    estado: null as boolean | null,
    fechaInicio: '',
    fechaFin: ''
  };

  seccionesFiltradas: SeccionModel[] = [];

  ciclos = [1,2,3,4,5,6,7,8,9,10];

  seccion: Partial<SeccionModel> = {
    nombre: '',
    carreraid: 0,
    ciclo: 1,
    letra: '',
    turno: 'M',
    serie: 1,
    fecha_inicio: '',
    fecha_fin: '',
    fecha_creacion: '',
    estado: true
  };

  mostrarConfirmInactivar = false;
  seccionAInactivar: SeccionModel | null = null;

  mostrarPromptFecha = false;
  seccionAReactivar: SeccionModel | null = null;
  fechaNuevaInicio: string = '';
  fechaNuevaFin: string = '';

  cargando = false;

  ngOnInit() {
    this.loadSecciones();
    this.carreraService.listar().subscribe(res => {
      this.carreras = res;
      this.filtros.estado = true;
      this.aplicarFiltros();
    });
  }

  // 👉 Agregado: lo pide el HTML
  openCrearModal() {
    this.mostrarCrearModal = true;
  }

  // 👉 Completado: ahora sí cierra correcto
  cerrarModal() {
    this.mostrarCrearModal = false;
  }

  loadSecciones() {
    this.cargando = true;
    this.seccionService.getAll().subscribe({
      next: (res) => {
        this.secciones = res;
        this.aplicarFiltros();
      },
      complete: () => this.cargando = false
    });
  }

  onCarreraChange() {
    const carrera = this.carreras.find(c => c.id == this.selectedCarreraId);
    if (carrera) {
      this.nomCarrera = carrera.nomenglatura ?? carrera.nombre ?? '';
      this.seccion.carreraid = carrera.id;
      this.updateNombre();
    }
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.seccionesFiltradas.length / this.elementosPorPagina));
  }

  get seccionesPaginadas(): SeccionModel[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.seccionesFiltradas.slice(inicio, inicio + this.elementosPorPagina);
  }

  updateNombre() {
    const cicloNum = String(this.seccion.ciclo ?? '').padStart(2, '0');
    const letra = (this.seccion.letra ?? '').toUpperCase();
    const turno = this.seccion.turno ?? '';
    const serie = String(this.seccion.serie ?? '');
    this.seccion.nombre = `${this.nomCarrera}${cicloNum}${letra}${turno}${serie}`;
  }

  crearSeccion() {
    this.seccion.fecha_creacion = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.seccionService.create(this.seccion).subscribe({
      next: () => {
        this.loadSecciones();
        this.seccionCreada = true;
        this.cerrarModal();
        setTimeout(() => this.seccionCreada = false, 3000);
      }
    });
  }

  toggleEstado(s: SeccionModel) {
    if (s.estado) {
      this.seccionAInactivar = s;
      this.mostrarConfirmInactivar = true;
    } else {
      this.seccionAReactivar = s;
      this.mostrarPromptFecha = true;
    }
  }

  confirmarInactivar() {
    if (!this.seccionAInactivar) return;
    this.seccionService.cambiarEstado(this.seccionAInactivar.id, false).subscribe({
      next: () => {
        this.loadSecciones();
        this.mostrarConfirmInactivar = false;
        this.mensajeEstado = 'La sección fue marcada como inactiva correctamente.';
        setTimeout(() => this.mensajeEstado = '', 3000);
      },
      error: () => {
        this.errorEstado = 'Ocurrió un error al marcar la sección como inactiva.';
      }
    });
  }

  cancelarInactivar() {
    this.mostrarConfirmInactivar = false;
    this.seccionAInactivar = null;
    this.mensajeEstado = '';
    this.errorEstado = '';
  }

  confirmarReactivar() {
    if (!this.seccionAReactivar || !this.fechaNuevaInicio || !this.fechaNuevaFin) return;

    this.seccionService.reactivarSeccion(
      this.seccionAReactivar.id,
      this.fechaNuevaInicio,
      this.fechaNuevaFin
    ).subscribe({
      next: () => {
        this.loadSecciones();
        this.mostrarPromptFecha = false;
        this.mensajeEstado = 'La sección fue reactivada con las nuevas fechas.';
        this.fechaNuevaInicio = '';
        this.fechaNuevaFin = '';
        setTimeout(() => this.mensajeEstado = '', 3000);
      },
      error: () => {
        this.errorEstado = 'Ocurrió un error al reactivar la sección.';
      }
    });
  }

  cancelarReactivar() {
    this.mostrarPromptFecha = false;
    this.seccionAReactivar = null;
    this.fechaNuevaInicio = '';
    this.fechaNuevaFin = '';
    this.mensajeEstado = '';
    this.errorEstado = '';
  }

  aplicarFiltros() {
    const { carreraId, estado, fechaInicio, fechaFin } = this.filtros;
    const formatearFecha = (f: string | Date) => formatDate(f, 'yyyy-MM-dd', 'en');

    this.seccionesFiltradas = this.secciones
      .filter(s => {
        const coincideCarrera = !carreraId || s.carreraid === carreraId;
        const coincideEstado = estado == null || s.estado === estado;
        const coincideFI = !fechaInicio || formatearFecha(s.fecha_inicio) === fechaInicio;
        const coincideFF = !fechaFin || formatearFecha(s.fecha_fin) === fechaFin;
        return coincideCarrera && coincideEstado && coincideFI && coincideFF;
      })
      .sort((a, b) => a.letra.localeCompare(b.letra));

    this.paginaActual = 1;
  }

  resetearFiltros() {
    this.filtros = {
      carreraId: null,
      estado: true,
      fechaInicio: '',
      fechaFin: ''
    };
    this.aplicarFiltros();
  }

  getNombreCarrera(id: number | null | undefined) {
    const carrera = this.carreras.find(c => c.id === id);
    return carrera ? carrera.nombre : '';
  }
}
