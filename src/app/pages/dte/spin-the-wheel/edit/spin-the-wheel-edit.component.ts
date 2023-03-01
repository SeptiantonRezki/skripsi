import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSelect } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Page } from 'app/classes/laravel-pagination';
import { B2BVoucherInjectService } from 'app/services/b2b-voucher-inject.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { GeotreeService } from 'app/services/geotree.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { NotificationService } from 'app/services/notification.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { SupplierCompanyService } from 'app/services/user-management/private-label/supplier-company.service';
import moment from 'moment';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { DialogProcessSaveComponentSPW } from '../dialog/dialog-process-save/dialog-process-save.component';
import { DialogProcessComponentSPW } from '../dialog/dialog-process/dialog-process.component';
import { ImportAudiencePersonalizeComponentSPW } from '../import/personalize/import-audience-personalize.component';
import { SequencingService } from 'app/services/dte/sequencing.service';

@Component({
  selector: 'app-spin-the-wheel-edit',
  templateUrl: './spin-the-wheel-edit.component.html',
  styleUrls: ['./spin-the-wheel-edit.component.scss']
})
export class SpinTheWheelEditComponent implements OnInit {
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

  formDetilVoucher: FormGroup;

  formSpin: FormGroup;
  formGeo: FormGroup;
  formPM: FormGroup;
  formPreview: FormGroup;
  onLoad: boolean;
  minDate: any = new Date();
  maxDate: any;
  groupTradePrograms: any[] = [];

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;
  imageConverted: any;
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
  detailFormSpin: any;
  showDetail: any;
  isDetail: Boolean;
  formId: number;

  settingsData: any = null;
  taskSpinId: number;

