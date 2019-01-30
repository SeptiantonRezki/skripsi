import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from "@angular/router";
import { Observable } from "rxjs/Observable";
import { AuthenticationService } from "../services/authentication.service";
import { DataService } from "../services/data.service";
import * as _ from 'underscore';
import { PagesName } from "./pages-name";

@Injectable()
export class AuthGuard implements CanActivate {
  previousPath: string = undefined;
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private dataService: DataService
  ) {}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
    const currentRoutePath = next.url[0].path;
    
    if (this.previousPath && this.previousPath !== currentRoutePath) {
      window.localStorage.removeItem('page');
      window.localStorage.removeItem('sort');
      window.localStorage.removeItem('sort_type');
      window.localStorage.removeItem('selected_tab');
    }

    this.previousPath = currentRoutePath;

    let token = this.dataService.getAuthorization() ? this.dataService.getAuthorization().access_token : null;
    if (token) {
      return true;
    }
    this.router.navigate(["login"]);
    return false;
    // return this.authenticationService.getProfileDetail().map((auth) => {
    //     if (auth) {
    //         let isActive = auth.status;
    //         if (isActive) {
    //             return true
    //         }
    //         else {
    //             this.router.navigate(['']);
    //             return false;
    //         }
    //     }
    //     return false;
    // }).catch((err) => {
    //     this.router.navigate(['']);
    //     return Observable.of(err);
    // })
  }
}

@Injectable()
export class PageGuard implements CanActivate {
  pageName: PagesName = new PagesName();
  previousPath: string = undefined;

  constructor(
    private router: Router,
    private dataService: DataService
  ) {
  }

  canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let paramsId = router.params['id'];
    let withParams = state.url.split(`/${paramsId}`)[0];

    const currentRoutePath = router.url[0] ? router.url[0]['path'] : state.url.split('/')[1];

    if (this.previousPath && this.previousPath !== currentRoutePath) {
      window.localStorage.removeItem('page');
      window.localStorage.removeItem('sort');
      window.localStorage.removeItem('sort_type');
      window.localStorage.removeItem('selected_tab');
    }

    this.previousPath = currentRoutePath;

    let role = this.dataService.getFromStorage("profile")['roles'][0]['permissions'];
    if (state.url !== '/dashboard' && state.url !== 'my-profile' && state.url !== '/shop' && state.url !== '/content') {
      let allow = _.contains(role, this.pageName.getPages(paramsId ? `${withParams}/` : state.url));
      if (allow)
        return true;
      else
        this.router.navigate(['access-denied']);

      return false;
    }
    return true;
  }
}
