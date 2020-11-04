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
  import {CallObjModel} from 'app/pages/call-objective/call-objective.model';
  import { CallObjectiveSerive } from '../../../services/call-objective/call-objective.service';
  import { AudienceService } from '../../../services/dte/audience.service';

  @Component({
    selector: 'app-list-call-objective.component',
    templateUrl: './list-call-objective.component.html'
  })
  export class CallObjectiveListComponent implements OnInit {

    callOjbMdl: CallObjModel;
    rows: any[];
    pagination: Page = new Page();
    offsetPagination: any;
    id: any;
    loadingIndicator: Boolean;

    constructor(
        private callObjService: CallObjectiveSerive,
        private dataService: DataService,
        private audienceService: AudienceService,
        private dialogService: DialogService,
        private router: Router,
    ) {
        this.callOjbMdl = new CallObjModel();
        this.rows = [{descriptionObjective: 'NANA', namaObjective: 'SOLO LORD'}];
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

  deleteAObjective(id) {
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
    this.router.navigate(["callobj", "call-objective-list"]);
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
  directEdit(param?: any): void {
    this.rows = [];
    this.dataService.setToStorage('detail_objective', param);
  }
  }
