import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from './core/auth/auth.service';
import { LoadPage } from './shared/ui/loading/app/load.page';
import { ToastComponent } from './shared/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  title = 'TaskManager';
  readonly showAuthLoader = computed(() => {
    return !this.authService.authResolved() && this.router.currentNavigation() !== null;
  });

  ngOnInit(): void {
    initFlowbite();
  }
}
