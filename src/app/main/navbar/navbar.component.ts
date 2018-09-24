import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
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
    private dataService: DataService
  ) {
    // Navigation data
    // this.navigation = navigation;

    // Default layout
    this.layout = "vertical";
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.sidebarService.getSidebar("navbar")) {
          this.sidebarService.getSidebar("navbar").close();
        }
      }
    });

    let session = this.dataService.getAuthorization();

    if (session) {
      return this.getNav();
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
