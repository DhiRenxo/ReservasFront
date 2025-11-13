import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../../core/services/curso.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { CursoModel } from '../../../core/models/Curso.model';
import { CarreraModel } from '../../../core/models/carrera.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-curso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './curso.html',
  styleUrls: ['./curso.css']
})
export class Curso implements OnInit {

  // Datos como Signals
  cursos = signal<CursoModel[]>([]);
  carreras = signal<CarreraModel[]>([]);

  // Formularios
  formCurso!: FormGroup;
  formEditarCurso!: FormGroup;
  cursoSeleccionado!: CursoModel | null;

  // Modal
  modalCrearVisible = signal(false);
  modalEditarVisible = signal(false);

  // Filtros como formulario reactivo
  filtrosForm!: FormGroup;

  planesEstudio = ['2019', '2023'];
  ciclos = Array.from({ length: 10 }, (_, i) => `${i + 1}`);

  // Cursos filtrados como computed
  filteredCursos = computed(() => {
    const filtros = this.filtrosForm.value;
    return this.cursos().filter(c => this.filtrarCurso(c, filtros));
  });

  constructor(
    private cursoService: CursoService,
    private carreraService: CarreraService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Formularios
    this.formCurso = this.fb.group({
      carreid: [null, Validators.required],
      modalidad: ['PRESENCIAL'],
      ciclo: ['', Validators.required],
      plan: ['', Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      horas: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

    this.formEditarCurso = this.fb.group({
      id: [null],
      carreid: [null, Validators.required],
      modalidad: ['PRESENCIAL'],
      ciclo: ['', Validators.required],
      plan: ['', Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      horas: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

    // Filtros
    this.filtrosForm = this.fb.group({
      carrera: [''],
      nombre: [''],
      codigo: [''],
      estado: [''],
      ciclo: [''],
      plan: ['']
    });

    // Cargar datos iniciales
    this.obtenerCarreras();
    this.obtenerCursos();

    // Reactividad en filtros
    this.filtrosForm.valueChanges.subscribe(() => {
      // filteredCursos se recalcula automáticamente
    });
  }

  // Métodos
  obtenerCursos() {
    this.cursoService.getAll().subscribe(data => this.cursos.set(data));
  }

  obtenerCarreras() {
    this.carreraService.listar().subscribe(data => this.carreras.set(data));
  }

  crearCurso() {
    if (this.formCurso.invalid) return;

    const curso: CursoModel = {
      ...this.formCurso.value,
      carreid: Number(this.formCurso.value.carreid)
    };

    console.log('Datos a crear:', curso);

    this.cursoService.create(curso).subscribe(() => {
      console.log('Curso creado correctamente');
      this.formCurso.reset({ modalidad: 'PRESENCIAL' });
      this.modalCrearVisible.set(false);

      // Actualizar signal para que filteredCursos se recalculen
      this.obtenerCursos();
    });
  }

  abrirModalCrear() { this.modalCrearVisible.set(true); }
  cerrarModalCrear() { this.modalCrearVisible.set(false); }

  abrirModalEditar(curso: CursoModel) {
    this.cursoSeleccionado = curso;
    this.formEditarCurso.patchValue(curso);
    this.modalEditarVisible.set(true);
  }
  cerrarModalEditar() { this.modalEditarVisible.set(false); }

  actualizarCurso() {
    if (this.formEditarCurso.invalid) return;

    const cursoActualizado = this.formEditarCurso.value;

    this.cursoService.update(cursoActualizado.id, cursoActualizado).subscribe(() => {
      this.modalEditarVisible.set(false);
      this.obtenerCursos();
    });
  }

  cambiarEstado(curso: CursoModel) {
    this.cursoService.toggleEstado(curso.id!).subscribe(() => this.obtenerCursos());
  }

  obtenerNombreCarrera(carreid: number) {
    const carrera = this.carreras().find(c => c.id === carreid);
    return carrera ? carrera.nombre : 'Desconocido';
  }

  private filtrarCurso(c: CursoModel, filtros: any): boolean {
    const nombreCarrera = this.obtenerNombreCarrera(c.carreid).toLowerCase();
    const estado = c.estado ?? false;

    return (
      (!filtros.carrera || nombreCarrera.includes(filtros.carrera.toLowerCase())) &&
      (!filtros.estado || (filtros.estado === 'activo' ? estado : !estado)) &&
      (!filtros.nombre || c.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (!filtros.codigo || c.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())) &&
      (!filtros.ciclo || c.ciclo === filtros.ciclo) &&
      (!filtros.plan || c.plan === filtros.plan)
    );
  }

}
