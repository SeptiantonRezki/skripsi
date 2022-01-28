
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { ConfirmationPublishDialogComponent } from './confirmation-publish-dialog/confirmation-publish-dialog.component';

@Component({
  selector: 'app-preview-voucher',
  templateUrl: './preview-voucher.component.html',
  styleUrls: ['./preview-voucher.component.scss']
})
export class PreviewVoucherComponent implements OnInit {
  onLoad: boolean;
  isDetail: boolean;
  detailVoucher: any;
  confirmationPublishDialogReference: any;

  _data: any = null;
  @Input()
  set data(data: any) {
    this.detailVoucher = data;
    // this._data = data;
  }
  get data(): any { return this._data; }

  // tslint:disable-next-line:no-output-on-prefix
  @Output()
  onRefresh: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2cVoucherService: B2CVoucherService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[0].path === 'detail' ? true : false;
    });
    this.onRefresh = new EventEmitter<any>();
  }

  ngOnInit() {
  }

  getDetail() {
    this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    if (this.detailVoucher) {
    } else {
      setTimeout(() => {
        this.getDetail();
      }, 1000);
    }
  }

  saveAndApproval(msg='') {
    this.updateStatusVoucher('', msg);
  }

  approveReject(str='Approve') {
    if(!this.detailVoucher.action.is_allowed) {
      this.dialogService.openSnackBar({ message: 'Anda tidak dapat melakukan tindakan ini' });
    } else {
      let data = {
        titleDialog: "Ubah Status Voucher",
        captionDialog: `Apakah anda yakin untuk merubah status voucher ini menjadi ${str}?`,
        confirmCallback: str === 'Approve' ? this.approveVoucher.bind(this) : this.rejectVoucher.bind(this),
        buttonText: ["Ya, Lanjutkan", "Batal"]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    };
  }

  approveVoucher() {
    this.updateStatusVoucher('accept', 'approve');
    this.dialogService.brodcastCloseConfirmation();
  }

  rejectVoucher() {
    this.updateStatusVoucher('reject', 'reject');
    this.dialogService.brodcastCloseConfirmation();
  }

  confirmUpdateStatusVoucher() {
    if(!this.detailVoucher.action.is_allowed) {
      this.dialogService.openSnackBar({ message: 'Anda tidak dapat melakukan tindakan ini' });
    } else {
      if (this.detailVoucher) {
        const data = {
          titleDialog: 'Apakah anda yakin untuk melakukan Publish B2C Voucher berikut ?',
          captionDialog: null,
          confirmCallback: this.updateStatusVoucher.bind(this),
          dataSubmit: this.detailVoucher.preview_submit,
          listRadio: this.detailVoucher.preview_submit,
          buttonText: ['Publish', 'Batal']
        };
        this.confirmationPublishDialogReference = this.dialog.open(
          ConfirmationPublishDialogComponent,
          {
            panelClass: 'popup-panel',
            data: data
          }
        );
      };
    };
  }

  updateStatusVoucher(stat='', msg='') {
    this.dataService.showLoading(true);
    const status = this.detailVoucher.status !== 'need_approval' ? this.detailVoucher.action.next_status[0] : stat;
    this.b2cVoucherService.updateStatus({ voucher_id: this.detailVoucher.id }, { status: status }).subscribe((res: any) => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: `${msg || status} berhasil!` });
      this.onRefresh.emit();
      this.confirmationPublishDialogReference.close();
    }, (err: any) => {
      this.dataService.showLoading(false);
      console.warn('err', err);
    });
  }

  dataLimitMap() {
    if (this.detailVoucher) {
      return this.detailVoucher.limit_only_data.map((item) => item.name ).join(', ');
    }
  }

}
