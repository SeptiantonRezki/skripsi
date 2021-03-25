import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinAdjustmentApprovalService } from 'app/services/dte/coin-adjustment-approval.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-coin-adjustment-dialog',
  templateUrl: './notification-coin-adjustment-dialog.component.html',
  styleUrls: ['./notification-coin-adjustment-dialog.component.scss']
})
export class NotificationCoinAdjustmentDialogComponent implements OnInit {
  formNotifikasi: FormGroup;
  public filterUserNames: FormControl = new FormControl();
  public filteredUserNames: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void>();

  users: any[] = [];
  pagination: Page = new Page();
  selectedUser: any;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NotificationCoinAdjustmentDialogComponent>,
    private coinAdjustmentApprovalService: CoinAdjustmentApprovalService,
    private dialogService: DialogService,
    private dataService: DataService
  ) { }

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
  }

  getUserList() {
    this.coinAdjustmentApprovalService.approverList({ is_tsm: this.data.is_tsm }, this.pagination).subscribe(
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
    // this.coinAdjustmentApprovalService.approverList({ is_tsm: this.data.is_tsm }, this.pagination).subscribe(
    //   (res) => {
    //     console.log("res users", res.data);
    //     this.users = res.data;
    //     this.filteredUserNames.next(this.users.slice());
    //   },
    //   (err) => {
    //     console.log("err ", err);
    //   }
    // );
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

  submit() {
    if (this.formNotifikasi.valid) {
      console.log('selected user', this.selectedUser)
      const data = {
        titleDialog: `Kirim Email Notifikasi`,
        captionDialog: `Anda akan mengirimkan email notifikasi ke <b>${this.selectedUser['fullname'] || 'Tidak Ada user yang terpilih'}</b> ?`,
        confirmCallback: () => this.confirmSubmit(),
        htmlContent: true,
        buttonText: ['Ya, Lanjutkan', 'Batal']
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      this.dialogService.openSnackBar({ message: "Lengkapi Formulir Pengisian Pengiriman Notifikasi" })
    }
  }

  confirmSubmit() {
    this.dataService.showLoading(true);
    this.coinAdjustmentApprovalService.sendNotification({ id: Number(this.data.id), user_id: this.formNotifikasi.get('name').value }, { is_tsm: this.data.is_tsm }).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.brodcastCloseConfirmation();
      this.dialogRef.close();
      this.dialogService.openSnackBar({ message: "Berhasil mengirimkan Notifikasi!" });
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  close() {
    this.dialogRef.close();
  }

}
