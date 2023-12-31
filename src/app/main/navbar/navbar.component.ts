import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  HostListener
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";

import { Subscription } from "rxjs";

import { FusePerfectScrollbarDirective } from "@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive";
import { FuseSidebarService } from "@fuse/components/sidebar/sidebar.service";

import { navigation } from "app/navigation/navigation";
import { FuseNavigationService } from "@fuse/components/navigation/navigation.service";
import { FuseSidebarComponent } from "@fuse/components/sidebar/sidebar.component";
import { PopupNotifComponent } from "app/shared/popup-notif/popup-notif.component";
import { NavigationService } from "app/services/navigation.service";
import { DataService } from "app/services/data.service";
import { AuthenticationService } from "app/services/authentication.service";
import { IdleService } from 'app/services/idle.service';
import { GeneralService } from "app/services/general.service";
import { QiscusService } from "app/services/qiscus.service";
import { NotificationService } from "app/services/notification.service";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { DialogService } from "app/services/dialog.service";
import { StorageHelper } from "app/helper/storage.helper";
import { getDynamicBranding } from "environments/environment";

@Component({
  selector: "fuse-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class FuseNavbarComponent implements OnInit, OnDestroy {
  private fusePerfectScrollbar: FusePerfectScrollbarDirective;


  @ViewChild(FusePerfectScrollbarDirective)
  set directive(theDirective: FusePerfectScrollbarDirective) {
    if (!theDirective) {
      return;
    }

    this.fusePerfectScrollbar = theDirective;

    this.navigationServiceWatcher = this.navigationService.onItemCollapseToggled.subscribe(
      () => {
        this.fusePerfectScrollbarUpdateTimeout = setTimeout(() => {
          this.fusePerfectScrollbar.update();
        }, 310);
      }
    );
  }

  @Input()
  layout;
  navigation: any;
  navigationServiceWatcher: Subscription;
  fusePerfectScrollbarUpdateTimeout;
  profile: any;
  branding: any;

  constructor(
    private sidebarService: FuseSidebarService,
    private navigationService: FuseNavigationService,
    private router: Router,
    private navService: NavigationService,
    private dataService: DataService,
    private userIdle: IdleService,
    private authenticationService: AuthenticationService,
    private generalService: GeneralService,
    private qs: QiscusService,
    private notificationService: NotificationService,
    private matDialog: MatDialog,
    // private gaService: GoogleAnalyticsService,
    // private storageHelper: StorageHelper,
    private dialogService: DialogService,
    private storageHelper: StorageHelper
  ) {
    // Navigation data
    // this.navigation = navigation;

    // Default layout
    this.layout = "vertical";

    this.branding = getDynamicBranding();
    console.log('this branding', this.branding)
  }
  @HostListener('document:click', ['$event'])
  documentClick(event: Event): void {
    this.userIdle.onHitEvent();
  }
  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Tab") {
      this.userIdle.onHitEvent();
    }
  }
  async ngOnInit() {
    this.profile = await this.dataService.getDecryptedProfile();
    await this.qiscusLoginOrRegister(this.profile);
    // this.qs.qiscusMC.realtimeAdapter.connected;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.sidebarService.getSidebar("navbar")) {
          this.sidebarService.getSidebar("navbar").close();
        }
      }
    });

    if (this.storageHelper.getUserQiscus() !== null) {
      this.qs.qiscus.setUserWithIdentityToken({ user: this.qs.qiscus.userData });
    }

    let session = this.dataService.getDecryptedAuth();

    if (session) {
      const response = await this.generalService.getPermissions().toPromise();
      this.dataService.setEncryptedPermissions(response.data);
      // this.dataService.setToStorage("permissions", response.data);
      let token = session.access_token;
      try {
        this.notificationService.requestPermissions(token);
        this.notificationService.receiveMessage();

        // this.openPopup();
      } catch (error) {
        console.log('Unable to Instantiate Firebase Messaging ', error);
      }
      this.userIdle.startWatching();
      this.userIdle.onTimerStart().subscribe(count => {
        // console.log(count)
      });
      this.userIdle.onTimeout().subscribe(() => {
        if (this.dataService.getFromStorage("auth")) {
          this.authenticationService.doLogout({}).subscribe(res => {
            if (res.status) {
              window.localStorage.clear();
              this.userIdle.stopWatching();
              this.router.navigate(["/login"]);
            }
          });
        }
      });
      return this.getNav();
    }

    const profile = await this.dataService.getDecryptedProfile();
    await this.qiscusLoginOrRegister(profile);
  }

  async qiscusLoginOrRegister(profile: any) {
    if (profile) {
      this.qs.qiscusMC.getNonce().then((gn: any) => {
        if (gn && gn.nonce) {
          return new Promise((resolve, reject) => {
            this.qs.createJWTMC({ nonce: gn.nonce }).subscribe((res: any) => {
              resolve(res);
            }, (err) => {
              reject(err);
            });
          });
        }
      }).then((jwt: any) => {
        if (jwt && jwt.data) {
          return this.qs.qiscusMC.verifyIdentityToken(jwt.data);
        }
      }).then((userData: any) => {
        if (userData) {
          this.qs.qiscusMC.setUserWithIdentityToken(userData);
          return userData;
        }
      });

      this.qs.qiscus.getNonce().then(async (gn: any) => {
        if (gn && gn.nonce) {
          return new Promise((resolve, reject) => {
            this.qs.createJWT({ nonce: gn.nonce }).subscribe((res: any) => {
              resolve(res);
            }, (err) => {
              reject(err);
            });
          });
        }
      }).then((jwt: any) => {
        if (jwt && jwt.data) {
          return this.qs.qiscus.verifyIdentityToken(jwt.data);
        }
      }).then((userData: any) => {
        if (userData) {
          this.qs.qiscus.setUserWithIdentityToken(userData);
          return userData;
        }
      });
    } else {
      console.warn('Maaf, Terjadi Kesalahan Server! failed to redirecting realtime server');
      // this.dialogService.openSnackBar({ message:"Maaf, Terjadi Kesalahan Server!" });
      return false;
    }
  }

  async openPopup() {
    try {
      const response = await this.notificationService.getPopupNotif().toPromise();
      if (response.id) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.width = "350px";
        dialogConfig.panelClass = "popup-notif";
        dialogConfig.data = response;

        /** TRACKING GA */
        // this.gaService.eventTracking({
        //   'event_category': 'PopUpBanner',
        //   'event_action': 'SendView',
        //   'event_label': `${response.id}`,
        //   'event_value': 1,
        //   'event_noninteraction': 0
        // });

        this.matDialog.open(PopupNotifComponent, dialogConfig);
      }
    } catch (error) {
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.fusePerfectScrollbarUpdateTimeout) {
      clearTimeout(this.fusePerfectScrollbarUpdateTimeout);
    }

    if (this.navigationServiceWatcher) {
      this.navigationServiceWatcher.unsubscribe();
    }
  }

  getNav(): void {
    this.navService.get().subscribe(res => {
      this.navigation = this.recursiveMenu(res);
    });
  }

  toggleSidebarOpened() {
    this.sidebarService.getSidebar("navbar").toggleOpen();
  }

  toggleSidebarFolded() {
    this.sidebarService.getSidebar("navbar").toggleFold();
  }

  toCapitalize(value?) {
    return value ? String(value).replace(/\b\w/g, l => l.toUpperCase()) : "";
  }

  recursiveMenu(array?) {
    return array.map(item => {
      return {
        ...item,
        translate: this.toCapitalize(item.translate),
        children: item.children ? this.recursiveMenu(item.children) : []
      };
    });
  }
}
