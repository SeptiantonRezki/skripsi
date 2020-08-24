import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogConfig, MatMenuTrigger } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { startWith, map, takeUntil } from 'rxjs/operators';
import { TaskVerificationService } from 'app/services/dte/task-verification.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { environment } from 'environments/environment';
import { Lightbox } from 'ngx-lightbox';

@Component({
  templateUrl: './confirm-dialog-tsm.component.html',
  styleUrls: ['./confirm-dialog-tsm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogTsmComponent implements OnInit {
  environment: any;
  loadingIndicator = true;
  onLoad: boolean;
  verificationConfirm: FormControl = new FormControl();
  reasonConfirm: FormControl = new FormControl();
  listConfirm: any[] = [{ name: 'Setujui', value: 'setuju' }, { name: 'Tolak', value: 'tolak' }];
  listReason: any[] = [{ name: 'Alasan 1', value: 'alasan1' }, { name: 'Alasan 2', value: 'alasan2' }];
  isDisagree: boolean;
  reason: any;
  jumlahMisi: any;
  totalSRC: any;
  indialogRef: any;
  dataSubmission: any;

  private _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogTsmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private taskVerificationService: TaskVerificationService,
    private dataService: DataService,
    private dialogService: DialogService,
    private _lightbox: Lightbox,
  ) {
    this.isDisagree = null;
    this.jumlahMisi = 0;
    this.totalSRC = 0;
    this.reason = null;
    this.dataSubmission = null;
    this.environment = environment;
  }

  ngOnInit() {
    // this.onLoad = true;
    this.verificationConfirm.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        if (value === 'tolak' ) {
          this.isDisagree = true;
        } else {
          this.isDisagree = false;
        }
      });

    this.reasonConfirm.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.reason = value;
      });
    this.getListReasonTsm();
  }

  getListReasonTsm() {
    if (this.data.popupType === 'Verification All TSM Mission') {
      this.onLoad = true;
      this.dataService.showLoading(true);
      this.jumlahMisi = this.data.task_need_verify;
      this.taskVerificationService.listReasonTsm({ template_id : this.data.task_sequencing_management_template_id}).subscribe(res => {
        this.onLoad = false;
        this.dataService.showLoading(false);
        if (res.data.length > 0) {
          this.listReason = [];
          res.data.map((item: any) => {
            this.listReason.push({ name: item, value: item });
          });
        }
      }, err => {
        this.onLoad = false;
        this.dataService.showLoading(false);
      });
    } else if (this.data.popupType === 'Release TSM Coin On Index') {
      // this.onLoad = true;
      // this.dataService.showLoading(true);
      this.totalSRC = this.data.task_need_coin;
      // this.taskVerificationService.totalSRC({ template_id : this.data.scheduler_templates_id}).subscribe(res => {
      //   this.onLoad = false;
      //   this.dataService.showLoading(false);
      //   if (res.data) {
      //   }
      // }, err => {
      //   this.onLoad = false;
      //   this.dataService.showLoading(false);
      // });
    } else if (this.data.popupType === 'Verifikasi Misi TSM') {
      this.onLoad = true;
      this.dataService.showLoading(true);
      this.taskVerificationService.submissionTsm({
        task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
        task_sequencing_management_id: this.data.task_sequencing_management_id,
        retailer_id: this.data.retailer_id,
      }).subscribe(res => {
        this.onLoad = false;
        this.dataService.showLoading(false);
        this.dataSubmission = res;
        if (this.dataSubmission.data.image) {
          if (this.dataSubmission.data.image.indexOf('http') < 0) {
            console.log('ok', this.dataSubmission.data.image.indexOf('http'))
            this.dataSubmission.data.image = 'https://d1fcivyo6xvcac.cloudfront.net/' + this.dataSubmission.data.image;
          }
        }
      }, err => {
        this.onLoad = false;
        this.dataService.showLoading(false);
      });
    }
  }

  // =========== ACTION ============

  saveVerification() {
    this.verificationAllTsmMission();
  }

  saveCoin() {
    this.releaseCoinOnTsmIndex();
  }

  verificationAllTsmMission() {
    if (this.isDisagree == null && !this.reason || this.isDisagree && !this.reason) {
      return;
    }
    this.dataService.showLoading(true);
    this.taskVerificationService.verificationAllTsm({
      task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
      verification: this.isDisagree ? 'rejected' : 'approved',
      reason: this.isDisagree ? this.reason : null,
    }).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogRef.close('data');
    }, err => {
      this.dataService.showLoading(false);
      alert('Terjadi Kesalahan saat verifikasi misi');
    });
  }

  releaseCoinOnTsmIndex() {
    this.dataService.showLoading(true);
    this.taskVerificationService.releaseCoinAllTsm({
      task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
      trade_creator_id: this.data.trade_creator_id,
      trade_creator_group_id: this.data.trade_creator_group_id
    }).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogRef.close('data');
    }, err => {
      this.dataService.showLoading(false);
      alert('Terjadi Kesalahan saat release coin');
    });
  }

  releaseCoinTsm() {
    this.dataService.showLoading(true);
    console.log('data', this.data);
    this.taskVerificationService.releaseCoinTsm({
      task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
      trade_creator_id: this.data.trade_creator_id,
      trade_creator_group_id: this.data.trade_creator_group_id,
      retailer_id: this.data.retailer_id,
    }).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogRef.close('data');
    }, err => {
      this.dataService.showLoading(false);
      alert('Terjadi Kesalahan saat release coin');
    });
  }

  verifikasiMisi(statusConfirm: string) {

    if (statusConfirm === 'setuju') {
      console.log('SETUJU')
      const data = {
        titleDialog: 'Apakah anda yakin untuk menyetujui misi ini?',
        captionDialog: null,
        confirmCallback: this.confirmVerifikasiMisi.bind(this),
        buttonText: ["Setujui", "Batal"]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      console.log('TOLAK');
      const data = {
        titleDialog: 'Silahkan isi alasan penolakan',
        captionDialog: null,
        confirmCallback: this.confirmVerifikasiMisi.bind(this),
        buttonText: ["Tolak", "Batal"],
        isDisagree: true,
        listRadio: this.listReason
      };
      this.dialogService.openCustomConfirmationDialog(data);
    }
  }

  confirmVerifikasiMisi(reason: string) {
    if (reason) {
      console.log('TOLAK')
      this.dataService.showLoading(true);
      this.taskVerificationService.verificationTsm({
        task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
        verification:'rejected',
        reason: reason,
        retailer_id: this.data.retailer_id,
      }).subscribe(res => {
        // this.dataService.showLoading(false);
        this.dialogService.closeModalEmitter.emit(true);
        this.dialogRef.close('data');
      }, err => {
        this.dataService.showLoading(false);
      });
    } else {
      console.log('SETUJU');
      this.dataService.showLoading(true);
      this.taskVerificationService.verificationTsm({
        task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
        verification: 'approved',
        reason: null,
        retailer_id: this.data.retailer_id,
      }).subscribe(res => {
        // this.dataService.showLoading(false);
        this.dialogService.closeModalEmitter.emit(true);
        this.dialogRef.close('data');
      }, err => {
        this.dataService.showLoading(false);
      });
    }
  }

  previewImage(url) {
    const album = {
      src: url,
      caption: '',
      thumb: url
    };

    this._lightbox.open([album], 0);
  }
 
}