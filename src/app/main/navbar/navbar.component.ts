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
import { NavigationService } from "app/services/navigation.service";
import { DataService } from "app/services/data.service";
import { AuthenticationService } from "app/services/authentication.service";
import { IdleService } from 'app/services/idle.service';
import { GeneralService } from "app/services/general.service";
import { QiscusService } from "app/services/qiscus.service";

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
  ) {
    // Navigation data
    // this.navigation = navigation;

    // Default layout
    this.layout = "vertical";
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
    this.qs.qiscusMC.realtimeAdapter.connected;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.sidebarService.getSidebar("navbar")) {
          this.sidebarService.getSidebar("navbar").close();
        }
      }
    });

    let session = this.dataService.getDecryptedAuth();

    if (session) {
      const response = await this.generalService.getPermissions().toPromise();
      this.dataService.setEncryptedPermissions(response.data);
      // this.dataService.setToStorage("permissions", response.data);
      this.getNav();
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
    }

    const profile = await this.dataService.getDecryptedProfile();
    // await this.qiscusLoginOrRegister(profile);
  }

  async qiscusLoginOrRegister(profile: any){
    console.warn('profile', profile);
    if(profile) {
      if(profile.id && profile.email && profile.fullname){
        const qiscusPayload = {
          userIdMC: profile.email,
          userKey: 'prinhms' + profile.id, //profile.qiscus_user_key,
          userName: profile.fullname,
          avatarImage: profile.image_url || null,
        }

				const qiscusMCPayload = {
					user_id: qiscusPayload.userIdMC,
					password: qiscusPayload.userKey,
					username: qiscusPayload.userName,
					avatar_url: qiscusPayload.avatarImage,
				};
        return await this.qs.qiscusLoginMultichannel(qiscusMCPayload).subscribe(async(res_2: any) => {
					return await this.qs.qiscusMC.setUser(qiscusMCPayload.user_id, qiscusMCPayload.password, qiscusMCPayload.username, qiscusMCPayload.avatar_url);
        });
      } else {
        console.warn('Maaf, Terjadi Kesalahan Server! (failed to redirecting realtime server)');
        // this.dialogService.openSnackBar({ message:"Maaf, Terjadi Kesalahan Server!" });
        return false;
      }
    } else {
      console.warn('Maaf, Terjadi Kesalahan Server! failed to redirecting realtime server');
      // this.dialogService.openSnackBar({ message:"Maaf, Terjadi Kesalahan Server!" });
      return false;
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
