import { HttpParams } from "@angular/common/http";
import { Component, HostListener, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
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
  lang: string = "id";
  init: boolean = false;
  private encodeToken: string = "";

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    return !this.formIsDirty;
  }

  @HostListener("window:message", ["$event"])
  onMessage({ data }) {
    if (data.type === "form") this.formIsDirty = data.isDirty;
    if (data.type === "redirect")
      this.router.navigate(data.path.split("/"));
    if (data.type === "newtab")
      this.router.navigate([]).then((result) => {
        window.open(data.path, "_blank");
      });
  }

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.permission = this.roles.getArrayRoles(
      "principal.dteprogramloyaltymitra"
    );
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl("");
  }

  ngOnInit() {
    this.lang = localStorage.getItem("user_country");
    this.authService.getEncryptedToken().subscribe((res) => {
      this.encodeToken = encodeURI(res.data);
      this.renderPage();
      this.init = true;
    });
  }

  renderPage() {
    this.loading = true;
    const targetPath = this.router.url;
    const baseurl = environment.REACT_BASE_URL;
    const httpParams = new HttpParams()
      .set("dceauth", this.encodeToken)
      .set("destination", targetPath)
      .set("platform", "principal")
      .set("allowBack", "1")
      .set("_prmdxtrn", JSON.stringify(this.permission))
      .set("locale", this.lang);
    const fullUrl = `${baseurl}?${httpParams.toString()}`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    this.loading = false;
  }
}
