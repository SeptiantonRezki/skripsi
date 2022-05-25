import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { MatDialog, MatDialogRef, VERSION } from "@angular/material";
import { DialogToolboxComponent } from "../dialog-toolbox/dialog-toolbox.component";
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
import { DialogToolboxEditComponent } from '../dialog-toolbox-edit/dialog-toolbox-edit.component';
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-list-kategori-toolbox',
  templateUrl: './list-kategori-toolbox.component.html',
  styleUrls: ['./list-kategori-toolbox.component.scss']
})
export class ListKategoriToolboxComponent implements OnInit {
  dialogToolboxDialogRef: MatDialogRef<DialogToolboxComponent>;
  dialogToolboxEditDialogRef: MatDialogRef<DialogToolboxEditComponent>;

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

  openDialogToolbox() {
    this.dialogToolboxDialogRef = this.Dialog.open(DialogToolboxComponent, {
      width: "300px",
    });

    this.dialogToolboxDialogRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        this.files.push({ name });
        this.getToolbox();
      });
  }

  openDialogToolboxEdit(id,name,status) {
    console.log(id + ", " + name + ", " + status);
    this.dialogToolboxEditDialogRef = this.Dialog.open(DialogToolboxEditComponent, {
      width: "300px",
      data: {id: id, name: name, status: status}
    });

    this.dialogToolboxEditDialogRef
      .afterClosed()
      .pipe(filter((id) => id))
      .subscribe((id) => {
        // this.files.push({ id });
        this.getToolbox();
      });
  }

  ngOnInit() {
    this.getToolbox();
  }

  getToolbox() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService.getToolbox(this.pagination).subscribe(
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
      },
      () => {
        setTimeout(() => {
          this.addObjectToTable();
        }, 1000);
      }
    );
  }

  addObjectToTable(){
    const toolbox = document.getElementById('table-toolbox');
    toolbox.querySelector("datatable-body").id = "datatable-body";

    let rows = toolbox.querySelectorAll("datatable-row-wrapper");
    for (let index = 0; index < rows.length; index++) {
      rows[index].id = 'data-row';

      let cells = rows[index].querySelectorAll("datatable-body-cell");
      for (let indexCell = 0; indexCell < cells.length; indexCell++) {
        cells[indexCell].id = 'data-cell';
      }
    }
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

    this.pengaturanAttributeMisiService.getToolbox(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getToolbox(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getToolbox(this.pagination).subscribe(
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

  deleteKategoriToolbox(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant("global.label.delete_entity", {entity: this.translate.instant('dte.pengaturan_attribute_misi.text2') }),
      captionDialog: this.translate.instant("global.messages.delete_confirm", {entity: this.translate.instant('dte.pengaturan_attribute_misi.text2'), index: "" }),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.pengaturanAttributeMisiService.deleteToolbox({ kategori_toolbox_id: this.id }).subscribe(res => {
      // if (res.status) {
      //   this.dialogService.brodcastCloseConfirmation();
      //   this.getToolbox();

      //   this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      // }
      this.dialogService.brodcastCloseConfirmation();
      this.getToolbox();

      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
    });
  }

}
