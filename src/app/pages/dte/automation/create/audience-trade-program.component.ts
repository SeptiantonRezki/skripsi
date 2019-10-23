import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent, MatSelect } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { AudienceTradeProgramService } from 'app/services/dte-automation/audience-trade-program.service';
import { takeUntil, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DialogService } from 'app/services/dialog.service';
import { Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-audience-trade-program',
  templateUrl: './audience-trade-program.component.html',
  styleUrls: ['./audience-trade-program.component.scss']
})
export class AudienceTradeProgramComponent implements OnInit, OnDestroy {
  selectedTab: any;
  submitting: Boolean;
  formAutomation: FormGroup;
  listAutomation: any[] = [
    { name: 'E-Order', value: 'e-order' },
    { name: 'Digital Coupon', value: 'coupon' },
    { name: 'Referral Code', value: 'referral_code' }
  ];

  filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  tradePrograms: any[];
  public filterTradeProgram: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  skus: FormArray;

  formSku: FormControl = new FormControl();
  formFilterSku: FormControl = new FormControl();
  searching: Boolean = false;
  public filteredSku: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  litSkus = [];
  @ViewChild('singleSelect') singleSelect: MatSelect;
  coinRewardInvalid: Boolean;

  tradeSelected: any;
  maxDateTradeProgram: any;
  minDateTradeProgram: any;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private audienceTradeProgramService: AudienceTradeProgramService,
    private dialogService: DialogService,
    private router: Router
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.formAutomation = this.formBuilder.group({
      automation: ['e-order', Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      coin_max: [null, Validators.required],
      coin_reward: [null, Validators.required],
      coupon_total: [null],
      trade_program_id: [null, Validators.required],
      title_challenge: ["", Validators.required],
      description_challenge: ["", Validators.required],
      button_text: ["", Validators.required],
      skus: this.formBuilder.array([this.createFormSku()])
    });

    this.audienceTradeProgramService.getTradePrograms().subscribe(res => {
      console.log('res list trade programs', res);
      this.tradePrograms = res.data.slice();
      this.filteredTradeProgram.next((res && res.data) ? res.data.slice() : []);
    });

    this.filterTradeProgram
      .valueChanges
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this._filterTradeProgram();
      });

    // this.formAutomation
    //   .get("coin_max")
    //   .valueChanges
    //   .pipe(
    //     debounceTime(300)
    //   )
    //   .subscribe(data => {
    //     console.log('data', data);
    //     let coinMax = this.formAutomation.get("coin_reward").value;
    //     this.checkCoinReward(data, coinMax);
    //   });

    this.formAutomation
      .get("coin_reward")
      .valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(data => {
        let coinReward = this.formAutomation.get("coin_max").value;
        this.checkCoinReward(coinReward, data);
      });

    this.formFilterSku
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.searching = true),
        switchMap(value => {
          if (value == null || value == "") {
            this.searching = false;
            return [];
          }
          return this.audienceTradeProgramService.getListSku({ search: value })
            .pipe(
              finalize(() => this.searching = false)
            )
        })
      ).subscribe(res => {
        this.filteredSku.next(res.data);
      });

    // this.formAutomation.get('skus')
    //   .valueChanges
    //   .pipe(
    //     debounceTime(300),
    //     tap(() => this.searching = true),
    //     switchMap(value => {
    //       console.log('val', value);
    //       if (value.formSku == null || value.formSku == "") {
    //         this.searching = false;
    //         return [];
    //       }
    //       console.log('after', value);
    //       return this.audienceTradeProgramService.getListSku({ search: value.formSku })
    //         .pipe(
    //           finalize(() => this.searching = false)
    //         )
    //     })
    //   ).subscribe(res => {
    //     this.filteredSku.next(res.data);
    //   });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  createFormSku() {
    const formItem = this.formBuilder.group({
      formSku: [""],
      formFilterSku: [new ReplaySubject<any[]>(1)],
      filteredSku: [new ReplaySubject<any[]>(1)]
    });
    let value = new ReplaySubject<any[]>(1);

    formItem
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.searching = true),
        switchMap(value => {
          console.log('val', value);
          if (value.formFilterSku == null || value.formFilterSku == "") {
            this.searching = false;
            return [];
          }
          console.log('after', value);
          return this.audienceTradeProgramService.getListSku({ search: value.formFilterSku })
            .pipe(
              finalize(() => this.searching = false)
            )
        })
      ).subscribe(res => {
        console.log('res', res, formItem.controls['filteredSku'].value);
        // this.filteredSku.next(res.data);
        formItem.controls['filteredSku'].value.next(res.data);
        // value.next(res.data);
        // this.litSkus.push(value);
        // this.filteredSku.next(this.litSkus);
      });
    return formItem;
  }

  addSkuProduct() {
    this.skus = this.formAutomation.get("skus") as FormArray;
    this.skus.insert(0, this.createFormSku());
  }

  removeSkuProduct(index) {
    this.skus = this.formAutomation.get("skus") as FormArray;
    this.skus.removeAt(index);
  }

  checkCoinReward(coinReward, coinMax) {
    if (!coinReward && !coinMax) {
      this.coinRewardInvalid = false;
    } else if (coinReward <= coinMax) {
      this.coinRewardInvalid = true;
    } else {
      this.coinRewardInvalid = false;
    }
  }

  _filterTradeProgram() {
    if (!this.tradePrograms) {
      return;
    }
    // get the search keyword
    let search = this.filterTradeProgram.value;
    if (!search) {
      this.filteredTradeProgram.next(this.tradePrograms.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the trades
    this.filteredTradeProgram.next(
      this.tradePrograms.filter(trade => trade.name.toLowerCase().indexOf(search) > -1)
    );
  }

  submit() {
    this.submitting = true;
    let automationType = this.formAutomation.get("automation").value;
    if (this.formAutomation.valid) {
      let body = {
        type: this.formAutomation.get("automation").value,
        start_date: this.formAutomation.get("startDate").value,
        end_date: this.formAutomation.get("endDate").value,
        coin_reward: this.formAutomation.get("coin_reward").value,
        max_frequency: this.formAutomation.get("coin_max").value,
        trade_creator_id: this.formAutomation.get("trade_program_id").value,
        title: this.formAutomation.get("title_challenge").value,
        description: this.formAutomation.get("description_challenge").value,
        text_button: this.formAutomation.get("button_text").value
      };

      switch (automationType) {
        case 'e-order':
          let barcodes = this.formAutomation.get('skus').value;
          body['barcode'] = barcodes.map(bc => bc.formSku);
          if (barcodes.length === 1 && barcodes[0].formSku === "") {
            delete body['barcode'];
          }
          break;
        case 'coupon':
          body['coupon_total'] = this.formAutomation.get('coupon_total').value
          if (body['barcode']) delete body['barcode'];
          break;
        case 'referral_code':
          if (body['barcode']) delete body['barcode'];
          break;
      }
      console.log(body, automationType, this.formAutomation.get('skus').value);
      this.audienceTradeProgramService.create(body).subscribe(res => {
        this.submitting = false;
        console.log('ressadas', res);
        if (res && res.status) {
          this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' });
          // this._resetForm();
          this.router.navigate(['dte', 'automation']);
        }
      }, err => {
        console.log('err', err);
        this.submitting = false;
      });
    } else {
      this.submitting = false;
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
      commonFormValidator.validateAllFields(this.formAutomation);
      // commonFormValidator.validateAllFields(this.formAutomation);
    }
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

  onSelectingTradeProgram(event) {
    this.tradeSelected = this.tradePrograms.find((value: any) => value.id === event.value);
    if (this.tradeSelected) {
      this.maxDateTradeProgram = this.tradeSelected.end_date;
      this.minDateTradeProgram = this.tradeSelected.start_date;
    }
  }

}
