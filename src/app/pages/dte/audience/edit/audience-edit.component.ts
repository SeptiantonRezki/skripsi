import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { MatSelect, MatDialogConfig, MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { Page } from 'app/classes/laravel-pagination';
import * as _ from "underscore";
import { ImportAudienceDialogComponent } from '../import/import-audience-dialog.component';
import { environment } from 'environments/environment';
import { GeotreeService } from 'app/services/geotree.service';
import { IdbService } from 'app/services/idb.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

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
  listTradePrograms: any[];
  rows: any[];
  listType: any[] = [{ name: this.translate.instant('dte.audience.text7'), value: 'limit' }, { name: this.translate.instant('dte.audience.text8'), value: 'pick-all' }]; // TODO
  tsmScheduler: any[] = [{ name: "TSM", value: "tsm" }, { name: this.translate.instant('dte.audience.text6'), value: "scheduler" },];
  listAudienceType: any[] = [{ name: this.translate.instant('dte.audience.text11'), value: 'mission' }, { name: this.translate.instant('dte.audience.text12'), value: 'challenge' }]; // TODO

  retailClassification: any[] = [
    { name: this.translate.instant('global.label.all_type'), value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" },
    // { name: "ISR", value: "ISR" }
  ];
  srcClassification: any[] = [
    { name: this.translate.instant('global.label.all_type'), value: "all" }
  ];
  srcType: any[] = [
    { name: this.translate.instant('global.label.all_type'), value: "all" }
  ];

  businessType: any = [
    { name: this.translate.instant('global.label.all_type'), value: "all" },
    { name: this.translate.instant('global.menu.retailer'), value: "retailer" },
    { name: this.translate.instant('global.menu.wholesaler'), value: "wholesaler" }
  ];

  selected = [];
  getListRetailerParam = {selected_businesses: []};
  area: Array<any>;
  queries: any;
  loadingIndicator: Boolean;
  reorderable = true;

  searchRetailer = new Subject<string>();

  valueChange: Boolean;
  saveData: Boolean;
  dialogRef: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  formFilterRetailer: FormGroup;

  pagination: Page = new Page();
  pageAccess = [];
  isDetail: Boolean;
  exportTemplate: Boolean;
  allRowsSelected: boolean;

  pageName = this.translate.instant('dte.audience.text1');
  titleParam = {entity: this.pageName};

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterTradeProgram: FormControl = new FormControl();
  public filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;
  ENABLE_IMPORT_IF = ['done', 'failed'];
  totalSelected = 0;
  importAudienceResult = {
    is_valid: 0,
    preview_id: null,
    preview_task_id: null,
    total_selected: 0,
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.isDetail) return true;
    if (this.exportTemplate) return true;

    if ((this.valueChange && !this.saveData) || (this.selected.length !== this.detailAudience.total_audiences && !this.saveData)) {
      return false;
    }

    console.log(this.downloadLink);

    return true;
  }

  paramImportTranslate = {entity: 'CSV'};

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private rupiahFormater: RupiahFormaterPipe,
    private dialog: MatDialog,
    private geotreeService: GeotreeService,
    private idbService: IdbService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.exportTemplate = false;
    this.saveData = false;
    this.rows = [];

    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.formAudienceError = {
      name: {},
      min: {},
      max: {},
      trade_scheduler_id: {}
    }

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SLSNTL"
      }
    ];

    if(this.dataService.getDecryptedProfile()["country"] == 'PH'){
      this.retailClassification.push({ name: "ISR", value: "ISR" });
    }

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
    this.area = dataService.getDecryptedProfile()['area_type'];
    this.detailAudience = dataService.getFromStorage('detail_audience');

    // this.listScheduler = activatedRoute.snapshot.data['listScheduler'].data.filter(item =>
    //   item.status_audience === null ||
    //   item.trade_audience_group_id === this.detailAudience.id
    // );

    // this.filteredScheduler.next(this.listScheduler.slice());
    // this.rows = activatedRoute.snapshot.data['listRetailer'];
  }

  ngOnInit() {
    this.idbService.reset();

    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", [Validators.required, Validators.min(0)]],
      max: ["", [Validators.required, Validators.min(0)]],
      limit: [""],
      type: ["", Validators.required],
      audience_type: ["scheduler", Validators.required],
      geotree_checkbox: true,
      // national: [""],
      // division: [""],
      // region: [""],
      // area: [""],
      // district: [""],
      // teritory: [""],
      trade_scheduler_id: [""],
      trade_creator_id: [""],
      business_type: ["all"],
    })

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    });

    this.formFilterRetailer = this.formBuilder.group({
      retail_classification: [''],
      src_classification: [''],
      src_type: ['']
    });

    this.initAudience();
    // this.initArea();
    this.initAreaV2();

    this.pagination['business_type'] = this.detailAudience.business_type;
    // this.getRetailer();

    this.formAudience.controls['limit'].valueChanges.subscribe(res => {
      if (res === 'pick-all') {
        this.formAudience.get('min').disable({ emitEvent: false });
        this.formAudience.get('max').disable({ emitEvent: false });

        // this.formFilter.disable({emitEvent: false});
        // this.getRetailer();
      } else {
        this.formAudience.get('min').enable({ emitEvent: false });
        this.formAudience.get('max').enable({ emitEvent: false });

        this.formFilter.enable({ emitEvent: false });
      }
    })

    this.formAudience.controls['min'].valueChanges.debounceTime(500).subscribe(res => {
      if (this.formAudience.get('min').valid) {
        this.formAudience.get('max').setValidators([Validators.required, Validators.min(res)]);
        this.formAudience.get('max').updateValueAndValidity();
      }
    })

    if (this.detailAudience.type === 'mission') {
      this.getListScheduler();
    } else {
      this.getTradePrograms();
    }

    this.formAudience.get("audience_type").valueChanges.subscribe((data) => {
      if (data === 'scheduler' && this.formAudience.get("type").value === 'mission') {
        this.getListScheduler();
      }
    })
    this.formAudience.get('type')
      .valueChanges
      .subscribe(data => {
        console.log('audience type', data);
        if (data === 'mission') {
          if (this.formAudience.get("audience_type").value === 'scheduler') {
            this.getListScheduler();
            this.formAudience
              .get("trade_scheduler_id")
              .setValidators(Validators.required);
          }
          this.formAudience.get("trade_creator_id").setValidators([]);
          this.formAudience.get("trade_creator_id").clearValidators();
          this.formAudience.get("trade_creator_id").updateValueAndValidity();
        } else {
          this.getTradePrograms();
          this.formAudience.get("trade_creator_id").setValidators(Validators.required);
          this.formAudience.get("trade_scheduler_id").setValidators(Validators.nullValidator);
        }
      });

    this.formAudience.valueChanges.subscribe(() => {
      this.valueChange = true;
    })

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      // this.searchingRetailer(res);
      // this.getRetailer();
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

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('area', res);
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      console.log('area', res, this.formFilter.value['area']);
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      console.log('salespoint', res);
      if (res) {
        this.getAudienceAreaV2('district', res);
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      console.log('district', res);
      if (res) {
        this.getAudienceAreaV2('territory', res);
      }
    });

    this.formFilterRetailer.valueChanges.debounceTime(1000).subscribe((res) => {
      this.getRetailer();
    });

    this.formAudience.get("business_type").valueChanges.debounceTime(1000).subscribe((res) => {
      this.selected = [];

      if (res) {
        this.pagination['business_type'] = res;
      } else {
        delete this.pagination['business_type'];
      }

      this.getRetailer();
    });

    this.formFilterRetailer.get('retail_classification').valueChanges.subscribe((res) => {
      if (res) {
        this.pagination['classification'] = res;
      } else {
        delete this.pagination['classification'];
      }
    });
  }

  loadFormFilter() {
    this.getRetailer();
  }

  initAreaV2() {
    let areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    let sameArea = this.geotreeService.diffLevelStarted;
    let areasDisabled = this.geotreeService.disableArea(sameArea);
    this.lastLevel = areasDisabled;
    let lastLevelDisabled = null;
    let levelAreas = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    let lastDiffLevelIndex = levelAreas.findIndex(level => level === (sameArea.type === 'teritory' ? 'territory' : sameArea.type));

    if (!this.formFilter.get('national') || this.formFilter.get('national').value === '') {
      this.formFilter.get('national').setValue(1);
      this.formFilter.get('national').disable();
      lastLevelDisabled = 'national';
    }
    areas.map((area, index) => {
      area.map((level, i) => {
        let level_desc = level.level_desc;
        let levelIndex = levelAreas.findIndex(lvl => lvl === level.type);
        if (lastDiffLevelIndex > levelIndex - 2) {
          if (!this.list[level.type]) this.list[level.type] = [];
          if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value || this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            console.log('ff value', this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) this.formFilter.get(this.parseArea(level.type)).disable();
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
          }

          let isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          console.log('area you choose', level.type, this.parseArea(level.type), this.geotreeService.getNextLevel(this.parseArea(level.type)));
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);

          if (i === area.length - 1) {
            this.endArea = this.parseArea(level.type);
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }
        }
      });
    });

    // let mutableAreas = this.geotreeService.listMutableArea(lastLevelDisabled);
    // mutableAreas.areas.map((ar, i) => {
    //   this.list[ar].splice(1, 1);
    // });
  }

  parseArea(type) {
    // return type === 'division' ? 'zone' : type;
    switch (type) {
      case 'division':
        return 'zone';
      case 'teritory':
      case 'territory':
        return 'territory';
      default:
        return type;
    }
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    let fd = new FormData();
    let lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
    // console.log('areaSelected', areaSelected, selection, lastLevel, Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })));
    console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== "") {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        })
        // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
        if (areaSelected[0].value.length === 0) {
          let beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
          let newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
          console.log('the selection', this.parseArea(selection), newAreaSelected);
          if (newAreaSelected[0].key !== 'national') {
            newAreaSelected[0].value.map(ar => {
              fd.append('area_id[]', ar);
            })
          } else {
            fd.append('area_id[]', newAreaSelected[0].value);
          }
        }
      }
    } else {
      let beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
      // console.log('new', beforeLastLevel, areaSelected);
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== "") {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          })
          // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
          if (areaSelected[0].value.length === 0) {
            let beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            let newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
            console.log('the selection', this.parseArea(selection), newAreaSelected);
            if (newAreaSelected[0].key !== 'national') {
              newAreaSelected[0].value.map(ar => {
                fd.append('area_id[]', ar);
              })
            } else {
              fd.append('area_id[]', newAreaSelected[0].value);
            }
          }
        }
      }
    }

    fd.append('area_type', selection === 'territory' ? 'teritory' : selection);
    let thisAreaOnSet = [];
    let areaNumber = 0;
    let expectedArea = [];
    if (!this.formFilter.get(this.parseArea(selection)).disabled) {
      thisAreaOnSet = this.areaFromLogin[0] ? this.areaFromLogin[0] : [];
      if (this.areaFromLogin[1]) thisAreaOnSet = [
        ...thisAreaOnSet,
        ...this.areaFromLogin[1]
      ];

      thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id));
      // console.log('on set', thisAreaOnSet, selection, id);
    }


    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.dataService.showLoading(true);
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
          this.dataService.showLoading(false);
          // fd = null
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
        console.log('zone selected', selection, this.list['region'], this.formFilter.get('region').value);
        break;
      case 'region':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              this.dataService.showLoading(false);
            });
          } else {
            this.list[selection] = [];
            this.dataService.showLoading(false);
          }
        } else {
          this.list['region'] = [];
          this.dataService.showLoading(false);
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
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          console.log('area hitted', selection, item, this.list['region']);
          if (item && item.name && item.name !== 'all') {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              this.dataService.showLoading(false);
            });
          } else {
            this.list[selection] = [];
            this.dataService.showLoading(false);
          }
        } else {
          this.list['area'] = [];
          this.dataService.showLoading(false);
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
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          console.log('item', item);
          if (item && item.name && item.name !== 'all') {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              this.dataService.showLoading(false);
            });
          } else {
            this.list[selection] = [];
            this.dataService.showLoading(false);
          }
        } else {
          this.list['salespoint'] = [];
          this.dataService.showLoading(false);
        }

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              this.dataService.showLoading(false);
            });
          } else {
            this.list[selection] = [];
            this.dataService.showLoading(false);
          }
        } else {
          this.list['district'] = [];
          this.dataService.showLoading(false);
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              this.dataService.showLoading(false);
              // fd = null
            });
          } else {
            this.list[selection] = [];
            this.dataService.showLoading(false);
          }
        } else {
          this.list['territory'] = [];
          this.dataService.showLoading(false);
        }

        this.formFilter.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  getTradePrograms() {
    this.audienceService.getListTradePrograms({ id: this.detailAudience.trade_creator_id }).subscribe(res => {
      console.log('res trade programs', res);
      this.listTradePrograms = res.data;
      this.filteredTradeProgram.next(this.listTradePrograms.slice());
    }, err => {
      console.log('err trade programs', err);
    });
  }

  getListScheduler() {
    this.audienceService.getListScheduler({ id: this.detailAudience.trade_scheduler_id }).subscribe(res => {
      console.log('res scheduler new', res);
      this.listScheduler = res.data;
      this.filteredScheduler.next(this.listScheduler.slice());
    }, err => {
      console.log('err list scheduler new', err);
    });
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
    this.formAudience.get('limit').setValue('limit');
    this.formAudience.get('audience_type').setValue(this.detailAudience.audience_type);
    this.formAudience.get('business_type').setValue(this.detailAudience.business_type);
    this.formAudience.get('type').setValue(this.detailAudience.type);
    if (this.detailAudience.type === 'mission' && this.detailAudience.audience_type === 'scheduler') this.formAudience.get('trade_scheduler_id').setValue(this.detailAudience.trade_scheduler_id);
    if (this.detailAudience.type === 'challenge') this.formAudience.get('trade_creator_id').setValue(this.detailAudience.trade_creator_id);

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
      this.formAudience.get('trade_creator_id').disable();
      this.formAudience.get('audience_type').disable();
    }

    console.log('init audience', this.formAudience);

    // this.formFilter.disable();

    this.detailAudienceSelect();
    if (this.isDetail) {
      this.formAudience.disable();
      this.formFilter.disable();
    }
  }

  checkAreaLocation(area, lastSelfArea) {
    let lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    let areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    let indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    let indexAreaSelected = areaList.indexOf(area.key);
    let rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = []
    // console.log('[checkAreaLocation:area]', area);
    // console.log('[checkAreaLocation:lastLevelFromLogin]', lastLevelFromLogin);
    // console.log('[checkAreaLocation:areaAfterEndLevel]', areaAfterEndLevel);
    if (area.value !== 1) {
      // console.log('[checkAreaLocation:list]', this.list[area.key]);
      // console.log('[checkAreaLocation:indexAreaAfterEndLevel]', indexAreaAfterEndLevel);
      // console.log('[checkAreaLocation:indexAreaSelected]', indexAreaSelected);
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // let sameAreas = this.list[area.key].filter(ar => area.value.includes(ar.id));
        let areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
        // console.log('[checkAreaLocation:list:areaAfterEndLevel', this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)), areaSelectedOnRawValues);
        // console.log('[checkAreaLocation:newLastSelfArea]', newLastSelfArea);
      }
    }

    return newLastSelfArea;
  }

  getRetailer() {
    console.log('getRetailer');
    this.pagination.per_page = 25;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    let area_id = areaSelected[areaSelected.length - 1].value;
    this.pagination.area = area_id;

    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {

      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        let second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id
        ];
        self_area = [
          ...self_area,
          ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
        ];
      }

      let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) delete this.pagination['after_level'];
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
        } else {
          // console.log('its hitted [other level]');
          this.pagination['after_level'] = true;
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // console.log('its hitted [other level other]');
        this.pagination['after_level'] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      }
    }

    this.loadingIndicator = true;
    this.pagination.area = this.formAudience.get('limit').value === 'pick-all' ? 1 : area_id;

    this.audienceService.getListRetailerForAudienceList(this.getListRetailerParam, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.pagination.page = 1;

      this.rows = res.data;
      this.loadingIndicator = false;
    })
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.audienceService.getListRetailerForAudienceList(this.getListRetailerParam, this.pagination).subscribe(res => {
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

    this.audienceService.getListRetailerForAudienceList(this.getListRetailerParam, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }

  detailAudienceSelect() {
    this.audienceService.getListRetailerIdSelected({ audience_id: this.detailAudience.id }).subscribe(
      res => {
        console.log('this.selected', res);
        this.selected = res;
        this.getListRetailerParam.selected_businesses = res.map((it) => it.id);
        this.formAudience.get('min').setValue(this.detailAudience.min ? this.detailAudience.min : 1);
        this.formAudience.get('max').setValue(this.detailAudience.max ? this.detailAudience.max : res.length);
        this.getRetailer();
      }
    )
  }

  getRows(id) {
    let index = this.rows.map(item => item.id).indexOf(id);
    return this.rows[index];
  }

  searchingRetailer(res) {
    console.log('searchingRetailer');
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    let area_id = areaSelected[areaSelected.length - 1].value;

    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {

      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        let second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id
        ];
        self_area = [
          ...self_area,
          ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
        ];
      }

      let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) delete this.pagination['after_level'];
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
        } else {
          // console.log('its hitted [other level]');
          this.pagination['after_level'] = true;
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // console.log('its hitted [other level other]');
        this.pagination['after_level'] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      }
    }

    this.loadingIndicator = true;

    this.audienceService.getListRetailerSelected({ audience_id: this.detailAudience.id }, { area: area_id }).subscribe(
      res => {
        this.rows = res['data'];
        this.selected = [];
        this.loadingIndicator = false;

        if (res['data'].length === 0) {
          this.loadingIndicator = false;
          return this.rows = [];
        }
      },
      err => {
        console.log(err.error.message);
        this.loadingIndicator = false;
      }
    )
  }

  changeValue() {
    if (this.formAudience.get('limit').value === 'pick-all') {
      this.selected = this.rows;
    } else {
      this.selected = []
    }
  }

  tsmOrScheduler() {
    console.log('');
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log(this.selected);
  }

  selectFn(allRowsSelected: boolean) {
    console.log('allRowsSelected_', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    if (allRowsSelected) {
      this.selected = [];
      this.formAudience.get('limit').setValue('pick-all');
    } else {
      this.formAudience.get('limit').setValue('limit');
    }
  }

  getId(row) {
    return row.id;
  }

  submit() {

    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    if(!this.formAudience.valid) {
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      commonFormValidator.validateAllFields(this.formAudience);

      return this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
    }

    if(this.formAudience.valid && this.selected.length == 0 && !this.allRowsSelected) {
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      commonFormValidator.validateAllFields(this.formAudience);

      return this.dialogService.openSnackBar({ message: this.translate.instant('dte.audience.please_select_audience') });
    }

    const selectedRetailer = this.selected.length;
    const limit = this.formAudience.get('limit').value === 'limit';
    const min = this.formAudience.get('min').value;
    const max = this.formAudience.get('max').value;

    if (limit && selectedRetailer < min) {
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      return this.dialogService.openSnackBar({
        message: this.translate.instant('dte.audience.min_audience', {min: min}),
      });
    } else if (limit && selectedRetailer > max) {
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      return this.dialogService.openSnackBar({
        message: this.translate.instant('dte.audience.max_audience', {max: max}),
      });
    }

    // Audience Type = TSM, Type = any
    if (this.formAudience.get("audience_type").value === "tsm") {
      let body = {
        _method: 'PUT',
        name: this.formAudience.get("name").value,
        trade_creator_id: this.formAudience.get("type").value === 'challenge' ? this.formAudience.get("trade_creator_id").value : null,
        business_type: this.formAudience.get("business_type").value,
      };

      body["type"] = this.formAudience.get("type").value;
      body["audience_type"] = this.formAudience.get("audience_type").value;

      if (this.formAudience.get("limit").value !== "pick-all") {
        body["retailer_id"] = this.selected.map((item) => item.id);
        body["min"] = this.formAudience.get("min").value;
        body["max"] = this.formAudience.get("max").value;
      } else {
        body["area_id"] = this.pagination.area;

        if (this.pagination.area !== 1) {
          body["min"] = 1;
          body["max"] = this.pagination.total;
        } else {
          body["min"] = "";
          body["max"] = "";
        }
      }


      if (this.allRowsSelected) {
        body['all'] = '1';
        body["retailer_id"] = null;
        body["query_audience"] = {...this.pagination};
      } else {
        body['all'] = '0';
      }

      this.saveData = true;
      this.audienceService.put(body, { audience_id: this.detailAudience.id }).subscribe(
        (res) => {
          this.dataService.showLoading(false);
          this.loadingIndicator = false;
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22,
          });
          this.router.navigate(["dte", "audience"]);
        },
        (err) => {
          this.dataService.showLoading(false);
          this.loadingIndicator = false;
          // this.dialogService.openSnackBar({ message: err.error.message })
          console.log(err.error.message);
        }
      );
    }

    // Audience Type = Scheduler, Type = Mission
    if (this.formAudience.get("audience_type").value === "scheduler" && this.formAudience.get("type").value === "mission") {
      let budget = {
        total_retailer: limit ? this.selected.length : this.pagination.total,
        trade_scheduler_id: this.formAudience.get("trade_scheduler_id").value,
      };
      this.audienceService.validateBudget(budget).subscribe((res) => {
        if (res.selisih < 0) {
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
          return this.dialogService.openSnackBar({
            message: this.translate.instant('dte.audience.max_funds', {funds: this.rupiahFormater.transform(res.selisih) }),
          });
        }

        let body = {
          _method: 'PUT',
          name: this.formAudience.get("name").value,
          trade_scheduler_id: this.formAudience.get("trade_scheduler_id").value,
          business_type: this.formAudience.get("business_type").value,
        };

        if (this.formAudience.get("limit").value !== "pick-all") {
          body["retailer_id"] = this.selected.map((item) => item.id);
          body["min"] = this.formAudience.get("min").value;
          body["max"] = this.formAudience.get("max").value;
        } else {
          body["area_id"] = this.pagination.area;

          if (this.pagination.area !== 1) {
            body["min"] = 1;
            body["max"] = this.pagination.total;
          } else {
            body["min"] = "";
            body["max"] = "";
          }
        }

        body["type"] = this.formAudience.get("type").value;
        body["audience_type"] = this.formAudience.get("audience_type").value;

        if (body["type"] === "mission") {
          body["trade_scheduler_id"] = this.formAudience.get(
            "trade_scheduler_id"
          ).value;
          if (body["trade_creator_id"]) delete body["trade_creator_id"];
        } else {
          body["trade_creator_id"] = this.formAudience.get(
            "trade_creator_id"
          ).value;
          if (body["trade_scheduler_id"]) delete body["trade_scheduler_id"];
        }

        if (this.allRowsSelected) {
          body['all'] = '1';
          body["retailer_id"] = null;
          body["query_audience"] = {...this.pagination};
        } else {
          body['all'] = '0';
        }

        console.log(this.findInvalidControls());
        // this.saveData = !this.saveData;
        this.saveData = true;
        this.audienceService.put(body, { audience_id: this.detailAudience.id }).subscribe(
          (res) => {
            this.dataService.showLoading(false);
            this.loadingIndicator = false;
            this.dialogService.openSnackBar({
              message: this.ls.locale.notification.popup_notifikasi.text22,
            });
            this.router.navigate(["dte", "audience"]);
          },
          (err) => {
            this.dataService.showLoading(false);
            this.loadingIndicator = false;
            // this.dialogService.openSnackBar({ message: err.error.message })
            console.log(err.error.message);
          }
        );
      });
    } else if (this.formAudience.get("audience_type").value === "scheduler" && this.formAudience.get("type").value === "challenge") {
      let body = {
        _method: 'PUT',
        name: this.formAudience.get("name").value,
        trade_creator_id: this.formAudience.get("trade_creator_id").value,
        business_type: this.formAudience.get("business_type").value,
      };

      if (this.formAudience.get("limit").value !== "pick-all") {
        body["retailer_id"] = this.selected.map((item) => item.id);
        body["min"] = this.formAudience.get("min").value;
        body["max"] = this.formAudience.get("max").value;
      } else {
        body["area_id"] = this.pagination.area;

        if (this.pagination.area !== 1) {
          body["min"] = 1;
          body["max"] = this.pagination.total;
        } else {
          body["min"] = "";
          body["max"] = "";
        }
      }

      body["type"] = this.formAudience.get("type").value;
      body["audience_type"] = this.formAudience.get("audience_type").value;

      if (body["type"] === "mission") {
        body["trade_scheduler_id"] = this.formAudience.get(
          "trade_scheduler_id"
        ).value;
        if (body["trade_creator_id"]) delete body["trade_creator_id"];
      } else {
        body["trade_creator_id"] = this.formAudience.get(
          "trade_creator_id"
        ).value;
        if (body["trade_scheduler_id"]) delete body["trade_scheduler_id"];
      }

      if (this.allRowsSelected) {
        body['all'] = '1';
        body["retailer_id"] = null;
        body["query_audience"] = {...this.pagination};
      } else {
        body['all'] = '0';
      }

      console.log(this.findInvalidControls());
      // this.saveData = !this.saveData;
      this.saveData = true;
      this.audienceService.put(body, { audience_id: this.detailAudience.id }).subscribe(
        (res) => {
          this.dataService.showLoading(false);
          this.loadingIndicator = false;
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22,
          });
          this.router.navigate(["dte", "audience"]);
        },
        (err) => {
          this.dataService.showLoading(false);
          this.loadingIndicator = false;
          // this.dialogService.openSnackBar({ message: err.error.message })
          console.log(err.error.message);
        }
      );
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

  updateAudience() {
    if (this.selected.length > 0) {
      let audience = this.formAudience.getRawValue();
      let budget = {
        total_retailer: audience['type'] === 'limit' ? this.selected.length : this.pagination.total,
        trade_scheduler_id: audience.trade_scheduler_id
      }

      const selectedRetailer = this.selected.length;
      const limit = audience['type'] === 'limit';
      const min = audience['min'];
      const max = audience['max'];

      if (limit && selectedRetailer < min)
        return this.dialogService.openSnackBar({ message: this.translate.instant('dte.audience.min_audience', {min: min}) });
      else if (limit && selectedRetailer > max)
        return this.dialogService.openSnackBar({ message: this.translate.instant('dte.audience.max_audience', {max: max}) });

      this.audienceService.validateBudget(budget).subscribe(res => {
        if (res.selisih < 0)
          return this.dialogService.openSnackBar({ message: this.translate.instant('dte.audience.max_funds', {funds: this.rupiahFormater.transform(res.selisih) }) })

        let body = {
          _method: 'PUT',
          name: audience['name'],
          trade_scheduler_id: audience['trade_scheduler_id'],
          // min: audience.min,
          // max: audience.max,
        }

        if (audience['type'] !== 'pick-all') {
          body['retailer_id'] = this.selected.map(item => item.id);
          body['min'] = audience.min;
          body['max'] = audience.max;

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

        this.saveData = !this.saveData;
        this.audienceService.put(body, { audience_id: this.detailAudience.id }).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: this.translate.instant('dte.template_tugas.updated_data') })
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
      return this.dialogService.openSnackBar({ message: this.translate.instant('dte.audience.please_select_audience') });
    }
  }

  importAudience() {
    const dialogConfig = new MatDialogConfig();
    const {
      id: trade_audience_group_id,
      import_audience_status,
      import_audience_status_type,
    } = this.detailAudience;

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = {
      password: 'P@ssw0rd',
      trade_audience_group_id,
      // import_audience_status,
      // import_audience_status_type,
      IMPORT_TYPE: 'AUDIENCE',
      min: this.formAudience.get('min').value,
      max: this.formAudience.get('max').value,
      audience_type: this.formAudience.get('audience_type').value,
      type: this.formAudience.get('type').value
    };

    this.dialogRef = this.dialog.open(ImportAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      this.detailAudience = this.dataService.getFromStorage('detail_audience');

      if (!this.ENABLE_IMPORT_IF.includes(this.detailAudience.import_audience_status)) {
        this.formAudience.get("business_type").setValue("all");
        this.formAudience.get("business_type").disable();
      } else {
        this.formAudience.get("business_type").enable();
      }

      if (response) {

        this.importAudienceResult = {...response};
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
        this.router.navigate(["dte", "audience"]);
        // this.selected = response;
        // this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
      }
    });
  }

  async exportAudience() {
    this.dataService.showLoading(true);
    this.exportTemplate = true;
    const body = {
      retailer_id: this.selected.length > 0 ? this.selected.map(item => item.id) : []
    }

    try {
      const response = await this.audienceService.exportExcel(body).toPromise();
      this.downloadLink.nativeElement.href = response.data;
      this.downloadLink.nativeElement.click();
      setTimeout(() => {
        this.exportTemplate = false;
        this.dataService.showLoading(false);
      }, 3000);

    } catch (error) {
      this.exportTemplate = false;
      this.dataService.showLoading(false);
      throw error;
    }
  }

}
