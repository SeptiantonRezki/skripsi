import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Page } from "../../../../classes/laravel-pagination";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { FeatureLevelService } from 'app/services/settings/feature-level.service';
import { DataService } from 'app/services/data.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-tingkat-fitur-index',
  templateUrl: './tingkat-fitur-index.component.html',
  styleUrls: ['./tingkat-fitur-index.component.scss']
})
export class TingkatFiturIndexComponent implements OnInit {

  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: any;

  keyUp = new Subject<string>();
  permission: any;
  roles: PagesName = new PagesName();
  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  constructor(
    private featureLevelService: FeatureLevelService,
    private dataService: DataService,
    private dialogService: DialogService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];
    this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.search(data);
      });
      this.permission = this.roles.getRoles('principal.feature_level');
  }

  ngOnInit() {
    this.getList();
  }

  search(query) {

  }
  getList() {
    this.dataService.showLoading(true);
    const page = this.dataService.getFromStorage("feature_level_page");
    const sort_type = this.dataService.getFromStorage("feature_level_sort_type");
    const sort = this.dataService.getFromStorage("feature_level_sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.loadingIndicator = true;
    this.featureLevelService.list(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = [...res.data.data];
      this.onLoad = false;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dialogService.openSnackBar({message: 'Terjadi kesalahan'});
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    })
  }
  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("feature_level_page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("feature_level_page");
    }
    this.getList();
  }
  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("feature_level_page", this.pagination.page);
    this.dataService.setToStorage("feature_level_sort", event.column.prop);
    this.dataService.setToStorage("feature_level_sort_type", event.newValue);
    this.getList();
  }

  _delete(id) {
    this.dataService.showLoading(true);
    this.featureLevelService.delete(id).subscribe(res => {
      
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: 'Data berhasil dihapus' });
      this.dialogService.brodcastCloseConfirmation();
      this.getList();

    }, err => {

      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: 'Data gagal dihapus' });
    })
  }
  confirmDelete(row) {
    const data = {
      titleDialog: 'Hapus Tingkat Fitur',
      captionDialog: `<p>Apakah anda yakin untuk menghapus Tingkat Fitur: <strong>${row.name}</strong>?</p>`,
      confirmCallback: this._delete.bind(this, row.id),
      htmlContent: true,
      buttonText: [this.ls.locale.global.button.yes_continue, this.ls.locale.global.button.cancel]
    };
    this.dialogService.openCustomConfirmationDialog(data);

  }

}
