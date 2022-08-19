import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes';
import { GeotreeService } from 'app/services/geotree.service';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DialogService } from 'app/services/dialog.service';
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig, MatSelect, MatChipInputEvent } from '@angular/material';
import { DialogProcessComponent } from '../../audience/dialog/dialog-process/dialog-process.component';
import { DialogProcessSaveComponent } from '../../audience/dialog/dialog-process-save/dialog-process-save.component';
import { ImportAudiencePersonalizeComponent } from '../../audience/import/personalize/import-audience-personalize.component';
import { B2BVoucherInjectService } from 'app/services/b2b-voucher-inject.service';
import { SupplierCompanyService } from 'app/services/user-management/private-label/supplier-company.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { LotteryService } from "app/services/dte/lottery.service";

@Component({
  selector: 'app-lottery-edit',
  templateUrl: './lottery-edit.component.html',
  styleUrls: ['./lottery-edit.component.scss']
})
export class LotteryEditComponent implements OnInit {
  selectedTab: number;
  panelBlast: number;
  exportTemplate: Boolean;
  isChecked: boolean = false;
  averageCoin: number = 0;
  isPPK: boolean = false;
  isExclude: boolean = false;
  editableCoin: boolean = true;
  selectedZone = [];
  selectedRegion = [];
  selectedArea = [];
  selectedCategory = [];
  loadingZone = true;
  loadingRegion = true;
  loadingArea = true;

  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterSGTP: FormControl = new FormControl();
  public filteredSGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  listGroupTradeProgram: any[] = [];
  listSubGroupTradeProgram: any[] = [];

  formDetilVoucher: FormGroup;

  formUndian: FormGroup;
  formGeo: FormGroup;
  formPM: FormGroup;
  formPreview: FormGroup;
  formListPemenang: FormGroup;
  onLoad: boolean;
  minDate = new Date();
  groupTradePrograms: any[] = [];

  files: File;
  files2: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;
  imageConverted: any;
  imageConverted2: any;
  preview_header: FormControl = new FormControl("");

