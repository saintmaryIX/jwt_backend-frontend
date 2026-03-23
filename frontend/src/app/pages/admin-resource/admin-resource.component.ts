import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-resource',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-resource.component.html',
  styleUrls: ['./admin-resource.component.css']
})
export class AdminResourceComponent implements OnInit {
  loading = true;
  error = '';
  message = '';
  userInfo: { id: string; email: string; role: string } | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getAdminResource().subscribe({
      next: (response) => {
        this.message = response.message;
        this.userInfo = response.usuario;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.status === 403
          ? 'No tienes permisos de administrador para acceder a este recurso.'
          : 'Error al cargar el recurso administrativo.';
        this.loading = false;
      }
    });
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }
}