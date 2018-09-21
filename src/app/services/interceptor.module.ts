import { Injectable, Injector } from "@angular/core";
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";
import { DataService } from "./data.service";
import { Observable } from "rxjs/Rx";
import { Router } from "@angular/router";
import { DialogService } from "./dialog.service";

@Injectable()
export class BaseInterceptor implements HttpInterceptor {
  private authenticationService: AuthenticationService;
  private refreshTokenObserver: Observable<any>;
  constructor(private injector: Injector, private router: Router) {
    // this.refreshTokenObserver = Observable.defer(() => {
    //   return this.injector.get(AuthenticationService).postRefreshToken();
    // }).share();
  }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = this.authenticateRequest(req);
    return next
      .handle(authReq)
      .do((event: HttpEvent<any>) => {
        // do event;
      })
      .catch((err: any) => {
        return this.throwIntercept(err, req);
      });
  }

  authenticateRequest(request: HttpRequest<any>) {
    const token = this.injector.get(DataService).getAuthorization() ? this.injector.get(DataService).getAuthorization()["access_token"] : null;
    if (token) {
      const duplicate = request.clone({
        headers: request.headers.set("Authorization", "Bearer " + token)
      });
      return duplicate;
    }
    return request;
  }

  throwIntercept(err, req) {
    // console.error("HTTP ERROR LOGGER", err);
    if (err.status === 0)
      this.injector.get(DialogService).openSnackBar({ message: "Terjadi kesalahan, koneksi anda terputus atau internet anda sedang bermasalah!" });

    if (err instanceof HttpErrorResponse) {
      // kondisi ketika check isms
      if (err.status == 404) {
        if (err.error.status == false) {
          this.injector.get(DialogService).openSnackBar({ message: "Data tidak valid / tidak ditemukan" });
        }
        return Observable.throw(err);
      } else if (err.status == 400) {
        if (req.method == "POST") {
          this.injector.get(DialogService).openSnackBar({ message: "Email / kata sandi yang Anda masukan salah" });
        }
        return Observable.throw(err);
      } else if (err.status == 401) {
        if (req.method == "POST") {
          this.injector.get(DialogService).openSnackBar({ message: "Email / kata sandi yang Anda masukan salah" });
        }

        if (err.error === "Tidak ada otorisasi") {
          window.localStorage.clear();
          this.router.navigate(["login"]);
          this.injector.get(DialogService).openSnackBar({ message: `Terjadi Kesalahan, ${err.error}` });
        }

        return Observable.throw(err);
      } else if (err.status == 403) {
        return Observable.throw(err);
      } else if (err.status == 422) {
        // let reqOtc = Object.entries(req.body).map(([key]) => ({ key }));
        if (req.method === "POST") {
          // if (reqOtc[0]["key"] === "password_current") {
          //   return Observable.throw(err);
          // }

          if (err.error['status']) {
            this.injector.get(DialogService).openSnackBar({ message: err.error['status']})
          } else {
            let errorArray = Object.values(err.error.errors);
            // this.injector.get(DialogService).openCustomDialog(null, errorArray[0][0]);
            this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0]})
          }
        }
        return Observable.throw(err);
      } else if (err.status == 404 || err.status == 500) {
        return Observable.throw(err);
      } else {
        const status = err.status;
        const errMsg = {
          error: err.error,
          status: status,
          headers: err.headers
        };
        return Observable.throw(errMsg || "Server error");
      }
    }

    return Observable.of(err);
  }

  refreshToken() {
    // return this.refreshTokenObserver.do((token) => {
    //   this.injector.get(OauthService).setAccessToken(token);
    // }, (err) => {
    //   console.error(err);
    //   this.injector.get(OauthService).broadCastLogout();
    //   // return Observable.throw(err);
    // })
  }
}
