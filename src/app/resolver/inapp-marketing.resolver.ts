import { BannerService } from "../services/inapp-marketing/banner.service";
import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";

@Injectable()
export class ListLevelAreaResolver implements Resolve<any>{
  constructor(private bannerService: BannerService){}
  resolve(): Observable<any> {
    return this.bannerService.getListLevel();
  }
}