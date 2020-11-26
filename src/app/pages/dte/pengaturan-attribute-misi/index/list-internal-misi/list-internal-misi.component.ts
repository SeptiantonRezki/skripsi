import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { MatDialog, MatDialogRef, VERSION } from "@angular/material";
import { DialogInternalMisiComponent } from "../dialog-internal-misi/dialog-internal-misi.component";
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
import { DialogInternalMisiEditComponent } from '../dialog-internal-misi-edit/dialog-internal-misi-edit.component';

@Component({
  selector: 'app-list-internal-misi',
  templateUrl: './list-internal-misi.component.html',
  styleUrls: ['./list-internal-misi.component.scss']
})
export class ListInternalMisiComponent implements OnInit {

  dialogInternalMisiDialogRef: MatDialogRef<DialogInternalMisiComponent>;
  dialogInternalMisiEditDialogRef: MatDialogRef<DialogInternalMisiEditComponent>;

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
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService
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

  openDialogInternalMisi() {
    this.dialogInternalMisiDialogRef = this.Dialog.open(
      DialogInternalMisiComponent,
      {
        width: "300px",
      }
    );

    this.dialogInternalMisiDialogRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        this.getInternalMisi();
      });
  }

  openDialogInternalMisiEdit(id,name, status) {
    console.log(id + ", " + name);
    this.dialogInternalMisiEditDialogRef = this.Dialog.open(DialogInternalMisiEditComponent, {
      width: "300px",
      data: {id: id, name: name, status: status}
    });

    this.dialogInternalMisiDialogRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        // this.files.push({ name });
        this.getInternalMisi();
      });
  }

  ngOnInit() {
    this.getInternalMisi();
  }

  getInternalMisi() {

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService.getInternalMisi(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getInternalMisi(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getInternalMisi(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getInternalMisi(this.pagination).subscribe(
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

  deleteInternalMisi(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Internal Kategori",
      captionDialog: "Apakah anda yakin untuk menghapus Internal Kategori ini ?",
      confirmCallback: this.confirmDeleteInternalnMisi.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDeleteInternalnMisi() {
    this.pengaturanAttributeMisiService.deleteInternalMisi({ internal_misi_id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.getInternalMisi();

      this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
    });
  }

}
