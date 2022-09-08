import { HttpParams } from "@angular/common/http";
import { Component, HostListener, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { PagesName } from "app/classes/pages-name";
import { AuthenticationService } from "app/services/authentication.service";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Component({
  selector: "app-loyalty-mitra",
  templateUrl: "./loyalty-mitra.component.html",
  styleUrls: ["./loyalty-mitra.component.scss"],
})
export class LoyaltyMitraComponent implements OnInit {
  url = "";
  urlSafe: SafeResourceUrl;
  loading = true;
  permission: any;
  roles: PagesName = new PagesName();
  formIsDirty: boolean = false;

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    return !this.formIsDirty;
  }

  @HostListener("window:message", ["$event"])
  onMessage({ data }) {
    if (data.type === "form") this.formIsDirty = data.isDirty;
    if (data.type === "redirect") this.router.navigate(data.path.split("/"));
    if (data.type === "newtab")
      this.router.navigate([]).then((result) => {
        window.open(data.path, "_blank");
      });
  }

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.permission = this.roles.getArrayRoles("principal.dteprogramloyaltymitra");
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl("");
  }

  ngOnInit() {
    const targetPath = this.router.url;
    this.authService.getEncryptedToken().subscribe((res) => {
      const baseurl = environment.REACT_BASE_URL;

      const encodedToken = encodeURI(res.data);
      const httpParams = new HttpParams()
        .set("dceauth", encodedToken)
        .set("destination", targetPath)
        .set("platform", "principal")
        .set("allowBack", "1")
        .set("_prmdxtrn", JSON.stringify(this.permission));
      const fullUrl = `${baseurl}?${httpParams.toString()}`;

      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      this.loading = false;
    });
  }
}
