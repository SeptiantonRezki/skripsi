import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'app/classes/config';
import { LanguagesService } from 'app/services/languages/languages.service';
import { InfoBoardService } from "app/services/dte/info-board.service";
import { DialogService } from 'app/services/dialog.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { GeotreeService } from 'app/services/geotree.service';
import { DataService } from 'app/services/data.service';
import { ImportAudiencePersonalizeInfoBoardComponent } from '../import/personalize/import-audience-personalize.component';
import { ProductService } from 'app/services/sku-management/product.service';
import { DialogProcessComponentIB } from '../dialog/dialog-process/dialog-process.component';
import { DialogProcessSaveIBComponent } from '../dialog/dialog-process-save-ib/dialog-process-save-ib.component';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { BtoBVoucherService } from 'app/services/bto-bvoucher.service';
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-info-board-edit',
  templateUrl: './info-board-edit.component.html',
  styleUrls: ['./info-board-edit.component.scss']
})
export class InfoBoardEditComponent implements OnInit {
  selectedTab: number = 0;

  formBoard: FormGroup;
  onLoad: boolean;
  minDateStart = new Date();
  minDateEnd = new Date();
  formFilter: FormGroup;
  formGeo: FormGroup;
  isPopulation: boolean = true;
  data_imported: any = [];
  exportTemplate: Boolean;
  dialogRef: any;
  isChecked: boolean = false;
  panelBlast: number;
  selectedZone = [];
  selectedRegion = [];
  selectedArea = [];
  loadingZone = true;
  loadingRegion = false;
  loadingArea = false;
  list: any;
  areaFromLogin;
  isFreeText = false;
  listBrands = [];
  public filterBrand: FormControl = new FormControl();
  public filteredBrand: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );
  isFour = false;
  productList: any[] = [];
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  keyUpProduct = new Subject<string>();
  product: FormControl = new FormControl('');
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  filteredSkuOptions: Observable<string[]>;
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl('');
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  inputChipList = [];
  listProductSkuBank: Array<any> = [];
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  showDetail: any;
  infoBoard: any[] =
  [
      { name: 'Ensure new order is processed within 6 hours (P0)', value: 'task-ensure-new-order-opt-p0' },
      { name: 'Ensure process order is ready / sent within 24 hours (P0)', value: 'task-ensure-process-order-opt-p0' },
      { name: 'Upload HMS products (P0)', value: 'task-upload-hms-product-sc-p0' },
      { name: 'Upload Top Selling Products (P0)', value: 'task-upload-top-selling-sc-p0' },
      { name: 'Upload NPL from HMS products (P0)', value: 'task-upload-npl-product-sc-p0' },
      { name: 'Upload product image for SKU without image (P1)', value: 'task-upload-product-image-sku-sc-p1' },
      { name: 'Revise wrong product data Name & Category (P1)', value: 'task-revise-wrong-product-sc-p1' },
      { name: 'Revise wrong / unclear product image (P2)', value: 'task-revise-wrong-unclear-sc-p2' },
      { name: 'Create Reward Catalog (P1)', value: 'task-create-reward-catalog-plp-p1' },
      { name: 'Create loyalty poin scheme (P1)', value: 'task-create-loyalty-poin-plp-p1' },
      { name: 'FREE TEXT', value: 'task-free-text' },
  ]

  public audienceFixed: FormControl = new FormControl();
  public audiencePopulation: FormControl = new FormControl();

  @ViewChild('downloadLink') downloadLink: ElementRef;

  listGroupTradeProgram: any[] = [];
  listSubGroupTradeProgram: any[] = [];

  private _onDestroy = new Subject<void>();
  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterSGTP: FormControl = new FormControl();
  public filteredSGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public options: Object = { ...Config.FROALA_CONFIG, placeholderText: "" };

  retailClassification: any[] = [
    { name: this.ls.locale.global.label.all + " " + this.ls.locale.call_objective.text9, value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
  ];
  status: any[] = [
    { name: 'Publish', value: 'publish' },
    { name: 'Unpublish', value: 'unpublish' }
  ];

  geoLevel: string[] = ["national", "division", "region", "area"];
  geoList: any = {
    national: [
      {
        id: 1,
        parent_id: null,
        code: "SLSNTL",
        name: "SLSNTL",
      },
    ],
  };
  isDetail: Boolean;
  detailFormBoard: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private infoBoardService: InfoBoardService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private geoService: GeotreeService,
    private geotreeService: GeotreeService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private b2bVoucherService: BtoBVoucherService,
  ) {
    this.onLoad = true;

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    };

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    });

    this.detailFormBoard = this.dataService.getFromStorage('detail_info_board');

  }

  ngOnInit() {
    this.keyUpProduct.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.getListProduct(res);
        this.resetField(res);
      });
    const status = this.dataService.getFromStorage('free_text');
    if (status ===  true) {
      this.selectedTab = 1;
      this.dataService.setToStorage('free_text', false);
    }
    this.formBoard = this.formBuilder.group({
      name_board: ["", Validators.required],
      description_board: ["", Validators.required],
      type: [""],
      start_date: [new Date()],
      start_time: ["00:00", Validators.required],
      end_date: [new Date()],
      end_time: ["00:00", Validators.required],
      status: [""],
      product: [""],
    });
    this.infoBoardService.type().subscribe(
      res => {
        this.infoBoard = res.data ? res.data.data : [];
      },
      err => {
        console.error(err);
      }
    );

    this.formGeo = this.formBuilder.group({
      national: [{ value: [1], disabled: true }],
      division: [""],
      region: [""],
      area: [""],
      classification:  [['all']],
      audiencePopulation: [""]
    });

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })
    this.onLoad = false;

    this.getLevel('national');

    this.setStorageDetail();

    this.formBoard.get('type').valueChanges.subscribe(res => {
      if (res === 1) {
        this.isFreeText = true;
      } else {
        this.isFreeText = false;
      }
      if (res === 4) {
        this.isFour = true;
      } else {
        this.isFour = false;
      }
    });

    this.formGeo.get('division').valueChanges.subscribe(res => {
      this.loadingRegion = true;
      console.log('berhasil');
      this.getLevel('division');
    });
    this.formGeo.get('region').valueChanges.subscribe(res => {
      this.loadingArea = true;
      this.getLevel('region');
    });


    if (this.isDetail) {
      this.formBoard.get('type').disable();
      this.formBoard.get('name_board').disable();
      this.formBoard.get('description_board').disable();
      this.formBoard.get('start_date').disable();
      this.formBoard.get('start_time').disable();
      this.formBoard.get('end_date').disable();
      this.formBoard.get('end_time').disable();
      this.formBoard.get('status').disable();
    }

    this.getBrands();
    this.filterBrand.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringKeyword();
      });
  }

  getBrands() {
    this.productService.getListBrand().subscribe(res => {
      this.listBrands = res.data ? res.data.data : [];
      this.filteredBrand.next(res.data ? res.data.data : []);
    });
  }

  filteringKeyword() {
    if (!this.listBrands) {
      return;
    }
    // get the search keyword
    let search = this.filterBrand.value;
    if (!search) {
      this.filteredBrand.next(this.listBrands.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the brand
    this.filteredBrand.next(
      this.listBrands.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  setStorageDetail() {
    // Show detail
    this.showDetail = this.infoBoardService.detail(this.detailFormBoard.id).subscribe(res => { 
      if (res.data) {
        this.dataService.setToStorage('detail_info_board', res.data);

        this.formBoard.setValue({
          name_board: res.data.name,
          description_board: res.data.description,
          type: res.data.business_infoboard_type_id,
          start_date: this.convertDate(res.data.start_date),
          start_time: this.convertTime(res.data.start_date ? res.data.start_date : ''),
          end_date: this.convertDate(res.data.end_date),
          end_time: this.convertTime(res.data.end_date ? res.data.end_date : ''),
          status: res.data.status,
          product: res.data['limit_only'] ? res.data.limit_only : '',
        });
        this.productList = res.data['limit_only'] ? res.data.limit_only : [];

        let zone = [];
        if (res.data.areas['zone']) {
          zone = res.data.areas['zone'];
        }
        this.selectedZone = zone;

        if (res.data.business_infoboard_type_id === 4) {
          this.isFour = true;
        } else {
          this.isFour = false;
        }

        this.panelBlast = res.data.panel_count;

        const filter = res.data.audience_filter;
        this.handleAudienceFilter(filter);

        if (res.data.panel_count > 0) {
          this.isChecked = true;
        }

        this.initAreaSelected(res.data);
      }
    });
  }

  initAreaSelected(data = null) {
    let arr = data.areas;
    let arr_area = [];
    let arr_region = [];

    if (arr['area']) {
      arr_area = arr['area'];
    }
    if (arr['region']) {
      arr_region = arr['region'];
    }

    if (arr_region.length === 0 || parseInt(arr_region[0], 10) === 0) {
      this.loadingRegion = false;
    }
    if (arr_area.length === 0 || parseInt(arr_area[0], 10) === 0) {
      this.loadingArea = false;
    }
    this.selectedRegion = arr_region;
    this.selectedArea = arr_area;
  }

  getLevel(value: string) {
    const level = this.formGeo.get(value).value;
    const index = this.geoLevel.indexOf(value);

    if (index + 1 <= this.geoLevel.length) {
      this.resetLevel(value);

      const fd = new FormData();
      const subLevel = this.geoLevel[index + 1];
      fd.append("area_type", subLevel);

      if (level.length) {
        level.forEach((item: any) => {
          fd.append("area_id[]", item);
        });
      } else {
        fd.append("area_id[]", "");
      }

      this.geoService.getChildFilterArea(fd).subscribe((res) => {
        this.geoList[subLevel] = res.data;

        if (value === 'national' && this.selectedZone.length > 0) {
          console.log('berhasil2', this.selectedZone);
          this.formGeo.get('division').setValue(this.selectedZone);
          this.selectedZone = [];
        } else if (value === 'division' && this.selectedRegion.length > 0) {
          this.formGeo.get('region').setValue(this.selectedRegion);
          this.selectedRegion = [];
        } else if (value === 'region' && this.selectedArea.length > 0) {
          this.formGeo.get('area').setValue(this.selectedArea);
          this.selectedArea = [];
        }
        if (value === 'national' && this.loadingZone === true) {
          this.loadingZone = false;
        }
        if (value === 'division' && this.loadingRegion === true) {
          this.loadingRegion = false;
        }
        if (value === 'region' && this.loadingArea === true) {
          this.loadingArea = false;
        }
      });
    }

  }

  resetLevel(value) {
    let current = false;
    this.geoLevel.forEach((item) => {
      if (item === value) {
        current = true;
        return;
      }
      if (current) {
        // this.formGeo.get(item).setValue("");
        this.geoList[item] = [];
      }
    });
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
            // console.log('ff value', this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) this.formFilter.get(this.parseArea(level.type)).disable();
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            // console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
          }

          let isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          // console.log('area you choose', level.type, this.parseArea(level.type), this.geotreeService.getNextLevel(this.parseArea(level.type)));
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
    // console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
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
          // console.log('the selection', this.parseArea(selection), newAreaSelected);
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
            // console.log('the selection', this.parseArea(selection), newAreaSelected);
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
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

          if (this.detailFormBoard.hasOwnProperty('zones')) {
            const zones = this.detailFormBoard.zones[0];
            const detailZones = zones > 1 ? this.detailFormBoard.zones : [];
            this.formFilter.get('zone').setValue(detailZones);
            this.detailFormBoard.zone = true
          }
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
        // console.log('zone selected', selection, this.list['region'], this.formFilter.get('region').value);
        break;
      case 'region':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              if (this.detailFormBoard.hasOwnProperty('regions')) {
                const regions = this.detailFormBoard.regions[0];
                const detailRegions = regions > 1 ? this.detailFormBoard.regions : [];
                this.formFilter.get('region').setValue(detailRegions);
              }
            });
          } else {
            this.list[selection] = []
          }
        } else {
          this.list['region'] = [];
        }
        // this.formFilter.get('region').setValue('');
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
          // console.log('area hitted', selection, item, this.list['region']);
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              if (this.detailFormBoard.hasOwnProperty('areas')) {
                const areas = this.detailFormBoard.areas[0];
                const detailAreas = areas > 1 ? this.detailFormBoard.areas : [];
                this.formFilter.get('area').setValue(detailAreas);
              }
            });
          } else {
            this.list[selection] = []
          }
        } else {
          this.list['area'] = [];
        }

        // this.formFilter.get('area').setValue('');
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
          // console.log('item', item);
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
          }
        } else {
          this.list['salespoint'] = [];
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
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
          }
        } else {
          this.list['district'] = [];
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
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

              // fd = null
            });
          } else {
            this.list[selection] = []
          }
        } else {
          this.list['territory'] = [];
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

  submit() {
    if (this.formBoard.valid) {

      const body = {
        _method: 'PUT',
        name: this.formBoard.get('name_board').value,
        type_id: this.formBoard.get('type').value,
        description: this.formBoard.get('description_board').value,
        start_date: `${moment(this.formBoard.get('start_date').value).format('YYYY-MM-DD')} ${this.formBoard.get('start_time').value}:00`,
        end_date: `${moment(this.formBoard.get('end_date').value).format('YYYY-MM-DD')} ${this.formBoard.get('end_time').value}:00`,
        status: this.formBoard.get('status').value,
        limit_by: 'product',
        limit_only: this.productList.map(prd => prd.sku_id)
      };

      this.infoBoardService.put(body, { id: this.detailFormBoard.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.router.navigate(['user-management', 'info-board']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formBoard);
    }
  }

  submitAudience() {
    let body = {};
    const id = this.dataService.getFromStorage('detail_info_board').id;
    if (this.isPopulation === true) {
      body = {
        infoboard_id: id,
        audience_filter: 'population-blast',
        zones: this.formGeo.get('division').value.length > 0 && parseInt(this.formGeo.get('division').value[0], 10) !== 0 ? this.formGeo.get('division').value : ['all'],
        regions: this.formGeo.get('region').value.length > 0 && parseInt(this.formGeo.get('region').value[0], 10) !== 0 ? this.formGeo.get('region').value : ['all'],
        areas: this.formGeo.get('area').value && this.formGeo.get('area').value.length > 0 && parseInt(this.formGeo.get('area').value[0], 10) !== 0 ? this.formGeo.get('area').value : ['all']
      };
    } else {
      body = {
        infoboard_id: id,
        audience_filter: 'fixed-panel',
        wholesalers: this.data_imported.map(item => item.id)
      };
    }

    const dialogConfig = new MatDialogConfig();
  
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = "scrumboard-card-dialog";
      dialogConfig.data = { password: "P@ssw0rd" };
  
      this.dialogRef = this.dialog.open(
        DialogProcessComponentIB,
        {...dialogConfig, width: '400px'}
      );

      const processCheck = this.infoBoardService.checkAudience(body).subscribe(
        (res) => {
          if (res.data) {
            this.isChecked = true;
            this.panelBlast = res.data.panel_count;
          }
          this.dialogRef.close();
          this.dialogService.openSnackBar({message : this.translate.instant('global.label.checking_success')});
        },
        (err) => {
          this.dialogRef.close();
        }
      );

      this.dialogRef.afterClosed().subscribe(() => {
        processCheck.unsubscribe();
      });
  }

  saveAudience() {
    let body = {};
    const id = this.dataService.getFromStorage('detail_info_board').id;
    if (this.isPopulation === true) {
      body = {
        infoboard_id: id,
        audience_filter: 'population-blast',
        zones: this.formGeo.get('division').value.length > 0 && parseInt(this.formGeo.get('division').value[0], 10) !== 0 ? this.formGeo.get('division').value : ['all'],
        regions: this.formGeo.get('region').value.length > 0 && parseInt(this.formGeo.get('region').value[0], 10) !== 0 ? this.formGeo.get('region').value : ['all'],
        areas: this.formGeo.get('area').value && this.formGeo.get('area').value.length > 0 && parseInt(this.formGeo.get('area').value[0], 10) !== 0 ? this.formGeo.get('area').value : ['all'],
        panel_count: this.panelBlast
      };
    } else {
      body = {
        infoboard_id: id,
        audience_filter: 'fixed-panel',
        wholesalers: this.data_imported.map(item => item.id),
        panel_count: this.panelBlast
      };
    }

    const dialogConfig = new MatDialogConfig();
  
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      DialogProcessSaveIBComponent,
      {...dialogConfig, width: '400px'}
    );

    const processCheck = this.infoBoardService.saveAudience(body, this.detailFormBoard.id).subscribe(
      (res) => {
        if (res.data) {
          this.isChecked = true;
          this.panelBlast = res.data.panel_count;
        }
        this.router.navigate(['user-management', 'info-board']);
        this.dialogRef.close();
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        // this.dialogService.openSnackBar({message : this.translate.instant('global.label.checking_success')});
      },
      (err) => {
        this.dialogRef.close();
      }
    );

    this.dialogRef.afterClosed().subscribe(() => {
      processCheck.unsubscribe();
    });
  }

  async exportAudience() {
    this.dataService.showLoading(true);
    this.exportTemplate = true;
    const body = {
      retailer_id: [1]
    };

    try {
      const response = await this.infoBoardService.exportExcel(body).toPromise();
      this.downloadLink.nativeElement.href = response.data;
      this.downloadLink.nativeElement.click();
      setTimeout(() => {
        this.dataService.showLoading(false);
        this.exportTemplate = false;
      }, 3000);
    } catch (error) {
      this.dataService.showLoading(false);
      this.exportTemplate = false;
      throw error;
    }
  }

  importAudience() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      ImportAudiencePersonalizeInfoBoardComponent,
      dialogConfig
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.data_imported = response;
      }
    });
  }

  handleClassification(event) {
    if (event.isUserInput) {
      const {value, selected} = event.source;
      const retailer = this.formGeo.get('classification');

      if (value !== 'all' && selected) {
        if (retailer.value.includes('all')) {
          let newValue = retailer.value;
          newValue.shift();
          retailer.setValue(newValue);
        }
      } else if (value === 'all' && selected) {
        let newValue = retailer.value;
        newValue.splice(0, newValue.length);
        retailer.setValue(newValue);
      }
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

  convertTime(param: Date) {
    if (param) {
      return moment(param).format('HH:mm');
    }

    return "";
  }

  handleAudienceFilter(value) {
    if (value === 'population-blast') {
      this.isPopulation = true;
      // this.formGeo.get('audiencePopulation').setValue(value);
      this.audienceFixed.setValue('');
      this.audiencePopulation.setValue(value);
    } else if (value === 'fixed-panel') {
      this.isPopulation = false;
      this.audienceFixed.setValue(value);
      this.audiencePopulation.setValue('');
      // this.formGeo.get('audiencePopulation').setValue('');
    }
  }

  submitPublishUnpublish() {
    const id = this.detailFormBoard.id;
    this.dataService.showLoading(true);
    const body = {
      status: (this.detailFormBoard.status === 'unpublish') ? 'publish' : 'unpublish'
    };
    this.infoBoardService.publishUnpublish({id: id}, body).subscribe(({data}) => {

    this.dataService.showLoading(false);
    this.router.navigate(['user-management', 'info-board']);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (value) {
      this.productList.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.product.setValue(null);
  }

  remove(id: string): void {
    const index = this.productList.findIndex((prd: any) => prd.sku_id === id);

    if (index >= 0) {
      this.productList.splice(index, 1);
    }
  }

  selectedProduct(event: MatAutocompleteSelectedEvent): void {
    // console.log('evenaksdjlak', event);
    this.productList.push(event.option.viewValue);
    if (this.productInput) {
      this.productInput.nativeElement.value = '';
    }
    this.product.setValue(null);
  }

  getProducts() {
    this.b2bVoucherService.getProductList({ page: 'all' }).subscribe(res => {
      this.listProduct = res.data ? res.data : [];
      this.filteredProduct.next(res.data ? res.data : []);
    });
  }

  getProductObj(event, obj) {
    let index = this.productList.findIndex(prd => prd.sku_id === obj.sku_id);
    if (index === -1) {
      this.productList.push(obj);
    }
    if (this.productInput) {
      this.productInput.nativeElement.value = null;
    }

    if (this.inputChipList && this.inputChipList.length > 0) {
      const itemClick = this.inputChipList.filter((item) => {
        return item.toLowerCase().search(obj.name.toLowerCase());
      });

      if (itemClick && itemClick.length > 0) {
        if (itemClick.length === 1 && itemClick[0] !== obj.name && itemClick[0].length < 6) {
          /**
           * jika pencarian produk kurang dari 6 char pencarian tidak akan dilanjutkan
           */
          this.listProductSkuBank = [];
        } else {
          // console.log('this.listProductSkuBank', this.listProductSkuBank)
          this.product.setValue(itemClick.toString());
          if (this.productInput) {
            this.productInput.nativeElement.value = itemClick.toString();
          }
          this.getListProduct(itemClick.toString());
        }
      } else {
        this.product.setValue(null);
        if (this.productInput) {
          this.productInput.nativeElement.value = null;
        }
        this.listProductSkuBank = [];
      }
      setTimeout(() => {
        if (this.productInput) {
          this.productInput.nativeElement.blur();
          this.productInput.nativeElement.focus();
        }
      }, 500);
    }
  }

  displayProductName(param?): any {
    return param ? param.name : param;
  }

  getListProduct(param?): void {
    if (param) {
      const list = param.split(';').join(',').split(',');
      this.inputChipList = list.map((item: any) => {
        if (item.substr(0, 1) === ' ') { // remove space from first char
          item = item.substr(1, item.length);
        }
        if (item.substr(item.length - 1, item.length) === ' ') { // remove space from last char
          item = item.substr(0, item.length - 1);
        }
        return item;
      });
    }
    if (param.length >= 3) {
      this.b2bVoucherService.getProductList({ page: 'all', search: param }).subscribe(res => {
        this.listProductSkuBank = res.data ? res.data : [];
        this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
      })
    } else {
      this.listProductSkuBank = [];
      this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
    }
  }

  _filterSku(value): any[] {
    // console.log('valueee', value);
    const filterValue = value && typeof value == "object" ? value.name.toLowerCase() : (value ? value.toLowerCase() : '');
    return this.listProductSkuBank.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  resetField(data?: any): void {
    const filteredItem = this.listProductSkuBank.filter(item => item.name.toLowerCase() === data.toLowerCase());

    if (filteredItem.length == 0) {
      // this.product = undefined;
    }
  }
}