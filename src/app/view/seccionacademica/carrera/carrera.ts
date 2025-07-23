import { Component, OnInit } from '@angular/core';
import { CarreraService } from '../../../core/services/carrera.service';
import { CarreraModel } from '../../../core/models/carrera.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrera',
  templateUrl: './carrera.html',
  styleUrls: ['./carrera.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class Carrera implements OnInit {
  carreras: CarreraModel[] = [];
  carrerasPaginadas: CarreraModel[] = [];
  carreraForm: FormGroup;
  editMode = false;
  currentId: number | null = null;

  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  pages: number[] = [];

  constructor(
    private carreraService: CarreraService,
    private fb: FormBuilder
  ) {
    this.carreraForm = this.fb.group({
      nombre: ['', Validators.required],
      nomenglatura: ['', [Validators.required, Validators.maxLength(1), Validators.minLength(1)]],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.listar();
  }

   listar(): void {
    this.carreraService.listar().subscribe(data => {
      this.carreras = data;
      this.totalPages = Math.ceil(this.carreras.length / this.itemsPerPage);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.paginarCarreras();
    });
  }

  paginarCarreras(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.carrerasPaginadas = this.carreras.slice(start, end);
  }

  cambiarPagina(pagina: number): void {
    this.currentPage = pagina;
    this.paginarCarreras();
  }

  enviar(): void {
    if (this.carreraForm.invalid) return;

    if (this.editMode && this.currentId !== null) {
      
      this.carreraService.actualizar(this.currentId, this.carreraForm.value).subscribe(() => {
        this.resetForm();
        this.listar();
      });
    } else {
      this.carreraService.crear(this.carreraForm.value).subscribe(() => {
        this.resetForm();
        this.listar();
      });
    }
  }

  editar(carrera: CarreraModel): void {
    this.editMode = true;
    this.currentId = carrera.id;
    this.carreraForm.patchValue(carrera);
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta carrera?')) {
      this.carreraService.eliminar(id).subscribe(() => this.listar());
    }
  }

  resetForm(): void {
    this.editMode = false;
    this.currentId = null;
    this.carreraForm.reset({
    nombre: '',
    nomenglatura: '',
    status: true 
    });
  }
}
