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
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private dataService: DataService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
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
