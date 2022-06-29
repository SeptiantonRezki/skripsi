import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { CoinDisburstmentService } from 'app/services/dte/coin-disburstment.service';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { GeotreeService } from 'app/services/geotree.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import moment from 'moment';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ImportAudienceDialogComponent } from '../../audience/import/import-audience-dialog.component';
import { IdbService } from 'app/services/idb.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-coin-disburstment-create',
  templateUrl: './coin-disburstment-create.component.html',
  styleUrls: ['./coin-disburstment-create.component.scss']
})
export class CoinDisburstmentCreateComponent implements OnInit, OnDestroy {
  selectedTab: number = 0;
  formCoin: FormGroup;
  minDate = new Date();
  groupTradePrograms: any[] = [];

  isTransferBank: FormControl = new FormControl(false);
  isPojokBayar: FormControl = new FormControl(false);
  isTargetedRetailer: FormControl = new FormControl(false);

  rows: any[];
  retailClassification: any[] = [
    { name: this.translate.instant('global.label.all_type'), value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
  ];
  srcClassification: any[] = [
    { name: this.translate.instant('global.label.all_type'), value: "all" }
  ];
  srcType: any[] = [
    { name: this.translate.instant('global.label.all_type'), value: "all" }
  ];

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
  formFilterRetailer: FormGroup;

  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  allRowsSelected: boolean;

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterTradeProgram: FormControl = new FormControl();
  public filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );
  private _onDestroy = new Subject<void>();
  @ViewChild("downloadLink") downloadLink: ElementRef;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  selectAllOnPage: any[] = [];
  pageOffset: number = 0;

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  // Untuk Edit
  isEdit: boolean;
  detailCoin: any;
  pageName = this.translate.instant('dte.coin_disbursement.text1');
  titleParam = {entity: this.pageName}

  priority_list: any[] = [];
  
  constructor(
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private coinDisburstmentService: CoinDisburstmentService,
    private formBuilder: FormBuilder,
    private groupTradeProgramService: GroupTradeProgramService,
    private audienceService: AudienceService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private idbService: IdbService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    activatedRoute.url.subscribe(params => {
      this.isEdit = params[1].path === 'edit' ? true : false;
      if (this.isEdit) {
        this.detailCoin = this.dataService.getFromStorage("detail_coin_disburstment");
      }
    });

    this.selectedTab = this.dataService.getFromStorage("coin_disburstment_selected_tab") ? this.dataService.getFromStorage("coin_disburstment_selected_tab") : 0;

    this.rows = [];
    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.area_id_list = this.dataService.getDecryptedProfile()["area_id"];
    this.listLevelArea = [
      {
        id: 1,
        parent_id: null,
        code: "SLSNTL      ",
        name: "SSLSNTL",
      },
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: [],
    };

    this.searchRetailer
      .debounceTime(500)
      .flatMap((search) => {
        return Observable.of(search).delay(500);
      })
      .subscribe((res) => {
        this.searchingRetailer(res);
      });
  }

