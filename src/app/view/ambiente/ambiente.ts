import { Component, OnInit } from '@angular/core';
import { AmbienteService} from '../../core/services/ambiente.service';
import { AmbienteModel } from '../../core/models/ambiente.models';
import { TipoAmbienteModel } from '../../core/models/tipoambiente.models';
import { TipoAmbienteService } from '../../core/services/tipoambiente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tipoambiente } from './tipoambiente/tipoambiente';

@Component({
  selector: 'app-ambiente',
  standalone: true,
  imports: [CommonModule, FormsModule, Tipoambiente],
  templateUrl: './ambiente.html',
  styleUrl: './ambiente.scss'
})
export class Ambiente implements OnInit {
  ambientes: AmbienteModel[] = [];
  tiposAmbiente: TipoAmbienteModel[] = [];

  mostrarForm = false;

  nuevoAmbiente: AmbienteModel = {
    id: 0,
    codigo: '',
    tipoid: 0,
    capacidad: 0,
    equipamiento: '',
    ubicacion: '',
    activo: true
  };

  constructor(
    private ambienteService: AmbienteService,
    private tipoAmbienteService: TipoAmbienteService
  ) {}

  ngOnInit() {
    this.cargarAmbientes();
    this.cargarTipos();
  }

  mostrarFormulario() {
    this.mostrarForm = true;
  }

  cancelar() {
    this.mostrarForm = false;
    this.resetFormulario();
  }

  cargarAmbientes() {
    this.ambienteService.listar().subscribe(data => this.ambientes = data);
  }

  cargarTipos() {
    this.tipoAmbienteService.getAll().subscribe(data => this.tiposAmbiente = data);
  }

  guardarAmbiente() {
    this.ambienteService.crear(this.nuevoAmbiente).subscribe({
      next: () => {
        this.cargarAmbientes();
        this.cancelar();
      },
      error: (err) => {
        alert('Error al guardar ambiente');
        console.error(err);
      }
    });
  }

  cambiarEstado(ambiente: AmbienteModel) {
    this.ambienteService.cambiarEstado(ambiente.id, !ambiente.activo).subscribe({
      next: () => this.cargarAmbientes(),
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }

  obtenerNombreTipo(id: number): string {
    const tipo = this.tiposAmbiente.find(t => t.id === id);
    return tipo ? tipo.nombre : 'Desconocido';
  }

  resetFormulario() {
    this.nuevoAmbiente = {
      id: 0,
      codigo: '',
      tipoid: 0,
      capacidad: 0,
      equipamiento: '',
      ubicacion: '',
      activo: true
    };
  }
}
