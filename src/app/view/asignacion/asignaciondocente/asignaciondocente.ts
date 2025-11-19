import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CursoService } from '../../../core/services/curso.service';
import { CarreraService } from '../../../core/services/carrera.service';

import type { AsignacionResponse } from '../../../core/models/asignacion.model';
import type { Docente } from '../../../core/models/docente.model';
import type { CursoModel } from '../../../core/models/Curso.model';

import { signal, WritableSignal } from '@angular/core';
import { Import } from 'lucide-angular';
import { TipoAmbienteService } from '../../../core/services/tipoambiente.service';
import { TipoAmbienteModel } from '../../../core/models/tipoambiente.models';

interface CursoAsignacion {
  id: number;
  asignacion_id: number;
  curso_id: number;
  seccion: number;
  nombreCurso: string;
  horas: number;
  docente?: Docente | null;
  docenteIdTemp?: number | null;
  es_bloque?: boolean;
  bloque?: string | null;
  duplica_horas?: boolean;
  comentario?: string | null;
  disponibilidad?: string | null;
  tipoambiente_id: number | null;
  tipoambiente_nombre?: string | { nombre: string; color: string } | null;
  activo?: boolean;
}

@Component({
  selector: 'app-asignacion-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignaciondocente.html',
  styleUrls: ['./asignaciondocente.css']
})
export class Asignaciondocente implements OnInit, AfterViewInit {
  // Datos
  asignaciones: AsignacionResponse[] = [];
  docentes: Docente[] = [];
  cursosPorAsignacion: { [asignacionId: number]: CursoAsignacion[] } = {};
  seleccion: { [clave: string]: number | null } = {};
  carrerasMap: { [id: number]: string } = {};

  tipoambiente: TipoAmbienteModel[] = [];
  tipoambienteMap: { [id: number]: { nombre: string; color: string } } = {};


  // UI state
  alerta: WritableSignal<{ tipo: 'success' | 'danger' | 'info' | null; mensaje: string }> =
    signal({ tipo: null, mensaje: '' });

  // PAGINACION / CARRERAS
  asignacionesPorCarrera: { [carreraId: number]: AsignacionResponse[] } = {};
  carrerasOrdenadas: number[] = [];
  paginaActual: number = 0;

  // Indicadores de "más" arriba/abajo para el scroll de contenido
  mostrarMasArriba = false;
  mostrarMasAbajo = false;

  // Referencia al contenedor scrolleable
  @ViewChild('scrollable') scrollable!: ElementRef<HTMLDivElement>;

  constructor(
    private asignacionService: AsignacionService,
    private docenteService: DocenteService,
    private cursoService: CursoService,
    private carreraService: CarreraService,
    private cdr: ChangeDetectorRef,
    private tipoAmbienteService: TipoAmbienteService
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
    this.cargarCarreras();
    this.cargarAsignaciones();
    this.cargarTiposAmbiente();
  }

  ngAfterViewInit(): void {
    // si el elemento existe más tarde, asignamos escuchador de scroll
    setTimeout(() => this.setupScrollListener(), 300);
  }

  // ───────────────── ALERTAS ─────────────────
  mostrarAlerta(tipo: 'success' | 'danger' | 'info', mensaje: string, ms = 3000) {
    this.alerta.set({ tipo, mensaje });
    setTimeout(() => this.alerta.set({ tipo: null, mensaje: '' }), ms);
  }

  // ───────────────── CARGA DATOS ─────────────────
  cargarAsignaciones(carreraId?: number) {
    this.asignacionService.getAll().subscribe({
      next: (res) => {
        // mantenemos todas; luego agrupamos por carrera
        this.asignaciones = res.filter(a => a.estado !== undefined ? a.estado : true);
        this.organizarPorCarrera();
      },
      error: (err) => console.error('Error cargar asignaciones', err)
    });
  }

  cargarDocentes() {
    this.docenteService.listar().subscribe({
      next: (res) => this.docentes = res.filter(d => d.estado !== false),
      error: (err) => console.error('Error cargar docentes', err)
    });
  }

  cargarCarreras() {
    this.carreraService.listar().subscribe({
      next: (res) => {
        this.carrerasMap = res.reduce((acc: any, carrera: any) => {
          acc[carrera.id] = carrera.nombre;
          return acc;
        }, {});
        this.organizarPorCarrera(); // si asignaciones ya cargadas, actualiza agrupado
      },
      error: (err) => console.error('Error cargar carreras', err)
    });
  }

