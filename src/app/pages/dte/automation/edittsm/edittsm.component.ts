import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabChangeEvent, MatSelect } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { AudienceTradeProgramService } from 'app/services/dte-automation/audience-trade-program.service';
import { takeUntil, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import moment from 'moment';

@Component({
  selector: 'app-edittsm',
  templateUrl: './edittsm.component.html',
  styleUrls: ['./edittsm.component.scss']
})
export class EdittsmComponent implements OnInit {

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
  detailAutomation: any;
  isDetail: Boolean;

  tradeSelected: any;
  maxDateTradeProgram: any;
  minDateTradeProgram: any;

  shareable: FormControl = new FormControl(false);
  exclude_gsm: FormControl = new FormControl(false);

  listJenisTantangan: Array<any> = [
    { name: "Default", value: "default" },
    { name: "Minimum Transaction Frequency", value: "minimum_transaction_frequency" },
    { name: "Extra Coin", value: "extra_coin" },
  ];

  listKombinasiBrand: Array<any> = [
    { name: "OR", value: "or" },
    { name: "AND", value: "and" }
  ];

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private audienceTradeProgramService: AudienceTradeProgramService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = 0;

    this.detailAutomation = this.dataService.getFromStorage('detail_dte_automation');

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    });
  }

  copyMessage(linkMisi: any) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (linkMisi));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.dialogService.openSnackBar({ message: "Link Misi Disalin!" });
  }
  ngOnInit() {
    this.formAutomation = this.formBuilder.group({
      automation: ['e-order', Validators.required],
      jenis_tantangan: ['default'],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      coin_max: [null, Validators.required],
      coin_reward: [null, Validators.required],
      coupon_total: [null],
      trade_program_id: [null, Validators.required],
      title_challenge: ["", Validators.required],
      description_challenge: ["", Validators.required],
      button_text: ["", Validators.required],
      extra_coin: [0],
      brand_combination: ["or"],
      skus: this.formBuilder.array([])
    });

    if (this.detailAutomation.type === 'e-order' && (!this.detailAutomation.barcode || this.detailAutomation.barcode.length === 0)) {
      console.log('is empty create one');
      let skus = this.formAutomation.get('skus') as FormArray;
      skus.push(this.createFormSku());
    }

    this.formAutomation.get("automation").setValue(this.detailAutomation.type);
    this.formAutomation.get("startDate").setValue(this.detailAutomation.start_date);
    this.formAutomation.get("endDate").setValue(this.detailAutomation.end_date);
    this.formAutomation.get("coin_max").setValue(this.detailAutomation.max_frequency);
    this.formAutomation.get("coin_reward").setValue(this.detailAutomation.coin_reward);
    this.formAutomation.get("coupon_total").setValue(this.detailAutomation.coupon_total ? this.detailAutomation.coupon_total : 0);
    this.formAutomation.get("trade_program_id").setValue(this.detailAutomation.trade_creator_id);
    this.formAutomation.get("description_challenge").setValue(this.detailAutomation.description);
    this.formAutomation.get("title_challenge").setValue(this.detailAutomation.title);
    this.formAutomation.get("button_text").setValue(this.detailAutomation.text_button);
    this.formAutomation.get('extra_coin').setValue(this.detailAutomation.coin_extra);
    this.formAutomation.get('brand_combination').setValue(this.detailAutomation.kombinasi_brand);
    this.formAutomation.get('jenis_tantangan').setValue(this.detailAutomation.jenis_tantangan);

    this.shareable.setValue(this.detailAutomation.is_shareable === 1 ? true : false);
    this.exclude_gsm.setValue(this.detailAutomation.is_exclude_gsm === 1 ? true : false);

    if (this.detailAutomation.type === 'e-order') {
      let skus = this.formAutomation.get('skus') as FormArray;
      if (this.detailAutomation.barcode) {
        this.detailAutomation.barcode.map(bc => {
          const formItem = this.formBuilder.group({
            formSku: bc,
            formFilterSku: new ReplaySubject<any[]>(1),
            filteredSku: new ReplaySubject<any[]>(1)
          });

          formItem.controls['formFilterSku'].value.next(bc);
          formItem.controls['filteredSku'].value.next([{ barcode: bc }].slice());

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

          skus.push(formItem);
          console.log('skus', skus);
        })
      }
    }

    this.audienceTradeProgramService.getTradePrograms({ id: this.detailAutomation.trade_creator_id }).subscribe(res => {
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


    if (this.isDetail) {
      this.formAutomation.disable();
    }
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
        start_date: this.convertDate(this.formAutomation.get("startDate").value),
        end_date: this.convertDate(this.formAutomation.get("endDate").value),
        coin_reward: this.formAutomation.get("coin_reward").value,
        max_frequency: this.formAutomation.get("coin_max").value,
        trade_creator_id: this.formAutomation.get("trade_program_id").value,
        classification: '1',
        title: this.formAutomation.get("title_challenge").value,
        description: this.formAutomation.get("description_challenge").value,
        text_button: this.formAutomation.get("button_text").value,
        _method: 'PUT',
        is_shareable: this.shareable.value ? 1 : 0,
        is_exclude_gsm: this.exclude_gsm.value ? 1 : 0,
        jenis_tantangan: this.formAutomation.get('jenis_tantangan').value,
        kombinasi_brand: this.formAutomation.get('jenis_tantangan').value === 'extra_coin' ? this.formAutomation.get('brand_combination').value : 'or'
      };

      switch (automationType) {
        case 'e-order':
          const barcodes = this.formAutomation.get('skus').value;
          if (barcodes && barcodes.length > 0) {
            const bcsFiltered = barcodes.filter(val => {
              return (val.formSku && val.formSku !== '' && val.formSku !== null);
            }).map(val => val.formSku);
            // console.log('bcsFiltered', bcsFiltered, barcodes);
            if (bcsFiltered.length > 0) {
              body['barcode'] = bcsFiltered;
            }

            if (bcsFiltered.length === 0) {
              delete body['barcode'];
            }
          } else {
            if (body['barcode']) delete body['barcode'];
          }

          if (this.formAutomation.get('jenis_tantangan').value === 'extra_coin') {
            body['coin_extra'] = this.formAutomation.get('extra_coin').value;
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
      this.audienceTradeProgramService.put(body, { automation_id: this.detailAutomation.id }).subscribe(res => {
        this.submitting = false;
        // console.log('ressss', res);
        // if (res && res.status) {
        this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' });
        // this._resetForm();
        this.router.navigate(['dte', 'automation']);
        // }
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

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }
}
