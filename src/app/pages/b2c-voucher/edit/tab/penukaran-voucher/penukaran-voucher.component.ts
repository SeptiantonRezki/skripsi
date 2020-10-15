import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
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

@Component({
  selector: 'app-penukaran-voucher',
  templateUrl: './penukaran-voucher.component.html',
  styleUrls: ['./penukaran-voucher.component.scss']
})
export class PenukaranVoucherComponent implements OnInit {
  onLoad: boolean;
  isDetail: boolean;
  detailVoucher: any;
  minDate: any = new Date();

  isVoucherAutomation: FormControl = new FormControl(false);
  formPenukaranVoucher: FormGroup;

  nominalList: any[];

  _data: any = null;
  @Input()
  set data(data: any) {
    this.detailVoucher = data;
    this._data = data;
  }
  get data(): any { return this._data; }

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
    this.nominalList = null;
  }

  ngOnInit() {
    this.formPenukaranVoucher = this.formBuilder.group({
      // coinPerVoucher: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      isVoucherB2B: [false],
      isTransferBank: [false],
      isSaldoPojokBayar: [false],
      transferBankArray: this.formBuilder.array([]),
      saldoPojokBayarArray: this.formBuilder.array([]),
      tambahTransferBank: [null],
      tambahSaldoPojokBayar: [null]
    });

    this.getDetail();
  }

  getNominal(transferBankValue: any, saldoPojokBayarValue: any) {
    this.b2cVoucherService.getNominal().subscribe((res) => {
      console.log('res', res)
      if (res.status === 'success') {
        this.nominalList = res.data;
        this.nominalList.forEach((item) => {
          if (item.type === 'transfer-bank') {
            const transferBank = this.formPenukaranVoucher.controls['transferBankArray'] as FormArray;
            if (transferBankValue && transferBankValue.length > 0) {
              transferBankValue.forEach((nom) => {
                transferBank.push(this.formBuilder.group({ nominal: [nom], isCheck: [true] }));
              });
            } else {
              item.nominal.forEach((nom) => {
                transferBank.push(this.formBuilder.group({ nominal: [nom], isCheck: [false] }));
              });
            }
          }
          if (item.type === 'pojok-bayar') {
            const saldoPojokBayar = this.formPenukaranVoucher.controls['saldoPojokBayarArray'] as FormArray;
            if (saldoPojokBayarValue && saldoPojokBayarValue.length > 0) {
              saldoPojokBayarValue.forEach((nom) => {
                saldoPojokBayar.push(this.formBuilder.group({ nominal: [nom], isCheck: [true] }));
              });
            } else {
              item.nominal.forEach((nom) => {
                saldoPojokBayar.push(this.formBuilder.group({ nominal: [nom], isCheck: [false] }));
              });
            }
          }
        });
      }
    }, (err) => {
      console.log('err', err)
    });
  }

  getDetail() {
    this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    if (this.detailVoucher) {
      this.isVoucherAutomation.setValue(this.detailVoucher.is_reimburse === 1 ? true : false);
      console.log('this.detailVoucher', this.detailVoucher);
        this.formPenukaranVoucher.get('startDate').setValue(this.detailVoucher.reimburse_start_date);
        this.formPenukaranVoucher.get('endDate').setValue(this.detailVoucher.reimburse_end_date);
        this.formPenukaranVoucher.get('isVoucherB2B').setValue(this.detailVoucher.reimburse_is_b2b_voucher === 1 ? true : false);
        this.formPenukaranVoucher.get('isTransferBank').setValue(this.detailVoucher.reimburse_transfer_bank !== null ? this.detailVoucher.reimburse_transfer_bank.length > 0 ? true : false : false);
        this.formPenukaranVoucher.get('isSaldoPojokBayar').setValue(this.detailVoucher.reimburse_pojok_bayar !== null ? this.detailVoucher.reimburse_pojok_bayar.length > 0 ? true : false : false);
      this.getNominal(this.detailVoucher.reimburse_transfer_bank, this.detailVoucher.reimburse_pojok_bayar);
    }
    if (this.isDetail) {
      this.isVoucherAutomation.disable();
      this.formPenukaranVoucher.get('startDate').disable();
      this.formPenukaranVoucher.get('endDate').disable();
      this.formPenukaranVoucher.get('isVoucherB2B').disable();
      this.formPenukaranVoucher.get('isTransferBank').disable();
    }
  }

  addNominal(opsi: string) {
    if (opsi === 'transfer-bank') {
      const transferBank = this.formPenukaranVoucher.controls['transferBankArray'] as FormArray;
      transferBank.push(this.formBuilder.group({ nominal: [this.formPenukaranVoucher.get('tambahTransferBank').value], isCheck: [true] }));
      this.formPenukaranVoucher.get('tambahTransferBank').setValue(null);
    } else { // pojok-bayar
      const saldoPojokBayar = this.formPenukaranVoucher.controls['saldoPojokBayarArray'] as FormArray;
      saldoPojokBayar.push(this.formBuilder.group({ nominal: [this.formPenukaranVoucher.get('tambahSaldoPojokBayar').value], isCheck: [true] }));
      this.formPenukaranVoucher.get('tambahSaldoPojokBayar').setValue(null);
    }
  }

  onUpdate() {
    const transferBank = this.formPenukaranVoucher.controls['transferBankArray'] as FormArray;
    const saldoPojokBayar = this.formPenukaranVoucher.controls['saldoPojokBayarArray'] as FormArray;
    try {
      if (this.formPenukaranVoucher.valid) {
        this.dataService.showLoading(true);
        const transferBankValue = [];
        const saldoPojokBayarValue = [];
        if (this.formPenukaranVoucher.get('isTransferBank').value) {
          transferBank.value.forEach((item: any) => {
            if (item.isCheck) {
              transferBankValue.push(item.nominal);
            }
          });
        }
        if (this.formPenukaranVoucher.get('isSaldoPojokBayar').value) {
          saldoPojokBayar.value.forEach((item: any) => {
            if (item.isCheck) {
              saldoPojokBayarValue.push(item.nominal);
            }
          });
        }
        const body = {
          'is_reimburse': this.isVoucherAutomation.value ? 1 : 0,
          'reimburse_start_date': this.formPenukaranVoucher.get('startDate').value,
          'reimburse_end_date': this.formPenukaranVoucher.get('endDate').value,
          'reimburse_is_b2b_voucher': this.formPenukaranVoucher.get('endDate').value ? 1 : 0,
          'reimburse_transfer_bank': transferBankValue.length > 0 ? transferBankValue : [],
          'reimburse_pojok_bayar': saldoPojokBayarValue.length > 0 ? saldoPojokBayarValue : [],
          'transfer_bank': transferBankValue.length > 0 ? transferBankValue : [],
          'pojok_bayar': saldoPojokBayarValue.length > 0 ? saldoPojokBayarValue : []
        }
        this.b2cVoucherService.updatePenukaranVoucher({ voucher_id: this.detailVoucher.id }, body).subscribe((res) => {
          console.log('res', res);
          this.router.navigate(["b2c-voucher"]);
          this.dataService.showLoading(false);
        }, (err) => {
          console.log('err updatePenukaranVoucher', err);
          this.dataService.showLoading(false);
        });
      } else {
        alert('Lengkapi bagian yang harus diisi!');
        commonFormValidator.validateAllFields(this.formPenukaranVoucher);
      }
    } catch (ex) {
      console.log('ex onUpdate', ex);
      this.dataService.showLoading(false);
    }
  }

}
