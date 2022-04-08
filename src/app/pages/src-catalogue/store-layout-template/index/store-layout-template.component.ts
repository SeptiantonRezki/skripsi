import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { StoreTemplateLayoutService } from 'app/services/src-catalogue/store-template-layout.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-store-layout-template',
  templateUrl: './store-layout-template.component.html',
  styleUrls: ['./store-layout-template.component.scss']
})
export class StoreLayoutTemplateComponent implements OnInit {
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
    private storeTemplateLayoutService: StoreTemplateLayoutService,
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
    this.getStoreTemplateLayouts();
  }

  getStoreTemplateLayouts() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.loadingIndicator = true;
    this.storeTemplateLayoutService.get(this.pagination).subscribe(
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

    this.storeTemplateLayoutService.get(this.pagination).subscribe(res => {
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

    this.storeTemplateLayoutService.get(this.pagination).subscribe(res => {
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

    this.storeTemplateLayoutService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  deleteUser(id): void {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('store_layout_template.delete'),
      captionDialog: this.translate.instant('store_layout_template.delete_confirm'),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.dataService.showLoading(true);
    this.storeTemplateLayoutService.delete({ layout_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
        this.dataService.showLoading(false);
        this.getStoreTemplateLayouts();
      },
      err => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_store_layout", param);
    this.router.navigate(["src-catalogue", "store-layout-template", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_store_layout", param);
    this.router.navigate(["src-catalogue", "store-layout-template", "detail"]);
  }

}
