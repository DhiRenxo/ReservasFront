import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoAmbienteService } from '../../../core/services/tipoambiente.service';
import { TipoAmbienteModel } from '../../../core/models/tipoambiente.models';

declare var bootstrap: any;

@Component({
  selector: 'app-tipoambiente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipoambiente.html',
  styleUrl: './tipoambiente.scss'
})
export class Tipoambiente {
  nuevoTipo: TipoAmbienteModel = {
    id: 0,
    nombre: '',
    colorhex: '#000000'
  };

  alerta = {
    tipo: '',
    mensaje: ''
  };

  colorPersonalizado: string = '#000000';
  colorValido: boolean = true;
  mostrarPaletaExtendida: boolean = false;

  coloresBasicos = [
    { nombre: 'Rojo', hex: '#FF0000' },
    { nombre: 'Azul', hex: '#0000FF' },
    { nombre: 'Verde', hex: '#008000' },
    { nombre: 'Amarillo', hex: '#FFFF00' },
    { nombre: 'Negro', hex: '#000000' },
    { nombre: 'Blanco', hex: '#FFFFFF' },
    { nombre: 'Naranja', hex: '#FFA500' },
    { nombre: 'Morado', hex: '#800080' },
  ];

  coloresExtendidos = [
    { nombre: 'Turquesa', hex: '#40E0D0' },
    { nombre: 'Coral', hex: '#FF7F50' },
    { nombre: 'Marrón', hex: '#A52A2A' },
    { nombre: 'Rosado', hex: '#FFC0CB' },
    { nombre: 'Gris', hex: '#808080' },
    { nombre: 'Oliva', hex: '#808000' },
    { nombre: 'Cian', hex: '#00FFFF' },
    { nombre: 'Dorado', hex: '#FFD700' },
  ];

  constructor(
    private tipoAmbienteService: TipoAmbienteService
  ) {}

  guardarTipoAmbiente() {
    this.tipoAmbienteService.post(this.nuevoTipo).subscribe({
      next: () => {
        this.mostrarAlerta('success', 'Tipo de ambiente creado correctamente.');
        this.resetForm();
        const modal = document.getElementById('modalTipoAmbiente');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();
        }
      },
      error: () => {
        this.mostrarAlerta('error', 'Error al crear el tipo de ambiente.');
      }
    });
  }

  seleccionarColor(color: { nombre: string; hex: string }) {
    this.nuevoTipo.colorhex = color.hex;
    this.colorPersonalizado = ''
    this.colorValido = true;
  }

  seleccionarColorPersonalizado() {
    this.nuevoTipo.colorhex = this.colorPersonalizado;
    this.colorValido = true;
  }

  esColorPersonalizado(): boolean {
    return ![...this.coloresBasicos, ...this.coloresExtendidos].some(c => c.hex === this.nuevoTipo.colorhex);
  }

  alternarPaleta() {
    this.mostrarPaletaExtendida = !this.mostrarPaletaExtendida;
  }

  mostrarAlerta(tipo: 'success' | 'error', mensaje: string) {
    this.alerta.tipo = tipo;
    this.alerta.mensaje = mensaje;
    setTimeout(() => {
      this.alerta.tipo = '';
      this.alerta.mensaje = '';
    }, 3000);
  }

  resetForm() {
    this.nuevoTipo = {
      id: 0,
      nombre: '',
      colorhex: '#000000'
    };
    this.colorValido = true;
  }
}