  keyUp = new Subject<string>();
  keyUpProduct = new Subject<string>();
  keyUpProductSRCC = new Subject<string>();
  listCategories: any[] = [];
  listCategoriesSRCC: any[] = [];
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl("");
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  listProductSkuBank: Array<any> = [];
  listProductSkuBankSRCC: Array<any> = [];
  filteredSkuOptions: Observable<string[]>;
  filteredSkuOptionsSRCC: Observable<string[]>;
  productList: any[] = [];
  productListSRCC: any[] = [];
  inputChipList = [];
  inputChipListSRCC = [];
  product: FormControl = new FormControl('');
  productSRCC: FormControl = new FormControl('');
  public audienceFixed: FormControl = new FormControl();
  public audiencePopulation: FormControl = new FormControl();
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];

  dialogRef: any;
  data_imported: any = [];

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('downloadLinkWinner') downloadLinkWinner: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('productInputSRCC') productInputSRCC: ElementRef<HTMLInputElement>;

  retailClassification: any[] = [
    { name: this.ls.locale.global.label.all + " " + this.ls.locale.call_objective.text9, value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
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
  public filterTradeProgram: FormControl = new FormControl();
  public filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );
  listTradePrograms: any[];
  isPopulation: boolean = true;
  private _onDestroy = new Subject<void>();

  formFilter: FormGroup;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  indexDelete: any;
  list: any;
  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  audienceSelected: any[] = [];
  rows: any[];
  selected: any[] = [];
  id: any[];
  reorderable = true;
  pagination: Page = new Page();

  areaType: any[] = [];

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;
  menuList: any[] = [];
  iconList: any[] = [];
  areaIdNonTargetAudience: any = 1;
  detailFormUndian: any;
  showDetail: any;
  isDetail: Boolean;

  constructor(
    private b2bVoucherInjectService: B2BVoucherInjectService,
    private supplierCompanyService: SupplierCompanyService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private geoService: GeotreeService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private geotreeService: GeotreeService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private spinTheWheelService: SpinTheWheelService,
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private lotteryService: LotteryService,
    private groupTradeProgramService: GroupTradeProgramService,
  ) {
    this.onLoad = true

    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
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

    this.selected = [];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }
    this.filterTradeProgram.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringTradeProgram();
      });

    this.filteredSkuOptions = this.product.valueChanges.pipe(
      startWith(null),
      map((prd: string | null) => prd ? this._filter(prd) : this.productList.slice()));

    this.detailFormUndian = this.dataService.getFromStorage('detail_lottery');

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listProduct.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
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
      this.listTradePrograms.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  ngOnInit() {
    this.formUndian = this.formBuilder.group({
      name: ["", Validators.required],
      coin: ["", Validators.required],
      group_trade_program_id: [""],
      sub_group_trade_program_id: [""],
      start_date: [new Date()],
      start_time: ["00:00", Validators.required],
      end_date: [new Date()],
      end_time: ["00:00", Validators.required],
      announcement_date:  [new Date()],
      announcement_time: ["00:00", Validators.required],
    });

    if (this.isDetail) {
      // this.formUndian.get('name').disable();
      // this.formUndian.get('coin').disable();
      // this.formUndian.get('start_date').disable();
      // this.formUndian.get('start_time').disable();
      // this.formSpin.get('end_date').disable();
      // this.formSpin.get('end_time').disable();
      // this.formUndian.get('announcement_date').disable();
      // this.formUndian.get('announcement_time').disable();
      // this.formUndian.get('group_trade_program_id').disable();
      // this.formUndian.get('sub_group_trade_program_id').disable();
    }

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

    this.formPreview = this.formBuilder.group({
      // image: ["", Validators.required],
      // icon: ["", Validators.required],
      desc: ["", Validators.required],
      desc_tc: ["", Validators.required],
      desc_tc_status: ["", Validators.required]
    });
    this.formListPemenang = this.formBuilder.group({
      // image: ["", Validators.required],
      // icon: ["", Validators.required],
      preview_header: ["", Validators.required]
    });
    if (this.isDetail) this.formPreview.disable();

    this.formUndian.setValue({
      name: this.detailFormUndian.name,
      coin: this.detailFormUndian.coin,
      start_date: this.convertDate(this.detailFormUndian.start_date),
      start_time: this.convertTime(this.detailFormUndian.start_date ? this.detailFormUndian.start_date : ''),
      end_date: this.convertDate(this.detailFormUndian.end_date),
      end_time: this.convertTime(this.detailFormUndian.end_date ? this.detailFormUndian.end_date : ''),
      announcement_date: this.convertDate(this.detailFormUndian.announcement_date),
      announcement_time: this.convertTime(this.detailFormUndian.announcement_date ? this.detailFormUndian.announcement_date : ''),
      group_trade_program_id: Array.isArray(this.detailFormUndian.trade_creator_group_id) ? this.detailFormUndian.trade_creator_group_id : parseInt(this.detailFormUndian.trade_creator_group_id, 10) ? this.detailFormUndian.trade_creator_group_id.split(',').map(rs => Number(rs)) : '',
      sub_group_trade_program_id: Array.isArray(this.detailFormUndian.trade_creator_sub_group_id) ? this.detailFormUndian.trade_creator_sub_group_id : parseInt(this.detailFormUndian.trade_creator_sub_group_id, 10) ? this.detailFormUndian.trade_creator_sub_group_id.split(',').map(rs => Number(rs))  : '',
    });

    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });

    this.filterSGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringSGTP();
      });

    this.getGroupTradeProgram();
    this.getSubGroupTradeProgram();

    this.onLoad = false;

    this.getLevel('national');
    this.getTradePrograms();

    this.initAreaV2();

    this.setStorageDetail();

    this.formGeo.get('division').valueChanges.subscribe(res => {
      this.loadingRegion = true;
      this.getLevel('division');
    });
    this.formGeo.get('region').valueChanges.subscribe(res => {
      this.loadingArea = true;
      this.getLevel('region');
    });

    if(!this.detailFormUndian){
      this.formGeo.get('classification').setValue(['all']);
    }
  }

  setStorageDetail() {
    // Show detail
    this.showDetail = this.lotteryService.showAudience(this.detailFormUndian.id).subscribe(res => { 
      if (res.data) {
        this.dataService.setToStorage('detail_lottery', res.data);

        // this.changeBlastType(res.data.audience_filter);
        if(res.data.audience_filter === 'population-blast'){
          this.formGeo.get('classification').setValue(res.data.class_groups);
        }

        let zone = [];
        if (res.data.areas) {
          for (let i = 0; i < res.data.areas.length; i++) {
            if (res.data.areas[i].level_desc === 'zone') {
              if (!( res.data.areas[i].area_id in zone )) {
                zone.push(res.data.areas[i].area_id);
              }
            }
          }
        }
        this.selectedZone = zone;
        this.imageConverted = res.data.icon_url;
        this.imageConverted2 = res.data.icon_url;

        this.panelBlast = res.data.panel_count;
        
        const filter = res.data.audience_filter;
        this.handleAudienceFilter(filter);

        if (filter !== 'fixed-panel') {
          this.formGeo.get('classification').setValue(res.data.class_groups);
        }

        if (res.data.panel_count > 0) {
          this.isChecked = true;
        }

        this.formPreview.setValue({
          desc: res.data.desc,
          desc_tc: res.data.desc_tc,
          desc_tc_status: res.data.desc_tc_status === 'active' ? true : false
        });

        this.initAreaSelected(res.data);
      }
    });
  }

  initAreaSelected(data = null) {
    console.log('=================');
    let arr = data.areas;
    let arr_area = [];
    let arr_region = [];
    let arr_zone = [];
    if (arr) {
      arr.map((area, index) => {
        if (area.level_desc === 'area') {
          if (arr_area.indexOf(area.area_id) == -1) {
            arr_area.push(area.area_id);
          }
        } else if (area.level_desc === 'region') {
          if (arr_region.indexOf(area.area_id) == -1) {
            arr_region.push(area.area_id);
          }
        } else {
          if (arr_zone.indexOf(area.area_id) == -1) {
            arr_zone.push(area.area_id);
          }
        }
      });
    }
    console.log(arr_area);
    console.log(arr_region);
    console.log(arr_zone);
    if (arr_region.length === 0 || parseInt(arr_region[0], 10) === 0) {
      this.loadingRegion = false;
    }
    if (arr_area.length === 0 || parseInt(arr_area[0], 10) === 0) {
      this.loadingArea = false;
    }
    this.selectedZone = arr_zone;
    this.selectedRegion = arr_region;
    this.selectedArea = arr_area;
  }

  removeImage(): void {
    this.files = undefined;
    this.imageConverted = undefined;
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageConverted = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

  removeImage2(): void {
    this.files2 = undefined;
    this.imageConverted2 = undefined;
  }

  changeImage2(event) {
    this.readThis2(event);
  }

  readThis2(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageConverted2 = myReader.result;
    }

    myReader.readAsDataURL(file);
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

  getTradePrograms() {
    this.audienceService.getListTradePrograms().subscribe(
      (res) => {
        console.log("res trade programs", res);
        this.listTradePrograms = res.data;
        this.filteredTradeProgram.next(res.data);
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  // changeBlastType(type) {
  //   if (type === 'population-blast') this.isPopulation = true;
  //   else this.isPopulation = false
  // }

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

    console.log('XYZ--------')
    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

          if (this.detailFormUndian.hasOwnProperty('zones')) {
            const zones = this.detailFormUndian.zones[0];
            const detailZones = zones > 1 ? this.detailFormUndian.zones : [];
            this.formFilter.get('zone').setValue(detailZones);
            this.detailFormUndian.zone = true
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
              if (this.detailFormUndian.hasOwnProperty('regions')) {
                const regions = this.detailFormUndian.regions[0];
                const detailRegions = regions > 1 ? this.detailFormUndian.regions : [];
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
              if (this.detailFormUndian.hasOwnProperty('areas')) {
                const areas = this.detailFormUndian.areas[0];
                const detailAreas = areas > 1 ? this.detailFormUndian.areas : [];
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

  getAudience() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
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
        // console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        // console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
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

    // this.pagination['audience'] = this.formUndian.get('application').value;


    this.notificationService.getPopupAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.dataService.showLoading(false);
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(false);
    });
  }

  submit() {
    if (this.formUndian.valid) {
      let fd = new FormData();

      const body = {
        _method: 'PUT',
        name: this.formUndian.get('name').value,
        coin: this.formUndian.get('coin').value,
        start_date: `${moment(this.formUndian.get('start_date').value).format('YYYY-MM-DD')} ${this.formUndian.get('start_time').value}:00`,
        end_date: `${moment(this.formUndian.get('end_date').value).format('YYYY-MM-DD')} ${this.formUndian.get('end_time').value}:00`,
        announcement_date: `${moment(this.formUndian.get('announcement_date').value).format('YYYY-MM-DD')} ${this.formUndian.get('announcement_time').value}:00`,
      }

      fd.append('_method', body._method);
      fd.append('name', body.name);
      fd.append('coin', body.coin);
      fd.append('start_date', body.start_date);
      fd.append('end_date', body.end_date);
      fd.append('announcement_date', body.announcement_date);
      // fd.append('trade_creator_group_id[]', this.formUndian.get('group_trade_program_id').value);
      fd.append('trade_creator_group_id[]', '0');
      fd.append('trade_creator_sub_group_id[]', this.formUndian.get('sub_group_trade_program_id').value);

      this.lotteryService.put(fd, { lottery_id: this.detailFormUndian.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.router.navigate(['dte', 'lottery']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formUndian);
    }
  }

  submitAudience() {
    console.log('final', this.formGeo.get('area').value);
    let body = {};
    const id = this.dataService.getFromStorage('detail_lottery').id;
    if (this.isPopulation === true) {
      body = {
        lottery_id: id,
        audience_filter: 'population-blast',
        class_groups: this.formGeo.get('classification').value,
        zones: this.formGeo.get('division').value.length > 0 && parseInt(this.formGeo.get('division').value[0], 10) !== 0 ? this.formGeo.get('division').value : ['all'],
        regions: this.formGeo.get('region').value.length > 0 && parseInt(this.formGeo.get('region').value[0], 10) !== 0 ? this.formGeo.get('region').value : ['all'],
        areas: this.formGeo.get('area').value && this.formGeo.get('area').value.length > 0 && parseInt(this.formGeo.get('area').value[0], 10) !== 0 ? this.formGeo.get('area').value : ['all'],
      };
    } else {
      body = {
        lottery_id: id,
        audience_filter: 'fixed-panel',
        retailers: this.data_imported.map(item => item.id)
      };
    }

    const dialogConfig = new MatDialogConfig();
  
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = "scrumboard-card-dialog";
      dialogConfig.data = { password: "P@ssw0rd" };
  
      this.dialogRef = this.dialog.open(
        DialogProcessComponent,
        {...dialogConfig, width: '400px'}
      );

      const processCheck = this.lotteryService.checkAudience(body).subscribe(
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
    const id = this.dataService.getFromStorage('detail_lottery').id;
    if (this.isPopulation === true) {
      body = {
        lottery_id: id,
        audience_filter: 'population-blast',
        class_groups: this.formGeo.get('classification').value,
        zones: this.formGeo.get('division').value.length > 0 && parseInt(this.formGeo.get('division').value[0], 10) !== 0 ? this.formGeo.get('division').value : ['all'],
        regions: this.formGeo.get('region').value.length > 0 && parseInt(this.formGeo.get('region').value[0], 10) !== 0 ? this.formGeo.get('region').value : ['all'],
        areas: this.formGeo.get('area').value && this.formGeo.get('area').value.length > 0 && parseInt(this.formGeo.get('area').value[0], 10) !== 0 ? this.formGeo.get('area').value : ['all'],
        panel_count: this.panelBlast
      };
    } else {
      body = {
        lottery_id: id,
        audience_filter: 'fixed-panel',
        retailers: this.data_imported.map(item => item.id),
        panel_count: this.panelBlast
      };
    }

    const dialogConfig = new MatDialogConfig();
  
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      DialogProcessSaveComponent,
      {...dialogConfig, width: '400px'}
    );

    const processCheck = this.lotteryService.saveAudience(body, this.detailFormUndian.id).subscribe(
      (res) => {
        if (res.data) {
          this.isChecked = true;
          this.panelBlast = res.data.panel_count;
        }
        this.dialogRef.close();
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.setStorageDetail();
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

  submitPreview() {
    const id = this.dataService.getFromStorage('detail_lottery').id;
    this.dataService.showLoading(true);
    // if (
    //   this.formPreview.valid
    //   ) {
      let body = new FormData();
      // body.append('image', '-');
      // let body;

      // body = {
      //   // icon: '-',
      //   header: this.formPreview.get('preview_header').value,
      //   image: '-'
      // };
      // if (this.files) body.append('image', this.files)
      if (this.files) body.append('header_img', this.files);
      if (this.files2) body.append('header_list_img', this.files2);
      body.append('desc', this.formPreview.get('desc').value);
      body.append('desc_tc', this.formPreview.get('desc_tc').value);
      body.append('desc_tc_status', this.formPreview.get('desc_tc_status').value);

      this.lotteryService.put_preview({ id: id }, body).subscribe(res => {
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.dataService.showLoading(false);
        this.setStorageDetail();
        // this.router.navigate(['dte', 'spin-the-wheel'])
      }, err => {
        this.dataService.showLoading(false);
      });
    // } else {
    //   commonFormValidator.validateAllFields(this.formUndian);
    //   // commonFormValidator.validateAllFields(this.formGeo);

    //   this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
    // }
  }

  async downloadWinnerList() {
    this.dataService.showLoading(true);
    try {
      const response = await this.lotteryService.downloadWinner(this.detailFormUndian.id).toPromise();
      this.downloadLinkWinner.nativeElement.href = response.data;
      this.downloadLinkWinner.nativeElement.click();
      setTimeout(() => {
        this.dataService.showLoading(false);
      }, 3000);
    } catch (error) {
      this.dataService.showLoading(false);
      throw error;
    }
  }

  submitPemenang() {
    
  }

  submitPublishUnpublish() {
    const id = this.dataService.getFromStorage('detail_lottery').id;
    this.dataService.showLoading(true);
    let body = {
      // status: (this.dataService.getFromStorage('spin_the_wheel').status === 'unpublish')? 'publish' : 'unpublish'
    }
    this.spinTheWheelService.publishUnpublish({id: id}, body).subscribe(({data}) => {
      
    this.dataService.showLoading(false);
    this.router.navigate(['dte', 'spin-the-wheel'])
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  async exportAudience() {
    this.dataService.showLoading(true);
    this.exportTemplate = true;
    const body = {
      retailer_id: [1]
    };

    try {
      const response = await this.audienceService.exportExcel(body).toPromise();
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
      ImportAudiencePersonalizeComponent,
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
    console.log('nilainya', value);
    if (value !== 'fixed-panel') {
      this.isPopulation = true;
      // this.formGeo.get('audiencePopulation').setValue(value);
      this.audienceFixed.setValue('');
      this.audiencePopulation.setValue(value);
    } else {
      this.isPopulation = false;
      this.audienceFixed.setValue(value);
      this.audiencePopulation.setValue('');
      // this.formGeo.get('audiencePopulation').setValue('');
    }
  }
  filteringGTP() {
    if (!this.listGroupTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;
    if (!search) {
      this.filteredGTP.next(this.listGroupTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredGTP.next(
      this.listGroupTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getGroupTradeProgram() {
    this.groupTradeProgramService.get({ page: 'all' }).subscribe(res => {
      this.listGroupTradeProgram = res.data ? res.data.data : [];
      this.filteredGTP.next(this.listGroupTradeProgram.slice());
    })
  }

  getSubGroupTradeProgram() {
    this.groupTradeProgramService.getSubGroupTrade({ page: 'all' }).subscribe(res => {
      const data = res.data ? res.data.data.filter((item: any) => item.status === "active") : [];
      this.listSubGroupTradeProgram = data;
      this.filteredSGTP.next(this.listSubGroupTradeProgram.slice());
    })
  }
  
  filteringSGTP() {
    if (!this.listSubGroupTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterSGTP.value;
    if (!search) {
      this.filteredSGTP.next(this.listSubGroupTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSGTP.next(
      this.listSubGroupTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }
}