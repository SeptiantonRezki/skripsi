import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";
import { Config } from "../classes/config";
import { Observable } from "rxjs";

@Injectable()
export class AuthenticationService extends BaseService {
  public namespace = "authentication";

  constructor(http: HttpClient) {
    super(http);
  }

  // postRefreshToken(): Observable<any> {
  //   const refreshToken = 'dummy_token';
  //   const body = {
  //     grant_type: 'refresh_token',
  //     refresh_token: refreshToken,
  //     client_id: Config.AYO_CLIENT_ID,
  //     client_secret: Config.AYO_CLIENT_SECRET
  //   };
  //   const url = this.getUrl(this.namespace, 'refresh_token');
  //   return this.postApi(url,body);
  // }

  checkIsms(context): Observable<any> {
    let contextParams = {
      business_code: context.business_code,
      phone: context.phone
    };
    const url = this.getUrl(this.namespace, "verify_isms", contextParams);
    return this.getApi(url);
  }

  storeUser(body): Observable<any> {
    const url = this.getUrl(this.namespace, "store_user");
    return this.postApi(url, body);
  }

  login(body): Observable<any> {
    const url = this.getUrl(this.namespace, "login");
    let authorization = {
      ...Config.AYO_AUTHORIZATION,
      ...body
    };
    return this.postApi(url, authorization);
  }

  verifyCode(body): Observable<any> {
    const url = this.getUrl(this.namespace, "verify_code");
    return this.postApi(url, body);
  }

  getProfileDetail(): Observable<any> {
    const url = this.getUrl(this.namespace, "me");
    return this.getApi(url);
  }

  resendOtpCode(body): Observable<any> {
    const url = this.getUrl(this.namespace, "resend_otp");
    return this.postApi(url, body);
  }

  resetPassword(body): Observable<any> {
    const url = this.getUrl(this.namespace, "reset_password");
    return this.postApi(url, body);
  }

  changePassword(body): Observable<any> {
    const url = this.getUrl(this.namespace, "change_password");
    return this.postApi(url, body);
  }

  changePasswordEditProfile(body): Observable<any> {
    const url = this.getUrl(this.namespace, "change_password_edit_profile");
    return this.postApi(url, body);
  }

  doLogout(body): Observable<any> {
    const url = this.getUrl(this.namespace, "logout");
    return this.getApi(url);
  }

  checkToken(body): Observable<any> {
    const url = this.getUrl(this.namespace, "check_token");
    return this.postApi(url, body);
  }

  getSyaratKetentuan(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_syarat_ketentuan");
    return this.getApi(url);
  }

  checkUserStatus(username): Observable<any> {
    const url = this.getUrl(this.namespace, "check_user_status");
    return this.postApi(url, { username });
  }

  getUserCognitoAD(authCode): Observable<any> {
    const url = this.getUrl(this.namespace, "get_user_cognito_ad");
    return this.postApi(url, { code: authCode });
  }

  getEncryptedToken(): Observable<any> {
    const url = this.getUrl(this.namespace, "encrypted_token");
    return this.getApi(url);
  }
}