  constructor(
    private b2bVoucherInjectService: B2BVoucherInjectService,
    private supplierCompanyService: SupplierCompanyService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private geoService: GeotreeService,
    private audienceService: AudienceService,
    private sequencingService: SequencingService,
    private dataService: DataService,
    private geotreeService: GeotreeService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private spinTheWheelService: SpinTheWheelService,
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
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

  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(param => {
      this.formId = Number(param.get("id"));
    });

    this.getDetail();

    this.filterTradeProgram.valueChanges
      .debounceTime(1000)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringTradeProgram();
      });

    this.filteredSkuOptions = this.product.valueChanges.pipe(
      startWith(null),
      map((prd: string | null) => prd ? this._filter(prd) : this.productList.slice()));

    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.formSpin = this.formBuilder.group({
      name: ["", Validators.required],
      trade_creator_id: ["", Validators.required],
      start_date: [new Date(), Validators.required],
      start_time: ["00:00", Validators.required],
      end_date: [new Date(), Validators.required],
      end_time: ["00:00", Validators.required],
    });

    this.formSpin.get("start_date").valueChanges.subscribe((value) => {
      const selectedDate = moment(value).format('YYYY-MM-DD');
      const endDate = moment(this.detailFormSpin.end_date).format('YYYY-MM-DD');

      if (selectedDate >= endDate) {
        this.formSpin.get("end_date").setValue("");
      }
    });

    if(this.isDetail){
      this.formSpin.get('name').disable();
      this.formSpin.get('trade_creator_id').disable();
      this.formSpin.get('start_date').disable();
      this.formSpin.get('start_time').disable();
      this.formSpin.get('end_date').disable();
      this.formSpin.get('end_time').disable();
    }


    this.formGeo = this.formBuilder.group({
      national: [{ value: [1], disabled: true }],
      division: [""],
      region: [""],
      area: [""],
      classification:  [['all']],
      // audiencePopulation: [""]
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
      preview_header: ["", Validators.required]
    });
    if (this.isDetail) this.formPreview.disable();


    this.onLoad = false;

    this.getLevel('national');
    this.getTradePrograms();


    this.formGeo.get('division').valueChanges.subscribe(res => {
      this.loadingRegion = true;
      this.getLevel('division');
    });
    this.formGeo.get('region').valueChanges.subscribe(res => {
      this.loadingArea = true;
      this.getLevel('region');
    });

    if(!this.detailFormSpin){
      this.formGeo.get('classification').setValue(['all']);
    }

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listProduct.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  filteringTradeProgram() {
    // get the search keyword
    const search = this.filterTradeProgram.value;
    const selectedValue = this.formSpin.get("trade_creator_id").value;
    if (!search && !!selectedValue) return;

    this.pagination.search = search.toLowerCase();
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        this.listTradePrograms = res.data.data;
        this.filteredTradeProgram.next(res.data.data);
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
    // filter the banks
    this.filteredTradeProgram.next(
      this.listTradePrograms.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getDetail() {
    this.showDetail = this.spinTheWheelService.showAudience(this.formId).subscribe(res => {
      if(res.data){
        this.detailFormSpin = res.data;
        this.taskSpinId = res.data.id;
        this.settingsData = res.data.settings;
        // this.changeBlastType(res.data.audience_filter);
        if(res.data.audience_filter === 'population-blast'){
          this.formGeo.get('classification').setValue(res.data.class_groups);
        }

        this.setDate(res.data.trade_creator_end_date);

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

        const selectedTp = {
          id: res.data.trade_creator_id,
          name: res.data.trade_creator_name,
          start_date: res.data.trade_creator_start_date,
          end_date: res.data.trade_creator_end_date
        };

        this.initAreaSelected(res.data);
        this.setValueDetail(res.data);
        this.getTradePrograms(selectedTp);

        if (res.data.status === "publish") {
          this.formSpin.get('trade_creator_id').disable();
        }
      }
    });
  }

  setStorageDetail() {
    // Show detail
    this.showDetail = this.spinTheWheelService.showAudience(this.formId).subscribe(res => {
      if(res.data){
        this.dataService.setToStorage('spin_the_wheel', res.data);
        this.detailFormSpin = res.data;
        this.taskSpinId = res.data.id;
        this.settingsData = res.data.settings;
        // this.changeBlastType(res.data.audience_filter);
        if(res.data.audience_filter === 'population-blast'){
          this.formGeo.get('classification').setValue(res.data.class_groups);
        }

        this.setDate(res.data.trade_creator_end_date);

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

        this.initAreaSelected(res.data);
      }
    });
  }

  initAreaSelected(data = null) {
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

  getTradePrograms(defaultValue?: any) {
    this.pagination.per_page = 15;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        this.listTradePrograms = defaultValue
          ? [
              defaultValue,
              ...res.data.data.filter((i) => i.id !== defaultValue.id),
            ]
          : res.data.data;
        this.filteredTradeProgram.next(this.listTradePrograms);
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  tradeProgramChange(e: any){
    const theIndex = this.listTradePrograms.findIndex(x => x.id === e.value);
    this.setDate(this.listTradePrograms[theIndex].end_date);
    this.formSpin.patchValue({
      trade_creator_name: this.listTradePrograms[theIndex].name,
      total_budget: this.listTradePrograms[theIndex].budget,
      endDateTrade: this.listTradePrograms[theIndex].end_date,
      status: "unpublish",
    });
  }

  setDate(d: any) {
    this.maxDate = moment(d).format('YYYY-MM-DD');
    this.minDate = moment(new Date()).format('YYYY-MM-DD');
  }

  // changeBlastType(type) {
  //   if (type === 'population-blast') this.isPopulation = true;
  //   else this.isPopulation = false
  // }

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
    }

    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

          if (this.detailFormSpin.hasOwnProperty('zones')) {
            const zones = this.detailFormSpin.zones[0];
            const detailZones = zones > 1 ? this.detailFormSpin.zones : [];
            this.formFilter.get('zone').setValue(detailZones);
            this.detailFormSpin.zone = true
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
              if (this.detailFormSpin.hasOwnProperty('regions')) {
                const regions = this.detailFormSpin.regions[0];
                const detailRegions = regions > 1 ? this.detailFormSpin.regions : [];
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
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
              if (this.detailFormSpin.hasOwnProperty('areas')) {
                const areas = this.detailFormSpin.areas[0];
                const detailAreas = areas > 1 ? this.detailFormSpin.areas : [];
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
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // let sameAreas = this.list[area.key].filter(ar => area.value.includes(ar.id));
        let areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
      }
    }

    return newLastSelfArea;
  }

  getAudience() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

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
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
        } else {
          this.pagination['after_level'] = true;
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        this.pagination['after_level'] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      }
    }

    // this.pagination['audience'] = this.formSpin.get('application').value;


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
    const id = this.dataService.getFromStorage('spin_the_wheel').id;
    if (
      this.formSpin.valid
      // && this.formGeo.valid
      ) {
      let body = {
        name: this.formSpin.get("name").value,
        trade_creator_id: this.formSpin.get("trade_creator_id").value,
        // start_date: this.convertDate(this.formSpin.get("start_date").value),
        // end_date: this.convertDate(this.formSpin.get("end_date").value),
        // status: "unpublish",
        // type: this.isPopulation ? 'population' : 'fixed',
        // classification: this.formGeo.get("classification").value,
        // zone: this.formGeo.get("division").value,
        // region: this.formGeo.get("region").value,
        // area: this.formGeo.get("area").value,
      }

      body['start_date'] = `${moment(this.formSpin.get('start_date').value).format('YYYY-MM-DD')} ${this.formSpin.get('start_time').value}:00`;
      body['end_date'] = `${moment(this.formSpin.get('end_date').value).format('YYYY-MM-DD')} ${this.formSpin.get('end_time').value}:00`;


      this.dataService.showLoading(true);
      this.spinTheWheelService.put_spin({ id: id }, body).subscribe(
        (res) => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.dataService.showLoading(false);
          this.setStorageDetail();
          // this.router.navigate(['dte', 'spin-the-wheel'])
        },
        () => {
          this.dataService.showLoading(false);
        }
      )
    } else {
      commonFormValidator.validateAllFields(this.formSpin);
      // commonFormValidator.validateAllFields(this.formGeo);

      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
    }
  }

  submitAudience() {
    let body = {};
    const id = this.dataService.getFromStorage('spin_the_wheel').id;
    if (this.isPopulation === true) {
      body = {
        task_spin_id: id,
        audience_filter: 'population-blast',
        class_groups: this.formGeo.get('classification').value,
        zones: this.formGeo.get('division').value.length > 0 && parseInt(this.formGeo.get('division').value[0], 10) !== 0 ? this.formGeo.get('division').value : ['all'],
        regions: this.formGeo.get('region').value.length > 0 && parseInt(this.formGeo.get('region').value[0], 10) !== 0 ? this.formGeo.get('region').value : ['all'],
        areas: this.formGeo.get('area').value && this.formGeo.get('area').value.length > 0 && parseInt(this.formGeo.get('area').value[0], 10) !== 0 ? this.formGeo.get('area').value : ['all'],
      };
    } else {
      body = {
        task_spin_id: id,
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
        DialogProcessComponentSPW,
        {...dialogConfig, width: '400px'}
      );

      const processCheck = this.spinTheWheelService.checkAudience(body).subscribe(
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
    const id = this.dataService.getFromStorage('spin_the_wheel').id;
    if (this.isPopulation === true) {
      body = {
        task_spin_id: id,
        audience_filter: 'population-blast',
        class_groups: this.formGeo.get('classification').value,
        zones: this.formGeo.get('division').value.length > 0 && parseInt(this.formGeo.get('division').value[0], 10) !== 0 ? this.formGeo.get('division').value : ['all'],
        regions: this.formGeo.get('region').value.length > 0 && parseInt(this.formGeo.get('region').value[0], 10) !== 0 ? this.formGeo.get('region').value : ['all'],
        areas: this.formGeo.get('area').value && this.formGeo.get('area').value.length > 0 && parseInt(this.formGeo.get('area').value[0], 10) !== 0 ? this.formGeo.get('area').value : ['all'],
        panel_count: this.panelBlast
      };
    } else {
      body = {
        task_spin_id: id,
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
      DialogProcessSaveComponentSPW,
      {...dialogConfig, width: '400px'}
    );

    const processCheck = this.spinTheWheelService.saveAudience(body).subscribe(
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
    const id = this.dataService.getFromStorage('spin_the_wheel').id;
    this.dataService.showLoading(true);
    // if (
    //   this.formPreview.valid
    //   ) {
      let body = new FormData();
      body.append('image', null);
      body.append('header', this.formPreview.get('preview_header').value);
      // body.append('image', '-');
      // let body;

      // body = {
      //   // icon: '-',
      //   header: this.formPreview.get('preview_header').value,
      //   image: '-'
      // };
      // if (this.files) body.append('image', this.files)
      if (this.files) body.append('icon', this.files)

      this.spinTheWheelService.put_preview({ id: id },body).subscribe(res => {
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.dataService.showLoading(false);
        this.setStorageDetail();
        // this.router.navigate(['dte', 'spin-the-wheel'])
      }, err => {
        this.dataService.showLoading(false);
      });
    // } else {
    //   commonFormValidator.validateAllFields(this.formSpin);
    //   // commonFormValidator.validateAllFields(this.formGeo);

    //   this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
    // }
  }

  submitPublishUnpublish() {
    const id = this.dataService.getFromStorage('spin_the_wheel').id;
    this.dataService.showLoading(true);
    let body = {
      status: (this.dataService.getFromStorage('spin_the_wheel').status === 'unpublish')? 'publish' : 'unpublish'
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
      const response = await this.spinTheWheelService.exportExcel(body).toPromise();
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
      ImportAudiencePersonalizeComponentSPW,
      dialogConfig
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.data_imported = response;
      }
    });
  }

  handleClassification(event){
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

  // MEKANISME PEMBATASAN PRODUK *MEKANISME

  resetField(data?: any): void {
    const filteredItem = this.listProductSkuBank.filter(item => item.name.toLowerCase() === data.toLowerCase());

    if (filteredItem.length === 0) {
      // this.product = undefined;
    }
  }

  setValueDetail(value: any) {
    this.formSpin.setValue({
      name: value.name ? value.name : '',
      trade_creator_id: value.trade_creator_id ? value.trade_creator_id : '',
      start_date: this.convertDate(value.start_date ? value.start_date : ''),
      start_time: this.convertTime(value.start_date ? value.start_date : ''),
      end_date: this.convertDate(value.end_date ? value.end_date : ''),
      end_time: this.convertTime(value.end_date ? value.end_date : '')
    });

    this.formPreview.setValue({
      preview_header: value.header ? value.header : '',
    })

    this.panelBlast = value.panel_count;

    const filter = value.audience_filter;
    this.handleAudienceFilter(filter);

    if (filter !== 'fixed-panel') {
      this.formGeo.get('classification').setValue(value.class_groups);
    }

    if (value.panel_count > 0) {
      this.isChecked = true;
    }

    // if (this.isDetail) {
    //   this.formAudience.disable();
    //   this.formFilter.disable();
    //   this.formFilterRetailer.disable();
    // }
  }

  // handleAudienceFilter(value) {
  //   this.isPopulation = (this.detailFormSpin.audience_filter === 'population-blast')? true : false;
  // }

  handleAudienceFilter(value) {
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

}
