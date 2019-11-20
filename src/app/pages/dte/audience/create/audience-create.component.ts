import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
import { environment } from 'environments/environment';

@Component({
  selector: 'app-audience-create',
  templateUrl: './audience-create.component.html',
  styleUrls: ['./audience-create.component.scss']
})
export class AudienceCreateComponent {
  formAudience: FormGroup;
  formAudienceError: any;

  listScheduler: any[];
  listTradePrograms: any[];
  listRetailer: any;
  rows: any[];
  listType: any[] = [{ name: 'Batasi Audience', value: 'limit' }, { name: 'Pilih Semua', value: 'pick-all' }];
  listAudienceType: any[] = [{ name: 'Misi', value: 'mission' }, { name: 'Tantangan', value: 'challenge' }];

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
  exportTemplate: Boolean;

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterTradeProgram: FormControl = new FormControl();
  public filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.exportTemplate) {
      return true;
    }

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
    this.exportTemplate = false;
    this.saveData = false;
    this.rows = [];
    this.formAudienceError = {
      name: {},
      min: {},
      max: {},
      trade_scheduler_id: {}
    }

    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
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
        this.searchingRetailer(res);
      })
    console.log(activatedRoute.snapshot.data);
    // this.listScheduler = activatedRoute.snapshot.data['listScheduler'].data.filter(item => item.status_scheduler === "draft" && item.trade_audience_group_id === null && item.status_audience === null);
    // this.filteredScheduler.next(this.listScheduler.slice());


    // this.loadingIndicator = true;
    // this.listRetailer = activatedRoute.snapshot.data['listRetailer'];

    // this.onSelect();
    this.area = dataService.getDecryptedProfile()['area_type'];
  }

  ngOnInit() {
    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", [Validators.required, Validators.min(0)]],
      max: ["", [Validators.required, Validators.min(0)]],
      type: ["limit"],
      audience_type: ["mission", Validators.required],
      // national: [""],
      // division: [""],
      // region: [""],
      // area: [""],
      // district: [""],
      // teritory: [""],
      trade_scheduler_id: [""],
      trade_creator_id: [""]
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
        this.formAudience.get('min').disable({ emitEvent: false });
        this.formAudience.get('max').disable({ emitEvent: false });

        // this.getRetailer();
      } else {
        this.formAudience.get('min').enable({ emitEvent: false });
        this.formAudience.get('max').enable({ emitEvent: false });
      }
    })

    this.formAudience.controls['min'].valueChanges.debounceTime(500).subscribe(res => {
      if (this.formAudience.get('min').valid) {
        this.formAudience.get('max').setValidators([Validators.required, Validators.min(res)]);
        this.formAudience.get('max').updateValueAndValidity();
      }
    });

    this.getListScheduler();

    this.formAudience.get('audience_type')
      .valueChanges
      .subscribe(data => {
        console.log('audience type', data);
        if (data === 'mission') {
          this.getListScheduler();
          this.formAudience.get("trade_scheduler_id").setValidators(Validators.required);
          this.formAudience.get("trade_creator_id").setValidators([]);
          this.formAudience.get("trade_creator_id").clearValidators();
          this.formAudience.get("trade_creator_id").updateValueAndValidity();
        } else {
          this.getTradePrograms();
          this.formAudience.get("trade_creator_id").setValidators(Validators.required);
          this.formAudience.get("trade_scheduler_id").setValidators([]);
          this.formAudience.get("trade_scheduler_id").clearValidators();
          this.formAudience.get("trade_scheduler_id").updateValueAndValidity();
        }
      });

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

    this.filterTradeProgram.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringTradeProgram();
      });
  }

  getTradePrograms() {
    this.audienceService.getListTradePrograms().subscribe(res => {
      console.log('res trade programs', res);
      this.listTradePrograms = res.data;
      this.filteredTradeProgram.next(res.data);
    }, err => {
      console.log('err trade programs', err);
    });
  }

  getListScheduler() {
    this.audienceService.getListScheduler().subscribe(res => {
      console.log('res scheduler new', res);
      this.listScheduler = res.data;
      this.filteredScheduler.next(res.data);
    }, err => {
      console.log('err list scheduler new', err);
    });
  }

  getRetailer() {
    this.dataService.showLoading(true);
    this.pagination.per_page = 25;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length - 1].value;

    this.loadingIndicator = true;
    this.pagination.area = area_id;
    // this.pagination.area = this.formAudience.get('type').value === 'pick-all' ? 1 : area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
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
      this.listScheduler.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filteringTradeProgram() {
    if (!this.listTradePrograms) {
      return;
    }
    // get the search keyword
    let search = this.filterTradeProgram.value;
    if (!search) {
      this.filteredTradeProgram.next(this.listTradePrograms.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredTradeProgram.next(
      this.listTradePrograms.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  initArea() {
    console.log('areaform login', this.areaFromLogin);
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

      if (this.formAudience.get("audience_type").value === 'mission') {
        this.audienceService.validateBudget(budget).subscribe(res => {
          if (res.selisih < 0)
            return this.dialogService.openSnackBar({ message: `Jumlah Dana Permintaan melebihi dari Jumlah Dana Trade Program, Selisih Dana : ${this.rupiahFormater.transform(res.selisih)}!` })

          let body = {
            name: this.formAudience.get('name').value,
            trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value
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

          body['type'] = this.formAudience.get("audience_type").value;

          if (body['type'] === 'mission') {
            body['trade_scheduler_id'] = this.formAudience.get('trade_scheduler_id').value;
            if (body['trade_creator_id']) delete body['trade_creator_id'];
          } else {
            body['trade_creator_id'] = this.formAudience.get('trade_creator_id').value;
            if (body['trade_scheduler_id']) delete body['trade_scheduler_id'];
          }
          console.log(this.findInvalidControls());
          // this.saveData = !this.saveData;
          this.saveData = true;
          this.audienceService.create(body).subscribe(
            res => {
              this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' })
              this.router.navigate(['dte', 'audience']);
            },
            err => {
              // this.dialogService.openSnackBar({ message: err.error.message })
              console.log(err.error.message);
            }
          )
        })
      } else {
        let body = {
          name: this.formAudience.get('name').value,
          trade_creator_id: this.formAudience.get('trade_creator_id').value
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

        body['type'] = this.formAudience.get("audience_type").value;

        if (body['type'] === 'mission') {
          body['trade_scheduler_id'] = this.formAudience.get('trade_scheduler_id').value;
          if (body['trade_creator_id']) delete body['trade_creator_id'];
        } else {
          body['trade_creator_id'] = this.formAudience.get('trade_creator_id').value;
          if (body['trade_scheduler_id']) delete body['trade_scheduler_id'];
        }
        console.log(this.findInvalidControls());
        // this.saveData = !this.saveData;
        this.saveData = true;
        this.audienceService.create(body).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' })
            this.router.navigate(['dte', 'audience']);
          },
          err => {
            // this.dialogService.openSnackBar({ message: err.error.message })
            console.log(err.error.message);
          }
        )
      }
    } else {
      commonFormValidator.validateAllFields(this.formAudience);

      if (this.formAudience.valid && this.selected.length === 0) {
        return this.dialogService.openSnackBar({ message: 'Belum ada Audience yang dipilih!' });
      }

      return this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
    }
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.formAudience.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
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

  async exportAudience() {
    this.exportTemplate = true;
    const body = {
      retailer_id: this.selected.length > 0 ? this.selected.map(item => item.id) : []
    }

    try {
      const response = await this.audienceService.exportExcel(body).toPromise();
      this.downloadLink.nativeElement.href = response.data;
      this.downloadLink.nativeElement.click();
      this.exportTemplate = false;
    } catch (error) {
      console.log('err', error);
      this.exportTemplate = false;
      throw error;
    }
  }

}
