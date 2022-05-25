import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { DialogService } from 'app/services/dialog.service';
import { Emitter } from 'app/helper/emitter.helper';
import { PayMethodService } from 'app/services/user-management/private-label/pay-method.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-pay-method-edit',
  templateUrl: './pay-method-edit.component.html',
  styleUrls: ['./pay-method-edit.component.scss']
})
export class PayMethodEditComponent implements OnInit {
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  verticalStepperStep3: FormGroup;

  onLoad: boolean;
  isLoadingSave: boolean;
  isDetail: boolean;

  listRole: Array<any>;
  supplierCompanyList: Array<any>;
  detailUserSupplier: any;
  userSupplierStatusSelected: any;
  userSupplierId: any;
  userSupplierStatusList: any[] = [
    { name: 'Aktif', status: 'active' },
    { name: 'Non-Aktif', status: 'inactive' }
  ];
  payMethodData: any;
  payMethodId: any;
  formPaymentMethod: FormGroup;
  checkAll: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private payMethodService: PayMethodService,
    private dialogService: DialogService,
    private router: Router,
    private emitter: Emitter,
    private dataService: DataService,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.isLoadingSave = false;
    this.payMethodData = null;
    this.checkAll = false;

    this.activatedRoute.url.subscribe(param => {
      console.log('param', param)
      this.isDetail = param[2].path === 'detail' ? true : false;
      this.payMethodId = param[3].path;

    });

  }

  async ngOnInit() {
    this.formPaymentMethod = this.formBuilder.group({
      listPayments: this.formBuilder.array([])
    });

    this.emitter.listenPayMethodDataEmitter.subscribe(async(data: any) => {
      // console.log('emitter', data);
      if (data.ubah) {
        this.payMethodData = data.data;
        // console.log('this.payMethodData', this.payMethodData);
        if (this.payMethodData.payments) {
          const listPayments = this.formPaymentMethod.controls['listPayments'] as FormArray;
          while (listPayments.length > 0) {
            listPayments.removeAt(listPayments.length - 1);
          }
          let i = 0;
          await this.payMethodData.payments.forEach((element: any) => {
            listPayments.push(this.formBuilder.group({ name: element.name, value: element.value }));
            if (element.value) {
              i++;
            }
          });
          // console.log(this.payMethodData.payments.length + ' == ' + i)
          if (i >= this.payMethodData.payments.length) { this.checkAll = true;
          } else {  this.checkAll = false; }
          // console.log('listPayments', listPayments)
        }
      }
    });

    this.formPaymentMethod.controls['listPayments'].valueChanges.debounceTime(300).subscribe(res => {
      (res || []).map(async(item: any, index: number) => {
        const fpm = this.formPaymentMethod.getRawValue();
        let i = 0;
        await fpm.listPayments.forEach((element: any) => {
          if (element.value) { i++; }
        });
        if (i >= fpm.listPayments.length) { this.checkAll = true;
        } else { this.checkAll = false; }
      });
    });

    setTimeout(() => {
      if (!this.payMethodData) {
        this.router.navigate(['user-management', 'supplier-settings']);
      }
    }, 1000);

  }

  selectionAll(event) {
    console.log('event', event.checked);
    const checked = event.checked;
    const listPayments = this.formPaymentMethod.controls['listPayments'] as FormArray;
    while (listPayments.length > 0) {
      listPayments.removeAt(listPayments.length - 1);
    }
    this.payMethodData.payments.forEach((element: any) => {
      listPayments.push(this.formBuilder.group({ name: element.name, value: checked }));
    });
  }

  async onSave() {
    const body = new FormData();
    const fpm = this.formPaymentMethod.getRawValue();
    await fpm.listPayments.forEach((item: any, index: number) => {
      body.append(`payments[${index}][name]`, item.name);
      body.append(`payments[${index}][value]`, item.value ? '1' : '0' );
    });

    this.dataService.showLoading(true);
    this.payMethodService.update(body, { payMethodId: this.payMethodId }).subscribe(res => {
      this.dialogService.openSnackBar({
        message: "Berhasil Menyimpan Data"
      });
      this.router.navigate(["user-management", "supplier-settings"]);
      this.dataService.showLoading(false);
      }, err => {
        console.log('err', err);
        this.dialogService.openSnackBar({
          message: err.error.message
        });
        this.dataService.showLoading(false);
      }
    );

  }

}
