import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesName } from 'app/classes/pages-name';
import { AuthenticationService } from 'app/services/authentication.service';
import { DataService } from 'app/services/data.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-promo-mandiri',
  templateUrl: './promo-mandiri.component.html',
  styleUrls: ['./promo-mandiri.component.scss']
})
export class PromoMandiriComponent implements OnInit {
  url = '';
  urlSafe: SafeResourceUrl;
  loading = true;
  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    // private serializer: UrlSerializer,
  ) {
    this.permission = this.roles.getArrayRoles('principal.promomandiri');
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnInit() {
    // TODO: move checking getEncrypted token only once after loggedin
    const targetPath = this.router.url;
    this.authService.getEncryptedToken().subscribe(res => {
      const baseurl = environment.REACT_BASE_URL;
      // const authData = this.dataService.getDecryptedAuth();
      // const httpParams = new HttpParams().set('dceauth', authData.access_token).set('destination', `${targetPath}`).set('platform', 'principal').set('allowBack', '1');
      const encodedToken = encodeURI(res.data);
      const httpParams = new HttpParams().set('dceauth', encodedToken).set('destination', targetPath).set('platform', 'principal').set('allowBack', '1').set('_prmdxtrn', JSON.stringify(this.permission));
      const fullUrl = `${baseurl}?${httpParams.toString()}`;
      // console.log({ fullUrl });

      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      this.loading = false;
    })
  }

}
