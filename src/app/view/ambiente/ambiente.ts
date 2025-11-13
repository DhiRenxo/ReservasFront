import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmbienteService } from '../../core/services/ambiente.service';
import { TipoAmbienteService } from '../../core/services/tipoambiente.service';
import { AmbienteModel } from '../../core/models/ambiente.models';
import { TipoAmbienteModel } from '../../core/models/tipoambiente.models';
import { Tipoambiente } from './tipoambiente/tipoambiente';

@Component({
  selector: 'app-ambiente',
  standalone: true,
  imports: [CommonModule, FormsModule, Tipoambiente],
  templateUrl: './ambiente.html',
  styleUrls: ['./ambiente.css']
})
export class Ambiente implements OnInit {

  ambientes = signal<AmbienteModel[]>([]);
  tiposAmbiente = signal<TipoAmbienteModel[]>([]);
  mostrarForm = signal(false);
  editando = signal(false);

  nuevoAmbiente = signal<AmbienteModel>({
    id: 0,
    codigo: '',
    tipoid: 0,
    capacidad: 0,
    equipamiento: '',
    ubicacion: '',
    activo: true
  });

  constructor(
    private ambienteService: AmbienteService,
    private tipoAmbienteService: TipoAmbienteService
  ) {}

  ngOnInit() {
    this.cargarAmbientes();
    this.cargarTipos();
  }

  /** Carga los ambientes */
  cargarAmbientes(): void {
    this.ambienteService.listar().subscribe({
      next: (data) => this.ambientes.set(data),
      error: (err) => console.error('Error al listar ambientes:', err)
    });
  }

  /** Carga los tipos de ambiente */
  cargarTipos(): void {
    this.tipoAmbienteService.getAll().subscribe({
      next: (data) => this.tiposAmbiente.set(data),
      error: (err) => console.error('Error al listar tipos:', err)
    });
  }

  /** Abre o cierra el formulario */
  toggleFormulario(): void {
    const estado = !this.mostrarForm();
    this.mostrarForm.set(estado);
    if (!estado) this.resetFormulario();
  }

  /** Limpia el formulario */
  resetFormulario(): void {
    this.nuevoAmbiente.set({
      id: 0,
      codigo: '',
      tipoid: 0,
      capacidad: 0,
      equipamiento: '',
      ubicacion: '',
      activo: true
    });
    this.editando.set(false);
  }

  /** Guarda o actualiza un ambiente */
  guardarAmbiente(): void {
    const amb = this.nuevoAmbiente();
    console.log("🧩 Datos del formulario:", amb);

    if (!amb.codigo || amb.tipoid <= 0) {
      alert('⚠️ Debes completar el código y tipo de ambiente.');
      return;
    }

    const edit = this.editando();
    const request = edit
      ? this.ambienteService.actualizar(amb.id, amb)
      : this.ambienteService.crear(amb);

    request.subscribe({
      next: (res) => {
        console.log("✅ Ambiente guardado:", res);
        this.cargarAmbientes();
        this.toggleFormulario();
      },
      error: (err) => {
        console.error("❌ Error al guardar ambiente:", err);
        alert(err.error?.detail || 'Error desconocido al guardar ambiente');
      }
    });
  }

  /** Activa el modo edición */
  editarAmbiente(amb: AmbienteModel): void {
    this.nuevoAmbiente.set({ ...amb });
    this.editando.set(true);
    this.mostrarForm.set(true);
  }

  /** Cambia el estado activo/inactivo */
  cambiarEstado(ambiente: AmbienteModel): void {
    this.ambienteService.cambiarEstado(ambiente.id, !ambiente.activo).subscribe({
      next: () => this.cargarAmbientes(),
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }

  /** Devuelve el nombre del tipo */
  obtenerNombreTipo(id: number): string {
    const tipo = this.tiposAmbiente().find(t => t.id === id);
    return tipo ? tipo.nombre : 'Desconocido';
  }

  /** Cuando se crea un nuevo tipo desde el modal hijo */
  onTipoCreado(nuevoTipo: TipoAmbienteModel): void {
    console.log("🎨 Nuevo tipo de ambiente recibido:", nuevoTipo);
    this.tiposAmbiente.update(lista => [...lista, nuevoTipo]);
  }
}
