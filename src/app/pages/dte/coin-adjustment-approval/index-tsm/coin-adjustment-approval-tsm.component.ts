import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog } from '@angular/material';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinAdjustmentApprovalService } from 'app/services/dte/coin-adjustment-approval.service';
import { IdleService } from 'app/services/idle.service';
import { forkJoin, Observable, ReplaySubject, Subject } from 'rxjs';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-coin-adjustment-approval-tsm',
  templateUrl: './coin-adjustment-approval-tsm.component.html',
  styleUrls: ['./coin-adjustment-approval-tsm.component.scss']
})
export class CoinAdjustmentApprovalTSMComponent implements OnInit, OnDestroy {
  onLoad: boolean;
  loadingIndicator: boolean;

  permissionCoinAdjustment: any;
  roles: PagesName = new PagesName();

  rows: any[];
  keyUp = new Subject<string>();

  table: DatatableComponent;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;

  formFilter: FormGroup;

  minDate: any;

  statusFilter: any[] = [
    { name: this.translate.instant('dte.pengatur_jadwal_program.text2'), value: 'day' },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text3'), value: 'mounth' },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text4'), value: 'year' }
  ];

  listStatuses: any[] = [
    { name: this.translate.instant('dte.pengatur_jadwal_program.text7'), value: "" },
    { name: this.translate.instant('dte.approval_coin_adjustment.approved'), value: 'approved' },
    { name: this.translate.instant('dte.approval_coin_adjustment.rejected'), value: 'rejected' },
    { name: this.translate.instant('dte.approval_coin_adjustment.pending'), value: 'pending' }
  ];

  dialogRef: any;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  requestors: any[] = [];
  approvers: any[] = [];
  formFilterReqApp: FormGroup;
  public filterRequestor: FormControl = new FormControl();
  public filteredRequestor: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterApprover: FormControl = new FormControl();
  public filteredApprover: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void>();
  paginationRequestor: Page = new Page();
  paginationApprover: Page = new Page();

  selected = [];
  owned = {
    name: "",
    show: 1,
  };

  constructor(
    private dialogService: DialogService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userIdle: IdleService,
    private dialog: MatDialog,
    private coinAdjustmentApprovalService: CoinAdjustmentApprovalService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.adapter.setLocale('id');
    this.rows = [];
    this.onLoad = true;
    this.loadingIndicator = true;

    this.permissionCoinAdjustment = this.roles.getRoles('principal.dtecoinadjustmentapproval');

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.getListCoinAdjustmentTSM();

    // Init requestor and approver data for filtering
    this.initFilterRequestorAndApprover().subscribe(res => {
      this.requestors = res[0].data;
      this.filteredRequestor.next(this.requestors.slice());
      this.approvers = res[1].data;
      this.filteredApprover.next(this.approvers.slice());
    }, err => {
      console.log('err', err);
    });

    this.formFilter = this.formBuilder.group({
      filter: 'day',
      start_date: '',
      end_date: '',
      status: '',
    });

    this.formFilterReqApp = this.formBuilder.group({
      requestor_id: [""],
      approver_id: [""]
    });

    this.filterRequestor.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringRequestor();
      });

    this.filterApprover.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringApprover();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filteringRequestor() {
    if (!this.requestors) {
      return;
    }
    // get the search keyword
    let search = this.filterRequestor.value;
    this.paginationRequestor.per_page = 20;
    this.paginationRequestor.search = search;

    this.coinAdjustmentApprovalService.getRequestors({ is_tsm: true }, this.paginationRequestor).subscribe(
      (res) => {
        this.requestors = res.data;
        this.filteredRequestor.next(this.requestors.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredRequestor.next(
      this.requestors.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filteringApprover() {
    if (!this.approvers) {
      return;
    }
    // get the search keyword
    let search = this.filterApprover.value;
    this.paginationApprover.per_page = 20;
    this.paginationApprover.search = search;
    this.coinAdjustmentApprovalService.getApprovers({ is_tsm: true }, this.paginationApprover).subscribe(
      (res) => {
        this.approvers = res.data;
        this.filteredApprover.next(this.approvers.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredApprover.next(
      this.approvers.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  initFilterRequestorAndApprover(): Observable<any[]> {
    this.paginationRequestor.per_page = 5;
    this.paginationApprover.per_page = 5;

    let listRequestors = this.coinAdjustmentApprovalService.getRequestors({ is_tsm: true }, this.paginationRequestor);
    let listApprovers = this.coinAdjustmentApprovalService.getApprovers({ is_tsm: true }, this.paginationApprover);

    return forkJoin([listRequestors, listApprovers]);
  }

  updateFilter(string?) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage('page');
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.pagination['type'] = this.convertDate(this.formFilter.get('start_date').value) ||
      this.convertDate(this.formFilter.get('end_date').value) ? this.formFilter.get('filter').value : '';
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.pagination['status'] = this.formFilter.get('status').value;
    this.pagination['requestor'] = this.formFilterReqApp.get('requestor_id').value;
    this.pagination['approver'] = this.formFilterReqApp.get('approver_id').value;

    const payload = {
      ...this.pagination,
      owned_by_user: 0,
    };

    this.coinAdjustmentApprovalService.getTsm(payload).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.owned.show = 0;
    });
  }

  getListCoinAdjustmentTSM() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    const payload = {
      ...this.pagination,
      owned_by_user: this.owned.show,
    };

    this.coinAdjustmentApprovalService.getTsm(payload).subscribe(
      res => {
        if (res.total < res.per_page && page !== 1) {
          this.dataService.setToStorage('page', 1);
          this.getListCoinAdjustmentTSM();
        } else {
          Page.renderPagination(this.pagination, res);
          this.rows = res.data;
          this.onLoad = false;
          this.loadingIndicator = false;

          this.owned.name = res.data && res.data[0].approver || "";
        }
      }, err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return '';
  }

  setMinDate(e) { }

  export(item) {
    this.dataService.showLoading({ show: true });
    let params = {
      approval_id: item.id,
      is_tsm: true
    }

    this.coinAdjustmentApprovalService.downloadApprovalList(params).subscribe(response => {
      if (response.data && response.status) {
        setTimeout(() => {
          this.downloadLink.nativeElement.href = response.data;
          this.downloadLink.nativeElement.click();
          this.dataService.showLoading(false);
        }, 500);
      }
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    };

    const payload = {
      ...this.pagination,
      owned_by_user: this.owned.show,
    };

    this.coinAdjustmentApprovalService.getTsm(payload).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.selected = [];
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination['type'] = this.formFilter.get('filter').value;
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.coinAdjustmentApprovalService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }
  
  getId(row) {
    return row.id;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);

    const newSelected = selected.filter(item => item.status === 'pending' && item.approver === this.owned.name);
    this.selected.push(...newSelected);
  }

  actionDialog(type): void {
    let caption = "";
    if (type === "Setujui") caption += "menyetujui";
    else caption += "menolak";

    let data = {
      titleDialog: `${type} Coin Adjustment`,
      captionDialog: `Apakah anda yakin untuk ${caption} semua request coin adjustment yang dipilih ?`,
      confirmCallback: (remark) => this.confirmAction(type, remark),
      isRemark: true,
      buttonText: ["Ya, lanjutkan", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmAction(type, reason) {
    const method = type === "Setujui" ? "approveAll" : "rejectAll";
    const payload = {
      ids: this.selected.map(item => item.id),
      reason
    };

    this.coinAdjustmentApprovalService[method](payload).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar(res);

        this.selected.splice(0, this.selected.length);
        this.getListCoinAdjustmentTSM();
      },
      err => {
        console.log('err', err);
      }
    );
  };
}
