import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { formatCurrency } from "@angular/common";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import { takeUntil } from "rxjs/operators";
import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
import { commonFormValidator } from "../../../../../classes/commonFormValidator";
import { Page } from "../../../../../classes/laravel-pagination";
import * as _ from "underscore";
import { ImportAudienceDialogComponent } from "../../import/import-audience-dialog.component";
import { environment } from "environments/environment";
import { GeotreeService } from "app/services/geotree.service";
import { IdbService } from "app/services/idb.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { SequencingService } from "app/services/dte/sequencing.service";
import { DialogPanelBlastComponent } from "../../dialog/dialog-panel-blast/dialog-panel-blast.component";
import { DialogProcessComponent } from "../../dialog/dialog-process/dialog-process.component";
import { merge } from "rxjs/observable/merge";
import { ImportAudiencePersonalizeComponent } from "../../import/personalize/import-audience-personalize.component";

@Component({
  selector: 'app-audience-create-personalize',
  templateUrl: './audience-create-personalize.component.html',
  styleUrls: ['./audience-create-personalize.component.scss']
})
export class AudienceCreatePersonalizeComponent implements OnInit {
  formAudience: FormGroup;
  formAudienceError: any;
  parameters: Array<string>;

  listScheduler: any[];
  listTradePrograms: any[];
  listRetailer: any;
  rows: any[];

  audienceFilter: any[] = [
    { name: "Population Blast", value: "population-blast" },
    { name: "Recommended Panel", value: "recommended-panel" },
  ];

  retailClassification: any[] = [
    { name: "Semua Tipe", value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
  ];
  b2bActiveList: any[] = [
    { name: "Active", value: "active" },
    { name: "Not Active", value: "inactive" },
  ];
  srcClassification: any[] = [
    { name: "Semua Tipe", value: "all" }
  ];
  srcType: any[] = [
    { name: "Semua Tipe", value: "all" }
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
  isChecked: boolean = false;
  data_imported: any = [];

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public audienceFixed: FormControl = new FormControl();
  listPublishMisi: any[];
  public filterPublishMisi: FormControl = new FormControl();
  public filteredPublishMisi: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild("downloadLink") downloadLink: ElementRef;
  @ViewChild("singleSelect") singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.exportTemplate) {
      return true;
    }

    if (
      (this.valueChange && !this.saveData) ||
      (this.selected.length > 0 && !this.saveData)
    )
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
    private dialog: MatDialog,
    private geotreeService: GeotreeService,
    private idbService: IdbService,
    private ls: LanguagesService,
    private sequencingService: SequencingService,
    ) {
    this.exportTemplate = false;
    this.saveData = false;
    this.rows = [];
    this.formAudienceError = {
      name: {},
      mission_publication_id: {},
    };

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
    this.area = dataService.getDecryptedProfile()["area_type"];
    this.parameters = [];
  }

