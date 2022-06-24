import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";
import { Subject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { BannerService } from "app/services/inapp-marketing/banner.service";
import { PagesName } from "app/classes/pages-name";
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-banner-index",
  templateUrl: "./banner-index.component.html",
  styleUrls: ["./banner-index.component.scss"]
})
export class BannerIndexComponent {
  
  TYPE_BANNER = {
    DEFAULT: '',
    INFO_TERKINI: 'info-terkini',
    AKTIVASI_KONSUMEN: 'aktivasi-konsumen',
    TERDEKAT: 'toko-terdekat',
    INFO_SRC: 'info-src',
    FBTN: 'flying-button',
    TICKER: 'ticker',
  };

  rows: any[];
  infoTerkiniRows: any[];
  tickerRows: any[];
  terdekatRows: any[];
  infoSRCRows: any[];
  fbtnRows: any[];
  aktivasiKonsumenRows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  infoTerkiniPagination: Page = new Page();
  tickerPagination: Page = new Page();
  terdekatPagination: Page = new Page();
  infoSRCPagination: Page = new Page();
  fbtnPagination: Page = new Page();
  aktivasiKonsumenPagination: Page = new Page();

  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  
  // INFO TERKINI
  infoTerkiniLoadingIndicator = true;
  infoTerkiniOnLoad: boolean;
  infoTerkiniOffsetPagination: any;

  tickerLoadingIndicator = true;
  tickerOnLoad: boolean;
  tickerOffsetPagination: any;

  // TOKO TERDEKAT
  terdekatLoadingIndicator = true;
  terdekatOnLoad: boolean;
  terdekatOffsetPagination: any;

  // INFO SRC
  infoSRCLoadingIndicator = true;
  infoSRCOnLoad: boolean;
  infoSRCOffsetPagination: any;

  // FLYING BUTTON
  fbtnLoadingIndicator = true;
  fbtnOnLoad: boolean;
  fbtnOffsetPagination: any;

  // AKTIVASI KONSUMEN
  aktivasiKonsumenLoadingIndicator = true;
  aktivasiKonsumenOnLoad: boolean;
  aktivasiKonsumenOffsetPagination: any;

  _onSearch = new Subject<any>();

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = true;
    this.infoTerkiniOnLoad = true;
    this.selected = [];
    this.onSearch = this.onSearch.bind(this);

