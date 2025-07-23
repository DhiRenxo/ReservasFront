import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../../core/services/curso.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { CursoModel } from '../../../core/models/Curso.model';
import { CarreraModel } from '../../../core/models/carrera.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;


@Component({
  selector: 'app-curso',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './curso.html',
  styleUrls: ['./curso.scss']
})
export class Curso implements OnInit {
  cursos: CursoModel[] = [];
  carreras: CarreraModel[] = [];

  filteredCursos: CursoModel[] = [];
  

  formCurso!: FormGroup;
  formEditarCurso!: FormGroup;
  cursoSeleccionado!: CursoModel | null;
  planesEstudio = ['2019', '2023'];
  ciclos = Array.from({ length: 10 }, (_, i) => `${i + 1}`);

  // Filtros
  filtroCarrera: string = '';
  filtroEstado: string = '';
  filtroNombre: string = '';
  filtroCodigo: string = '';
  filtroCiclo: string = '';
  filtroPlan: string = '';

  constructor(
    private cursoService: CursoService,
    private carreraService: CarreraService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.formCurso = this.fb.group({
      carreid: [null, Validators.required],
      ciclo: ['', Validators.required],
      plan: ['', Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      horas: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

    this.obtenerCursos();
    this.obtenerCarreras();

    this.formEditarCurso = this.fb.group({
      id: [null],
      carreid: [null, Validators.required],
      ciclo: ['', Validators.required],
      plan: ['', Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      horas: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

  }

  obtenerCursos(): void {
    this.cursoService.getAll().subscribe(data => {
      this.cursos = data;
      this.aplicarFiltros();
    });
  }

  obtenerCarreras(): void {
    this.carreraService.listar().subscribe(data => {
      this.carreras = data;
    });
  }

  crearCurso(): void {
    if (this.formCurso.invalid) return;

    const curso = {
      ...this.formCurso.value,
      carreid: Number(this.formCurso.value.carreid),
    };

    console.log('Datos enviados al backend:', curso);

    this.cursoService.create(curso).subscribe(() => {
      this.formCurso.reset();
      this.obtenerCursos();
    });
  }


  actualizar(curso: CursoModel): void {
    const updated = { ...curso };
    this.cursoService.update(curso.id!, updated).subscribe(() => {
      this.obtenerCursos();
    });
  }

  cambiarEstado(curso: CursoModel): void {
    this.cursoService.toggleEstado(curso.id!).subscribe(() => {
      this.obtenerCursos();
    });
  }

  aplicarFiltros(): void {
    this.filteredCursos = this.cursos.filter(curso => {
      const carreraNombre = this.obtenerNombreCarrera(curso.carreid).toLowerCase();
      return (
        (!this.filtroCarrera || carreraNombre.includes(this.filtroCarrera.toLowerCase())) &&
        (!this.filtroEstado || (this.filtroEstado === 'activo' ? curso.estado : !curso.estado)) &&
        (!this.filtroNombre || curso.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())) &&
        (!this.filtroCodigo || curso.codigo.toLowerCase().includes(this.filtroCodigo.toLowerCase())) &&
        (!this.filtroCiclo || curso.ciclo === this.filtroCiclo) &&
        (!this.filtroPlan || curso.plan === this.filtroPlan)
      );
    });
  }

  obtenerNombreCarrera(carreid: number): string {
    const carrera = this.carreras.find(c => c.id === carreid);
    return carrera ? carrera.nombre : 'Desconocido';
  }

  abrirModalEditar(curso: CursoModel): void {
    this.cursoSeleccionado = curso;
    this.formEditarCurso.patchValue(curso);
    const modal = new bootstrap.Modal(document.getElementById('editarCursoModal')!);
    modal.show();
  }
  actualizarCurso(): void {
    if (this.formEditarCurso.invalid) return;

    const cursoActualizado = this.formEditarCurso.value;
    this.cursoService.update(cursoActualizado.id, cursoActualizado).subscribe(() => {
      this.obtenerCursos();
    });
  }


}
