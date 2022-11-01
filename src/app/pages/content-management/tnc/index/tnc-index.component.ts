import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { TncService } from 'app/services/content-management/tnc.service';
import { Router } from '@angular/router';
import { LanguagesService } from 'app/services/languages/languages.service';
import { PagesName } from 'app/classes/pages-name';

@Component({
  selector: 'app-tnc-index',
  templateUrl: './tnc-index.component.html',
  styleUrls: ['./tnc-index.component.scss']
})
export class TncIndexComponent {

  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  roles: PagesName = new PagesName();
  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  permission: {}

  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private tncService: TncService,
    private router: Router,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];
    this.permission = this.roles.getRoles('principal.syaratketentuan');
    console.log(this.permission);
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
    // this._fuseSplashScreenService.show();
    // this.http.get("api/ayo-b2b-user").subscribe((contacts: any) => {
    //   this.rows = contacts;
    //   this.loadingIndicator = false;
    // });
    // setTimeout(() => {
    //     this._fuseSplashScreenService.hide();
    // }, 3000);
    this.getTnc();
  }

  getTnc() {
    this.tncService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        console.log(res.data)
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

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.tncService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.tncService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    this.tncService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    // let navigationExtras: NavigationExtras = {
    //   queryParams: param
    // }
    this.dataService.setToStorage("detail_tnc", param);
    this.router.navigate(['content-management', 'terms-and-condition', 'edit']);
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  deletePage(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Syarat & Ketentuan", // TODO
      captionDialog: "Apakah anda yakin untuk menghapus data syarat & ketentuan ini ?", // TODO
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"] // TODO
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.tncService.delete({ content_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" }); // TODO

        this.getTnc();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

}
