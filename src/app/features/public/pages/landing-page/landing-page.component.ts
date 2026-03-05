import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, FooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements AfterViewInit {
  ngAfterViewInit(): void {
      // Re-initialize Flowbite after this route renders its template.
    initFlowbite();
  }
}
