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

@Injectable()
export class NonAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private dataService: DataService
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let token = this.dataService.getDecryptedAuth()
      ? this.dataService.getDecryptedAuth().access_token
      : null;
    if (token) {
      this.router.navigate(["dashboard"]);
      return false;
    }
    return true;
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
