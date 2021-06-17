import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
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
import { DataService } from '../../../services/data.service';
import { AudienceService } from "../../../services/dte/audience.service";
import { DialogService } from "../../../services/dialog.service";
import { Subject, Observable, ReplaySubject, Subscription } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import { takeUntil } from "rxjs/operators";
import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
import { commonFormValidator } from "../../../classes/commonFormValidator";
import { Page } from "../../../classes/laravel-pagination";
import * as _ from "underscore";
import { environment } from "environments/environment";
import { GeotreeService } from "app/services/geotree.service";
import { IdbService } from "app/services/idb.service";
import {NotesRetailerModel} from 'app/pages/notes-retailer/notes-retailer.model';
import { NotesRetailerService } from '../../../services/notes-retailer/notes-retailer.service';
import { ImportNotesDialogComponent } from '../import-component/import-notes-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'app-create-notes-retailer.component',
  templateUrl: './create-notes-retailer.component.html'
})
export class CreateNotesRetailerComponent implements OnInit {
  formAudience: FormGroup;
  formAudienceError: any;
  parameters: Array<string>;
  paramEdit: any = null;

  listScheduler: any[];
  listTradePrograms: any[];
  listRetailer: any;
  rows: any[];
  listType: any[] = [
    { name: "Batasi Audience", value: "limit" },
    { name: "Pilih Semua", value: "pick-all" },
  ];
  tsmScheduler: any[] = [
    { name: "TSM", value: "tsm" },
    { name: "Scheduler", value: "scheduler" },
  ];
  listAudienceType: any[] = [{ name: 'Misi', value: 'mission' }, { name: 'Tantangan', value: 'challenge' }];

  retailClassification: any[] = [
    { name: "Semua Tipe", value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
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
  private subscription: Subscription;
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  formFilterRetailer: FormGroup;
  notesMdl: NotesRetailerModel;

  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  allRowsSelected: boolean;
  swithchBool:  Boolean = true;

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterTradeProgram: FormControl = new FormControl();
  public filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );

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
    private route: ActivatedRoute,
    private notesRetailerService: NotesRetailerService,
  ) {
    this.notesMdl = new NotesRetailerModel();
    this.exportTemplate = false;
    this.saveData = false;
    this.rows = [];
    this.formAudienceError = {
      name: {},
      min: {},
      max: {},
      trade_scheduler_id: {},
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
    console.log('ini ob', this.notesMdl);

    this.subscription = this.route.params.subscribe((params) => {
      if (params['id']) {
        this.paramEdit = params['id'];
        this.notesMdl =  this.dataService.getFromStorage('detail_notes');
        }
      });

    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", [Validators.required, Validators.min(0)]],
      max: ["", [Validators.required, Validators.min(0)]],
      limit: ["limit"],
      type: ["mission", Validators.required],
      audience_type: ["tsm", Validators.required],
      business_checkbox: true,
      geotree_checkbox: true,
      trade_scheduler_id: [""],
      trade_creator_id: [""],
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
      retail_classification: [''],
      src_classification: [''],
      src_type: ['']
    });

    // this.initArea();
    this.initAreaV2();
    this.getRetailer();

    this.formAudience.controls["limit"].valueChanges.subscribe((res) => {
      if (res === "pick-all") {
        this.formAudience.get("min").disable({ emitEvent: false });
        this.formAudience.get("max").disable({ emitEvent: false });

        // this.getRetailer();
      } else {
        this.formAudience.get("min").enable({ emitEvent: false });
        this.formAudience.get("max").enable({ emitEvent: false });
      }
    });

    this.formAudience.controls["min"].valueChanges
      .debounceTime(500)
      .subscribe((res) => {
        if (this.formAudience.get("min").valid) {
          this.formAudience
            .get("max")
            .setValidators([Validators.required, Validators.min(res)]);
          this.formAudience.get("max").updateValueAndValidity();
        }
      });

    // this.getListScheduler();

