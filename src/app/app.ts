import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('reservas');


  constructor() {}

  ngOnInit(): void {
    // Aquí podrías cargar roles si es necesario en producción,
    // pero la prueba de consola se ha eliminado.
  }
}
