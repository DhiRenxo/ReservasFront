import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../../core/services/asignacion.service';
import { DocenteService } from '../../../core/services/docente.service';
import { CursoService } from '../../../core/services/curso.service';
import { CarreraService } from '../../../core/services/carrera.service';
import { AsignacionResponse } from '../../../core/models/asignacion.model';
import { Docente } from '../../../core/models/docente.model';
import { CursoModel } from '../../../core/models/Curso.model';

interface CursoAsignacion {
  id: number;
  asignacion_id: number;
  curso_id: number;
  seccion: number;
  nombreCurso: string;
  horas: number;
  docente?: Docente;
  docenteIdTemp?: number | null;
  es_bloque?: boolean;
  bloque?: string | null;
  duplica_horas?: boolean;
  comentario?: string | null;
  disponibilidad?: string | null;
  activo?: boolean;
}

@Component({
  selector: 'app-asignacion-docente',
  standalone: true,
  templateUrl: './asignaciondocente.html',
  styleUrls: ['./asignaciondocente.css'],
  imports: [CommonModule, FormsModule]
})
export class Asignaciondocente implements OnInit {
  asignaciones: AsignacionResponse[] = [];
  docentes: Docente[] = [];
  cursosPorAsignacion: { [asignacionId: number]: CursoAsignacion[] } = {};
  seleccion: { [clave: string]: number | null } = {};
  alerta: { tipo: 'success' | 'danger' | 'info' | null; mensaje: string } = { tipo: null, mensaje: '' };
  carrerasMap: { [id: number]: string } = {};

