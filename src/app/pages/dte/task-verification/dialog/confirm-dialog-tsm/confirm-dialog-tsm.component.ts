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
import { TranslateService } from '@ngx-translate/core';

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
  listConfirm: any[] = [{ name: this.translate.instant('dte.task_verification.do_approve'), value: 'setuju' }, { name: this.translate.instant('dte.task_verification.do_reject'), value: 'tolak' }];
  listReason: any[] = [{ name: this.translate.instant('dte.task_verification.reason_index', {index: 1}), value: 'alasan1' }, { name: this.translate.instant('dte.task_verification.reason_index', {index: 2}), value: 'alasan2' }];
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
    private translate: TranslateService,
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
        if (value === 'tolak') {
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

  async getListReasonTsm() {
    if (this.data.popupType === 'Verification All TSM Mission') {
      this.onLoad = true;
      this.dataService.showLoading(true);
      this.jumlahMisi = this.data.task_need_verify;
      
      this.taskVerificationService.listReasonTsm({ template_id: this.data.task_sequencing_management_template_id }).subscribe(res => {
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

      let body = {
        task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
        task_sequencing_management_id: this.data.task_sequencing_management_id,
        retailer_id: this.data.retailer_id,
      };

      if (this.data.submission_id) {
        body['submission_id'] = this.data.submission_id;
      }

      await this.taskVerificationService.submissionTsm(body).subscribe(async res => {
        this.onLoad = false;
        this.dataService.showLoading(false);
        const dataSubmission_ = res;
        this.listReason = res.data && res.data.rejected_reason_choices ? res.data.rejected_reason_choices.map(choice => ({
          name: choice,
          value: choice
        })) : [];
        if (dataSubmission_.data.image) {
          if (dataSubmission_.data.image.indexOf('http') < 0) {
            dataSubmission_.data.image = 'https://d1fcivyo6xvcac.cloudfront.net/' + dataSubmission_.data.image;
          }
        }

        if (dataSubmission_.data && dataSubmission_.data.submissions && dataSubmission_.data.submissions.length > 0) {
          dataSubmission_.data.submissions = await dataSubmission_.data.submissions.map((item: any) => {
            if (item.type === 'stock_check_ir') {
              try {
                item.stock_check_ir_list = JSON.parse(item.stock_check_ir_list);
              } catch (ex) {
                console.log('error - stock_check_ir', ex);
              }
            }
            return item;
          });
        }

        if (dataSubmission_.data && dataSubmission_.data.ir_verification) {
          try {
            dataSubmission_.data.ir_verification = JSON.parse(dataSubmission_.data.ir_verification);
          } catch (ex) {
            dataSubmission_.data.ir_verification = dataSubmission_.data.ir_verification;
          }
        }

        dataSubmission_.data.submissions.forEach(item => {
          if (item.type === 'radio_numeric' || item.type == 'radio_text' || item.type == 'radio_textarea') {
            const answer = this.isArray(item.answer);

            let newAdditional = [...item.additional];
            if (answer) {
              if (!item.additional.includes(item.answer[0])) {
                newAdditional[newAdditional.length - 1] = item.answer[0];
                item.additional = newAdditional;
              } else {
                const newLastAdditional = newAdditional[newAdditional.length - 1].replace('Lainnya, ', '');
                newAdditional[newAdditional.length - 1] = newLastAdditional;
                item.additional = newAdditional;
              }
            } else {
              newAdditional[newAdditional.length - 1] = item.answer;
              item.additional = newAdditional;
            }
          }
        });

        this.dataSubmission = dataSubmission_;
        console.log('dataSub => ', this.dataSubmission);
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
      alert(this.translate.instant('dte.task_verification.verify_mission_error'));
    });
  }

  releaseCoinOnTsmIndex() {
    this.dataService.showLoading(true);

    let body = {
      task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
      trade_creator_id: this.data.trade_creator_id,
      trade_creator_group_id: this.data.trade_creator_group_id,
    };
    
    this.taskVerificationService.releaseCoinAllTsm(body).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogRef.close('data');
    }, err => {
      this.dataService.showLoading(false);
      alert(this.translate.instant('dte.task_verification.release_coin_error'));
    });
  }

  releaseCoinTsm() {
    this.dataService.showLoading(true);
    console.log('data', this.data);

    let body = {
      task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
      trade_creator_id: this.data.trade_creator_id,
      trade_creator_group_id: this.data.trade_creator_group_id,
      retailer_id: this.data.retailer_id,
      task_sequencing_management_type: this.data.task_sequencing_management_type,
      audience_group_id: this.data.audience_group_id,
    };

    this.taskVerificationService.releaseCoinTsm(body).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogRef.close('data');
    }, err => {
      this.dataService.showLoading(false);
      alert(this.translate.instant('dte.task_verification.release_coin_error'));
    });
  }

  verifikasiMisi(statusConfirm: string) {

    if (statusConfirm === 'setuju') {
      console.log('SETUJU')
      const data = {
        titleDialog: this.translate.instant('dte.task_verification.approve_confirm_message'),
        captionDialog: null,
        confirmCallback: this.confirmVerifikasiMisi.bind(this),
        buttonText: [this.translate.instant('dte.task_verification.do_approve'), this.translate.instant('global.button.cancel')]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      console.log('TOLAK');
      const data = {
        titleDialog: this.translate.instant('dte.task_verification.fill_reject_reason'),
        captionDialog: null,
        confirmCallback: this.confirmVerifikasiMisi.bind(this),
        buttonText: [this.translate.instant('dte.task_verification.do_reject'), this.translate.instant('global.button.cancel')],
        isDisagree: true,
        listRadio: this.listReason
      };
      this.dialogService.openCustomConfirmationDialog(data);
    }
  }

  confirmVerifikasiMisi(reason: string) {
    let body = {
      task_sequencing_management_template_id: this.data.task_sequencing_management_template_id,
      retailer_id: this.data.retailer_id,
    };

    if (reason) {
      body['verification'] = 'rejected';
      body['reason'] = reason;
    } else {
      body['verification'] = 'approved';
      body['reason'] = null;
    }

    if (this.data.submission_id) {
      body['submission_id'] = this.data.submission_id;
    }

    if (reason) {
      console.log('TOLAK')
      this.dataService.showLoading(true);
      this.taskVerificationService.verificationTsm(body).subscribe(res => {
        // this.dataService.showLoading(false);
        this.dialogService.closeModalEmitter.emit(true);
        this.dialogRef.close('data');
      }, err => {
        this.dataService.showLoading(false);
      });
    } else {
      console.log('SETUJU');
      this.dataService.showLoading(true);
      this.taskVerificationService.verificationTsm(body).subscribe(res => {
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

  isArray(val): boolean { return typeof val === 'object'; }
}
