import { Routes } from '@angular/router';

// Páginas
import { LoginComponent } from './view/login/login.component';
import { HomeComponent } from './view/home/home.component';

// Layout
import { Layout } from './layout/layout/layout';
// Sección Académica
import { Seccion } from './view/seccionacademica/seccion/seccion';
import { Curso } from './view/seccionacademica/curso/curso';
import { Carrera } from './view/seccionacademica/carrera/carrera';

// Ambientes
import { Ambiente } from './view/ambiente/ambiente';

// Asignaciones
import { AsignacionCreateComponent } from './view/asignacion/asignacioncreate/asignacioncreate';
import { Asignaciondocente } from './view/asignacion/asignaciondocente/asignaciondocente';
import { Asignacionvalidacion } from './view/asignacion/asignacionvalidacion/asignacionvalidacion';

export const routes: Routes = [
  // 🔑 Login
  {
    path: 'login',
    component: LoginComponent
  },

  // 🔄 Redirect raíz
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // 🖥️ Área principal con Layout
  {
    path: 'app',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // Dashboard
      { path: 'home', component: HomeComponent },

      // Usuarios
      {
        path: 'usuarios',
        loadChildren: () => import('./view/usuario/usuario.routes').then(m => m.USUARIO_ROUTES)
      },



      // Docentes
      { 
        path: 'docente',
        loadChildren: () => import('./view/docente/docente.routes').then(m => m.DOCENTE_ROUTES)
       },

      // Sección académica
      { path: 'curso', component: Curso },
      { path: 'seccion', component: Seccion },
      { path: 'carrera', component: Carrera },

      // Ambientes
      { path: 'ambiente', component: Ambiente },

      // Asignaciones
      { path: 'asignacion-creacion', component: AsignacionCreateComponent },
      { path: 'asignacion-docente', component: Asignaciondocente },
      { path: 'asignacion-validacion', component: Asignacionvalidacion }
    ]
  },

  // 🌐 Ruta fallback
  {
    path: '**',
    redirectTo: 'login'
  }
];
