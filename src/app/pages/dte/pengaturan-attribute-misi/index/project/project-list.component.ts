import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { MatDialog, MatDialogRef, VERSION } from "@angular/material";
import { DialogTipeMisiComponent } from "../dialog-tipe-misi/dialog-tipe-misi.component";
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
import {DialogCreateComponent} from '../dialog-create/dialog-create.component';
import {DialogEditComponent} from '../dialog-edit/dialog-edit.component';
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";


@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html"
})
export class ProjectListComponent implements OnInit {
  dialogCreateRef: MatDialogRef<DialogCreateComponent>;
  dialogEditRef: MatDialogRef<DialogEditComponent>;


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

   openDialogProjectMisi() {
    const dataProps = {
      data: {
        title: this.translate.instant('dte.template_tugas.mission_project'),
        methodGet: 'getProject',
        methodCreate: 'createProjectMisi',
     },
     width: "300px"
    }

    this.dialogCreateRef = this.Dialog.open(DialogCreateComponent, dataProps);

    this.dialogCreateRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        // this.types.push({ name });
        this.ngOnInit();
      });
  }
  openDialogProjectMisiEdit(id, name, status) {
    const dataProps = {
      data: {
        title: this.translate.instant('dte.template_tugas.mission_project'),
        methodPut: 'putProjectMisi',
        paramsId: 'project_misi_id',
        id: id,
        name: name,
        status: status
     },
     width: "300px"
    }

    this.dialogEditRef = this.Dialog.open(DialogEditComponent, dataProps);

    this.dialogEditRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        // this.files.push({ name });
        this.ngOnInit();
      });
  }

  ngOnInit() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
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

    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
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

  deleteProjectMisi(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('dte.pengaturan_attribute_misi.delete_project_mission'),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {entity: this.translate.instant('dte.template_tugas.mission_project'), index: ""}),
      confirmCallback: this.confirmDeleteProjectMisi.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDeleteProjectMisi() {
    this.pengaturanAttributeMisiService.deleteProjectMisi({ tipe_project_id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.ngOnInit();

      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
    });
  }

}
