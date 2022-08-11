import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { HttpClient } from '@angular/common/http';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { ShopingDiscountCoinsService } from 'app/services/shoping-discount-coins.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shoping-discount-coins.component',
  templateUrl: './shoping-discount-coins.component.html',
  styleUrls: ['./shoping-discount-coins.component.scss']
})
export class ShopingDiscountCoinsComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: Number = null;

  keyUp = new Subject<string>();

  @ViewChild("activeCell") activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  permission: any;
  roles: PagesName = new PagesName();
  opsiVoucherList = [
    { name: 'B2B Only', value: 'b2b' },
    { name: 'Katalog SRC Only', value: 'src-catalogue' },
    { name: 'B2B & Katalog SRC', value: 'both' },
    { name: 'Private Label', value: 'private-label' },
  ]; // TODO

  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private shopingDiscountCoinsService: ShopingDiscountCoinsService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = true;
    // this.selected = [];

    this.permission = this.roles.getRoles('principal.koin_potongan_belanja');

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getList();

  }

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.shopingDiscountCoinsService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.shopingDiscountCoinsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.shopingDiscountCoinsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.shopingDiscountCoinsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_shoping_discount_coins", param);
    this.router.navigate(["discount-coins-order", "detail"]);
  }
  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_shoping_discount_coins", param);
    this.router.navigate(["discount-coins-order", "edit"]);
  }

  getStatusColor(status) {
    switch (status) {
      case "draft":
        return "mat-yellow-900-bg";
      case "need-approval":
        return "mat-red-800-bg";
      case "approved":
        return "mat-green-800-bg";
      case "published":
        return "mat-green-800-bg";
      default:
        return "mat-red-800-bg";
    }
  }

  deleteDiscountCoin(id) {
    this.id = id;
    const entity = this.translate.instant('cn_reward.discount_coins_order.title')
    const data = {
      titleDialog: this.translate.instant('global.label.delete_entity', {entity}),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {entity, index: ''}),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')] 
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.shopingDiscountCoinsService.delete({ coin_discount_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getList();

        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') }); // TODO
      }
    });
  }

}
