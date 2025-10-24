import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Docente } from '../../../core/models/docente.model';

@Component({
  selector: 'app-docente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docenteform.html'
})
export class DocenteForm {
  @Input() docente: Partial<Docente> = {
    estado: true,
    horassemanal: 0,
    horasactual: 0
  };

  @Input() esEdicion: boolean = false;
  @Output() onGuardar = new EventEmitter<Partial<Docente>>();
  @Output() onCancelar = new EventEmitter<void>();

  guardar() {
    console.log('Datos enviados al guardar:', this.docente);
    this.onGuardar.emit(this.docente);
  }

  cancelar() {
    this.onCancelar.emit();
  }
}