    this.formAudience.get("audience_type").valueChanges.subscribe((data) => {
      if (data === 'scheduler' && this.formAudience.get("type").value === 'mission') {
        this.getListScheduler();
      }
    })
    this.formAudience.get("type").valueChanges.subscribe((data) => {
      console.log("type", data);
      if (data === "mission") {
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
        this.formAudience
          .get("trade_creator_id")
          .setValidators(Validators.required);
        this.formAudience.get("trade_scheduler_id").setValidators([]);
        this.formAudience.get("trade_scheduler_id").clearValidators();
        this.formAudience.get("trade_scheduler_id").updateValueAndValidity();
      }
    });

    this.formAudience.valueChanges.subscribe(() => {
      this.valueChange = true;
    });

    this.formFilter.valueChanges.debounceTime(1000).subscribe((res) => {
    });

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
    this.formFilter.get("salespoint").valueChanges.subscribe((res) => {
      console.log("salespoint", res);
      if (res) {
        this.getAudienceAreaV2("district", res);
      }
    });
    this.formFilter.get("district").valueChanges.subscribe((res) => {
      console.log("district", res);
      if (res) {
        this.getAudienceAreaV2("territory", res);
      }
    });

    this.formFilterRetailer.valueChanges.debounceTime(1000).subscribe((res) => {
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
  onChangeInputSlide(event: any, i: number) {
    if (event.checked == true) {
      this.notesMdl.status = 'Active';
    } else {
      this.notesMdl.status = 'Not Active';
    }
  }
  klikCreate() {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    this.notesMdl.status = 'active';
    this.notesMdl.retailer_id = this.selected.map((map) => map.id);
    this.notesMdl.start_date = this.convertDate(this.notesMdl.start_date);
    this.notesMdl.end_date =  this.convertDate(this.notesMdl.end_date);
    this.notesRetailerService.create(this.notesMdl).subscribe((res) => {
      this.selected = [];
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      this.router.navigate(["notesretailer", "notes-retailer-list"]);
    });
  }
  klikUpdate() {
    this.loadingIndicator = true;
    this.dataService.showLoading(true);
    this.notesMdl.retailer_id = this.selected.map((map) => map.id);
    this.notesMdl.start_date = this.convertDate(this.notesMdl.start_date);
    this.notesMdl.end_date =  this.convertDate(this.notesMdl.end_date);
    this.notesRetailerService.put(this.notesMdl, this.paramEdit).subscribe((res) => {
      window.localStorage.removeItem('detail_audience');
      this.selected = [];
      this.router.navigate(["notesretailer", "notes-retailer-list"]);
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    });
  }
  loadFormFilter() {
    this.getRetailer();
  }

  clickMe(input, parameter) {
    if (parameter !== null) {
      this.parameters.push(parameter);
      input.value = "";
    }
  }
  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

  deleteLanguage(paramter) {
    const index = this.parameters.indexOf(paramter);
    if (index >= 0) this.parameters.splice(index, 1);
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
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1)
              this.formFilter.get(this.parseArea(level.type)).disable();
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
  }

  parseArea(type) {
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
    }

    switch (this.parseArea(selection)) {
      case "zone":
        this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
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
          item =
            this.list["zone"].length > 0
              ? this.list["zone"].filter((item) => {
                  return id && id.length > 0 ? id[0] : id;
                })[0]
              : {};
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
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
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
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
        if (id && id.length !== 0) {
          item =
            this.list["salespoint"].length > 0
              ? this.list["salespoint"].filter((item) => {
                  return id && id.length > 0 ? id[0] : id;
                })[0]
              : {};
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
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
        if (id && id.length !== 0) {
          item =
            this.list["district"].length > 0
              ? this.list["district"].filter((item) => {
                  return id && id.length > 0 ? id[0] : id;
                })[0]
              : {};
          if (item && item.name && item.name !== "all") {
            this.geotreeService.getChildFilterArea(fd).subscribe((res) => {
              this.list[selection] =
                expectedArea.length > 0
                  ? res.data.filter((dt) =>
                      expectedArea.map((eArea) => eArea.id).includes(dt.id)
                    )
                  : res.data;
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

  getListScheduler() {
    this.audienceService.getListScheduler().subscribe(
      (res) => {
        console.log("res scheduler new", res);
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
          if (is_area_2)
            this.pagination["last_self_area"] = [last_self_area[1]];
          else this.pagination["last_self_area"] = [last_self_area[0]];
        } else {
          this.pagination["after_level"] = true;
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        this.pagination["after_level"] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      }
    }
    this.loadingIndicator = true;

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

  initArea() {
    console.log("areaform login", this.areaFromLogin);
    this.areaFromLogin.map((item) => {
      let level_desc = "";
      switch (item.type.trim()) {
        case "national":
          level_desc = "zone";
          this.formFilter.get("national").setValue(item.id);
          this.formFilter.get("national").disable();
          break;
        case "division":
          level_desc = "region";
          this.formFilter.get("zone").setValue(item.id);
          this.formFilter.get("zone").disable();
          break;
        case "region":
          level_desc = "area";
          this.formFilter.get("region").setValue(item.id);
          this.formFilter.get("region").disable();
          break;
        case "area":
          level_desc = "salespoint";
          this.formFilter.get("area").setValue(item.id);
          this.formFilter.get("area").disable();
          break;
        case "salespoint":
          level_desc = "district";
          this.formFilter.get("salespoint").setValue(item.id);
          this.formFilter.get("salespoint").disable();
          break;
        case "district":
          level_desc = "territory";
          this.formFilter.get("district").setValue(item.id);
          this.formFilter.get("district").disable();
          break;
        case "territory":
          this.formFilter.get("territory").setValue(item.id);
          this.formFilter.get("territory").disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case "zone":
        this.audienceService
          .getListOtherChildren({ parent_id: id })
          .subscribe((res) => {
            this.list[selection] = res;
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
        break;
      case "region":
        item =
          this.list["zone"].length > 0
            ? this.list["zone"].filter((item) => item.id === id)[0]
            : {};
        if (item.name !== "all") {
          this.audienceService
            .getListOtherChildren({ parent_id: id })
            .subscribe((res) => {
              this.list[selection] = res;
            });
        } else {
          this.list[selection] = [];
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
        item =
          this.list["region"].length > 0
            ? this.list["region"].filter((item) => item.id === id)[0]
            : {};
        if (item.name !== "all") {
          this.audienceService
            .getListOtherChildren({ parent_id: id })
            .subscribe((res) => {
              this.list[selection] = res;
            });
        } else {
          this.list[selection] = [];
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
        item =
          this.list["area"].length > 0
            ? this.list["area"].filter((item) => item.id === id)[0]
            : {};
        if (item.name !== "all") {
          this.audienceService
            .getListOtherChildren({ parent_id: id })
            .subscribe((res) => {
              this.list[selection] = res;
            });
        } else {
          this.list[selection] = [];
        }

        this.formFilter.get("salespoint").setValue("");
        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["district"] = [];
        this.list["territory"] = [];
        break;
      case "district":
        item =
          this.list["salespoint"].length > 0
            ? this.list["salespoint"].filter((item) => item.id === id)[0]
            : {};
        if (item.name !== "all") {
          this.audienceService
            .getListOtherChildren({ parent_id: id })
            .subscribe((res) => {
              this.list[selection] = res;
            });
        } else {
          this.list[selection] = [];
        }

        this.formFilter.get("district").setValue("");
        this.formFilter.get("territory").setValue("");
        this.list["territory"] = [];
        break;
      case "territory":
        item =
          this.list["district"].length > 0
            ? this.list["district"].filter((item) => item.id === id)[0]
            : {};
        if (item.name !== "all") {
          this.audienceService
            .getListOtherChildren({ parent_id: id })
            .subscribe((res) => {
              this.list[selection] = res;
            });
        } else {
          this.list[selection] = [];
        }

        this.formFilter.get("territory").setValue("");
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
  importAudience() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      ImportNotesDialogComponent,
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
              message: "File berhasil diimport",
            });
          });
      }
    });
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
          this.pagination["after_level"] = true;
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
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

  tsmOrScheduler() {
    console.log('');
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  getRows(id) {
    let index = this.rows.map((item) => item.id).indexOf(id);
    return this.rows[index];
  }

  getId(row) {
    return row.id;
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
      this.exportTemplate = false;
      throw error;
    }
  }
}
