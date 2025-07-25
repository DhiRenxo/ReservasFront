import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocenteService } from '../../../core/services/docente.service';
import { Docente } from '../../../core/models/docente.model';
import { RouterModule } from '@angular/router';
import { DocenteForm } from '../docenteform/docenteform';
declare var bootstrap: any;

@Component({
  selector: 'app-docente-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DocenteForm],
  templateUrl: './docentelist.html',
})
export class DocenteList {
  private docenteService = inject(DocenteService);
  docentes = signal<Docente[]>([]);
  currentPage = signal(1);
  pageSize = 10;
  filtros = signal({
    nombre: '',
    codigo: '',
    tipocontrato: '',
    estado: '', // 'activo', 'inactivo' o ''
  });


  mostrarModal = signal(false);
  docenteActual = signal<Partial<Docente>>({});
  esEdicion = signal(false);

  ngOnInit() {
    this.cargarDocentes();
  }

  cargarDocentes() {
    this.docenteService.listar().subscribe({
      next: (data) => {
        this.docentes.set(data);
        this.currentPage.set(1); // Reinicia a la primera página
      },
      error: (err) => console.error('Error al cargar docentes', err),
    });
  }

  get totalPages() {
    const { nombre, codigo, tipocontrato, estado } = this.filtros();

    const totalFiltrados = this.docentes().filter((d) => {
      return (
        d.nombre.toLowerCase().includes(nombre.toLowerCase()) &&
        d.codigo.toLowerCase().includes(codigo.toLowerCase()) &&
        d.tipocontrato.toLowerCase().includes(tipocontrato.toLowerCase()) &&
        (estado === '' ||
          (estado === 'activo' && d.estado) ||
          (estado === 'inactivo' && !d.estado))
      );
    }).length;

    return Math.ceil(totalFiltrados / this.pageSize);
  }

  get docentesPaginados() {
  const { nombre, codigo, tipocontrato, estado } = this.filtros();

  const filtrados = this.docentes().filter((d) => {
    return (
      d.nombre.toLowerCase().includes(nombre.toLowerCase()) &&
      d.codigo.toLowerCase().includes(codigo.toLowerCase()) &&
      d.tipocontrato.toLowerCase().includes(tipocontrato.toLowerCase()) &&
      (estado === '' ||
        (estado === 'activo' && d.estado) ||
        (estado === 'inactivo' && !d.estado))
    );
  });

  const ordenados = filtrados.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );

  const start = (this.currentPage() - 1) * this.pageSize;
  return ordenados.slice(start, start + this.pageSize);
}



  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage.set(pagina);
    }
  }

  siguientePagina() {
    this.cambiarPagina(this.currentPage() + 1);
  }

  anteriorPagina() {
    this.cambiarPagina(this.currentPage() - 1);
  }

  nuevo() {
    this.docenteActual.set({
      estado: true,
      horassemanal: 0,
      horasactual: 0,
    });
    this.esEdicion.set(false);
    this.mostrarModal.set(true);
  }

  editar(docente: Docente) {
    this.docenteActual.set({ ...docente });
    this.esEdicion.set(true);
    this.mostrarModal.set(true);
  }

  guardar(docente: Partial<Docente>) {
    const cerrarModal = () => this.mostrarModal.set(false);
    if (this.esEdicion()) {
      this.docenteService.actualizar(docente.id!, docente).subscribe(() => {
        this.cargarDocentes();
        cerrarModal();
      });
    } else {
      this.docenteService.crear(docente as Docente).subscribe(() => {
        this.cargarDocentes();
        cerrarModal();
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este docente?')) {
      this.docenteService.eliminar(id).subscribe({
        next: () => this.cargarDocentes(),
        error: (err) => console.error('Error al eliminar docente', err),
      });
    }
  }

  cancelarModal() {
    this.mostrarModal.set(false);
  }

  actualizarFiltro(campo: keyof Docente, valor: string) {
  this.filtros.set({
    ...this.filtros(),
    [campo]: valor,
  });
  this.currentPage.set(1);
}

}
