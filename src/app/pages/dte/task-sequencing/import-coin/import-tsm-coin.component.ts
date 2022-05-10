import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatSelect } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { SequencingService } from 'app/services/dte/sequencing.service';
import { DataService } from 'app/services/data.service';
import { FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { CoinAdjustmentApprovalService } from 'app/services/dte/coin-adjustment-approval.service';
import { takeUntil } from 'rxjs/operators';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './import-tsm-coin.component.html',
  styleUrls: ['./import-tsm-coin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportTsmCoinComponent {
  formNotifikasi: FormGroup;
  textReason: FormControl = new FormControl();
  files: File;
  validComboDrag: boolean;
  show: Boolean;

  uploading: Boolean;
  rows: any[];
  isValid: Boolean = false;

  public filterUserNames: FormControl = new FormControl();
  public filteredUserNames: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void>();

  users: any[] = [];
  pagination: Page = new Page();
  selectedUser: any;
  parentData: any;
  ENABLE_IMPORT_IF = ['done', 'failed'];
  requestingPreview:boolean = false;
  importing: boolean = false;
  loadingIndicator = false;
  previewPagination: Page = new Page();
  offsetPagination: any;
  dataPreview: any;
  requestingImport:boolean = false;

  lastPage: number = 1;
  hasMore: boolean = true;
  currentScrollTop: any;
  @ViewChildren('select_approval') private select_approval: QueryList<any>;

  constructor(
    public dialogRef: MatDialogRef<ImportTsmCoinComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private sequencingService: SequencingService,
    private dataService: DataService,
    private coinAdjustmentApprovalService: CoinAdjustmentApprovalService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.rows = [];
    if (data) {
      this.show = true;
    }
    this.parentData = data;
    if (!this.ENABLE_IMPORT_IF.includes(data.import_coin_status) && data.import_coin_status_type === 'preview') {
      this.requestingPreview = true;
    } else {
      this.getPreview(data);
    }

    if(!this.ENABLE_IMPORT_IF.includes(data.import_coin_status) && data.import_coin_status_type === 'import') {
      
      this.requestingImport = true;

    } else {

      this.requestingImport = false;

    }
  }

  ngOnInit() {
    this.getUserList();
    this.formNotifikasi = this.formBuilder.group({
      approval : this.formBuilder.array([this.formBuilder.group({
        name: ["", Validators.required],
        email: ["", Validators.required]
      })])
    });

    this.filterUserNames.valueChanges
      .debounceTime(1000)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringMission();
      });

    setTimeout(() => {
      document.getElementById("import-coin").getElementsByTagName("input")[0].id = "upload-file-import";
    }, 500);
  }

  getUserList() {
    this.coinAdjustmentApprovalService.approverList({ is_tsm: this.parentData.is_tsm }, this.pagination).subscribe(
      (res) => {
        this.users = res.data;
        this.filteredUserNames.next(this.users.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
  }
  getPreview(data) {
    const page = this.dataService.getFromStorage("import_tsm_coin_preview_page");
    this.previewPagination.page = page;
    this.offsetPagination = page ? (page - 1) : 0;


    const body = {
      task_sequencing_management_id : data.id,
      trade_creator_id : data.trade_creator_id,
      page : this.previewPagination.page,
      per_page : this.previewPagination.per_page,
    };
    
    this.loadingIndicator = true;
    this.sequencingService.getImportPreviewAdjustmentCoin(body).subscribe(res => {
      this.rows = (res.data && res.data.data && res.data.data.data) ? res.data.data.data : [];
      Page.renderPagination(this.previewPagination, res.data.data);
      this.dataPreview = res.data;
      this.isValid = res.data ? res.data.is_valid : false;
      this.loadingIndicator = false;
    }, err => {
      this.loadingIndicator = false;
      this.isValid = false;
    })
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;

    if (this.pagination['search']) {
      this.previewPagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("import_tsm_coin_preview_page", pageInfo.offset + 1);
      this.previewPagination.page = this.dataService.getFromStorage("import_tsm_coin_preview_page");
    }
    this.getPreview(this.parentData);

  }

  filteringMission() {
    if (!this.users) {
      return;
    }
    // get the search keyword
    let search = this.filterUserNames.value;
    this.pagination.per_page = 30;
    this.pagination.page = 1;
    this.pagination.search = search;
    this.coinAdjustmentApprovalService.approverList({ is_tsm: this.parentData.is_tsm }, this.pagination).subscribe(
      (res) => {
        const data = [...this.users, ...res.data];
        const filterArray = data.reduce((accumalator, current) => {
          if (!accumalator.some((item) => item.id === current.id)) {
            accumalator.push(current);
          }
          return accumalator;
        }, []);

        this.users = [...filterArray];

        if (this.pagination.search === "") {
          this.filteredUserNames.next(this.users.slice());
        } else {
          this.filteredUserNames.next(res.data.slice());
        }
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredUserNames.next(
      this.users.filter(item => item.fullname.toLowerCase().indexOf(search ? search.toLowerCase() : search) > -1)
    );
  }

  selectChangeReceiver(e: any, index) {
    let approval = this.formNotifikasi.get('approval') as FormArray;
    let indexUsers = this.users.findIndex(x => x.id === e.value);

    if (indexUsers > -1) {
      const value = approval.at(index).value;
      approval.at(index).setValue({...value, ['email']: this.users[indexUsers]['email']});
    }
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    // if (this.files.name.indexOf(".xlsx") > -1) {
    //   this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
    //   return;
    // }
    if (this.requestingPreview) {
      this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.request_preview_onprogress') });
      return;
    }
    if (this.requestingImport) {
      this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.request_import_onprogress') });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('task_sequencing_management_id', this.parentData.id);
    fd.append('trade_creator_id', this.parentData.trade_creator_id);
    this.dataService.showLoading(true);
    this.sequencingService.previewAdjustmentCoin(fd).subscribe(
      res => {
        this.requestingPreview = true;
        this.dataService.showLoading(false);
        this.addObjectToTable();
      },
      err => {
        this.requestingPreview = false;
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.failed_upload') })
      }
    )
  }

  submit() {
    // if (this.files) {
      if (this.formNotifikasi.invalid) {
        this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.not_set_notification_user') })
        return;
      }
      if (!this.dataPreview) {
        this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.preview_not_available') })
        return;
      }

      const data = {
        titleDialog: this.translate.instant('dte.approval_coin_adjustment.confirmation'),
        captionDialog: this.translate.instant('dte.approval_coin_adjustment.submit_confirmation_message'),
        confirmCallback: () => this.confirmSubmit(),
        htmlContent: true,
        buttonText: [this.ls.locale.global.button.yes_continue, this.ls.locale.global.button.cancel]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    // } else {
    //   this.dialogService.openSnackBar({ message: 'Ukuran file melebihi 2mb' })
    // }
  }

  confirmSubmit() {
    let approval = this.formNotifikasi.get('approval') as FormArray;

    const body = {
      preview_id: this.dataPreview.preview_id,
      preview_task_id: this.dataPreview.preview_task_id,
      reason : this.textReason.value,
      approval_id : approval.value.map(item => item.name),
    }

    this.dataService.showLoading(true);
    this.importing = true;

    this.sequencingService.importCoinMultipleApproval(body).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogRef.close(res);
      this.dialogService.brodcastCloseConfirmation();
      this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.save_success_notification_sent') });
    }, (err) => {
      console.log(err);
      this.dataService.showLoading(false);
    })
  }

  setRedIfDuplicate(item) {
    if (item.flag) return '#C62728';
  }

  selectForm(form?: any){
    setTimeout(() => {
      const selectSearch = document.getElementById('selectSearch'+form);
      let inputTag = selectSearch.querySelectorAll('input');
      for (let index = 0; index < inputTag.length; index++) {
        inputTag[index].id = "search"+form;
      }
      
      let matOption = selectSearch.parentElement.querySelectorAll('mat-option');
      if (matOption) {
        for (let index = 0; index < matOption.length; index++) {
          matOption[index].id = 'listUserPenerima';
        }
      }
    }, 500);
  }

  addObjectToTable(){
    document.querySelector("datatable-body").id = "datatable-body";
    const namaKolom = ['GTP','NamaProgram','NamaAudience','NamaRetailer','StatusRetailer','CurrentCoinTotal'];
    
    let rows = document.querySelectorAll("datatable-row-wrapper");
    for (let index = 0; index < rows.length; index++) {
      rows[index].id = 'data-row';

      let cells = rows[index].querySelectorAll("datatable-body-cell");
      for (let indexCell = 0; indexCell < cells.length; indexCell++) {
        cells[indexCell].id = 'data-cell'+(namaKolom[indexCell] ? '-'+namaKolom[indexCell] : '');
      }
    }
  }

  addApproval(index){
    let approval = this.formNotifikasi.get('approval') as FormArray;

    approval.insert((index + 1), this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", Validators.required]
    }));
  }

  removeApproval(index){
    let approval = this.formNotifikasi.get('approval') as FormArray;
    approval.removeAt(index);
  }

  isApprovalUsed(id){
    let approval = this.formNotifikasi.get('approval') as FormArray;
    let value = false;
    approval.value.forEach(item => {
      if (item.name === id) {
        value = true;
      }
    });

    return value;
  }

  triggerEvent(event){
    if (!event) {
      this.filteringMission();
    }
  }

  onOpenedChange(event: any, select: string, index: number) {
    if (event && this.hasMore) {
      const selected = this.select_approval.filter((item, idx) => idx === index);
      
      selected[0].panel.nativeElement.addEventListener('scroll', (event: any) => {
        const {scrollTop} = selected[0].panel.nativeElement;

        if (scrollTop === 0) {
          if (this.currentScrollTop > 200) {
            selected[0].panel.nativeElement.scrollTop = this.currentScrollTop;
          }
        }
        this.currentScrollTop = selected[0].panel.nativeElement.scrollTop;

        if (
          selected[0].panel.nativeElement.scrollTop ===
          selected[0].panel.nativeElement.scrollHeight -
            selected[0].panel.nativeElement.offsetHeight
        ) {
          this.lastPage += 1;
          this.pagination.page = this.lastPage;

          this.coinAdjustmentApprovalService.approverList({ is_tsm: this.parentData.is_tsm }, this.pagination).subscribe(
            (res) => {
              if (res.data && res.data.length) {
                const data = [...this.users, ...res.data];
                const filterArray = data.reduce((accumalator, current) => {
                  if (!accumalator.some((item) => item.id === current.id)) {
                    accumalator.push(current);
                  }
                  return accumalator;
                }, []);
        
                this.users = [...filterArray];
                this.filteredUserNames.next(this.users.slice());
              } else {
                this.lastPage -= 1;
                this.hasMore = false;
              }
            },
            (err) => {
              console.log("err ", err);
            }
          );
        }
      });
    }
  }
}