  cargarTiposAmbiente() {
    this.tipoAmbienteService.getAll().subscribe({
      next: (res) => {

        // Primero guardamos la lista real
        this.tipoambiente = res;

        // Ahora sí creamos el mapa correctamente
        this.tipoambienteMap = res.reduce((acc, t) => {
          acc[t.id] = { nombre: t.nombre, color: t.colorhex };
          return acc;
        }, {} as any);

        console.log("✔ Tipos ambiente cargados:", this.tipoambiente);
      },
      error: (err) => console.error("❌ Error cargando tipos ambiente", err)
    });
  }




  // Agrupa asignaciones por carrera y calcula orden/cantidad páginas
  organizarPorCarrera() {
    const map: { [id: number]: AsignacionResponse[] } = {};
    this.asignaciones.forEach(a => {
      const cid = a.carreraid || 0;
      if (!map[cid]) map[cid] = [];
      map[cid].push(a);
    });
    this.asignacionesPorCarrera = map;
    this.carrerasOrdenadas = Object.keys(map).map(k => Number(k));

    // Asegurar paginaActual válida
    if (this.paginaActual >= this.carrerasOrdenadas.length) this.paginaActual = 0;
    this.cdr.markForCheck();
  }

  // ───────────────── CARRUSEL / PAGINACION ─────────────────
  irAPagina(i: number) {
    if (i < 0 || i >= this.carrerasOrdenadas.length) return;
    this.paginaActual = i;
    this.scrollToTopContenido();
    this.cdr.markForCheck();
  }

  siguienteCarrera() {
    if (this.carrerasOrdenadas.length === 0) return;
    this.paginaActual = (this.paginaActual + 1) % this.carrerasOrdenadas.length;
    this.scrollToTopContenido();
  }

  anteriorCarrera() {
    if (this.carrerasOrdenadas.length === 0) return;
    this.paginaActual = (this.paginaActual - 1 + this.carrerasOrdenadas.length) % this.carrerasOrdenadas.length;
    this.scrollToTopContenido();
  }

  scrollToTopContenido() {
    if (!this.scrollable) return;
    try {
      this.scrollable.nativeElement.scrollTop = 0;
      this.actualizarIndicadores();
    } catch (e) { /* noop */ }
  }

  // ───────────────── CURSOS (toggle) ─────────────────
  toggleCursos(asig: AsignacionResponse) {
    const key = asig.id;
    const existe = this.cursosPorAsignacion[key] && this.cursosPorAsignacion[key].length > 0;
    if (existe) {
      // ocultar (mantener cached si quieres; aquí vaciamos)
      this.cursosPorAsignacion[key] = [];
      this.cdr.markForCheck();
    } else {
      // cargar
      this.cargarCursos(asig);
    }
  }

  // Legacy name preserved: cargarCursos — ahora se usa tanto para cargar como para toggle
  cargarCursos(asig: AsignacionResponse) {
    this.asignacionService.getRelaciones(asig.id).subscribe({
      next: (relaciones) => {
        this.cursoService.getAll().subscribe({
          next: (cursos) => {
            const cursosMap = cursos.reduce((acc: any, c: CursoModel) => {
              acc[c.id!] = c;
              return acc;
            }, {});

            const cursosAsignados: CursoAsignacion[] = relaciones.map((r: any) => {
              const docenteAsignado = this.docentes.find(d => d.id === r.docente_id) || null;
              const clave = `${r.curso_id}_${r.seccion}`;
              if (!this.seleccion[clave] && docenteAsignado) this.seleccion[clave] = docenteAsignado.id;

              return {
                id: r.id,
                asignacion_id: r.asignacion_id,
                curso_id: r.curso_id,
                seccion: r.seccion,
                nombreCurso: cursosMap[r.curso_id]?.nombre || `Curso ${r.curso_id}`,
                horas: cursosMap[r.curso_id]?.horas || 0,
                docente: docenteAsignado,
                docenteIdTemp: this.seleccion[clave] || docenteAsignado?.id || null,
                es_bloque: r.es_bloque,
                bloque: r.bloque,
                duplica_horas: r.duplica_horas,
                comentario: r.comentario,
                disponibilidad: r.disponibilidad,
                tipoambiente_id: r.tipoambiente_id || null,                         // ⭐ nuevo
                tipoambiente_nombre: this.tipoambienteMap[r.tipoambiente_id] || null,
                activo: (r as any).activo
              };
            });

            this.cursosPorAsignacion[asig.id] = cursosAsignados;
            // actualizar indicadores (resultado cargado)
            setTimeout(() => this.actualizarIndicadores(), 50);
            this.cdr.markForCheck();
          },
          error: (err) => console.error('Error getAll cursos', err)
        });
      },
      error: (err) => console.error('Error getRelaciones', err)
    });
  }