  ngOnInit() {
    this.idbService.reset();
    this.getGroupTradeProgram();

    this.formCoin = this.formBuilder.group({
      name: ["", Validators.required],
      coin_valuation: [0, [Validators.required, Validators.min(0)]],
      start_date: [null, Validators.required],
      end_date: [null, Validators.required],
      group_trade_id: ["", Validators.required],
      status: ["draft"],
      priorities: this.formBuilder.array([])
    });

    if (!this.isEdit) {
      this.addPriority(-1);
    }

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""],
    });

    this.formFilterRetailer = this.formBuilder.group({
      retail_classification: [''],
      src_classification: [''],
      src_type: ['']
    });

    this.initAreaV2();
    this.getRetailer();

    this.formFilter.valueChanges.debounceTime(1000).takeUntil(this._onDestroy).subscribe((res) => {
      // this.searchingRetailer(res);
      // this.getRetailer();
    });

    this.formFilter.get("zone").valueChanges.takeUntil(this._onDestroy).subscribe((res) => {
      console.log("zone", res);
      if (res) {
        this.getAudienceAreaV2("region", res);
      }
    });
    this.formFilter.get("region").valueChanges.takeUntil(this._onDestroy).subscribe((res) => {
      console.log("region", res);
      if (res) {
        this.getAudienceAreaV2("area", res);
      }
    });
    this.formFilter.get("area").valueChanges.takeUntil(this._onDestroy).subscribe((res) => {
      console.log("area", res, this.formFilter.value["area"]);
      if (res) {
        this.getAudienceAreaV2("salespoint", res);
      }
    });
    this.formFilter.get("salespoint").valueChanges.takeUntil(this._onDestroy).subscribe((res) => {
      console.log("salespoint", res);
      if (res) {
        this.getAudienceAreaV2("district", res);
      }
    });
    this.formFilter.get("district").valueChanges.takeUntil(this._onDestroy).subscribe((res) => {
      console.log("district", res);
      if (res) {
        this.getAudienceAreaV2("territory", res);
      }
    });

    this.formFilterRetailer.valueChanges.takeUntil(this._onDestroy).debounceTime(1000).subscribe((res) => {
      this.getRetailer();
    });

    this.formFilterRetailer.get('retail_classification').valueChanges.takeUntil(this._onDestroy).subscribe((res) => {
      if (res) {
        this.pagination['classification'] = res;
      } else {
        delete this.pagination['classification'];
      }
    });
  }

  ngOnDestroy() {
    if (this.isEdit && this.dataService.getFromStorage("coin_disburstment_selected_tab")) {
      window.localStorage.removeItem("coin_disburstment_selected_tab");
    }

    this._onDestroy.next();
    this._onDestroy.unsubscribe();
  }

  getDetail() {
    this.dataService.showLoading(true);
    let priorities = this.formCoin.get('priorities') as FormArray;

    this.coinDisburstmentService.getDetail({ coin_id: this.detailCoin.id }).subscribe(res => {
      this.detailCoin = res.data;

      this.formCoin.get('name').setValue(this.detailCoin.name);
      this.formCoin.get('coin_valuation').setValue(this.detailCoin.coin_valuation);
      this.formCoin.get('start_date').setValue(this.detailCoin.start_date);
      this.formCoin.get('end_date').setValue(this.detailCoin.end_date);
      this.formCoin.get('status').setValue(this.detailCoin.status);
      this.formCoin.get('group_trade_id').setValue(this.detailCoin.group.map(group => {
        this.priority_list.push({id: group.trade_creator_group_id, name: group.name});
        return group.trade_creator_group_id;
      }));

      if (this.detailCoin.group_priorities) {
        this.detailCoin.group_priorities.map((list) => {
          return priorities.push(this.formBuilder.group({ group_id: list.group_trade_program_id }));
        });
      } else {
        this.addPriority(-1);
      }

      if (this.detailCoin.targeted_audience === 1) this.isTargetedRetailer.setValue(true);
      if (this.detailCoin.opsi_penukaran === 'transfer bank') this.isTransferBank.setValue(true);
      if (this.detailCoin.opsi_penukaran === 'saldo pojok bayar') this.isPojokBayar.setValue(true);
      if (this.detailCoin.opsi_penukaran === 'all') {
        this.isPojokBayar.setValue(true);
        this.isTransferBank.setValue(true);
      }

      this.getListAudience();
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  getListAudience() {
    this.dataService.showLoading(true);
    this.coinDisburstmentService.getListAudience({ coin_id: this.detailCoin.id }).subscribe(res => {
      this.dataService.showLoading(false);
      console.log("resss audience", res);
      if (Array.isArray(res)) {
        this.selected = res.map(data => ({ id: data.retailer_id }));
        console.log('selected', this.selected);
      }
    }, err => {
      console.log("err", err);
      this.dataService.showLoading(false);
    })
  }

  loadFormFilter() {
    this.getRetailer();
  }

  initAreaV2() {
    let areas = this.dataService.getDecryptedProfile()["areas"] || [];
    this.geotreeService.getFilter2Geotree(areas);
    let sameArea = this.geotreeService.diffLevelStarted;
    let areasDisabled = this.geotreeService.disableArea(sameArea);
    this.lastLevel = areasDisabled;
    let lastLevelDisabled = null;
    let levelAreas = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];
    let lastDiffLevelIndex = levelAreas.findIndex(
      (level) =>
        level === (sameArea.type === "teritory" ? "territory" : sameArea.type)
    );

    if (
      !this.formFilter.get("national") ||
      this.formFilter.get("national").value === ""
    ) {
      this.formFilter.get("national").setValue(1);
      this.formFilter.get("national").disable();
      lastLevelDisabled = "national";
    }
    areas.map((area, index) => {
      area.map((level, i) => {
        let level_desc = level.level_desc;
        let levelIndex = levelAreas.findIndex((lvl) => lvl === level.type);
        if (lastDiffLevelIndex > levelIndex - 2) {
          if (!this.list[level.type]) this.list[level.type] = [];
          if (
            !this.formFilter.controls[this.parseArea(level.type)] ||
            !this.formFilter.controls[this.parseArea(level.type)].value ||
            this.formFilter.controls[this.parseArea(level.type)].value === ""
          ) {
            this.formFilter.controls[this.parseArea(level.type)].setValue([
              level.id,
            ]);
            console.log("ff value", this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1)
              this.formFilter.get(this.parseArea(level.type)).disable();
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            console.log(
              this.parseArea(level.type),
              this.list[this.parseArea(level.type)]
            );
          }

          let isExist = this.list[this.parseArea(level.type)].find(
            (ls) => ls.id === level.id
          );
          level["area_type"] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist
            ? [...this.list[this.parseArea(level.type)]]
            : [...this.list[this.parseArea(level.type)], level];
          console.log(
            "area you choose",
            level.type,
            this.parseArea(level.type),
            this.geotreeService.getNextLevel(this.parseArea(level.type))
          );
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled)
            this.getAudienceAreaV2(
              this.geotreeService.getNextLevel(this.parseArea(level.type)),
              level.id
            );

          if (i === area.length - 1) {
            this.endArea = this.parseArea(level.type);
            this.getAudienceAreaV2(
              this.geotreeService.getNextLevel(this.parseArea(level.type)),
              level.id
            );
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
      case "division":
        return "zone";
      case "teritory":
      case "territory":
        return "territory";
      default:
        return type;
    }
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    let fd = new FormData();
    let lastLevel = this.geotreeService.getBeforeLevel(
      this.parseArea(selection)
    );
    let areaSelected: any = Object.entries(this.formFilter.getRawValue())
      .map(([key, value]) => ({ key, value }))
      .filter((item) => item.key === this.parseArea(lastLevel));
    // console.log('areaSelected', areaSelected, selection, lastLevel, Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })));
    console.log(
      "audienceareav2",
      this.formFilter.getRawValue(),
      areaSelected[0]
    );
    if (areaSelected && areaSelected[0] && areaSelected[0].key === "national") {
      fd.append("area_id[]", areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== "") {
        areaSelected[0].value.map((ar) => {
          fd.append("area_id[]", ar);
        });
        // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
        if (areaSelected[0].value.length === 0) {
          let beforeLevel = this.geotreeService.getBeforeLevel(
            areaSelected[0].key
          );
          let newAreaSelected: any = Object.entries(
            this.formFilter.getRawValue()
          )
            .map(([key, value]) => ({ key, value }))
            .filter((item) => item.key === this.parseArea(beforeLevel));
          console.log(
            "the selection",
            this.parseArea(selection),
            newAreaSelected
          );
          if (newAreaSelected[0].key !== "national") {
            newAreaSelected[0].value.map((ar) => {
              fd.append("area_id[]", ar);
            });
          } else {
            fd.append("area_id[]", newAreaSelected[0].value);
          }
        }
      }
    } else {
      let beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      areaSelected = Object.entries(this.formFilter.getRawValue())
        .map(([key, value]) => ({ key, value }))
        .filter((item) => item.key === this.parseArea(beforeLastLevel));
      // console.log('new', beforeLastLevel, areaSelected);
      if (
        areaSelected &&
        areaSelected[0] &&
        areaSelected[0].key === "national"
      ) {
        fd.append("area_id[]", areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== "") {
          areaSelected[0].value.map((ar) => {
            fd.append("area_id[]", ar);
          });
          // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
          if (areaSelected[0].value.length === 0) {
            let beforeLevel = this.geotreeService.getBeforeLevel(
              areaSelected[0].key
            );
            let newAreaSelected: any = Object.entries(
              this.formFilter.getRawValue()
            )
              .map(([key, value]) => ({ key, value }))
              .filter((item) => item.key === this.parseArea(beforeLevel));
            console.log(
              "the selection",
              this.parseArea(selection),
              newAreaSelected
            );
            if (newAreaSelected[0].key !== "national") {
              newAreaSelected[0].value.map((ar) => {
                fd.append("area_id[]", ar);
              });
            } else {
              fd.append("area_id[]", newAreaSelected[0].value);
            }
          }
        }
      }
    }

    fd.append("area_type", selection === "territory" ? "teritory" : selection);
    let thisAreaOnSet = [];
    let areaNumber = 0;
    let expectedArea = [];
    if (!this.formFilter.get(this.parseArea(selection)).disabled) {
      thisAreaOnSet = this.areaFromLogin[0] ? this.areaFromLogin[0] : [];
      if (this.areaFromLogin[1])
        thisAreaOnSet = [...thisAreaOnSet, ...this.areaFromLogin[1]];

      thisAreaOnSet = thisAreaOnSet.filter(
        (ar) =>
          (ar.level_desc === "teritory" ? "territory" : ar.level_desc) ===
          selection
      );
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== "national")
        expectedArea = thisAreaOnSet.filter((ar) =>
          areaSelected[0].value.includes(ar.parent_id)
        );
      // console.log('on set', thisAreaOnSet, selection, id);
    }

    switch (this.parseArea(selection)) {
      case "zone":
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] =
            expectedArea.length > 0
              ? res.data.filter((dt) =>
                expectedArea.map((eArea) => eArea.id).includes(dt.id)
              )
              : res.data;

          // fd = null
        });

        this.formFilter.get("region").setValue("");
        this.formFilter.get("area").setValue("");
        this.formFilter.get("salespoint").setValue("");
        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["region"] = [];
        this.list["area"] = [];
        this.list["salespoint"] = [];
        this.list["district"] = [];
        this.list["territory"] = [];
        console.log(
          "zone selected",
          selection,
          this.list["region"],
          this.formFilter.get("region").value
        );
        break;
      case "region":
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item =
            this.list["zone"].length > 0
              ? this.list["zone"].filter((item) => {
                return id && id.length > 0 ? id[0] : id;
              })[0]
              : {};
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] =
                expectedArea.length > 0
                  ? res.data.filter((dt) =>
                    expectedArea.map((eArea) => eArea.id).includes(dt.id)
                  )
                  : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list["region"] = [];
        }
        this.formFilter.get("region").setValue("");
        this.formFilter.get("area").setValue("");
        this.formFilter.get("salespoint").setValue("");
        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["area"] = [];
        this.list["salespoint"] = [];
        this.list["district"] = [];
        this.list["territory"] = [];
        break;
      case "area":
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item =
            this.list["region"].length > 0
              ? this.list["region"].filter((item) => {
                return id && id.length > 0 ? id[0] : id;
              })[0]
              : {};
          console.log("area hitted", selection, item, this.list["region"]);
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] =
                expectedArea.length > 0
                  ? res.data.filter((dt) =>
                    expectedArea.map((eArea) => eArea.id).includes(dt.id)
                  )
                  : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list["area"] = [];
        }

        this.formFilter.get("area").setValue("");
        this.formFilter.get("salespoint").setValue("");
        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["salespoint"] = [];
        this.list["district"] = [];
        this.list["territory"] = [];
        break;
      case "salespoint":
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item =
            this.list["area"].length > 0
              ? this.list["area"].filter((item) => {
                return id && id.length > 0 ? id[0] : id;
              })[0]
              : {};
          console.log("item", item);
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] =
                expectedArea.length > 0
                  ? res.data.filter((dt) =>
                    expectedArea.map((eArea) => eArea.id).includes(dt.id)
                  )
                  : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list["salespoint"] = [];
        }

        this.formFilter.get("salespoint").setValue("");
        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["district"] = [];
        this.list["territory"] = [];
        break;
      case "district":
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item =
            this.list["salespoint"].length > 0
              ? this.list["salespoint"].filter((item) => {
                return id && id.length > 0 ? id[0] : id;
              })[0]
              : {};
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] =
                expectedArea.length > 0
                  ? res.data.filter((dt) =>
                    expectedArea.map((eArea) => eArea.id).includes(dt.id)
                  )
                  : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list["district"] = [];
        }

        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["territory"] = [];
        break;
      case "territory":
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item =
            this.list["district"].length > 0
              ? this.list["district"].filter((item) => {
                return id && id.length > 0 ? id[0] : id;
              })[0]
              : {};
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] =
                expectedArea.length > 0
                  ? res.data.filter((dt) =>
                    expectedArea.map((eArea) => eArea.id).includes(dt.id)
                  )
                  : res.data;

              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list["territory"] = [];
        }

        this.formFilter.get("territory").setValue("");
        break;

      default:
        break;
    }
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  checkAreaLocation(area, lastSelfArea) {
    let lastLevelFromLogin = this.parseArea(
      this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type
    );
    let areaList = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];
    let areaAfterEndLevel = this.geotreeService.getNextLevel(
      lastLevelFromLogin
    );
    let indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    let indexAreaSelected = areaList.indexOf(area.key);
    let rawValues = Object.entries(
      this.formFilter.getRawValue()
    ).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = [];
    // console.log('[checkAreaLocation:area]', area);
    // console.log('[checkAreaLocation:lastLevelFromLogin]', lastLevelFromLogin);
    // console.log('[checkAreaLocation:areaAfterEndLevel]', areaAfterEndLevel);
    if (area.value !== 1) {
      // console.log('[checkAreaLocation:list]', this.list[area.key]);
      // console.log('[checkAreaLocation:indexAreaAfterEndLevel]', indexAreaAfterEndLevel);
      // console.log('[checkAreaLocation:indexAreaSelected]', indexAreaSelected);
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // let sameAreas = this.list[area.key].filter(ar => area.value.includes(ar.id));
        let areaSelectedOnRawValues: any = rawValues.find(
          (raw) => raw.key === areaAfterEndLevel
        );
        newLastSelfArea = this.list[areaAfterEndLevel]
          .filter((ar) => areaSelectedOnRawValues.value.includes(ar.id))
          .map((ar) => ar.parent_id)
          .filter((v, i, a) => a.indexOf(v) === i);
        // console.log('[checkAreaLocation:list:areaAfterEndLevel', this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)), areaSelectedOnRawValues);
        // console.log('[checkAreaLocation:newLastSelfArea]', newLastSelfArea);
      }
    }

    return newLastSelfArea;
  }

  getRetailer() {
    this.dataService.showLoading(true);
    this.pagination.per_page = 25;
    this.pagination.sort = "name";
    this.pagination.sort_type = "asc";
    let areaSelected = Object.entries(this.formFilter.getRawValue())
      .map(([key, value]) => ({ key, value }))
      .filter(
        (item: any) =>
          item.value !== null && item.value !== "" && item.value.length !== 0
      );
    let area_id = areaSelected[areaSelected.length - 1].value;
    let areaList = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];
    this.pagination.area = area_id;

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (
      this.areaFromLogin[0].length === 1 &&
      this.areaFromLogin[0][0].type === "national" &&
      this.pagination.area !== 1
    ) {
      this.pagination["after_level"] = true;
    } else {
      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(
        this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type
      );
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0]
        ? this.areaFromLogin[0].map((area_1) => area_1.id)
        : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        let second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id,
        ];
        self_area = [
          ...self_area,
          ...second_areas
            .map((area_2) => area_2.id)
            .filter((area_2) => self_area.indexOf(area_2) === -1),
        ];
      }

      let newLastSelfArea = this.checkAreaLocation(
        areaSelected[areaSelected.length - 1],
        last_self_area
      );

      if (this.pagination["after_level"]) delete this.pagination["after_level"];
      this.pagination["self_area"] = self_area;
      this.pagination["last_self_area"] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0])
        levelCovered = this.areaFromLogin[0].map((level) =>
          this.parseArea(level.type)
        );
      if (
        lastSelectedArea.value.length === 1 &&
        this.areaFromLogin.length > 1
      ) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(
          (are) => are.id === oneAreaSelected
        );
        console.log("oneArea Selected", oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log(
          "last self area",
          last_self_area,
          is_area_2,
          levelCovered,
          levelCovered.indexOf(lastSelectedArea.key) !== -1,
          lastSelectedArea
        );
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2)
            this.pagination["last_self_area"] = [last_self_area[1]];
          else this.pagination["last_self_area"] = [last_self_area[0]];
        } else {
          // console.log('its hitted [other level]');
          this.pagination["after_level"] = true;
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // console.log('its hitted [other level other]');
        this.pagination["after_level"] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      }
    }
    this.loadingIndicator = true;
    // this.pagination.area = this.formAudience.get('type').value === 'pick-all' ? 1 : area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(
      (res) => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      },
      (err) => {
        this.dataService.showLoading(false);
      }
    );
  }

  setPage(pageInfo) {
    this.pageOffset = pageInfo.offset;
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.audienceService.getListRetailer(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      let rows = this.rows.map((row) => row.id);
      // this.idbService.getAnyOf(rows).then(result => {
      //   console.log('result', result);
      //   this.selected = result;
      //   this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
      // })

      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event["newValue"];
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.audienceService.getListRetailer(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      let rows = this.rows.map((row) => row.id);
      // this.idbService.get(rows).then(result => {
      //   console.log('result', result);
      //   this.selected = result;
      //   this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
      // })

      this.loadingIndicator = false;
    });
  }

  selectAll(event) {
    console.log("event select all", event);
    if (!this.selectAllOnPage[this.pageOffset]) {
      // Unselect all so we dont get duplicates.
      if (this.selected.length > 0) {
        this.rows.map(company => {
          this.selected = this.selected.filter((selected) => selected.uuid !== company.uuid);
        })
      }
      // Select all again
      this.selected.push(...this.rows);
      this.selectAllOnPage[this.pageOffset] = true;
    } else {
      // Unselect all
      this.rows.map(company => {
        this.selected = this.selected.filter((selected) => selected.uuid !== company.uuid);
      });
      this.selectAllOnPage[this.pageOffset] = false;
    }
  }

  selectFn(allRowsSelected: boolean) {
    console.log('allRowsSelected_', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    // if (allRowsSelected) {
    //   this.formAudience.get('limit').setValue('pick-all');
    // } else {
    //   this.formAudience.get('limit').setValue('limit');
    // }
  }

  appendRows(rows, next) {
    (rows || []).map((item) => {
      this.data.push(item);
    });

    if (next) {
      let page = { page: next.split("?page=")[1] };

      this.audienceService.getListRetailer(page).subscribe((res) => {
        this.appendRows(res["data"], res["next_page_url"]);

        if (res["next_page_url"] === null) {
          this.loadingIndicator = false;
          this.rows = this.data;

          // return this.data = [];
        }
      });
    } else {
      this.loadingIndicator = false;
      this.rows = this.data;

      // return this.data = [];
    }
  }

  searchingRetailer(res) {
    let areaSelected = Object.entries(this.formFilter.getRawValue())
      .map(([key, value]) => ({ key, value }))
      .filter(
        (item: any) =>
          item.value !== null && item.value !== "" && item.value.length !== 0
      );
    let area_id = areaSelected[areaSelected.length - 1].value;
    let areaList = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (
      this.areaFromLogin[0].length === 1 &&
      this.areaFromLogin[0][0].type === "national" &&
      this.pagination.area !== 1
    ) {
      this.pagination["after_level"] = true;
    } else {
      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(
        this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type
      );
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0]
        ? this.areaFromLogin[0].map((area_1) => area_1.id)
        : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        let second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id,
        ];
        self_area = [
          ...self_area,
          ...second_areas
            .map((area_2) => area_2.id)
            .filter((area_2) => self_area.indexOf(area_2) === -1),
        ];
      }

      let newLastSelfArea = this.checkAreaLocation(
        areaSelected[areaSelected.length - 1],
        last_self_area
      );

      if (this.pagination["after_level"]) delete this.pagination["after_level"];
      this.pagination["self_area"] = self_area;
      this.pagination["last_self_area"] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0])
        levelCovered = this.areaFromLogin[0].map((level) =>
          this.parseArea(level.type)
        );
      if (
        lastSelectedArea.value.length === 1 &&
        this.areaFromLogin.length > 1
      ) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(
          (are) => are.id === oneAreaSelected
        );
        console.log("oneArea Selected", oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log(
          "last self area",
          last_self_area,
          is_area_2,
          levelCovered,
          levelCovered.indexOf(lastSelectedArea.key) !== -1,
          lastSelectedArea
        );
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2)
            this.pagination["last_self_area"] = [last_self_area[1]];
          else this.pagination["last_self_area"] = [last_self_area[0]];
        } else {
          // console.log('its hitted [other level]');
          this.pagination["after_level"] = true;
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // console.log('its hitted [other level other]');
        this.pagination["after_level"] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      }
    }

    this.loadingIndicator = true;
    this.pagination.area = area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(
      (res) => {
        this.rows = res["data"];
        this.loadingIndicator = false;
      },
      (err) => {
        console.log(err.error.message);
        this.loadingIndicator = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  getRows(id) {
    let index = this.rows.map((item) => item.id).indexOf(id);
    return this.rows[index];
  }

  getId(row: any) {
    return row.id;
  }
  getIdFunction() {
    return this.getId.bind(this);
  }

  getGroupTradeProgram() {
    this.groupTradeProgramService.get({ page: 'all' }).subscribe(res => {
      this.groupTradePrograms = res.data ? res.data.data : [];

      if (this.isEdit) {
        this.getDetail();
      }
    })
  }

  submit() {
    let args = this.getArgsForSubmit();
    if (this.formCoin.valid) {
      if (!this.isPojokBayar.value && !this.isTransferBank.value) {
        this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.please_select_exchange_options') });
        return;
      }
      if (this.isTargetedRetailer.value && !this.allRowsSelected && this.selected.length === 0) {
        this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.please_select_target_receiver') });
        return;
      }

      this.dataService.showLoading(true);
      let opsiPenukaran = this.getOpsiPenukaranValue();
      let priorities = this.formCoin.get('priorities').value;

      let body = {
        name: this.formCoin.get("name").value,
        coin_valuation: this.formCoin.get("coin_valuation").value,
        start_date: moment(this.formCoin.get("start_date").value).format("YYYY-MM-DD"),
        end_date: moment(this.formCoin.get("end_date").value).format("YYYY-MM-DD"),
        opsi_penukaran: opsiPenukaran,
        status: args && args === 'publish' ? 'publish' : (args && args === 'unpublish' ? 'unpublish' : 'draft'),
        targeted_audience: this.isTargetedRetailer.value ? "1" : "0",
        group_trade_id_priorities: priorities.filter(list => list.group_id !== "").map(item => item.group_id),
      }

      let fd = new FormData();
      if (this.isEdit) fd.append('_method', 'PUT');
      fd.append("name", body['name']);
      fd.append("coin_valuation", body['coin_valuation']);
      fd.append("start_date", body['start_date']);
      fd.append("end_date", body['end_date']);
      fd.append("opsi_penukaran", body['opsi_penukaran']);
      fd.append("status", body['status']);
      fd.append("targeted_audience", body['targeted_audience']);

      let groupTradeProgramsValue = this.formCoin.get("group_trade_id").value;
      if (Array.isArray(groupTradeProgramsValue)) {
        groupTradeProgramsValue.map((gtp, idx) => {
          fd.append(`group_trade_id[]`, gtp);
        });
      }

      if (this.isTargetedRetailer.value && !this.allRowsSelected) {
        this.selected.map(retailer => {
          fd.append("retailer_id[]", retailer.id);
        })
      }
      if (this.isTargetedRetailer.value && this.allRowsSelected) {
        if (this.pagination['area'] && Array.isArray(this.pagination['area'])) {
          this.pagination['area'].map(area => {
            fd.append('area_id[]', area);
          });
        }
        fd.append('classification', this.pagination['classification']);
      }
      if (body["group_trade_id_priorities"].length) {
        body["group_trade_id_priorities"].forEach(id => {
          fd.append('group_trade_id_priorities[]', id);
        })
      }

      if (this.isEdit) {
        this.coinDisburstmentService.update({ coin_id: this.detailCoin.id }, fd).subscribe(res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.dataService.showLoading(false);
          this.router.navigate(['dte', 'coin-disbursement']);
        }, err => {
          this.dataService.showLoading(false);
        });
      } else {
        this.coinDisburstmentService.create(fd).subscribe(res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.dataService.showLoading(false);
          this.dataService.setToStorage("detail_coin_disburstment", { id: res.id });
          this.dataService.setToStorage("coin_disburstment_selected_tab", "1");
          this.router.navigate(['dte', 'coin-disbursement', 'edit']);
        }, err => {
          this.dataService.showLoading(false);
        });
      }
    } else {
      console.log(this.findInvalidControls(this.formCoin));
      commonFormValidator.validateAllFields(this.formCoin);
      this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.please_fill_form') });
    }
  }

  findInvalidControls(f: FormGroup) {
    const invalid = [];
    const controls = f.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  getOpsiPenukaranValue() {
    let value = "";
    if (this.isTransferBank.value && this.isPojokBayar.value) value = "all";
    else if (this.isTransferBank.value && !this.isPojokBayar.value) value = "transfer bank";
    else if (this.isPojokBayar.value && !this.isTransferBank.value) value = "saldo pojok bayar";

    return value;
  }

  getArgsForSubmit() {
    if (this.isEdit) {
      switch (this.detailCoin.status) {
        case "draft":
          return "publish";
        case "publish":
          return "unpublish";
        default:
          return null;
      }
    }

    return null;
  }

  importAudience() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      ImportAudienceDialogComponent,
      dialogConfig
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        let rows = this.rows.map((row) => row.id);
        this.idbService
          .getAll((dt) => dt.is_valid)
          .then((result) => {
            console.log("result", result);
            this.onSelect({ selected: result });
            this.dialogService.openSnackBar({
              message: this.translate.instant('global.messages.text8'),
            });
          });
      }
    });
  }

  async exportAudience() {
    this.exportTemplate = true;
    const body = {
      retailer_id:
        this.selected.length > 0 ? this.selected.map((item) => item.id) : [],
    };

    try {
      const response = await this.audienceService.exportExcel(body).toPromise();
      this.downloadLink.nativeElement.href = response.data;
      this.downloadLink.nativeElement.click();
      this.exportTemplate = false;
    } catch (error) {
      console.log("err", error);
      this.exportTemplate = false;
      throw error;
    }
  }

  groupChosen(event) {
    let priorities = this.formCoin.get('priorities') as FormArray;
    const newPriority = [...this.priority_list];

    if (event.value.length < newPriority.length) {
      newPriority.forEach(item => {
        const hasValue = event.value.some(selected => selected === item.id);
        
        if (!hasValue) {
          const index = priorities.value.findIndex(list => list.group_id === item.id);
          if (index > -1) {
            priorities.value.length > 1 ? this.removePriority(index) : priorities.at(0).get("group_id").setValue("");
          }
        };
      })
    };
    
    const newList = [];
    event.value.forEach(group_id => {
      const item = this.groupTradePrograms.find(group => group.id === group_id);
      newList.push(item);
    });
    this.priority_list = [...newList];
  }

  addPriority(index){
    let priorities = this.formCoin.get('priorities') as FormArray;

    priorities.insert((index + 1), this.formBuilder.group({
      group_id: [""]
    }));
  }

  removePriority(index){
    let priorities = this.formCoin.get('priorities') as FormArray;
    priorities.removeAt(index);
  }

  isPriorityUsed(id){
    let priorities = this.formCoin.get('priorities') as FormArray;
    
    let value = false;
    priorities.value.forEach(item => {
      if (item.group_id === id) {
        value = true;
      }
    });

    return value;
  }
}
