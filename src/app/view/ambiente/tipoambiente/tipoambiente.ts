import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgStyle } from '@angular/common';
import { TipoAmbienteService } from '../../../core/services/tipoambiente.service';
import { TipoAmbienteModel } from '../../../core/models/tipoambiente.models';

@Component({
  selector: 'app-tipoambiente',
  standalone: true,
  imports: [FormsModule, NgClass, NgStyle],
  templateUrl: './tipoambiente.html',
  styleUrls: ['./tipoambiente.css']
})
export class Tipoambiente {
  @Output() tipoCreado = new EventEmitter<TipoAmbienteModel>();

  modalVisible = false;
  editando = false;

  nuevoTipo: TipoAmbienteModel = {
    id: 0,
    nombre: '',
    colorhex: '#000000'
  };

  alerta = { tipo: '', mensaje: '' };

  colorPersonalizado = '#000000';
  colorValido = true;
  mostrarPaletaExtendida = false;

  coloresBasicos = [
    { nombre: 'Rojo', hex: '#E11D48' },
    { nombre: 'Blanco', hex: '#FFFFFF' },
    { nombre: 'Negro', hex: '#000000' },
    { nombre: 'Gris', hex: '#9CA3AF' },
    { nombre: 'Azul', hex: '#2563EB' },
    { nombre: 'Verde', hex: '#16A34A' },
    { nombre: 'Amarillo', hex: '#FACC15' },
    { nombre: 'Morado', hex: '#7C3AED' }
  ];

  coloresExtendidos = [
    { nombre: 'Coral', hex: '#FB7185' },
    { nombre: 'Turquesa', hex: '#14B8A6' },
    { nombre: 'Dorado', hex: '#FBBF24' },
    { nombre: 'Rosa', hex: '#F472B6' },
    { nombre: 'Cian', hex: '#06B6D4' },
    { nombre: 'Oliva', hex: '#84CC16' },
    { nombre: 'Marrón', hex: '#92400E' },
    { nombre: 'Gris oscuro', hex: '#374151' }
  ];

  constructor(private tipoAmbienteService: TipoAmbienteService) {}

  abrirModal() {
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.editando = false;
    this.resetForm();
  }

  editarTipo(tipo: TipoAmbienteModel) {
    this.nuevoTipo = { ...tipo };
    this.colorPersonalizado = tipo.colorhex;
    this.editando = true;
    this.modalVisible = true;
  }

  guardarTipoAmbiente() {
    if (!this.nuevoTipo.nombre.trim()) {
      this.mostrarAlerta('error', 'El nombre es obligatorio.');
      return;
    }

    const request = this.editando
      ? this.tipoAmbienteService.put(this.nuevoTipo.id, this.nuevoTipo)
      : this.tipoAmbienteService.post(this.nuevoTipo);

    request.subscribe({
      next: (res) => {
        this.mostrarAlerta('success', this.editando
          ? 'Tipo de ambiente actualizado correctamente.'
          : 'Tipo de ambiente creado correctamente.'
        );

        this.tipoCreado.emit(res);
        this.resetForm();
        this.cerrarModal();
      },
      error: () => {
        this.mostrarAlerta('error', this.editando
          ? 'Error al actualizar el tipo de ambiente.'
          : 'Error al crear el tipo de ambiente.'
        );
      }
    });
  }

  seleccionarColor(color: { nombre: string; hex: string }) {
    this.nuevoTipo.colorhex = color.hex;
    this.colorPersonalizado = '';
    this.colorValido = true;
  }

  seleccionarColorPersonalizado() {
    this.nuevoTipo.colorhex = this.colorPersonalizado;
    this.colorValido = true;
  }

  esColorPersonalizado(): boolean {
    return ![...this.coloresBasicos, ...this.coloresExtendidos].some(
      c => c.hex === this.nuevoTipo.colorhex
    );
  }

  alternarPaleta() {
    this.mostrarPaletaExtendida = !this.mostrarPaletaExtendida;
  }

  mostrarAlerta(tipo: 'success' | 'error', mensaje: string) {
    this.alerta = { tipo, mensaje };
    setTimeout(() => (this.alerta = { tipo: '', mensaje: '' }), 3000);
  }

  resetForm() {
    this.nuevoTipo = { id: 0, nombre: '', colorhex: '#000000' };
    this.colorPersonalizado = '#000000';
    this.colorValido = true;
  }
}
