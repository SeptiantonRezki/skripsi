import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vendors-index',
  templateUrl: './vendors-index.component.html',
  styleUrls: ['./vendors-index.component.scss']
})
export class VendorsIndexComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private vendorsService: VendorsService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = true;
    this.selected = [];

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
    this.getVendors();
  }

  getVendors() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.loadingIndicator = true;
    this.vendorsService.get(this.pagination).subscribe(
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

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.vendorsService.get(this.pagination).subscribe(res => {
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

    console.log("check pagination", this.pagination);

    this.vendorsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);

    this.vendorsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_vendor", param);
    this.router.navigate(["src-catalogue", "vendors", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_vendor", param);
    this.router.navigate(["src-catalogue", "vendors", "detail"]);
  }


  deleteUser(id): void {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('src_katalog.vendor.delete'),
      captionDialog: this.translate.instant('src_katalog.vendor.delete_confirm'),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.dataService.showLoading(true);
    this.vendorsService.delete({ vendor_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
        this.dataService.showLoading(false);
        this.getVendors();
      },
      err => {
        if (err && err.status === 403) {
          this.dialogService.brodcastCloseConfirmation();
          let data = {
            titleDialog: this.translate.instant('src_katalog.vendor.force_delete'),
            captionDialog: this.translate.instant('src_katalog.vendor.force_delete_confirm'),
            confirmCallback: this.forceDelete.bind(this),
            buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
          };
          this.dialogService.openCustomConfirmationDialog(data);
        }
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  forceDelete() {
    this.dataService.showLoading(true);
    this.vendorsService.forceDelete({ vendor_id: this.id }, { force_delete: 1 }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
        this.dataService.showLoading(false);
        this.getVendors();
      },
      err => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

}
