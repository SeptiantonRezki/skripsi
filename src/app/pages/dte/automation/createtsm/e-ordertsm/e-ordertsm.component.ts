import { Component, OnInit, ViewChild, ElementRef, HostListener, Input, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { takeUntil, switchMap, debounceTime, tap, finalize, map, take } from "rxjs/operators";
import { MatSelect, MatDialog, MatDialogConfig, MatChipInputEvent, MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { AudienceService } from 'app/services/dte/audience.service';
import { ImportAudienceDialogComponent } from 'app/pages/dte/audience/import/import-audience-dialog.component';
import { AudienceTradeProgramService } from 'app/services/dte-automation/audience-trade-program.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import moment from 'moment';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-e-ordertsm',
  templateUrl: './e-ordertsm.component.html',
  styleUrls: ['./e-ordertsm.component.scss']
})
export class EOrdertsmComponent implements OnInit {
  
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  skus: any[] = [];
  skuSelected: any;
  submitting: Boolean;
  onLoad: Boolean;
  coinRewardInvalid: Boolean;

  formEOrder: FormGroup;
  formEOrderError: any;
  showLoadingBar: Boolean;
  isLoading: Boolean;

  listScheduler: any[];
  listRetailer: any;
  rows: any[];
  listType: any[] = [{ name: 'Batasi Audience', value: 'limit' }, { name: 'Pilih Semua', value: 'pick-all' }];

  selectedRows = [];
  area: Array<any>;
  queries: any;
  data = [];
  pagination: Page = new Page();

  searchRetailer = new Subject<string>();

  valueChange: Boolean;
  dialogRef: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  formTemp: FormGroup;

  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  dummyAudience: any[] = [{ id: 1, name: "Audience Sampoerna" }, { id: 2, name: "Audience Phillip Morris" }];
  filteredAudience: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredSku: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  audienceGroups: any[];
  tradePrograms: any[];
  skuList: any[];

  public filterScheduler: FormControl = new FormControl();
  public filterAudience: FormControl = new FormControl();
  public filterTradeProgram: FormControl = new FormControl();
  public filterSku: FormControl = new FormControl();

  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('skuInput') skuInput: ElementRef;
  @ViewChild('myContainer') myContainer: ElementRef;
  @Input() automationType: string;

