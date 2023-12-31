import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from 'app/services/data.service';
import { TranslateService } from '@ngx-translate/core';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class DteGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}

@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private dataService: DataService, private translate: TranslateService,) { }
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate() ?
      this.leavePage() :
      // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
      // when navigating away from your angular app, the browser will show a generic warning message
      // see http://stackoverflow.com/a/42207299/7307355
      this.confirm()
  }

  leavePage() {
    window.localStorage.removeItem('isReactChanged');
    window.localStorage.removeItem('duplicate_template_task');
    return true;
  }

  confirm() {
    const token = this.dataService.getDecryptedAuth();
    if (!token) {
      return true;
    }

    if (window.localStorage.getItem('isImport') == 'false' || !window.localStorage.getItem('isImport') || window.localStorage.getItem("isReactChanged") === "true"){
      const leave = confirm(this.translate.instant('dte.audience.confirm_leave'));
      if (leave) {
        window.localStorage.removeItem('isReactChanged');
        window.localStorage.removeItem('duplicate_template_task');
        return true;
      }
    }else{
      alert(this.translate.instant('dte.audience.file_import_success_press_ok'));
      window.localStorage.removeItem('duplicate_template_task');
      return true;
    }
  }
}
