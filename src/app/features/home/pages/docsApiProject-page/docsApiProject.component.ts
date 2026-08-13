import { Component } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-docsApiProject-page',
  templateUrl: './docsApiProject.component.html'
})
export class DocsApiProjectPageComponent {
  iframeUrl: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) {
    const url = environment.authApiBaseUrl + "/api/v1/project/swagger-ui/index.html";
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}