  seleccionarDocente(clave: string, docenteId: number | null, curso: CursoAsignacion) {
    this.seleccion[clave] = docenteId;
    curso.docenteIdTemp = docenteId;
  }

  confirmarGuardado(curso: CursoAsignacion) {
    const clave = `${curso.curso_id}_${curso.seccion}`;
    const docenteId = this.seleccion[clave];

    if (curso.es_bloque === undefined) {
      this.mostrarAlerta('info', 'Selecciona si el curso es BLOQUE o NO antes de continuar');
      return;
    }
    if (curso.es_bloque && !curso.bloque) {
      this.mostrarAlerta('danger', 'Debes seleccionar un bloque (A o B)');
      return;
    }
    if (!docenteId) {
      this.mostrarAlerta('info', 'Selecciona un docente para guardar');
      return;
    }

    this.guardarRelacionYDocente(curso);
  }

  guardarRelacionYDocente(curso: CursoAsignacion) {
    const clave = `${curso.curso_id}_${curso.seccion}`;
    const docenteId = this.seleccion[clave];

    const payloadRelacion: any = {
      es_bloque: curso.es_bloque || false,
      bloque: curso.bloque || null,
      duplica_horas: curso.duplica_horas || false,
      comentario: curso.comentario || null,
      tipoambiente: curso.tipoambiente_id || null
    };

    this.asignacionService.actualizarRelacion(curso.id, payloadRelacion).subscribe({
      next: () => {
        curso.tipoambiente_nombre = this.tipoambienteMap[curso.tipoambiente_id ?? 0] || null;
        if (!docenteId) {
          this.mostrarAlerta('info', 'Ahora selecciona un docente');
          return;
        }

        this.asignacionService.actualizarDocenteCurso(curso.asignacion_id, {
          curso_id: curso.curso_id,
          seccion: curso.seccion,
          docente_id: docenteId
        }).subscribe({
          next: () => {
            const docenteNuevo = this.docentes.find(d => d.id === docenteId);
            if (docenteNuevo) curso.docente = docenteNuevo;

            if (curso.es_bloque && curso.duplica_horas && curso.activo) {
              this.recalcularHoras(docenteNuevo!);
            }

            this.mostrarAlerta('success', `Guardado completo en ${curso.nombreCurso}`);
          },
          error: (err) => console.error('❌ ERROR guardar docente', err)
        });
      },
      error: (err) => console.error('❌ ERROR guardar relación', err)
    });
  }

  recalcularHoras(docente: Docente) {
    this.asignacionService.recalcularHorasDocente(docente.id!).subscribe({
      next: (res) => {
        docente.horasactual = res.horasactual;
        docente.horastemporales = res.horastemporales;
        this.mostrarAlerta('success', `Horas recalculadas para ${docente.nombre}`);
      },
      error: (err) => console.error('Error recalcular horas', err)
    });
  }

