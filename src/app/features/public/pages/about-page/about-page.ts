import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../../../shared/ui/footer/footer.component";
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-about-page',
  imports: [RouterOutlet, RouterLink, FooterComponent],
  templateUrl: './about-page.html',
})
export class AboutPage {
  
  ngOnInit(): void {
    initFlowbite();
  }
}
