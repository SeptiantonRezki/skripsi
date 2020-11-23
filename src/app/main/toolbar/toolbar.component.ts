import { Component, OnInit } from "@angular/core";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

import { FuseConfigService } from "@fuse/services/config.service";
import { FuseSidebarService } from "@fuse/components/sidebar/sidebar.service";

import { navigation } from "../../navigation/navigation";
import { DataService } from "../../services/data.service";
import { AuthenticationService } from "../../services/authentication.service";
import { environment } from "environments/environment";
import { NotificationService } from "app/services/notification.service";
import { Emitter } from "app/helper/emitter.helper";

@Component({
  selector: "fuse-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"]
})
export class FuseToolbarComponent implements OnInit {
  userStatusOptions: any[];
  languages: any;
  selectedLanguage: any;
  showLoadingBar: boolean;
  horizontalNav: boolean;
  noNav: boolean;
  navigation: any;
  profile: any;
  environment: any;
  badge: any;
  showBadge: boolean;

  constructor(
    private router: Router,
    private fuseConfig: FuseConfigService,
    private sidebarService: FuseSidebarService,
    private translate: TranslateService,
    private dataService: DataService,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private emitter: Emitter,
  ) {
    this.userStatusOptions = [
      {
        title: "Online",
        icon: "icon-checkbox-marked-circle",
        color: "#4CAF50"
      },
      {
        title: "Away",
        icon: "icon-clock",
        color: "#FFC107"
      },
      {
        title: "Do not Disturb",
        icon: "icon-minus-circle",
        color: "#F44336"
      },
      {
        title: "Invisible",
        icon: "icon-checkbox-blank-circle-outline",
        color: "#BDBDBD"
      },
      {
        title: "Offline",
        icon: "icon-checkbox-blank-circle-outline",
        color: "#616161"
      }
    ];

    this.languages = [
      {
        id: "en",
        title: "English",
        flag: "us"
      },
      {
        id: "id",
        title: "Indonesia",
        flag: "id"
      }
    ];

    this.selectedLanguage = this.languages[0];

    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showLoadingBar = true;
      }
      if (event instanceof NavigationEnd) {
        this.showLoadingBar = false;
      }
    });

    this.fuseConfig.onConfigChanged.subscribe(settings => {
      this.horizontalNav = settings.layout.navigation === "top";
      this.noNav = settings.layout.navigation === "none";
    });

    this.navigation = navigation;
    // this.profile = this.dataService.getFromStorage("profile") || null;
    this.profile = this.dataService.getDecryptedProfile() || null;

    this.environment = environment;
  }

  async ngOnInit() {
    const session = await this.dataService.getAuthorization();
    if (session) {
      // console.log(session);
      try {
        // console.log('Init Notif');
        this.getListNotif();
        this.notificationService.currentMessage.subscribe(res => {
          if (res) {
            this.getListNotif();
          }
        });
      } catch (e) {

      }
    }
  }

  toggleSidebarOpened(key) {
    this.sidebarService.getSidebar(key).toggleOpen();
  }

  getListNotif() {
    this.notificationService.getListNotif().subscribe(res => {
      // this.dataService.setToStorage('notif', res.result.data.filter(item => item.status === 'unread').length);
      if (res.unread !== null && res.unread > 0) {
        this.dataService.setToStorage('notif', res.unread);
      } else {
        this.dataService.setToStorage('notif', 0);
      }
      this.emitter.emitNotifDetailEmitter({ isInitNotif: true, data: res.result.data });
      this.badge = res.unread || 0;
      if (this.badge > 0) {
        this.showBadge = true;
      } else {
        this.showBadge = false;
      }
    });
  }

  search(value) {
    // Do your search here...
    // console.log(value);
  }

  setLanguage(lang) {
    // Set the selected language for toolbar
    this.selectedLanguage = lang;

    // Use the selected language for translations
    this.translate.use(lang.id);
  }

  logout() {
    this.authService.doLogout({}).subscribe(res => {
      if (res.status) {
        window.localStorage.clear();
        this.router.navigate(["/login"]);
      }
    });
  }
}
