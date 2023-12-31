import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { PagesName } from "../../../classes/pages-name";
import { AuthenticationService } from "../../../services/authentication.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "loyalty-keping-external-web",
  templateUrl: "./external-web.component.html",
  styleUrls: ["./external-web.component.scss"],
})
export class ExternalWebComponent implements OnInit {
  roles: PagesName = new PagesName();
  urlSafe: SafeResourceUrl;
  loading: boolean = true;
  currentUrl: string;
  permission: any;
  permissionId: any = {
    catalogues: "katalog_keping",
    redeems: "riwayat_penukaran_keping",
    sources: "riwayat_pendapatan_keping",
    settings: {
      stars: "pengaturan_keping_bintang_ke_keping",
      coo: "pengaturan_keping_pesan_antar",
      cashier: "pengaturan_keping_belanja_langsung",
    },
    resets: "reset_keping",
  };

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUrl = this.route.snapshot.url[0].path;
    let permissionId = this.permissionId[this.currentUrl];
    if (typeof permissionId !== "string") {
      let subCurrentUrl = this.route.snapshot.url[1].path;
      permissionId = this.permissionId[this.currentUrl][subCurrentUrl];
    }
    this.permission = this.roles.getArrayRoles(`principal.${permissionId}`);
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
