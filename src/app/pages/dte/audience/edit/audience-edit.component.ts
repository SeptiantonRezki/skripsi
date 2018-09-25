import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { MatSelect } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-audience-edit',
  templateUrl: './audience-edit.component.html',
  styleUrls: ['./audience-edit.component.scss']
})
export class AudienceEditComponent {

  formAudience: FormGroup;
  formAudienceError: any;
  detailAudience: any;
  detailAudienceSelected: any;

  listScheduler: Array<any>;
  rows: any[];
  listType: any[] = [{ name: 'Batasi Audience', value: 'limit'}, { name: 'Pilih Semua', value: 'pick-all' }];

  selected = [];
  area: Array<any>;
  queries: any;
  loadingIndicator: Boolean;

  searchRetailer = new Subject<string>();

  valueChange: Boolean;
  saveData: Boolean;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if ((this.valueChange && !this.saveData) || (this.selected.length !== this.detailAudience.total_audiences && !this.saveData)) {
      return false;
    }

    return true;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
  ) { 
    this.saveData = false;
    this.formAudienceError = {
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
        "name": "Sales National"
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
    this.area = dataService.getFromStorage('profile')['area_type'];
    this.detailAudience = dataService.getFromStorage('detail_audience');

    this.listScheduler = activatedRoute.snapshot.data['listScheduler'].data.filter(item => 
      item.status_audience === null || 
      item.trade_audience_group_id === this.detailAudience.id
    );

    this.filteredScheduler.next(this.listScheduler.slice());
    this.rows = activatedRoute.snapshot.data['listRetailer'];
  }

  ngOnInit() {
    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", [Validators.required, Validators.min(0)]],
      max: ["", [Validators.required, Validators.min(0)]],
      type: [""],
      // national: [""],
      // division: [""],
      // region: [""],
      // area: [""],
      // district: [""],
      // teritory: [""],
      trade_scheduler_id: ["", Validators.required],
    })

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.initAudience();
    this.initArea();

    this.formAudience.controls['type'].valueChanges.subscribe(res => {
      if (res === 'pick-all') {
        this.formAudience.get('min').disable({emitEvent: false});
        this.formAudience.get('max').disable({emitEvent: false});
      } else {
        this.formAudience.get('min').enable({emitEvent: false});
        this.formAudience.get('max').enable({emitEvent: false});
      }
    })

    this.formAudience.controls['min'].valueChanges.debounceTime(500).subscribe(res => {
      if (this.formAudience.get('min').valid) {
        this.formAudience.get('max').setValidators([Validators.required, Validators.min(res)]);
        this.formAudience.get('max').updateValueAndValidity();
      }
    })

    this.formAudience.valueChanges.subscribe(() => {
      this.valueChange = true;
    })

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      this.searchingRetailer(res);
    })

    this.filterScheduler.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringScheduler();
      });
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
      this.listScheduler.filter(item => item.name.toLowerCase().indexOf(search) > -1)
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
            this.list[selection] = []
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

  initAudience() {
    this.formAudience.get('name').setValue(this.detailAudience.name);
    this.formAudience.get('min').setValue(this.detailAudience.min);
    this.formAudience.get('max').setValue(this.detailAudience.max);
    this.formAudience.get('type').setValue(this.detailAudience.max && this.detailAudience.min ? 'limit' : 'pick-all');
    this.formAudience.get('trade_scheduler_id').setValue(this.detailAudience.trade_scheduler_id);

    // for (const item of this.detailAudience['retailer_id']) {
    //   for (const value of this.rows) {
    //     if (item === value.id) {
    //       this.selected.push(value);
    //     }
    //   }
    // }

    if (!this.detailAudience.min) {
      this.formAudience.get('min').disable();
    }

    if (!this.detailAudience.max) {
      this.formAudience.get('max').disable();
    }

    if (this.detailAudience.status === 'approved') {
      this.formAudience.get('name').disable();
      this.formAudience.get('min').disable();
      this.formAudience.get('max').disable();
      this.formAudience.get('type').disable();
      this.formAudience.get('trade_scheduler_id').disable();
    }

    this.detailAudienceSelect();
  }

  detailAudienceSelect() {
    this.loadingIndicator = true;
    this.audienceService.getListRetailerSelected({ audience_id: this.detailAudience.id }).subscribe(
      res => {
        this.selected = (res.data || []).map(item => { return this.getRows(item.id) });
        this.loadingIndicator = false;
      }
    )
  }

  getRows(id) {
    let index = this.rows.map(item => item.id).indexOf(id);
    return this.rows[index];
  }

  // initArea() {
  //   let national = this.area.filter(item => { return item.type === 'national' });
  //   let division = this.area.filter(item => item.type === 'division');
  //   let region = this.area.filter(item => item.type === 'region');
  //   let area = this.area.filter(item => item.type === 'area');

  //   if (national.length > 0) {
  //     this.formAudience.get('national').setValue(national[0].code.trim());
  //     this.formAudience.get('national').disable();
  //   }

  //   if (division.length > 0) { 
  //     this.formAudience.get('division').setValue(division[0].code.trim(), {disable: true});
  //     this.formAudience.get('division').disable();
  //   }
  //   if (region.length > 0) {
  //     this.formAudience.get('region').setValue(region[0].code.trim(), {disable: true});
  //     this.formAudience.get('region').disable();
  //   }

  //   if (area.length > 0) {
  //     this.formAudience.get('area').setValue(area[0].code.trim(), {disable: true});
  //     this.formAudience.get('area').disable();
  //   }
  // }

  searchingRetailer(res) {
    let queries = res;
    this.queries = {
      national: 1,
      division:  parseInt(queries['zone']) === parseInt("1") ? '' : queries['zone'],
      region:  parseInt(queries['region']) === parseInt(queries['zone']) ? '' : queries['region'],
      area:  parseInt(queries['area']) === parseInt(queries['region']) ? '' : queries['area'],
      salespoint:  parseInt(queries['salespoint']) === parseInt(queries['area']) ? '' : queries['salespoint'],
      district:  parseInt(queries['district']) === parseInt(queries['salespoint']) ? '' : queries['district'],
      teritory:  parseInt(queries['territory']) === parseInt(queries['district']) ? '' : queries['territory'],
    }
    this.loadingIndicator = true;

    this.audienceService.getListRetailer(this.queries).subscribe(
      res => {
        this.rows = res;
        this.selected = [];
        this.loadingIndicator = false;
      },
      err => {
        console.log(err.error.message);
        this.loadingIndicator = false;
      }
    )
  }

  changeValue() {
    if (this.formAudience.get('type').value === 'pick-all') {
      this.selected = this.rows;
    } else {
      this.selected = []
    }

  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  submit() {
    if (this.formAudience.valid && this.selected.length > 0) {
      const selectedRetailer = this.selected.length;
      const limit = this.formAudience.get('type').value === 'limit';
      const min = this.formAudience.get('min').value;
      const max = this.formAudience.get('max').value;

      if (limit && selectedRetailer < min) 
        return this.dialogService.openSnackBar({ message: `Jumlah Audience yang dipilih kurang dari ${min} Audience` });
      else if (limit && selectedRetailer > max) 
        return this.dialogService.openSnackBar({ message: `Jumlah Audience yang dipilih melebih dari ${max} Audience` });
      
      let budget = {
        total_retailer: this.selected.length,
        trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value
      }

      this.audienceService.validateBudget(budget).subscribe(res => {
        if (res.selisih < 0) 
          return this.dialogService.openSnackBar({ message: `Jumlah Dana Permintaan melebihi dari Jumlah Dana Trade Program, Selisih Dana : ${res.selisih}!`})
        
        let body = {
          _method: 'PUT',
          name: this.formAudience.get('name').value,
          trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value,
          min: limit ? this.formAudience.get('min').value : '',
          max: limit ? this.formAudience.get('max').value : '',
          retailer_id: this.selected.map(item => item.id)
        }

        this.saveData = !this.saveData;
        this.audienceService.put(body, {audience_id: this.detailAudience.id}).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Data Berhasil Diubah'})
            this.router.navigate(['dte', 'audience']);
            window.localStorage.removeItem('detail_audience');
          },
          err => {
            // this.dialogService.openSnackBar({ message: err.error.message })
            console.log(err.error.message);
          }
        )
      })
    } else {
      if (this.formAudience.valid && this.selected.length < 0) {
        return this.dialogService.openCustomDialog({ message: 'Belum ada Audience yang dipilih!' });
      }
      
      commonFormValidator.validateAllFields(this.formAudience);
      return this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
    }
  }

  updateAudience(){
    let audience = this.formAudience.getRawValue();
    let budget = {
      total_retailer: this.selected.length,
      trade_scheduler_id: audience.trade_scheduler_id
    }

    this.audienceService.validateBudget(budget).subscribe(res => {
      if (res.selisih < 0) 
        return this.dialogService.openSnackBar({ message: `Jumlah Dana Permintaan melebihi dari Jumlah Dana Trade Program, Selisih Dana : ${res.selisih}!`})
      
      let body = {
        _method: 'PUT',
        name: this.formAudience.get('name').value,
        trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value,
        min: audience.min,
        max: audience.max,
        retailer_id: this.selected.map(item => item.id)
      }

      this.saveData = !this.saveData;
      this.audienceService.put(body, {audience_id: this.detailAudience.id}).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Data Berhasil Diubah'})
          this.router.navigate(['dte', 'audience']);
          window.localStorage.removeItem('detail_audience');
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message })
          console.log(err.error.message);
        }
      )
    })
  }

}
