import { Routes } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { HomeComponent } from './view/home/home.component';
import { Layout } from './layout/layout/layout';
import { Usuariolist } from './view/usuario/usuariolist/usuariolist';
import { DocenteList } from './view/docente/docentelist/docentelist';
import { Seccion } from './view/seccionacademica/seccion/seccion';
import { Curso } from './view/seccionacademica/curso/curso';
import { Carrera } from './view/seccionacademica/carrera/carrera';
import { Ambiente } from './view/ambiente/ambiente';
import { AsignacionCreateComponent  } from './view/asignacion/asignacioncreate/asignacioncreate';
import { Asignaciondocente } from './view/asignacion/asignaciondocente/asignaciondocente';
import { Asignacionvalidacion } from './view/asignacion/asignacionvalidacion/asignacionvalidacion';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'app',
    component: Layout,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'usuarios',
        component: Usuariolist
      },
      {
        path: 'docente',
        component: DocenteList
      },
      {
        path: 'curso',
        component: Curso
      },
      {
        path: 'seccion',
        component: Seccion
      },
      {
        path: 'carrera',
        component: Carrera
      },
      {
        path: 'ambiente',
        component: Ambiente
      },
      {
        path: 'asignacioncreacion',
        component: AsignacionCreateComponent, 
      },
      {
        path: 'asignaciondoncente',
        component: Asignaciondocente
      },
      {
        path: 'asignacionvalidacion',
        component: Asignacionvalidacion
      }

    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
