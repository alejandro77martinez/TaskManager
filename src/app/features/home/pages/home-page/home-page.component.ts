import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet} from '@angular/router';
import { ProjectService } from '../../../../core/project/project.service';
import { initFlowbite } from 'flowbite';
import { FooterComponent } from '../../../../shared/ui/footer/footer.component';
import { NavComponent } from '../../components/nav-component/nav.component';
import { SideComponent } from '../../components/side-component/side.component';
import { LoadPage } from '../../../../shared/ui/loading/app/load.page';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [FooterComponent, NavComponent, SideComponent, RouterOutlet, LoadPage]
})
export class HomePageComponent implements AfterViewInit {

  private readonly projectService = inject(ProjectService)
  readonly loadProjects = this.projectService.loadProjects

  ngOnInit(): void {
    if (this.projectService.projects().length === 0) {
      this.projectService.getProjectsFromApi()
    }
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

}