  ngOnInit() {
    this.idbService.reset();

    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      mission_publication_id: ["", Validators.required],
      audience_filter: ["population-blast"],
      panel_count: ["---"],
      est_task_compliance: []
    });

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
      retail_classification: [['all']],
      b2b_active: ['', Validators.required],
      total_required_panel: ['', Validators.required],
    });

    this.handleAudienceFilter(this.formAudience.get('audience_filter').value);
    this.initAreaV2();
    this.getPublishMisi();

    merge(
      this.formAudience.get('mission_publication_id').valueChanges,
      this.formFilter.valueChanges,
      this.formFilterRetailer.valueChanges,
    ).subscribe((res) => {
      if (res) {
        this.isChecked = false;
      }
    });

    this.filterScheduler.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringScheduler();
      });

    this.filterPublishMisi.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringPublishMisi();
      });

    this.formFilter.get("zone").valueChanges.subscribe((res) => {
      console.log("zone", res);
      if (res) {
        this.getAudienceAreaV2("region", res);
      }
    });
    this.formFilter.get("region").valueChanges.subscribe((res) => {
      console.log("region", res);
      if (res) {
        this.getAudienceAreaV2("area", res);
      }
    });
    this.formFilter.get("area").valueChanges.subscribe((res) => {
      console.log("area", res, this.formFilter.value["area"]);
      if (res) {
        this.getAudienceAreaV2("salespoint", res);
      }
    });
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
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) {
            this.getAudienceAreaV2(
              this.geotreeService.getNextLevel(this.parseArea(level.type)),
              level.id
            );
          }

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

  getAudienceAreaV2(selection, id) {
    let item: any;
    let fd = new FormData();
    let lastLevel = this.geotreeService.getBeforeLevel(
      this.parseArea(selection)
    );
    let areaSelected: any = Object.entries(this.formFilter.getRawValue())
      .map(([key, value]) => ({ key, value }))
      .filter((item) => item.key === this.parseArea(lastLevel));
      
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
        this.dataService.showLoading(true);
        this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
          this.dataService.showLoading(false);
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
        if (id && id.length !== 0) {
          item = this.list["zone"].length > 0 ?
                this.list["zone"].filter((item) => {
                  return id && id.length > 0 ? id[0] : id;
                })[0] : {};

          if (item && item.name && item.name !== "all") {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              this.dataService.showLoading(false);
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
        if (id && id.length !== 0) {
          item =
            this.list["region"].length > 0
              ? this.list["region"].filter((item) => {
                  return id && id.length > 0 ? id[0] : id;
                })[0]
              : {};
          console.log("area hitted", selection, item, this.list["region"]);
          if (item && item.name && item.name !== "all") {
            this.dataService.showLoading(true);
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              this.dataService.showLoading(false);
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
      default:
        break;
    }
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  filteringPublishMisi() {
    if (!this.listPublishMisi) {
      return;
    }
    // get the search keyword
    let search = this.filterPublishMisi.value;
    if (!search) {
      this.filteredPublishMisi.next(this.listPublishMisi.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredPublishMisi.next(
      this.listPublishMisi.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getPublishMisi() {
    this.sequencingService.getPersonalize({ page: 'all' }).subscribe(
      (res) => {
        this.listPublishMisi = res.data.data;
        this.filteredPublishMisi.next(res.data.data);
      },
      (err) => {
        console.log("err publish misi", err);
      }
    );
  }

  getListScheduler() {
    this.audienceService.getListScheduler().subscribe(
      (res) => {
        this.listScheduler = res.data;
        this.filteredScheduler.next(res.data);
      },
      (err) => {
        console.log("err list scheduler new", err);
      }
    );
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
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        let areaSelectedOnRawValues: any = rawValues.find(
          (raw) => raw.key === areaAfterEndLevel
        );
        newLastSelfArea = this.list[areaAfterEndLevel]
          .filter((ar) => areaSelectedOnRawValues.value.includes(ar.id))
          .map((ar) => ar.parent_id)
          .filter((v, i, a) => a.indexOf(v) === i);
      }
    }

    return newLastSelfArea;
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.audienceService.getListRetailer(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      let rows = this.rows.map((row) => row.id);

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

      this.loadingIndicator = false;
    });
  }

  selectFn(allRowsSelected: boolean) {
    console.log('allRowsSelected_', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    if (allRowsSelected) {
      this.formAudience.get('limit').setValue('pick-all');
    } else {
      this.formAudience.get('limit').setValue('limit');
    }
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
      this.listScheduler.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
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

  changeValue() {
    if (this.formAudience.get("limit").value === "pick-all") {
      this.selected = this.rows;
    } else {
      this.selected = [];
    }
  }

  handleAudienceFilter(value) {
    this.formAudience.get('audience_filter').setValue(value);

    if (value !== 'recommended-panel') {
      this.formFilterRetailer.get('b2b_active').setValue('');
      this.formFilterRetailer.get('total_required_panel').setValue('');
      this.formFilterRetailer.get('b2b_active').disable();
      this.formFilterRetailer.get('total_required_panel').disable();
    } else {
      this.formFilterRetailer.get('b2b_active').enable();
      this.formFilterRetailer.get('total_required_panel').enable();
    }

    if (value !== 'fixed-panel') {
      this.audienceFixed.setValue('');
    }
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

  submit() {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;

    const zones = this.formFilter.get('zone').value;
    const region = this.formFilter.get('region').value;
    const area = this.formFilter.get('area').value;

    if (this.formAudience.valid) {
      const audience_filter = this.formAudience.get("audience_filter").value;
      let body = {};

      if (audience_filter !== "fixed-panel") {
        body = {
          mission_publication_id: this.formAudience.get("mission_publication_id").value,
          name: this.formAudience.get("name").value,
          panel_count: this.formAudience.get("panel_count").value,
          est_task_compliance: this.formAudience.get("est_task_compliance").value,
          audience_filter: audience_filter,
          
          class_groups: this.formFilterRetailer.get("retail_classification").value,
          zones: zones.length ? zones : ["all"],
          regions: region.length ? region : ["all"],
          areas: area.length ? area : ["all"],
        };

        if (audience_filter === "recommended-panel") {
          body['audience_filter_data'] = {
            b2b_active: this.formFilterRetailer.get("b2b_active").value,
            panel_required: this.formFilterRetailer.get("total_required_panel").value
          };
        }
      } else {
        body = {
          mission_publication_id: this.formAudience.get("mission_publication_id").value,
          name: this.formAudience.get("name").value,
          panel_count: this.formAudience.get("panel_count").value,
          est_task_compliance: this.formAudience.get("est_task_compliance").value,
          audience_filter: audience_filter,
          
          retailers: this.data_imported.map(item => item.id)
        }
      }

      // console.log('body', body);

      this.audienceService.createPersonalize(body).subscribe(
        (res) => {
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22,
          });
          this.router.navigate(["dte", "audience"]);
        },
        (err) => {
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar(err.error.message);
        }
      );
    } else {
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      commonFormValidator.validateAllFields(this.formAudience);

      return this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!",
      });
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

  checkAudience(){
    const zones = this.formFilter.get('zone').value;
    const region = this.formFilter.get('region').value;
    const area = this.formFilter.get('area').value;

    if (this.formAudience.valid && this.formFilterRetailer.valid) {
      const audience_filter = this.formAudience.get("audience_filter").value;
      let body = {};

      if (audience_filter !== "fixed-panel") {
        body = {
          mission_publication_id: this.formAudience.get("mission_publication_id").value,
          audience_filter: audience_filter,
          
          class_groups: this.formFilterRetailer.get("retail_classification").value,
          zones: zones.length ? zones : ["all"],
          regions: region.length ? region : ["all"],
          areas: area.length ? area : ["all"],
        };

        if (audience_filter === "recommended-panel") {
          body['audience_filter_data'] = {
            b2b_active: this.formFilterRetailer.get("b2b_active").value,
            panel_required: this.formFilterRetailer.get("total_required_panel").value
          };
        }
      } else {
        if (!this.data_imported.length) {
          this.dialogService.openSnackBar({
            message: "Silahkan import file terlebih dahulu",
          });
          return;
        }

        body = {
          mission_publication_id: this.formAudience.get("mission_publication_id").value,
          audience_filter: audience_filter,
          retailers: this.data_imported.map(item => item.id)
        }
      }
  
      // console.log('body', body);

      const dialogConfig = new MatDialogConfig();
  
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = "scrumboard-card-dialog";
      dialogConfig.data = { password: "P@ssw0rd" };
  
      this.dialogRef = this.dialog.open(
        DialogProcessComponent,
        {...dialogConfig, width: '400px'}
      );

      const processCheck = this.audienceService.checkAudience(body).subscribe(
        (res) => {
          if (res.data) {
            this.isChecked = true;
            this.formAudience.get("panel_count").setValue(res.data.panel_count);
            this.formAudience.get("est_task_compliance").setValue(res.data.est_task_compliance);
          }
          this.dialogRef.close();
          this.dialogService.openSnackBar({message : 'Proses Check Berhasil'});
        },
        (err) => {
          this.dialogRef.close();
        }
      );

      this.dialogRef.afterClosed().subscribe(() => {
        processCheck.unsubscribe();
      });

    } else {
      commonFormValidator.validateAllFields(this.formAudience);
      commonFormValidator.validateAllFields(this.formFilterRetailer);

      return this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!",
      });
    }
  }

  handleEstimate(value){
    return typeof(value) === 'number' ? `${value * 100}%` : '---';
  }

  handleClassification(event){
    if (event.isUserInput) {
      const {value, selected} = event.source;
      const retailer = this.formFilterRetailer.get('retail_classification');

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
}