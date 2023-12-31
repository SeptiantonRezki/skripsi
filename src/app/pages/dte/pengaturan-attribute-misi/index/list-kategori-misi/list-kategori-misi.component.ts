import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { MatDialog, MatDialogRef, VERSION, MatDialogConfig } from "@angular/material";
import { DialogKategoriMisiComponent } from "../dialog-kategori-misi/dialog-kategori-misi.component";
import { filter } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { DialogKategoriMisiEditComponent } from "../dialog-kategori-misi-edit/dialog-kategori-misi-edit.component";
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-list-kategori-misi',
  templateUrl: './list-kategori-misi.component.html',
  styleUrls: ['./list-kategori-misi.component.scss']
})
export class ListKategoriMisiComponent implements OnInit {

  dialogKategoriMisiDialogRef: MatDialogRef<DialogKategoriMisiComponent>;
  dialogKategoriMisiEditDialogRef: MatDialogRef<DialogKategoriMisiEditComponent>;

  rows: any[];
  selected: any[];
  id: any[];
  name: any[];

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
  pageName = this.translate.instant('dte.pengaturan_attribute_misi.text5');
  titleParam = {entity: this.pageName};

  constructor(
    public Dialog: MatDialog,
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = false; // temporarily set to false to show the dummy table
    this.selected = []

    this.permission = this.roles.getRoles('principal.task_sequencing');
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

  files = [];
  types = [];
  internal = [];
  kategori = [];

  openDialogKategoriMisi() {
    this.dialogKategoriMisiDialogRef = this.Dialog.open(
      DialogKategoriMisiComponent,
      {
        width: "300px",
      }
    );

    this.dialogKategoriMisiDialogRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        // this.kategori.push({ name });
        this.getKategoriMisi();
      });
  }

  openDialogKategoriMisiEdit(id,name,status) {
    console.log(id + ", " + name + ", " + status);

    this.dialogKategoriMisiEditDialogRef = this.Dialog.open(DialogKategoriMisiEditComponent, {
      width: "300px",
      data: {id: id, name: name, status: status}
    });

    this.dialogKategoriMisiEditDialogRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        // this.files.push({ id });
        this.getKategoriMisi();
      });
  }

  ngOnInit() {
    this.getKategoriMisi();
  }

  getKategoriMisi() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService.getKategoriMisi(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        // this.rows = this.dataDummy.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
        console.log(this.rows);
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    console.log(arguments);
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

    this.pengaturanAttributeMisiService.getKategoriMisi(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.pengaturanAttributeMisiService.getKategoriMisi(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
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

    this.pengaturanAttributeMisiService.getKategoriMisi(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  deleteKategoriMisi(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('global.label.delete_entity', {entity: this.pageName}),
      captionDialog: this.translate.instant('global.messages.delete_confirm', { entity: this.pageName, index: "" }),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.pengaturanAttributeMisiService.deleteKategoriMisi({ kategori_misi_id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.getKategoriMisi();

      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
    });
  }

}
