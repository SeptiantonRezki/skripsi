import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { SequencingService } from 'app/services/dte/sequencing.service';
import { DataService } from 'app/services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { CoinAdjustmentApprovalService } from 'app/services/dte/coin-adjustment-approval.service';
import { takeUntil } from 'rxjs/operators';

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

  constructor(
    public dialogRef: MatDialogRef<ImportTsmCoinComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private sequencingService: SequencingService,
    private dataService: DataService,
    private coinAdjustmentApprovalService: CoinAdjustmentApprovalService,
    private formBuilder: FormBuilder
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
      name: ["", Validators.required],
      email: ["", Validators.required]
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
    this.pagination.search = search;
    this.coinAdjustmentApprovalService.approverList({ is_tsm: this.parentData.is_tsm }, this.pagination).subscribe(
      (res) => {
        console.log("res users", res.data);
        this.users = res.data;
        this.filteredUserNames.next(this.users.slice());
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

  selectChangeReceiver(e: any) {
    let indexValue = this.users.findIndex(x => x.id === e.value);

    if (indexValue > -1) {
      this.formNotifikasi.get('email').setValue(this.users[indexValue]['email']);
      this.selectedUser = { ...this.users[indexValue] };
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
      this.dialogService.openSnackBar({ message: "Proses Request Preview Masih Berjalan!" });
      return;
    }
    if (this.requestingImport) {
      this.dialogService.openSnackBar({ message: "Proses Request Import Masih Berjalan!" });
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
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
      }
    )
  }

  submit() {
    // if (this.files) {
      if (this.formNotifikasi.invalid) {
        this.dialogService.openSnackBar({ message: "User Notifikasi Belum Di set!" })
        return;
      }
      if (!this.dataPreview) {
        this.dialogService.openSnackBar({ message: "Data Preview Tidak ada!" })
        return;
      }

      const data = {
        titleDialog: `Konfirmasi`,
        captionDialog: `Apakah anda yakin ingin menyimpan data ini (Notifikasi Akan langsung diproses kepada Penerima) ?`,
        confirmCallback: () => this.confirmSubmit(),
        htmlContent: true,
        buttonText: ['Ya, Lanjutkan', 'Batal']
      };
      this.dialogService.openCustomConfirmationDialog(data);
    // } else {
    //   this.dialogService.openSnackBar({ message: 'Ukuran file melebihi 2mb' })
    // }
  }

  confirmSubmit() {
    // const res = {
    //   coins: this.rows,
    //   reason: this.textReason.value,
    //   user_id: this.formNotifikasi.get('name').value
    // };

    const body = {
      preview_id: this.dataPreview.preview_id,
      preview_task_id: this.dataPreview.preview_task_id,
      reason : this.textReason.value,
      approval_id : this.selectedUser.id,
    }

    this.dataService.showLoading(true);
    this.importing = true;

    this.sequencingService.importAdjustmentCoin(body).subscribe(res => {
      // this.coinAdjustmentApprovalService.sendNotification({ id: res.data.id, user_id: res.data.responded_by }, { is_tsm: true }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogRef.close(res);
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Berhasil menyimpan data dan mengirimkan Notifikasi!" });
      // }, err => {
      //   this.dataService.showLoading(false);
      // });
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
}