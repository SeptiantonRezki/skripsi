import {
    Component,
    OnInit,
    HostListener,
    ViewChild,
    ElementRef,
  } from "@angular/core";
  import { formatCurrency } from "@angular/common";
  import {
    FormGroup,
    FormBuilder,
    Validators,
    FormArray,
    FormControl,
  } from "@angular/forms";
  import { Router, ActivatedRoute } from "@angular/router";
  import { DataService } from '../../../services/data.service';
  import { DialogService } from "../../../services/dialog.service";
  import { Subject, Observable, ReplaySubject } from "rxjs";
  import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
  import { takeUntil } from "rxjs/operators";
  import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
  import { commonFormValidator } from "../../../classes/commonFormValidator";
  import { Page } from "../../../classes/laravel-pagination";
  import * as _ from "underscore";
  import { environment } from "environments/environment";
  import { IdbService } from "app/services/idb.service";
  import {NotesRetailerModel} from 'app/pages/notes-retailer/notes-retailer.model';
  import { NotesRetailerService } from '../../../services/notes-retailer/notes-retailer.service';
  import { AudienceService } from '../../../services/dte/audience.service';

  @Component({
    selector: 'app-list-notes-retailer.component',
    templateUrl: './list-notes-retailer.component.html'
  })
  export class NotesRetailerListComponent implements OnInit {

    notesMdl: NotesRetailerModel;
    rows: any[];
    pagination: Page = new Page();
    offsetPagination: any;
    id: any;
    loadingIndicator: Boolean;
    keyUp = new Subject<string>();

    constructor(
        private callObjService: NotesRetailerService,
        private dataService: DataService,
        private audienceService: AudienceService,
        private dialogService: DialogService,
        private router: Router,
    ) {
        this.notesMdl = new NotesRetailerModel();

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
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.callObjService.getList(this.pagination).subscribe((res) => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
    });
    }

  deleteNotes(id) {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    this.id = id;
    let data = {
      titleDialog: "Hapus Objective",
      captionDialog: "Apakah anda yakin untuk menghapus Objective ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
    this.dataService.showLoading(false);
    this.loadingIndicator = false;
    this.router.navigate(["notesretailer", "notes-retailer-list"]);
  }

  confirmDelete(id) {
    this.callObjService.delete({ objective_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        // this.getAudience();
        this.ngOnInit();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
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

    this.callObjService.getList(this.pagination).subscribe(res => {
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

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.callObjService.getList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }
  directEdit(param?: any): void {
    this.rows = [];
    this.dataService.setToStorage('detail_notes', param);
  }
  }
