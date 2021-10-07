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
    if (this.files.name.indexOf(".xlsx") > -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.sequencingService.previewAdjustmentCoin(fd).subscribe(
      res => {
        this.rows = res.data ? res.data.data : [];
        this.isValid = res.data ? res.data.is_valid : false;
        this.dataService.showLoading(false);
      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
      }
    )
  }

  submit() {
    if (this.files) {
      if (this.formNotifikasi.invalid) {
        this.dialogService.openSnackBar({ message: "User Notifikasi Belum Di set!" })
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
    } else {
      this.dialogService.openSnackBar({ message: 'Ukuran file melebihi 2mb' })
    }
  }

  confirmSubmit() {
    const res = {
      coins: this.rows,
      reason: this.textReason.value,
      user_id: this.formNotifikasi.get('name').value
    };

    this.dataService.showLoading(true);
    this.sequencingService.importAdjustmentCoin(res).subscribe(res => {
      this.coinAdjustmentApprovalService.sendNotification({ id: res.data.id, user_id: res.data.responded_by }, { is_tsm: true }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogRef.close(res);
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Berhasil menyimpan data dan mengirimkan Notifikasi!" });
      }, err => {
        this.dataService.showLoading(false);
      });
    })
  }

  setRedIfDuplicate(item) {
    if (item.flag) return '#C62728';
  }

}