  toggleBloque(curso: CursoAsignacion) {
    if (curso.activo) {
      this.asignacionService.desactivarBloque(curso.id).subscribe({
        next: () => {
          curso.activo = false;
          this.mostrarAlerta('danger', `Se desactivó el bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: (err) => console.error('ERROR desactivarBloque', err)
      });
    } else {
      this.asignacionService.activarBloque(curso.id, curso.bloque as 'A' | 'B').subscribe({
        next: (res) => {
          curso.activo = res.activo;
          (this.cursosPorAsignacion[curso.asignacion_id] || []).forEach(c => {
            if (c.curso_id === curso.curso_id && c.seccion === curso.seccion && c.id !== curso.id) c.activo = false;
          });
          this.mostrarAlerta('success', `Se activó bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: (err) => console.error('ERROR activarBloque', err)
      });
    }
  }

  // UTILITARIOS (secciones / activar / desactivar)
  tieneCursos(asignacionId: number): boolean {
    return (this.cursosPorAsignacion[asignacionId]?.length || 0) > 0;
  }

  agregarSeccion(asig: AsignacionResponse) {
    const nuevaCantidad = (asig.cantidad_secciones || 0) + 1;
    this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: nuevaCantidad }).subscribe({
      next: (updated) => {
        asig.cantidad_secciones = updated.cantidad_secciones;
        const cursoIdsUnicos = Array.from(new Set((this.cursosPorAsignacion[asig.id] || []).map(c => c.curso_id)));
        this.asignacionService.actualizarCursos(asig.id, { curso_ids: cursoIdsUnicos }).subscribe({
          next: () => {
            this.cargarCursos(asig);
            this.mostrarAlerta('success', `Se agregó la sección ${nuevaCantidad}`);
          },
          error: (err) => console.error('❌ ERROR al actualizar cursos después de agregar sección:', err)
        });
      },
      error: (err) => console.error('❌ ERROR al AGREGAR sección:', err)
    });
  }

  quitarSeccion(asig: AsignacionResponse) {

      // ⚠️ Nuevo: advertencia antes de eliminar
      const confirmar = confirm(
        `Se eliminará la sección ${asig.cantidad_secciones} y también el registro del docente asignado a esa sección. ¿Desea continuar?`
      );

      if (!confirmar) return;

      if ((asig.cantidad_secciones || 0) <= 1) {
        this.mostrarAlerta('danger', 'No puedes tener menos de 1 sección');
        return;
      }

      const ultimaSeccion = asig.cantidad_secciones!;

      this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: ultimaSeccion - 1 }).subscribe({
        next: (updated) => {
          asig.cantidad_secciones = updated.cantidad_secciones;

          this.asignacionService.deleteSeccion(asig.id, ultimaSeccion).subscribe({
            next: () => {
              this.cursosPorAsignacion[asig.id] = 
                (this.cursosPorAsignacion[asig.id] || []).filter(c => c.seccion !== ultimaSeccion);

              this.cargarCursos(asig);

              this.mostrarAlerta('danger', 
                `Se eliminó la sección ${ultimaSeccion} y su registro de docente asignado`);
            },
            error: (err) => console.error('❌ ERROR AL ELIMINAR sección desde la BD:', err)
          });
        },
        error: (err) => console.error('❌ ERROR al actualizar cantidad_secciones antes de eliminar:', err)
      });
    }


  desactivarAsignacion(asig: AsignacionResponse) {
    this.asignacionService.updateEstado(asig.id, { estado: false }).subscribe({
      next: (updated) => {
        asig.estado = false;
        (this.cursosPorAsignacion[asig.id] || []).forEach(curso => {
          if (curso.activo) {
            curso.activo = false;
            this.asignacionService.desactivarBloque(curso.id).subscribe();
          }
        });
        this.mostrarAlerta('danger', 'Asignación desactivada y bloques inactivos');
      },
      error: (err) => console.error('Error desactivar asignación', err)
    });
  }

  activarAsignacion(asig: AsignacionResponse) {
    this.asignacionService.updateEstado(asig.id, { estado: true }).subscribe({
      next: (updated) => {
        asig.estado = true;
        this.mostrarAlerta('success', 'Asignación activada. Los bloques permanecen inactivos');
      },
      error: (err) => console.error('Error activar asignación', err)
    });
  }

  // ───────────────── SCROLL / INDICADORES ─────────────────
  setupScrollListener() {
    if (!this.scrollable) return;
    const el = this.scrollable.nativeElement;
    this.actualizarIndicadores();
    el.addEventListener('scroll', () => {
      this.actualizarIndicadores();
    }, { passive: true });
  }

  actualizarIndicadores() {
    if (!this.scrollable) return;
    const el = this.scrollable.nativeElement;
    const max = el.scrollHeight - el.clientHeight;
    this.mostrarMasArriba = el.scrollTop > 10;
    this.mostrarMasAbajo = el.scrollTop < max - 10;
    this.cdr.markForCheck();
  }
}
