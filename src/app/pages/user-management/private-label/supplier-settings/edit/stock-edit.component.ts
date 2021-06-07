import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DialogService } from 'app/services/dialog.service';
import { Emitter } from 'app/helper/emitter.helper';
import { PLStockService } from 'app/services/user-management/private-label/stock.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-stock-edit',
  templateUrl: './stock-edit.component.html',
  styleUrls: ['./stock-edit.component.scss']
})
export class StockEditComponent implements OnInit, OnDestroy {
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
  stockData: any;
  stockId: any;
  formStock: FormGroup;
  checkAll: boolean;
  private _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private stockService: PLStockService,
    private dialogService: DialogService,
    private router: Router,
    private emitter: Emitter,
    private dataService: DataService,
  ) {
    this.onLoad = true;
    this.isLoadingSave = false;
    this.stockData = null;
    this.checkAll = false;

    this.activatedRoute.url.subscribe(param => {
      this.isDetail = param[1].path === 'detail' ? true : false;
      this.stockId = param[2].path;
    });

    this.emitter.listenStockDataEmitter
    .pipe(takeUntil(this._onDestroy))
    .subscribe(async(data: any) => {
      if (data.ubah && this.formStock) {
        this.stockData = data.data;
        if (this.stockData.settings && this.stockData.settings.length > 0) {
          const listStock = this.formStock.controls['listStock'] as FormArray;
          while (listStock.length > 0) {
            listStock.removeAt(listStock.length - 1);
            listStock.reset();
          }
          setTimeout(async() => {
            let i = 0;
            await this.stockData.settings.forEach((element: any, index: any) => {
              if (index < 7) {
                listStock.push(this.formBuilder.group({ name: element.name, value: element.value }));
                if (!this.packsConvertion(element.name)) {
                  if (element.value) {
                    i++;
                  }
                }
              }
            });
            console.log('i', i)
            if (i === 4) { this.checkAll = true;
            } else { this.checkAll = false; }
          }, 1000);
        }
      }
    });

  }

  async ngOnInit() {
    this.formStock = this.formBuilder.group({
      listStock: this.formBuilder.array([])
    });

    this.formStock.controls['listStock'].valueChanges.debounceTime(300).subscribe(res => {
      (res || []).map(async(item: any, index: number) => {
        const fpm = this.formStock.getRawValue();
        let i = 0;
        await fpm.listStock.forEach((element: any) => {
          if (!this.packsConvertion(element.name)) {
            if (element.value) { i++; }
          }
        });
        if (i >= fpm.listStock.length) { this.checkAll = true;
        } else { this.checkAll = false; }
      });
    });

    setTimeout(() => {
      if (!this.stockData) {
        this.router.navigate(['user-management', 'supplier-settings']);
      }
    }, 1000);

  }

  selectionAll(event) {
    console.log('event', event.checked);
    const checked = event.checked;
    const listStock = this.formStock.controls['listStock'] as FormArray;
    // while (listStock.length > 0 && listStock.length < 4) {
    //   listStock.removeAt(listStock.length - 4);
    // }
    this.stockData.settings.forEach((element: any, index: number) => {
      if (!this.packsConvertion(element.name)) {
        // listStock.push(this.formBuilder.group({ name: element.name, value: checked }));
        listStock.at(index).setValue({ name: element.name, value: checked });
      }
    });
  }

  async onSave() {
    const body = new FormData();
    const fpm = this.formStock.getRawValue();
    await fpm.listStock.forEach((item: any, index: number) => {
      body.append(`settings[${index}][name]`, item.name);
      if (!this.packsConvertion(item.name)) {
        body.append(`settings[${index}][value]`, item.value ? '1' : '0' );
      } else {
        body.append(`settings[${index}][value]`, item.value ? item.value : 0 );
      }
    });

    this.dataService.showLoading(true);
    this.stockService.update(body, { id: this.stockId }).subscribe(res => {
      this.dialogService.openSnackBar({
        message: 'Berhasil Menyimpan Data'
      });
      this.router.navigate(['user-management', 'supplier-settings']);
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

  packsConvertion = (name: String) => {
    if (name === 'packs_per_box' ||
        name === 'packs_per_bale' ||
        name === 'packs_per_slop') {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

}
