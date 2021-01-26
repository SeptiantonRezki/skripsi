import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";
import { Subject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { BannerService } from "app/services/inapp-marketing/banner.service";
import { PagesName } from "app/classes/pages-name";

@Component({
  selector: "app-banner-index",
  templateUrl: "./banner-index.component.html",
  styleUrls: ["./banner-index.component.scss"]
})
export class BannerIndexComponent {
  
  TYPE_BANNER = {
    DEFAULT: '',
    INFO_TERKINI: 'info-terkini',
    AKTIVASI_KONSUMEN: 'aktivasi-konsumen'
  };

  rows: any[];
  infoTerkiniRows: any[];
  aktivasiKonsumenRows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  infoTerkiniPagination: Page = new Page();
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

  // AKTIVASI KONSUMEN
  aktivasiKonsumenLoadingIndicator = true;
  aktivasiKonsumenOnLoad: boolean;
  aktivasiKonsumenOffsetPagination: any;

  _onSearch = new Subject<any>();

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService
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
    this.getInfoTerkini();
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
  getAktivasiKonsumen() {
    const page = this.dataService.getFromStorage("banner_aktivasi_konsumen_page");
    const sort_type = this.dataService.getFromStorage("banner_aktivasi_konsumen_sort_type");
    const sort = this.dataService.getFromStorage("banner_aktivasi_konsumen_sort");

    this.aktivasiKonsumenPagination.page = page;
    this.aktivasiKonsumenPagination.sort_type = sort_type;
    this.aktivasiKonsumenPagination.sort = sort;
    this.aktivasiKonsumenPagination.type_banner = this.TYPE_BANNER.AKTIVASI_KONSUMEN;
    this.aktivasiKonsumenPagination.per_page = 5;

    this.infoTerkiniOffsetPagination = page ? (page - 1) : 0;

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
      titleDialog: "Hapus Spanduk",
      captionDialog: "Apakah anda yakin untuk menghapus spanduk ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.bannerService.delete({ banner_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getBanner();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
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
    }
  }
}