  constructor(
    private asignacionService: AsignacionService,
    private docenteService: DocenteService,
    private cursoService: CursoService,
    private carreraService: CarreraService
  ) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
    this.cargarDocentes();
    this.cargarCarreras();
  }

  // ────────────── ALERTAS ──────────────
  mostrarAlerta(tipo: 'success' | 'danger' | 'info', mensaje: string) {
    this.alerta = { tipo, mensaje };
    setTimeout(() => (this.alerta = { tipo: null, mensaje: '' }), 3000);
  }

  // ────────────── CARGA DE DATOS ──────────────
  cargarAsignaciones(carreraId?: number) {
    this.asignacionService.getAll().subscribe(res => {
      this.asignaciones = res.filter(a => a.estado && (!carreraId || a.carreraid === carreraId));
    });
  }

  cargarDocentes() {
    this.docenteService.listar().subscribe(res => {
      this.docentes = res.filter(d => d.estado);
    });
  }

  cargarCarreras() {
    this.carreraService.listar().subscribe(res => {
      this.carrerasMap = res.reduce((acc, carrera) => {
        acc[carrera.id] = carrera.nombre;
        return acc;
      }, {} as { [id: number]: string });
    });
  }

  cargarCursos(asig: AsignacionResponse) {
    this.asignacionService.getRelaciones(asig.id).subscribe(relaciones => {
      this.cursoService.getAll().subscribe(cursos => {
        const cursosMap = cursos.reduce((acc, c) => {
          acc[c.id!] = c;
          return acc;
        }, {} as { [id: number]: CursoModel });

        const cursosAsignados: CursoAsignacion[] = relaciones.map(r => {
          const docenteAsignado = this.docentes.find(d => d.id === r.docente_id);
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
            activo: (r as any).activo
          };
        });

        this.cursosPorAsignacion[asig.id] = cursosAsignados;
      });
    });
  }

  seleccionarDocente(clave: string, docenteId: number | null, curso: CursoAsignacion) {
    this.seleccion[clave] = docenteId;
    curso.docenteIdTemp = docenteId;
  }

  confirmarGuardado(curso: CursoAsignacion) {
    const clave = `${curso.curso_id}_${curso.seccion}`;
    const docenteId = this.seleccion[clave];

    // 1️⃣ Validar bloque
    if (curso.es_bloque === undefined) {
      this.mostrarAlerta('info', 'Selecciona si el curso es BLOQUE o NO antes de continuar');
      return;
    }

    if (curso.es_bloque && !curso.bloque) {
      this.mostrarAlerta('danger', 'Debes seleccionar un bloque (A o B)');
      return;
  }

  // 2️⃣ Validar docente (solo después del bloque)
  if (!docenteId) {
    this.mostrarAlerta('info', 'Selecciona un docente para guardar');
    return;
  }

  this.guardarRelacionYDocente(curso);
}


  guardarRelacionYDocente(curso: CursoAsignacion) {
  const clave = `${curso.curso_id}_${curso.seccion}`;
  const docenteId = this.seleccion[clave];

  const payloadRelacion = {
    es_bloque: curso.es_bloque || false,
    bloque: curso.bloque || null,
    duplica_horas: curso.duplica_horas || false,
    comentario: curso.comentario || null
  };


  this.asignacionService.actualizarRelacion(curso.id, payloadRelacion).subscribe({
    next: () => {

      if (!docenteId) {
        console.log("⏸ Docente aún no seleccionado. Deteniendo aquí.");
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
            console.log("📌 Duplicar horas activo -> Recalculando...");
            this.recalcularHoras(docenteNuevo!);
          }

          this.mostrarAlerta('success', `Guardado completo en ${curso.nombreCurso}`);
        },
        error: err => console.error("❌ ERROR guardar docente", err)
      });

    },
    error: err => console.error("❌ ERROR guardar relación", err)
  });
}


  recalcularHoras(docente: Docente) {
    this.asignacionService.recalcularHorasDocente(docente.id!).subscribe(res => {
      docente.horasactual = res.horasactual;
      docente.horastemporales = res.horastemporales;
      this.mostrarAlerta('success', `Horas recalculadas para ${docente.nombre}`);
    });
  }

  toggleBloque(curso: CursoAsignacion) {
    if (curso.activo) {
      this.asignacionService.desactivarBloque(curso.id).subscribe({
        next: () => {
          curso.activo = false;
          this.mostrarAlerta('danger', `Se desactivó el bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: err => console.error("ERROR desactivarBloque", err)
      });
    } else {
      this.asignacionService.activarBloque(curso.id, curso.bloque as 'A' | 'B').subscribe({
        next: res => {
          curso.activo = res.activo;
          this.cursosPorAsignacion[curso.asignacion_id].forEach(c => {
            if (c.curso_id === curso.curso_id && c.seccion === curso.seccion && c.id !== curso.id) {
              c.activo = false;
            }
          });
          this.mostrarAlerta('success', `Se activó bloque ${curso.bloque} en ${curso.nombreCurso}`);
        },
        error: err => console.error("ERROR activarBloque", err)
      });
    }
  }

  // ────────────── UTILES ──────────────
  tieneCursos(asignacionId: number): boolean {
    return (this.cursosPorAsignacion[asignacionId]?.length || 0) > 0;
  }

  agregarSeccion(asig: AsignacionResponse) {
  const nuevaCantidad = (asig.cantidad_secciones || 0) + 1;

  console.log("➕ Intentando AGREGAR sección:", {
    asignacion_id: asig.id,
    cantidad_actual: asig.cantidad_secciones,
    nuevaCantidad
  });

  this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: nuevaCantidad }).subscribe({
    next: updated => {
      console.log("✅ Sección AGREGADA en BD:", updated);

      asig.cantidad_secciones = updated.cantidad_secciones;
      const cursoIdsUnicos = Array.from(new Set((this.cursosPorAsignacion[asig.id] || []).map(c => c.curso_id)));

      this.asignacionService.actualizarCursos(asig.id, { curso_ids: cursoIdsUnicos }).subscribe({
        next: () => {
          this.cargarCursos(asig);
          this.mostrarAlerta('success', `Se agregó la sección ${nuevaCantidad}`);
        },
        error: err => console.error("❌ ERROR al actualizar cursos después de agregar sección:", err)
      });
    },
    error: err => console.error("❌ ERROR al AGREGAR sección:", err)
  });
}

  quitarSeccion(asig: AsignacionResponse) {
  if (asig.cantidad_secciones <= 1) {
    this.mostrarAlerta('danger', 'No puedes tener menos de 1 sección');
    console.warn("⛔ Intento de eliminar sección 1. Prohibido.");
    return;
  }

  const ultimaSeccion = asig.cantidad_secciones;

  console.log("🗑️ Intentando ELIMINAR sección:", {
    asignacion_id: asig.id,
    cantidad_actual: asig.cantidad_secciones,
    seccion_a_eliminar: ultimaSeccion
  });

  this.asignacionService.updateSecciones(asig.id, { cantidad_secciones: ultimaSeccion - 1 }).subscribe({
    next: updated => {
      console.log("✅ Sección RESTADA en BD:", updated);

      asig.cantidad_secciones = updated.cantidad_secciones;

      this.asignacionService.deleteSeccion(asig.id, ultimaSeccion).subscribe({
        next: () => {

          // ✅ Eliminar visualmente la sección en memoria
          this.cursosPorAsignacion[asig.id] = 
            (this.cursosPorAsignacion[asig.id] || [])
              .filter(c => c.seccion !== ultimaSeccion);

          console.log("✅ Filtrada sección en Frontend");

          // ✅ Recargar información real del backend
          this.cargarCursos(asig);

          this.mostrarAlerta('danger', `Se eliminó la sección ${ultimaSeccion}`);
        },
        error: err => console.error("❌ ERROR AL ELIMINAR sección desde la BD:", err)
      });
    },
    error: err => console.error("❌ ERROR al actualizar cantidad_secciones antes de eliminar:", err)
  });
}


  desactivarAsignacion(asig: AsignacionResponse) {
    this.asignacionService.updateEstado(asig.id, { estado: false }).subscribe(updated => {
      asig.estado = false;
      (this.cursosPorAsignacion[asig.id] || []).forEach(curso => {
        if (curso.activo) {
          curso.activo = false;
          this.asignacionService.desactivarBloque(curso.id).subscribe();
        }
      });
      this.mostrarAlerta('danger', 'Asignación desactivada y bloques inactivos');
    });
  }

  activarAsignacion(asig: AsignacionResponse) {
    this.asignacionService.updateEstado(asig.id, { estado: true }).subscribe(updated => {
      asig.estado = true;
      this.mostrarAlerta('success', 'Asignación activada. Los bloques permanecen inactivos');
    });
  }
}
