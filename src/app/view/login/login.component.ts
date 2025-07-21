import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


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
      client_id: '42810701050-msob7or2min1au6v1o850mvjn8c87m28.apps.googleusercontent.com', 
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
      next: () => {
        this.router.navigate(['/app/home']);
      },
      error: () => alert('Error en login'),
    });
  }

}