  private _onDestroy = new Subject<void>();

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.exportTemplate) {
      return true;
    }

    if (this.valueChange && !this.saveData || (this.selectedRows.length > 0 && !this.saveData))
      return false;

    // if (this.selected.length > 0)
    //   return false;

    return true;
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private rupiahFormater: RupiahFormaterPipe,
    private dialog: MatDialog,
    private audienceService: AudienceService,
    private audienceTradeProgramService: AudienceTradeProgramService,
    private ls: LanguagesService
  ) {
    this.exportTemplate = false;
    this.saveData = false;
    this.rows = [];
    this.formEOrderError = {
      name: {},
      min: {},
      max: {},
      trade_scheduler_id: {}
    }

    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SSLSNTL"
      }
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.searchRetailer.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        // this.searchingRetailer();
      })

    // console.log('getting list Audience!');
    // this.audienceService.getListAudience().subscribe(res => {
    //   console.log('res getList Audience', res);
    //   this.listScheduler = res.data.filter(item => item.status_scheduler === "draft" && item.trade_audience_group_id === null && item.status_audience === null);
    //   this.filteredScheduler.next(this.listScheduler.slice());
    // });

    this.area = dataService.getFromStorage('profile')['area_type'];
  }

  displayFn(audience) {
    if (audience) return audience.name;
  }

  ngOnInit() {
    console.log('automationType', this.automationType);
    this.showLoadingBar = true;
    setTimeout(() => {
      this.showLoadingBar = false;
    }, 3000);

    this.formEOrder = this.formBuilder.group({
      name: [""],
      audienceName: [""],
      min: [""],
      max: [""],
      type: ["limit"],
      // national: [""],
      // division: [""],
      // region: [""],
      // area: [""],
      // district: [""],
      // teritory: [""],
      trade_scheduler_id: [""],
      newAudience: [false]
    });

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    });

    this.formTemp = this.formBuilder.group({
      sku: [""],
      startDate: [moment.now(), Validators.required],
      endDate: [moment.now(), Validators.required],
      coin_reward: [0, Validators.required],
      coin_max: [0, Validators.required],
      trade_program_id: [null, Validators.required],
      coupon_total: this.automationType === 'coupon' ? [0, Validators.required] : [0]
    });

    // this.initArea();
    // this.getRetailer();

    this.formEOrder.controls['type'].valueChanges.subscribe(res => {
      if (res === 'pick-all') {
        this.formEOrder.get('min').disable({ emitEvent: false });
        this.formEOrder.get('max').disable({ emitEvent: false });

        // this.getRetailer();
      } else {
        this.formEOrder.get('min').enable({ emitEvent: false });
        this.formEOrder.get('max').enable({ emitEvent: false });
      }
    })

    this.formEOrder.controls['min'].valueChanges.debounceTime(500).subscribe(res => {
      if (this.formEOrder.get('min').valid) {
        this.formEOrder.get('max').setValidators([Validators.required, Validators.min(res)]);
        this.formEOrder.get('max').updateValueAndValidity();
      }
    })

    this.formEOrder.valueChanges.subscribe(() => {
      this.valueChange = true;
    })

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      // this.searchingRetailer(res);
      this.getRetailer();
    })

    this.filterScheduler.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringScheduler();
      });

    this.audienceTradeProgramService.getAudienceGroups().subscribe(res => {
      console.log('list audience group!', res);
      this.audienceGroups = res.data.slice();
      this.filteredAudience.next((res && res.data) ? res.data.slice() : []);
    });
    this.audienceTradeProgramService.getTradePrograms().subscribe(res => {
      console.log('res list trade programs', res);
      this.tradePrograms = res.data.slice();
      this.filteredTradeProgram.next((res && res.data) ? res.data.slice() : []);
    });

    this.filterAudience
      .valueChanges
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this._filterAudience()
      });

    this.filterTradeProgram
      .valueChanges
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this._filterTradeProgram();
      });

    this.formTemp
      .get('sku')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => {
          if (value == null || value == "") {
            this.isLoading = false;
            return [];
          }
          return this.audienceTradeProgramService.getListSku({ search: value })
            .pipe(
              finalize(() => this.isLoading = false)
            )
        })
      ).subscribe(res => {
        this.filteredSku.next(res.data);
      });

    this.formTemp
      .get("coin_max")
      .valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(data => {
        console.log('data', data);
        let coinMax = this.formTemp.get("coin_reward").value;
        this.checkCoinReward(data, coinMax);
      })
    this.formTemp
      .get("coin_reward")
      .valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(data => {
        let coinReward = this.formTemp.get("coin_max").value;
        this.checkCoinReward(coinReward, data);
      });
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

  runServiceForNewAudience() {
    this.initArea();
    this.getRetailer();
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.skus.push();
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.formTemp.get("sku").setValue(null);
    }
  }

  remove(sku: string): void {
    const index = this.skus.indexOf(sku);

    if (index >= 0) {
      this.skus.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let index = this.skus.findIndex(sku => {
      return sku === event.option.value.sku_id;
    });

    if (index < 0) {
      this.skus.push({
        sku_id: event.option.value.sku_id,
        name: event.option.value.name
      });
    } else {
      this.dialogService.openSnackBar({ message: 'SKU ID Sudah terpilih di dalam List!' });
    }
    this.skuInput.nativeElement.value = '';
    this.formTemp.get("sku").setValue(null);
  }

  _filterAudience() {
    if (!this.audienceGroups) {
      return;
    }
    // get the search keyword
    let search = this.filterAudience.value;
    if (!search) {
      this.filteredAudience.next(this.audienceGroups.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the audiences
    this.filteredAudience.next(
      this.audienceGroups.filter(audience => audience.name.toLowerCase().indexOf(search) > -1)
    );
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
    if (this.formEOrder.valid && this.formTemp.valid) {
      let body = {
        sku_id: this.skus.map(sku => sku.sku_id),
        type: this.automationType,
        start_date: this.formTemp.get("startDate").value,
        end_date: this.formTemp.get("endDate").value,
        coin_reward: this.formTemp.get("coin_reward").value,
        coin_max: this.formTemp.get("coin_max").value,
        trade_creator_id: this.formTemp.get("trade_program_id").value,
        min: this.formEOrder.get("min").value,
        max: this.formEOrder.get("max").value,
        area_id: this.pagination.area,
        trade_audience_group_id: this.formEOrder.get('name').value,
        name: this.formEOrder.get('audienceName').value,
        coupon_total: this.formTemp.get("coupon_total").value
      };

      switch (this.automationType) {
        case 'coupon':
        case 'referral_code':
          delete body.sku_id;
          break;
      }

      if (this.formEOrder.get('type').value !== 'pick-all') {
        body['retailer_id'] = this.selectedRows.map(item => item.id);
        body['min'] = this.formEOrder.get('min').value;
        body['max'] = this.formEOrder.get('max').value;
      } else {
        body['area_id'] = this.pagination.area;

        if (this.pagination.area !== 1) {
          body['min'] = 1;
          body['max'] = this.pagination.total;
        } else {
          body['min'] = "";
          body['max'] = "";
        }
      }
      this.audienceTradeProgramService.create(body).subscribe(res => {
        this.submitting = false;
        if (res && res.status) {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
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
      commonFormValidator.validateAllFields(this.formTemp);
      commonFormValidator.validateAllFields(this.formEOrder);
    }
  }

  isCreateAudience(event) {
    if (event.checked) {
      this.formEOrder.get("name").disable();
      this.formEOrder.get("name").reset();
      this.runServiceForNewAudience();
      console.log('its new Audience', this.formEOrder.get("name").value)
    } else {
      console.log('its selecting group audience');
      this.formEOrder.get("name").enable();
    }
  }

  _resetForm() {
    this.skus = [];
    this.selectedRows = [];
    this.formTemp.get("coin_reward").setValue(0);
    this.formTemp.get("coin_max").setValue(0);
    this.formEOrder.get("min").setValue(0);
    this.formEOrder.get("max").setValue(0);
    this.formTemp.get("trade_program_id").setValue("");
    this.formEOrder.get("name").setValue("");
    this.formTemp.get("startDate").setValue(null);
    this.formTemp.get("endDate").setValue(null);
  }

  getRetailer() {
    this.pagination.per_page = 25;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length - 1].value;

    this.loadingIndicator = true;
    this.pagination.area = area_id;
    // this.pagination.area = this.formEOrder.get('type').value === 'pick-all' ? 1 : area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    })
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.audienceService.getListRetailer(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event['newValue'];
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.audienceService.getListRetailer(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }

  appendRows(rows, next) {
    (rows || []).map(item => {
      this.data.push(item);
    });

    if (next) {
      let page = { page: next.split('?page=')[1] };

      this.audienceService.getListRetailer(page).subscribe(res => {
        this.appendRows(res['data'], res['next_page_url']);

        if (res['next_page_url'] === null) {
          this.loadingIndicator = false;
          this.rows = this.data;

          // return this.data = [];
        }
      })
    } else {
      this.loadingIndicator = false;
      this.rows = this.data;

      // return this.data = [];
    }
  }

  filteringScheduler() {
    if (!this.listScheduler) {
      return;
    }
    // get the search keyword
    let search = this.filterScheduler.value;
    if (!search) {
      this.filteredScheduler.next(this.listScheduler.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredScheduler.next(
      this.listScheduler.filter(item => item.scheduler_name.toLowerCase().indexOf(search) > -1)
    );
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.formFilter.get('national').setValue(item.id);
          this.formFilter.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formFilter.get('zone').setValue(item.id);
          this.formFilter.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formFilter.get('region').setValue(item.id);
          this.formFilter.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formFilter.get('area').setValue(item.id);
          this.formFilter.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formFilter.get('salespoint').setValue(item.id);
          this.formFilter.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formFilter.get('district').setValue(item.id);
          this.formFilter.get('district').disable();
          break;
        case 'territory':
          this.formFilter.get('territory').setValue(item.id);
          this.formFilter.get('territory').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.audienceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res;
        });

        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.audienceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = [];
        }

        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.audienceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.audienceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.audienceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.audienceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  searchingRetailer(res) {
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length - 1].value;

    this.loadingIndicator = true;
    this.pagination.area = area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(
      res => {
        this.rows = res['data'];
        this.loadingIndicator = false;
      },
      err => {
        console.log(err.error.message);
        this.loadingIndicator = false;
      }
    )
  }

  changeValue() {
    if (this.formEOrder.get('type').value === 'pick-all') {
      this.selectedRows = this.rows;
    } else {
      this.selectedRows = []
    }
  }

  onSelect({ selected }) {
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  getRows(id) {
    let index = this.rows.map(item => item.id).indexOf(id);
    return this.rows[index];
  }

  getId(row) {
    return row.id;
  }

  importAudience() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { password: 'P@ssw0rd' };

    this.dialogRef = this.dialog.open(ImportAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.selected = response;
        this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
      }
    });
  }

}
