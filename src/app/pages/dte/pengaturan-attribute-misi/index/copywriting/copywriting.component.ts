import { Component, OnInit} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { filter } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { PagesName } from 'app/classes/pages-name';
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { DialogCreateComponent } from '../dialog-create/dialog-create.component';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-copywriting',
  templateUrl: './copywriting.component.html',
  styleUrls: ['./copywriting.component.scss']
})
export class CopywritingComponent implements OnInit {
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
    this.onLoad = false;
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

  openDialog() {     
    const dataProps = {
      data: {
        title: this.translate.instant('dte.template_tugas.copywriting'),
        methodGet: 'getCopywriting',
        methodCreate: 'createCopywriting',
        isColor: true,
      },
      width: "300px"
    }
    this.dialogCreateRef = this.Dialog.open(DialogCreateComponent, dataProps);

    this.dialogCreateRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        this.ngOnInit();
      });
  }

  openDialogEdit(row) {
    const dataProps = {
      data: {
        title: this.translate.instant('dte.template_tugas.copywriting'),
        methodPut: 'putCopywriting',
        paramsId: 'id',
        id: row.id,
        name: row.name,
        color: row.color,
        status: row.status,
      },
      width: "300px"
    }

    this.dialogEditRef = this.Dialog.open(DialogEditComponent, dataProps);

    this.dialogEditRef
      .afterClosed()
      .pipe(filter((name) => name))
      .subscribe((name) => {
        this.ngOnInit();
      });
  }

  ngOnInit() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort") === 'fullname' ? 'name' : this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.getData();
  }

  getData(){
    this.pengaturanAttributeMisiService.getCopywriting(this.pagination).subscribe(
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

    this.getData();
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop === 'name' ? 'fullname' : event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.getData();
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
    
    this.getData();
  }

  delete(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('global.label.delete_entity', { entity: this.translate.instant('dte.template_tugas.copywriting') }),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {entity: this.translate.instant('dte.template_tugas.copywriting'), index: ""}),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.pengaturanAttributeMisiService.deleteCopywriting({ id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.ngOnInit();

      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
    });
  }
}
