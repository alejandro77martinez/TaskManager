import { AfterViewInit, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { initFlowbite } from 'flowbite';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { NavComponent } from '../../components/nav-component/nav.component';
import { SideComponent } from '../../components/side-component/side.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [FooterComponent, NavComponent, SideComponent, RouterOutlet]
})
export class HomePageComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Re-initialize Flowbite after this route renders its template.
    initFlowbite();
  }

}