    this.permission = this.roles.getRoles('principal.spanduk');


    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
    this._onSearch.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap((data) => Observable.of(data).delay(500) )
      .subscribe(this.onSearch);
  }

  ngOnInit() {
    this.getBanner();
    this.getTicker();
    this.getInfoTerkini();
    this.getTerdekat();
    this.getInfoSRC();
    this.getFbtn();
    this.getAktivasiKonsumen();
  }

  getBanner() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.per_page = 5;

    this.offsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  getTicker() {
    const page = this.dataService.getFromStorage("banner_ticker_page");
    const sort_type = this.dataService.getFromStorage("banner_ticker_sort_type");
    const sort = this.dataService.getFromStorage("banner_ticker_sort");

    this.tickerPagination.page = page;
    this.tickerPagination.sort_type = sort_type;
    this.tickerPagination.sort = sort;
    this.tickerPagination.type_banner = this.TYPE_BANNER.TICKER;
    this.tickerPagination.per_page = 5;

    this.tickerOffsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.tickerPagination).subscribe(
      res => {
        Page.renderPagination(this.tickerPagination, res);
        this.tickerRows = res.data;
        this.tickerOnLoad = false;
        this.tickerLoadingIndicator = false;
      },
      err => {
        this.tickerOnLoad = false;
      }
    );
  }

  getInfoTerkini() {
    const page = this.dataService.getFromStorage("banner_info_terkini_page");
    const sort_type = this.dataService.getFromStorage("banner_info_terkini_sort_type");
    const sort = this.dataService.getFromStorage("banner_info_terkini_sort");

    this.infoTerkiniPagination.page = page;
    this.infoTerkiniPagination.sort_type = sort_type;
    this.infoTerkiniPagination.sort = sort;
    this.infoTerkiniPagination.type_banner = this.TYPE_BANNER.INFO_TERKINI;
    this.infoTerkiniPagination.per_page = 5;

    this.infoTerkiniOffsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.infoTerkiniPagination).subscribe(
      res => {
        Page.renderPagination(this.infoTerkiniPagination, res);
        this.infoTerkiniRows = res.data;
        this.infoTerkiniOnLoad = false;
        this.infoTerkiniLoadingIndicator = false;
      },
      err => {
        this.infoTerkiniOnLoad = false;
      }
    );
  }
  getTerdekat() {
    const page = this.dataService.getFromStorage("banner_terdekat_page");
    const sort_type = this.dataService.getFromStorage("banner_terdekat_sort_type");
    const sort = this.dataService.getFromStorage("banner_terdekat_sort");

    this.terdekatPagination.page = page;
    this.terdekatPagination.sort_type = sort_type;
    this.terdekatPagination.sort = sort;
    this.terdekatPagination.type_banner = this.TYPE_BANNER.TERDEKAT;
    this.terdekatPagination.per_page = 5;

    this.terdekatOffsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.terdekatPagination).subscribe(
      res => {
        Page.renderPagination(this.terdekatPagination, res);
        this.terdekatRows = res.data;
        this.terdekatOnLoad = false;
        this.terdekatLoadingIndicator = false;
      },
      err => {
        this.terdekatOnLoad = false;
      }
    );
  }
  getInfoSRC() {
    const page = this.dataService.getFromStorage("banner_info_src_page");
    const sort_type = this.dataService.getFromStorage("banner_info_src_sort_type");
    const sort = this.dataService.getFromStorage("banner_info_src_sort");

    this.infoSRCPagination.page = page;
    this.infoSRCPagination.sort_type = sort_type;
    this.infoSRCPagination.sort = sort;
    this.infoSRCPagination.type_banner = this.TYPE_BANNER.INFO_SRC;
    this.infoSRCPagination.per_page = 5;

    this.infoSRCOffsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.infoSRCPagination).subscribe(
      res => {
        Page.renderPagination(this.infoSRCPagination, res);
        this.infoSRCRows = res.data;
        this.infoSRCOnLoad = false;
        this.infoSRCLoadingIndicator = false;
      },
      err => {
        this.infoSRCOnLoad = false;
      }
    );
  }
  getFbtn() {
    const page = this.dataService.getFromStorage("banner_fbtn_page");
    const sort_type = this.dataService.getFromStorage("banner_fbtn_sort_type");
    const sort = this.dataService.getFromStorage("banner_fbtn_sort");

    this.fbtnPagination.page = page;
    this.fbtnPagination.sort_type = sort_type;
    this.fbtnPagination.sort = sort;
    this.fbtnPagination.type_banner = this.TYPE_BANNER.FBTN;
    this.fbtnPagination.per_page = 5;

    this.fbtnOffsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.fbtnPagination).subscribe(
      res => {
        Page.renderPagination(this.fbtnPagination, res);
        this.fbtnRows = res.data;
        this.fbtnOnLoad = false;
        this.fbtnLoadingIndicator = false;
      },
      err => {
        this.fbtnOnLoad = false;
      }
    );
  }
  getAktivasiKonsumen() {
    const page = this.dataService.getFromStorage("banner_aktivasi_konsumen_page");
    const sort_type = this.dataService.getFromStorage("banner_aktivasi_konsumen_sort_type");
    const sort = this.dataService.getFromStorage("banner_aktivasi_konsumen_sort");

    this.aktivasiKonsumenPagination.page = page;
    this.aktivasiKonsumenPagination.sort_type = sort_type;
    this.aktivasiKonsumenPagination.sort = sort;
    this.aktivasiKonsumenPagination.type_banner = this.TYPE_BANNER.AKTIVASI_KONSUMEN;
    this.aktivasiKonsumenPagination.per_page = 5;

    this.aktivasiKonsumenOffsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.aktivasiKonsumenPagination).subscribe(
      res => {
        Page.renderPagination(this.aktivasiKonsumenPagination, res);
        this.aktivasiKonsumenRows = res.data;
        this.aktivasiKonsumenOnLoad = false;
        this.aktivasiKonsumenLoadingIndicator = false;
      },
      err => {
        this.aktivasiKonsumenOnLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

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

    this.bannerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }
  setPageInfoTerkini(pageInfo) {
    this.infoTerkiniOffsetPagination = pageInfo.offset;      
    this.infoTerkiniLoadingIndicator = true;

    if (this.infoTerkiniPagination['search']) {
      this.infoTerkiniPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("banner_info_terkini_page", pageInfo.offset + 1);
      this.infoTerkiniPagination.page = this.dataService.getFromStorage("banner_info_terkini_page");
    }

    this.bannerService.get(this.infoTerkiniPagination).subscribe(res => {
      Page.renderPagination(this.infoTerkiniPagination, res);
      this.infoTerkiniRows = res.data;

      this.infoTerkiniLoadingIndicator = false;
    });
  }


  setPageTicker(pageInfo) {
    this.tickerOffsetPagination = pageInfo.offset;      
    this.tickerLoadingIndicator = true;

    if (this.tickerPagination['search']) {
      this.tickerPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("banner_ticker_page", pageInfo.offset + 1);
      this.tickerPagination.page = this.dataService.getFromStorage("banner_ticker_page");
    }

    this.bannerService.get(this.tickerPagination).subscribe(res => {
      Page.renderPagination(this.tickerPagination, res);
      this.tickerRows = res.data;

      this.tickerLoadingIndicator = false;
    });
  }

  setPageTerdekat(pageInfo) {
    this.terdekatOffsetPagination = pageInfo.offset;      
    this.terdekatLoadingIndicator = true;

    if (this.terdekatPagination['search']) {
      this.terdekatPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("banner_terdekat_page", pageInfo.offset + 1);
      this.terdekatPagination.page = this.dataService.getFromStorage("banner_terdekat_page");
    }

    this.bannerService.get(this.terdekatPagination).subscribe(res => {
      Page.renderPagination(this.terdekatPagination, res);
      this.terdekatRows = res.data;

      this.terdekatLoadingIndicator = false;
    });
  }
  setPageInfoSRC(pageInfo) {
    this.infoSRCOffsetPagination = pageInfo.offset;      
    this.infoSRCLoadingIndicator = true;

    if (this.infoSRCPagination['search']) {
      this.infoSRCPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("banner_info_src_page", pageInfo.offset + 1);
      this.infoSRCPagination.page = this.dataService.getFromStorage("banner_info_src_page");
    }

    this.bannerService.get(this.infoSRCPagination).subscribe(res => {
      Page.renderPagination(this.infoSRCPagination, res);
      this.infoSRCRows = res.data;

      this.infoSRCLoadingIndicator = false;
    });
  }
  setPageFbtn(pageInfo) {
    this.fbtnOffsetPagination = pageInfo.offset;      
    this.fbtnLoadingIndicator = true;

    if (this.fbtnPagination['search']) {
      this.fbtnPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("banner_fbtn_page", pageInfo.offset + 1);
      this.fbtnPagination.page = this.dataService.getFromStorage("banner_fbtn_page");
    }

    this.bannerService.get(this.fbtnPagination).subscribe(res => {
      Page.renderPagination(this.fbtnPagination, res);
      this.fbtnRows = res.data;

      this.fbtnLoadingIndicator = false;
    });
  }

  setPageAktivasiKonsumen(pageInfo) {
    this.aktivasiKonsumenOffsetPagination = pageInfo.offset;      
    this.aktivasiKonsumenLoadingIndicator = true;

    if (this.aktivasiKonsumenPagination['search']) {
      this.aktivasiKonsumenPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("banner_aktivasi_konsumen_page", pageInfo.offset + 1);
      this.aktivasiKonsumenPagination.page = this.dataService.getFromStorage("banner_aktivasi_konsumen_page");
    }

    this.bannerService.get(this.aktivasiKonsumenPagination).subscribe(res => {
      Page.renderPagination(this.aktivasiKonsumenPagination, res);
      this.aktivasiKonsumenRows = res.data;

      this.aktivasiKonsumenLoadingIndicator = false;
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

    this.bannerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }
  onSortInfoTerkini(event) {
    this.infoTerkiniPagination.sort = event.column.prop;
    this.infoTerkiniPagination.sort_type = event.newValue;
    this.infoTerkiniPagination.page = 1;
    this.infoTerkiniLoadingIndicator = true;

    this.dataService.setToStorage("banner_info_terkini_page", this.infoTerkiniPagination.page);
    this.dataService.setToStorage("banner_info_terkini_sort_type", event.column.prop);
    this.dataService.setToStorage("banner_info_terkini_sort", event.newValue);

    this.bannerService.get(this.infoTerkiniPagination).subscribe(res => {
      Page.renderPagination(this.infoTerkiniPagination, res);
      this.infoTerkiniRows = res.data;

      this.infoTerkiniLoadingIndicator = false;
    });
  }

  onSortTicker(event) {
    this.tickerPagination.sort = event.column.prop;
    this.tickerPagination.sort_type = event.newValue;
    this.tickerPagination.page = 1;
    this.tickerLoadingIndicator = true;

    this.dataService.setToStorage("banner_ticker_page", this.tickerPagination.page);
    this.dataService.setToStorage("banner_ticker_sort_type", event.column.prop);
    this.dataService.setToStorage("banner_ticker_sort", event.newValue);

    this.bannerService.get(this.tickerPagination).subscribe(res => {
      Page.renderPagination(this.tickerPagination, res);
      this.tickerRows = res.data;

      this.tickerLoadingIndicator = false;
    });
  }

  onSortTerdekat(event) {
    this.terdekatPagination.sort = event.column.prop;
    this.terdekatPagination.sort_type = event.newValue;
    this.terdekatPagination.page = 1;
    this.terdekatLoadingIndicator = true;

    this.dataService.setToStorage("banner_terdekat_page", this.terdekatPagination.page);
    this.dataService.setToStorage("banner_terdekat_sort_type", event.column.prop);
    this.dataService.setToStorage("banner_terdekat_sort", event.newValue);

    this.bannerService.get(this.terdekatPagination).subscribe(res => {
      Page.renderPagination(this.terdekatPagination, res);
      this.terdekatRows = res.data;

      this.terdekatLoadingIndicator = false;
    });
  }
  onSortInfoSRC(event) {
    this.infoSRCPagination.sort = event.column.prop;
    this.infoSRCPagination.sort_type = event.newValue;
    this.infoSRCPagination.page = 1;
    this.infoSRCLoadingIndicator = true;

    this.dataService.setToStorage("banner_info_src_page", this.infoSRCPagination.page);
    this.dataService.setToStorage("banner_info_src_sort_type", event.column.prop);
    this.dataService.setToStorage("banner_info_src_sort", event.newValue);

    this.bannerService.get(this.infoSRCPagination).subscribe(res => {
      Page.renderPagination(this.infoSRCPagination, res);
      this.infoSRCRows = res.data;

      this.infoSRCLoadingIndicator = false;
    });
  }
  onSortFbtn(event) {
    this.fbtnPagination.sort = event.column.prop;
    this.fbtnPagination.sort_type = event.newValue;
    this.fbtnPagination.page = 1;
    this.fbtnLoadingIndicator = true;

    this.dataService.setToStorage("banner_fbtn_page", this.fbtnPagination.page);
    this.dataService.setToStorage("banner_fbtn_sort_type", event.column.prop);
    this.dataService.setToStorage("banner_fbtn_sort", event.newValue);

    this.bannerService.get(this.fbtnPagination).subscribe(res => {
      Page.renderPagination(this.fbtnPagination, res);
      this.fbtnRows = res.data;

      this.fbtnLoadingIndicator = false;
    });
  }
  onSortAktivasiKonsumen(event) {
    this.aktivasiKonsumenPagination.sort = event.column.prop;
    this.aktivasiKonsumenPagination.sort_type = event.newValue;
    this.aktivasiKonsumenPagination.page = 1;
    this.aktivasiKonsumenLoadingIndicator = true;

    this.dataService.setToStorage("banner_aktivasi_konsumen_page", this.aktivasiKonsumenPagination.page);
    this.dataService.setToStorage("banner_aktivasi_konsumen_sort_type", event.column.prop);
    this.dataService.setToStorage("banner_aktivasi_konsumen_sort", event.newValue);

    this.bannerService.get(this.aktivasiKonsumenPagination).subscribe(res => {
      Page.renderPagination(this.aktivasiKonsumenPagination, res);
      this.aktivasiKonsumenRows = res.data;

      this.aktivasiKonsumenLoadingIndicator = false;
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

    this.bannerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    console.log("PARAMS++++", param)
    this.dataService.setToStorage("detail_banner", param);
    this.router.navigate(["advertisement", "banner", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_banner", param);
    this.router.navigate(["advertisement", "banner", "detail"]);
  }

  deleteSpanduk(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.delete_banner'),
      captionDialog: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.delete_banner_confirm'),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.bannerService.delete({ banner_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getBanner();

        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
      }
    });
  }
  updateFilterInfoTerkini(keyword) {

    this.infoTerkiniLoadingIndicator = true;
    this.infoTerkiniPagination.search = keyword;

    if (keyword) {
      this.infoTerkiniPagination.page = 1;
      this.infoTerkiniOffsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.infoTerkiniPagination.page = page;
      this.infoTerkiniOffsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.infoTerkiniPagination).subscribe(res => {
      Page.renderPagination(this.infoTerkiniPagination, res);
      this.infoTerkiniRows = res.data;
      this.infoTerkiniLoadingIndicator = false;
    });

  }

  updateFilterTicker(keyword) {

    this.tickerLoadingIndicator = true;
    this.tickerPagination.search = keyword;

    if (keyword) {
      this.tickerPagination.page = 1;
      this.tickerOffsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.tickerPagination.page = page;
      this.tickerOffsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.tickerPagination).subscribe(res => {
      Page.renderPagination(this.tickerPagination, res);
      this.tickerRows = res.data;
      this.tickerLoadingIndicator = false;
    });

  }

  updateFilterTerdekat(keyword) {

    this.terdekatLoadingIndicator = true;
    this.terdekatPagination.search = keyword;

    if (keyword) {
      this.terdekatPagination.page = 1;
      this.terdekatOffsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.terdekatPagination.page = page;
      this.terdekatOffsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.terdekatPagination).subscribe(res => {
      Page.renderPagination(this.terdekatPagination, res);
      this.terdekatRows = res.data;
      this.terdekatLoadingIndicator = false;
    });

  }
  updateFilterInfoSRC(keyword) {

    this.infoSRCLoadingIndicator = true;
    this.infoSRCPagination.search = keyword;

    if (keyword) {
      this.infoSRCPagination.page = 1;
      this.infoSRCOffsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.infoSRCPagination.page = page;
      this.infoSRCOffsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.infoSRCPagination).subscribe(res => {
      Page.renderPagination(this.infoSRCPagination, res);
      this.infoSRCRows = res.data;
      this.infoSRCLoadingIndicator = false;
    });

  }
  updateFilterFbtn(keyword) {

    this.fbtnLoadingIndicator = true;
    this.fbtnPagination.search = keyword;

    if (keyword) {
      this.fbtnPagination.page = 1;
      this.fbtnOffsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.fbtnPagination.page = page;
      this.fbtnOffsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.fbtnPagination).subscribe(res => {
      Page.renderPagination(this.fbtnPagination, res);
      this.fbtnRows = res.data;
      this.fbtnLoadingIndicator = false;
    });

  }
  updateFilterAktivasiKonsumen(keyword) {

    this.aktivasiKonsumenLoadingIndicator = true;
    this.aktivasiKonsumenPagination.search = keyword;

    if (keyword) {
      this.aktivasiKonsumenPagination.page = 1;
      this.aktivasiKonsumenOffsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.aktivasiKonsumenPagination.page = page;
      this.aktivasiKonsumenOffsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.aktivasiKonsumenPagination).subscribe(res => {
      Page.renderPagination(this.aktivasiKonsumenPagination, res);
      this.aktivasiKonsumenRows = res.data;
      this.aktivasiKonsumenLoadingIndicator = false;
    });
  }

  onSearch({keyword, searchType}) {
    switch (searchType) {
      case this.TYPE_BANNER.INFO_TERKINI: this.updateFilterInfoTerkini(keyword); break;
      case this.TYPE_BANNER.AKTIVASI_KONSUMEN: this.updateFilterAktivasiKonsumen(keyword); break;
      case this.TYPE_BANNER.TERDEKAT: this.updateFilterTerdekat(keyword); break;
      case this.TYPE_BANNER.INFO_SRC: this.updateFilterInfoSRC(keyword); break;
      case this.TYPE_BANNER.FBTN: this.updateFilterFbtn(keyword); break;
    }
  }
}
