import { HttpParams } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesName } from 'app/classes/pages-name';
import { AuthenticationService } from 'app/services/authentication.service';
import { DataService } from 'app/services/data.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-group-sku',
  templateUrl: './group-sku.component.html'
})
export class GroupSkuComponent implements OnInit {
  url = '';
  urlSafe: SafeResourceUrl;
  loading = true;
  permission: any;
  roles: PagesName = new PagesName();
  isChange: boolean = false;

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.isChange) return false;

    return true;
  }

  @HostListener("window:message", ["$event"])
  onPostMessage({ data: resData }) {
    console.log('resData =>', resData);
    
    this.isChange = resData.isChange ? resData.isChange : false;

    if (this.isChange) {
      window.localStorage.setItem("isReactChanged", 'true');
    } else {
      window.localStorage.setItem("isReactChanged", 'false');
    }
  }

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    // private serializer: UrlSerializer,
  ) {
    this.permission = this.roles.getArrayRoles('principal.dte_image_recognition_master_brand_group');
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnInit() {
    const targetPath = this.router.url;
    this.authService.getEncryptedToken().subscribe(res => {
      const baseurl = environment.SRC_KATALOG_KOIN_BASE_IFRAME_URL;
      const encodedToken = encodeURI(res.data);
      const httpParams = new HttpParams().set('dceauth', encodedToken).set('destination', targetPath).set('platform', 'principal').set('allowBack', '1').set('_prmdxtrn', JSON.stringify(this.permission));
      const fullUrl = `${baseurl}?${httpParams.toString()}`;
      // console.log({ fullUrl });

      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      this.loading = false;
    })
  }
}
