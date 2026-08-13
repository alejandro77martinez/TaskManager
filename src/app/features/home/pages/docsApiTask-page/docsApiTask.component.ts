import { Component } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-docsApiTask-page',
  templateUrl: './docsApiTask.component.html'
})
export class DocsApiTaskPageComponent {
  iframeUrl: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) {
    const url = environment.authApiBaseUrl + "/api/v1/task/swagger-ui/index.html";
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}