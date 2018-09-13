import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { ScheduleTradeProgramService } from "../services/dte/schedule-trade-program.service";
import { Observable } from "rxjs";
import { AudienceService } from "../services/dte/audience.service";

@Injectable()
export class ListTradeProgramResolver implements Resolve<any> {
  constructor(private schedulerTradeProgramService: ScheduleTradeProgramService) {}
  resolve(): Observable<any> {
    return this.schedulerTradeProgramService.getTradeProgram({ param: "" });
  }
}

@Injectable()
export class ListTemplateResolver implements Resolve<any> {
  constructor(private schedulerTradeProgramService: ScheduleTradeProgramService) {}
  resolve(): Observable<any> {
    return this.schedulerTradeProgramService.getTemplate({ param: "" });
  }
}

@Injectable()
export class ListSchedulerResolver implements Resolve<any> {
  constructor(private audienceService: AudienceService) {}
  resolve(): Observable<any> {
    return this.audienceService.getListAudience();
  }
}

@Injectable()
export class ListRetailerResolver implements Resolve<any> {
  constructor(private audienceService: AudienceService) {}
  resolve(): Observable<any> {
    return this.audienceService.getListRetailer();
  }
}