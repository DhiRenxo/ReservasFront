import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CursoService } from '../../../core/services/curso.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { CursoModel } from '../../../core/models/Curso.model';
import { CarreraModel } from '../../../core/models/carrera.model';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { Asignacion, AsignacionCreate } from '../../../core/models/asignacion.model';
import { of } from 'rxjs';
declare var bootstrap: any;


@Component({
  selector: 'app-asignacion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'asignacioncreate.html'
})
export class AsignacionCreateComponent implements OnInit {
  cursos: CursoModel[] = [];
  carreras: CarreraModel[] = [];
  asignaciones: Asignacion[] = [];
  asignacionForm!: FormGroup;
  cursosFiltrados: CursoModel[] = [];

  planes = ['2023', '2019'];
  ciclos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  constructor(
    private cursoService: CursoService,
    private carreraService: CarreraService,
    private asignacionService: AsignacionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.asignacionForm = this.fb.group({
      plan: ['2023'],
      ciclo: ['1'],
      carreraid: [null],
      curso_docente: this.fb.array([])
    });

    this.cargarCarreras();
    this.cargarAsignaciones();
    this.asignacionForm.get('carreraid')!.valueChanges.subscribe(() => this.filtrarCursos());
    this.asignacionForm.get('ciclo')!.valueChanges.subscribe(() => this.filtrarCursos());
  }

  cargarCarreras(): void {
    this.carreraService.listar().subscribe(carreras => {
      this.carreras = carreras;
    });
  }

  cargarAsignaciones(): void {
    this.asignacionService.listar().subscribe(asignaciones => this.asignaciones = asignaciones);
  }

  filtrarCursos(): void {
    const carreraid = this.asignacionForm.get('carreraid')!.value;
    const ciclo = this.asignacionForm.get('ciclo')!.value;

    if (!carreraid || !ciclo) return;

    this.cursoService.getActivos().subscribe(cursos => {
      this.cursos = cursos.filter(c => c.carreid === carreraid && c.ciclo === ciclo);
      this.initCursoDocenteForm();
    });
  }

  initCursoDocenteForm(): void {
    const control = this.asignacionForm.get('curso_docente') as FormArray;
    control.clear();

    this.cursos.forEach(curso => {
      control.push(this.fb.group({
        curso_id: [curso.id],
        horas: [curso.horas],
        horas_asignadas: [curso.horas]  // editable
      }));
    });
  }

  guardarAsignacion(): void {
    const formValue = this.asignacionForm.value;

    const asignacion: AsignacionCreate = {
      carreraid: formValue.carreraid,
      plan: formValue.plan,
      ciclo: formValue.ciclo,
      cantidad_secciones: formValue.curso_docente.length,
      secciones_asignadas: formValue.curso_docente.length,
      curso_ids: formValue.curso_docente.map((cd: any) => cd.curso_id)
    };

    this.asignacionService.crear(asignacion).subscribe({
      next: (res) => {
        console.log('Asignación creada:', res);
        this.cargarAsignaciones(); // recargar la lista
        this.asignacionForm.reset({
          plan: '2023',
          ciclo: '1',
          carreraid: null,
          curso_docente: []
        });
        this.cursos = [];
      },
      error: (err) => console.error('Error al crear asignación:', err)
    });
  }

  getNombreCarrera(id: number): string {
    const carrera = this.carreras.find(c => c.id === id);
    return carrera ? carrera.nombre : 'Desconocida';
  }

  get cursoDocenteControls() {
    return (this.asignacionForm.get('curso_docente') as FormArray)?.controls || [];
  }


  mostrarCursos(carreraid: number, plan: string, ciclo: string): void {
  // 🪵 Mostrar en consola los valores de la asignación
  console.log('🟡 Consulta de cursos con:', { carreraid, plan, ciclo });

  this.cursoService.getByFiltro(carreraid, plan, ciclo).subscribe({
    next: (data) => {
      console.log('🟢 Respuesta de cursos:', data); // muestra los cursos traídos
      this.cursosFiltrados = data;

      // Mostrar el modal con Bootstrap
      const modal = new bootstrap.Modal(document.getElementById('modalCursos')!);
      modal.show();
    },
    error: (err) => {
      console.error('🔴 Error al cargar cursos:', err);
    }
  });
}

}
