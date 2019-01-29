import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { formatCurrency } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../services/data.service';
import { AudienceService } from '../../../../services/dte/audience.service';
import { DialogService } from '../../../../services/dialog.service';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { MatSelect, MatDialogConfig, MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { Page } from '../../../../classes/laravel-pagination';
import * as _ from 'underscore';
import { ImportAudienceDialogComponent } from '../import/import-audience-dialog.component';

@Component({
  selector: 'app-audience-create',
  templateUrl: './audience-create.component.html',
  styleUrls: ['./audience-create.component.scss']
})
export class AudienceCreateComponent {
  formAudience: FormGroup;
  formAudienceError: any;

  listScheduler: any[];
  listRetailer: any;
  rows: any[];
  listType: any[] = [{ name: 'Batasi Audience', value: 'limit'}, { name: 'Pilih Semua', value: 'pick-all' }];

  selected = [];
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

  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange && !this.saveData || (this.selected.length > 0 && !this.saveData))
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
    private audienceService: AudienceService,
    private rupiahFormater: RupiahFormaterPipe,
    private dialog: MatDialog
  ) { 
    this.saveData = false;
    this.rows = [];
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

    this.listScheduler = activatedRoute.snapshot.data['listScheduler'].data.filter(item => item.status_scheduler === "draft" && item.trade_audience_group_id === null && item.status_audience === null);
    this.filteredScheduler.next(this.listScheduler.slice());


    // this.loadingIndicator = true;
    // this.listRetailer = activatedRoute.snapshot.data['listRetailer'];

    // this.onSelect();
    this.area = dataService.getFromStorage('profile')['area_type'];
  }

  ngOnInit() {
    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", [Validators.required, Validators.min(0)]],
      max: ["", [Validators.required, Validators.min(0)]],
      type: ["limit"],
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

    this.initArea();
    this.getRetailer();

    this.formAudience.controls['type'].valueChanges.subscribe(res => {
      if (res === 'pick-all') {
        this.formAudience.get('min').disable({emitEvent: false});
        this.formAudience.get('max').disable({emitEvent: false});

        // this.getRetailer();
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
      // this.searchingRetailer(res);
      this.getRetailer();
    })

    this.filterScheduler.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringScheduler();
      });
  }

  getRetailer() {
    this.pagination.per_page = 25;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({key, value})).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length-1].value;

    this.loadingIndicator = true;
    this.pagination.area = area_id;
    // this.pagination.area = this.formAudience.get('type').value === 'pick-all' ? 1 : area_id;

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

  selectFn() {
    console.log('jalan')
  }

  appendRows(rows, next) {
    (rows|| []).map(item => { 
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
    // let queries = res;
    // this.queries = {
    //   national: 1,
    //   division:  parseInt(queries['zone']) === parseInt("1") ? '' : queries['zone'],
    //   region:  parseInt(queries['region']) === parseInt(queries['zone']) ? '' : queries['region'],
    //   area:  parseInt(queries['area']) === parseInt(queries['region']) ? '' : queries['area'],
    //   salespoint:  parseInt(queries['salespoint']) === parseInt(queries['area']) ? '' : queries['salespoint'],
    //   district:  parseInt(queries['district']) === parseInt(queries['salespoint']) ? '' : queries['district'],
    //   teritory:  parseInt(queries['territory']) === parseInt(queries['district']) ? '' : queries['territory'],
    // }
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({key, value})).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length-1].value;

    this.loadingIndicator = true;
    this.pagination.area = area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(
      res => {
        this.rows = res['data'];
        // this.selected = [];
        this.loadingIndicator = false;

        // if (res['data'].length === 0) {
        //   this.loadingIndicator = false;
        //   return this.rows = [];
        // }

        // this.appendRows(res['data'], res['next_page_url']);
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

  getRows(id) {
    let index = this.rows.map(item => item.id).indexOf(id);
    return this.rows[index];
  }

  getId(row) {
    return row.id;
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
        return this.dialogService.openSnackBar({ message: `Jumlah Audience yang dipilih melebihi dari ${max} Audience` });
      
      let budget = {
        total_retailer: limit ? this.selected.length : this.pagination.total,
        trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value
      }

      this.audienceService.validateBudget(budget).subscribe(res => {
        if (res.selisih < 0) 
          return this.dialogService.openSnackBar({ message: `Jumlah Dana Permintaan melebihi dari Jumlah Dana Trade Program, Selisih Dana : ${this.rupiahFormater.transform(res.selisih)}!`})
        
        let body = {
          name: this.formAudience.get('name').value,
          trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value,
          // min: limit ? this.formAudience.get('min').value : '',
          // max: limit ? this.formAudience.get('max').value : ''
        }

        if (this.formAudience.get('type').value !== 'pick-all') {
          body['retailer_id'] = this.selected.map(item => item.id);
          body['min'] = this.formAudience.get('min').value;
          body['max'] = this.formAudience.get('max').value;

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

        // this.saveData = !this.saveData;
        this.saveData = true;
        this.audienceService.create(body).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan'})
            this.router.navigate(['dte', 'audience']);
          },
          err => {
            // this.dialogService.openSnackBar({ message: err.error.message })
            console.log(err.error.message);
          }
        )
      })
    } else {
      commonFormValidator.validateAllFields(this.formAudience);

      if (this.formAudience.valid && this.selected.length === 0) {
        return this.dialogService.openSnackBar({ message: 'Belum ada Audience yang dipilih!' });
      }
      
      return this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
    }
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
