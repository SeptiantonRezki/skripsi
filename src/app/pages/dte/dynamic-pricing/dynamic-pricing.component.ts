import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesName } from 'app/classes/pages-name';
import { AuthenticationService } from 'app/services/authentication.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-dynamic-pricing',
  templateUrl: './dynamic-pricing.component.html',
  styleUrls: ['./dynamic-pricing.component.scss']
})
export class DynamicPricingComponent implements OnInit {
  url = '';
  urlSafe: SafeResourceUrl;
  loading = true;
  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService,
  ) {
    this.permission = this.roles.getArrayRoles('principal.dtedynamicpricing');
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnInit() {
    // this.authService.getDynamicPricingEncryptedToken().subscribe(res => {
    //   const baseurl = environment.STREAMLIT;

    //   const encodedToken = encodeURI(res.data);
    //   this.authService.getDynamicPricingDecryptedToken({ token: encodedToken }, { username: 'ayodecrypt', password: '3mUAOH9dS4' }).subscribe(resDecrypt => {
    //     const newEncodedToken = encodeURI(resDecrypt.data);
    //     const httpParams = new HttpParams().set('token', newEncodedToken).set('platform', 'principal').set('allowBack', '1').set('_prmdxtrn', JSON.stringify(this.permission));
    //     const fullUrl = `${baseurl}?${httpParams.toString()}`;
    //     // console.log({fullUrl});

    //     this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    //     this.loading = false;
    //   })
    // })
    this.authService.getEncryptedToken().subscribe(res => {
      const baseurl = environment.STREAMLIT;

      const encodedToken = encodeURI(res.data);
      const httpParams = new HttpParams().set('token', encodedToken).set('platform', 'principal').set('allowBack', '1').set('_prmdxtrn', JSON.stringify(this.permission));
      const fullUrl = `${baseurl}?${httpParams.toString()}`;
      // console.log({fullUrl});

      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      this.loading = false;
    })
  }
}
