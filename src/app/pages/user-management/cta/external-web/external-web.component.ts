import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { PagesName } from "app/classes/pages-name";
import { AuthenticationService } from "app/services/authentication.service";
import { environment } from "environments/environment";

@Component({
  selector: "cta-external-web",
  templateUrl: "./external-web.component.html",
  styleUrls: ["./external-web.component.scss"],
})
export class CTAExternalWebComponent implements OnInit {
  roles: PagesName = new PagesName();
  urlSafe: SafeResourceUrl;
  loading: boolean = true;
  currentUrl: string;
  permission: any;

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.permission = this.roles.getArrayRoles(`principal.call-to-action`);
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl("");
  }

  ngOnInit() {
    const targetPath = this.router.url;
    this.authService.getEncryptedToken().subscribe(({ data: token }) => {
      const encodedToken = encodeURI(token);
      const httpParams = new HttpParams()
        .set("dceauth", encodedToken)
        .set("destination", targetPath)
        .set("platform", "principal")
        .set("allowBack", "1")
        .set("_prmdxtrn", JSON.stringify(this.permission));

      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${environment.REACT_BASE_URL}?${httpParams.toString()}`
      );
      this.loading = false;
    });
  }
}
