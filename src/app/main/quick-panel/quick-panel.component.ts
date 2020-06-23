import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from "@angular/core";
import { DataService } from "../../services/data.service";
import { NotificationService } from "../../services/notification.service";
import { Router } from "../../../../node_modules/@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { FuseMatSidenavHelperService } from "@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service";
import { Emitter } from "app/helper/emitter.helper";
import { Page } from 'app/classes/laravel-pagination';

@Component({
	selector: 'fuse-quick-panel',
	templateUrl: './quick-panel.component.html',
	styleUrls: ['./quick-panel.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FuseQuickPanelComponent implements OnInit {
	@ViewChild('containerScroll', { read: ElementRef }) public myContainerS: ElementRef<any>;
	date: Date;
	settings: any;
	notes = [];
	events = [];
	listNotif = [];
	getNotif: any;
	page: number;
	pagination: Page = new Page();
	isLoadNotif: boolean;
	isLastPage: boolean;

	constructor(
		private dataService: DataService,
		private notificationService: NotificationService,
		private fuseSplashScreen: FuseSplashScreenService,
		private router: Router,
		private fuseMatSidenavService: FuseMatSidenavHelperService,
		private emitter: Emitter,
	) {
		console.log('V200623-1027');
		this.isLastPage = false;
		this.isLoadNotif = false;
		this.page = 1;
		this.pagination.per_page = 15;
		this.date = new Date();
		this.settings = {
			notify: true,
			cloud: false,
			retro: true
		};

		this.emitter.listenNotifDetailEmitter.subscribe((value: any) => {
			if (value.isUpdateNotif) {
				this.getListNotif();
			}
			if (value.isNotifOnCLick) {
				this.router.navigate(['/list-notifications']);
			}
			if (value.isInitNotif) {
				this.page = 1;
				this.listNotif = value.data;
				this.isLastPage = false;
				this.scrollToTop();
				if (this.listNotif.length < this.pagination.per_page) {
					this.isLastPage = true;
				}
			}
		});
	}

	async ngOnInit() {
		this.notificationService.currentMessage.subscribe(res => {
			if (res) {
				this.getListNotif();
			}
		});
	}

	getListNotif() {
		this.isLoadNotif = true;
		this.notificationService.getListNotif().subscribe(res => {
			if (res.unread !== null && res.unread > 0) {
				this.dataService.setToStorage('notif', res.unread);
			} else {
				this.dataService.setToStorage('notif', 0);
			}
			this.emitter.emitNotifDetailEmitter({ isUpdateBadge: true });
			if (res.result.data.length > 0) {
				this.listNotif = res.result.data;
			}
			this.page = 1;
			this.isLoadNotif = false;
			this.isLastPage = false;
			if (res.result.last_page === this.page) {
				this.isLastPage = true;
			}
		}, () => {
			this.isLoadNotif = false;
		});
		console.log(this.listNotif);
	}

	getListNotifMore() {
		this.isLoadNotif = true;
		this.pagination.page = this.page + 1;
		this.page = this.page + 1;
		this.notificationService.getListNotif(this.pagination).subscribe(res => {
			if (res.unread !== null && res.unread > 0) {
				this.dataService.setToStorage('notif', res.unread);
			} else {
				this.dataService.setToStorage('notif', 0);
			}
			this.emitter.emitNotifDetailEmitter({ isUpdateBadge: true });
			if (res.result.data.length > 0) {
				this.listNotif.push(...res.result.data);
			}
			this.isLoadNotif = false;
			if (res.result.last_page === this.page) {
				this.isLastPage = true;
			}
		}, () => {
			this.isLoadNotif = false;
		});
	}

	directNotif(item) {
		if (item.status === 'unread') {
			this.notificationService.updateNotif(item.id).subscribe(res => {
				this.getListNotif();
			});

			if (item.notif_type === 'supplier') {
				this.router.navigate(['/user-management/supplier-order', 'detail', item.entity_id]);
			}
			//  else if (item.entity_type === 'request confirmed' || item.notif_type === 'request_confirmed') {
			// 	this.router.navigate(['/b2b', 'user']);
			// } else if (item.entity_type === 'video' || item.entity_type === 'image') {
			// 	this.router.navigate(['/list-notifications', 'detail', item.id]);
			// 	this.emitter.emitNotifDetailEmitter({ isDirectDetail: true, data: item });
			// } else {
			// 	this.router.navigate(['/user-management/supplier-order', 'detail', item.id]);
			// }
		} else {
			if (item.notif_type === 'supplier') {
				this.router.navigate(['/user-management/supplier-order', 'detail', item.entity_id]);
			}
			// if (item.entity_type === 'matchmaking request' || item.notif_type === 'matchmaking_request') {
			// 	this.router.navigate(['/b2b', 'request-user']);
			// } else if (item.entity_type === 'request confirmed' || item.notif_type === 'request_confirmed') {
			// 	this.router.navigate(['/b2b', 'user']);
			// } else if (item.entity_type === 'video' || item.entity_type === 'image') {
			// 	this.router.navigate(['/list-notifications', 'detail', item.id]);
			// 	this.emitter.emitNotifDetailEmitter({ isDirectDetail: true, data: item });
			// } else {
			// 	this.router.navigate(['/orders', 'detail', item.entity_id]);
			// }
		}
		
			

		this.fuseMatSidenavService.getSidenav('quick-panel').toggle();
	}

	scrollToTop() {
		try {
			this.myContainerS.nativeElement.scrollTop = 0;
		} catch (ex) {
			console.warn('Scrolling failed', ex);
		}
	}

}
