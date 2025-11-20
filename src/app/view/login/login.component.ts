import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../core/models/usuario.model';

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}


declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements AfterViewInit {

  
  constructor(private authService: AuthService, private router: Router) {}


  ngAfterViewInit(): void {
    
    window.google.accounts.id.initialize({
      client_id: '763954804482-3r39uuk35iqb94h6al0ut4urr2ic2cdv.apps.googleusercontent.com', 
      callback: this.handleCredentialResponse.bind(this)
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-button')!,
      { theme: 'outline', size: 'large' }
    );
  }

  handleCredentialResponse(response: any) {
    const token = response.credential;

    this.authService.loginConGoogle(token).subscribe({
      next: (data) => {
        console.log("✅ Respuesta login:", data);

        // 👇 Guardamos token y usuario_id
        localStorage.setItem("access_token", data.access_token);

        if (data.usuario?.id) {
          localStorage.setItem("usuario_id", data.usuario.id.toString());
        } else {
          console.warn("⚠️ No vino usuario en la respuesta del login");
        }

        this.router.navigate(['/app/home']);
      },
      error: (err) => {
        console.error("❌ Error en login:", err);
        alert('Error en login');
      },
    });
  }


}
