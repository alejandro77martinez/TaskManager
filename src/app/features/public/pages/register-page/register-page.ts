import { Component } from '@angular/core';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink, FooterComponent],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {}
