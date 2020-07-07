import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { MatDialog, MatDialogRef, VERSION } from "@angular/material";
import { DialogToolboxComponent } from "./dialog-toolbox/dialog-toolbox.component";
import { DialogTipeMisiComponent } from "./dialog-tipe-misi/dialog-tipe-misi.component";
import { DialogKesulitanMisiComponent } from "./dialog-kesulitan-misi/dialog-kesulitan-misi.component";
import { DialogKategoriMisiComponent } from "./dialog-kategori-misi/dialog-kategori-misi.component";
import { filter } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../services/dialog.service";
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { DialogToolboxEditComponent } from './dialog-toolbox-edit/dialog-toolbox-edit.component';

@Component({
  selector: "app-pengaturan-attribute-misi-index",
  templateUrl: "./pengaturan-attribute-misi-index.component.html",
  styleUrls: ["./pengaturan-attribute-misi-index.component.scss"],
})
export class PengaturanAttributeMisiIndexComponent implements OnInit {

  dialogToolboxDialogRef: MatDialogRef<DialogToolboxComponent>;
  dialogTipeMisiDialogRef: MatDialogRef<DialogTipeMisiComponent>;
  dialogKesulitanMisiDialogRef: MatDialogRef<DialogKesulitanMisiComponent>;
  dialogKategoriMisiDialogRef: MatDialogRef<DialogKategoriMisiComponent>;
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
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService
  ) {

  }

  files = [];
  types = [];
  kesulitan = [];
  kategori = [];


  openDialogToolboxEdit(id,name) {
    console.log(id + ", " + name);
    this.dialogToolboxEditDialogRef = this.Dialog.open(DialogToolboxEditComponent, {
      width: "300px",
    });

    this.dialogToolboxEditDialogRef
      .afterClosed()
      .pipe(filter((id) => id))
      .subscribe((id) => {
        this.files.push({ id });
        // this.getToolbox();
      });
  }

  ngOnInit() {
  }

}
