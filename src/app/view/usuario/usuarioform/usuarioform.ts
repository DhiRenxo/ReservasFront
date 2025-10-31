import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Rol } from '../../../core/models/rol.model';

@Component({
  selector: 'app-usuarioform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarioform.html',
  styleUrls: ['./usuarioform.css'],
})
export class Usuarioform implements OnInit {
  @Input() idUsuario: number | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() onGuardado = new EventEmitter<void>();

  usuarioForm!: FormGroup;
  roles: Rol[] = [];
  editando = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      rolid: [null, Validators.required],
      estado: [true, Validators.required],
    });

    this.cargarRoles();

    if (this.idUsuario) {
      this.editando = true;
      this.usuarioService.obtener(this.idUsuario).subscribe((usuario) => {
        this.usuarioForm.patchValue(usuario);
      });
    }
  }

  cargarRoles(): void {
    this.rolService.getAll().subscribe({
      next: (data) => (this.roles = data),
      error: (err) => console.error('Error al cargar roles', err),
    });
  }

  guardar(): void {
    if (this.usuarioForm.invalid) return;

    const usuarioInput: Partial<Usuario> = this.usuarioForm.value;

    const req = this.editando && this.idUsuario
      ? this.usuarioService.actualizar(this.idUsuario, usuarioInput)
      : this.usuarioService.crear(usuarioInput as Usuario);

    req.subscribe(() => {
      this.onGuardado.emit();
      this.cerrar.emit();
    });
  }
}