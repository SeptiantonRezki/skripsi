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
import { MatDialog } from "@angular/material";
import { LanguagesService } from "./languages/languages.service";

@Injectable()
export class BaseInterceptor implements HttpInterceptor {
  private authenticationService: AuthenticationService;
  private refreshTokenObserver: Observable<any>;
  constructor(
    private injector: Injector,
    private router: Router,
    private matDialog: MatDialog,
    private ls: LanguagesService
  ) {
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
    const token = this.injector.get(DataService).getDecryptedAuth() ? this.injector.get(DataService).getDecryptedAuth()["access_token"] : null;
    const country_code = localStorage.getItem('user_country');
    if (token && request.url.indexOf("decrypt-dynamic-pricing") === -1) {
      const duplicate = request.clone({
        headers: request.headers.set("Authorization", "Bearer " + token).set('App-Locale', country_code)
      });
      return duplicate;
    }
    const duplicateReq = request.clone({
      headers: request.headers.set('App-Locale', country_code)
    });
    return duplicateReq;
  }

  throwIntercept(err, req) {
    console.error("HTTP ERROR LOGGER", err.status);
    if (err.status === 0)
      this.injector.get(DialogService).openSnackBar({ message: "Terjadi kesalahan, koneksi anda terputus atau internet anda sedang bermasalah!" });

    if (err instanceof HttpErrorResponse) {
      // kondisi ketika check isms
      if (err.status == 404) {
        if (err.error.status == false) {
          this.injector.get(DialogService).openSnackBar({ message: "Data tidak valid / tidak ditemukan" });
        } else if (err.error instanceof Blob) {
          // handle 404 Error response from postBlobAsJsonApi
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            this.injector.get(DialogService).openSnackBar({ message: Object.values(JSON.parse(reader.result).errors)[0][0] });
          }, false);

          if (err.error) {
            reader.readAsText(err.error);
          }
        }
        if (req.method === "PUT") {
          if (err.error.errors) {
            if (err.error.errors['status']) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors['status'] })
            } else if (err.error.errors.access_lock) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors.access_lock });
            } else {
              let errorArray = Object.values(err.error.errors);
              this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0] })
            }
          } else {
            this.injector.get(DialogService).openSnackBar({ message: err.error.message });
          }
        }
        return Observable.throw(err);
      } else if (err.status == 400) {
        if (req.method === "POST") {
          if (err.error.errors) {
            if (err.error.errors.access_lock) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors.access_lock });
            } else {
              let errorArray = Object.values(err.error.errors);
              this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0] })
            }
          } else {
            this.injector.get(DialogService).openSnackBar({ message: err.error.message });
          }
        }
        return Observable.throw(err);
      } else if (err.status == 401) {
        const country_code = localStorage.getItem('user_country');

        if (req.method == "POST") {
          this.injector.get(DialogService).openSnackBar({ message: "Email / kata sandi yang Anda masukkan salah" });
        }

        if (err.error === "Tidak ada otorisasi") {
          window.localStorage.clear();
          localStorage.setItem('user_country', country_code);
          this.router.navigate(["login"]);
          this.matDialog.closeAll();
          this.injector.get(DialogService).openSnackBar({ message: `Terjadi Kesalahan, ${err.error}` });
        }

        window.localStorage.clear();
        localStorage.setItem('user_country', country_code);
        this.router.navigate(["login"]);
        this.matDialog.closeAll();
        this.injector.get(DialogService).openSnackBar({ message: `Terjadi Kesalahan, ${err.error.message}` });

        return Observable.throw(err);
      } else if (err.status == 403) {
        return Observable.throw(err);
      } else if (err.status == 422) {
        // let reqOtc = Object.entries(req.body).map(([key]) => ({ key }));
        if (req.method === "POST") {
          // if (reqOtc[0]["key"] === "password_current") {
          //   return Observable.throw(err);
          // }

          // if (err.error.errors['status']) {
          //   this.injector.get(DialogService).openSnackBar({ message: err.error.errors['status'] })
          // } else
          if (err.error.errors) {
            if (err.error.errors.access_lock) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors.access_lock });
            } else {
              let errorArray = Object.values(err.error.errors);
              this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0] })
            }
          } else {
            this.injector.get(DialogService).openSnackBar({ message: err.error.message });
          }

        } else if (req.method === "DELETE") {
          let errorArray = Object.values(err.error.errors);
          this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0] })
        }

        if (req.method === "PUT") {
          if (err.error.errors) {
            if (err.error.errors['status']) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors['status'] })
            } else if (err.error.errors.access_lock) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors.access_lock });
            } else {
              let errorArray = Object.values(err.error.errors);
              this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0] })
            }
          } else {
            this.injector.get(DialogService).openSnackBar({ message: err.error.message });
          }
        }
        return Observable.throw(err);
      } else if (err.status == 500) {
        if (req.method == "POST") {
          this.injector.get(DialogService).openSnackBar({ message: err.error.message });
        }
        if (req.method === "PUT") {
          if (err.error.errors) {
            if (err.error.errors['status']) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors['status'] })
            } else if (err.error.errors.access_lock) {
              this.injector.get(DialogService).openSnackBar({ message: err.error.errors.access_lock });
            } else {
              let errorArray = Object.values(err.error.errors);
              this.injector.get(DialogService).openSnackBar({ message: errorArray[0][0] })
            }
          } else {
            this.injector.get(DialogService).openSnackBar({ message: err.error.message });
          }
        }
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
