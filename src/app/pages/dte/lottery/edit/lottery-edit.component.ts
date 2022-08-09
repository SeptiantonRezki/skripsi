import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialog } from "@angular/material";
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'app/classes/config';
import { LanguagesService } from 'app/services/languages/languages.service';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { LotteryService } from "app/services/dte/lottery.service";
import { AudienceService } from "app/services/dte/audience.service";
import { DialogService } from 'app/services/dialog.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { merge } from "rxjs/observable/merge";
import { DialogPanelBlastComponent } from "../dialog/dialog-panel-blast/dialog-panel-blast.component";
import { DialogProcessComponent } from "../dialog/dialog-process/dialog-process.component";
import { ImportAudiencePersonalizeComponent } from "../import/personalize/import-audience-personalize.component";
import { GeotreeService } from "app/services/geotree.service";

@Component({
  selector: 'app-lottery-edit',
  templateUrl: './lottery-edit.component.html',
  styleUrls: ['./lottery-edit.component.scss']
})
export class LotteryEditComponent implements OnInit {
  selectedTab: number = 0;
  detailFormUndian: any;
  parameters: Array<string>;

  formUndian: FormGroup;
  formAudience: FormGroup;
  formAudienceError: any;
  formFilter: FormGroup;
  formFilterRetailer: FormGroup;

  // formAudience: FormGroup;
  // formPreview: FormGroup;
  onLoad: boolean;
  minDate = new Date();
  groupTradePrograms: any[] = [];

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;
  imageConverted: any;
  preview_header: FormControl = new FormControl("");
  isChecked: boolean = false;

retailClassification: any[] = [
  { name: this.translate.instant('global.label.all_type'), value: "all" },
  { name: "SRC", value: "SRC" },
  { name: "NON-SRC", value: "NON-SRC" },
  { name: "IMO", value: "IMO" },
  { name: "LAMP/HOP", value: "LAMP/HOP" },
  { name: "GT", value: "GT" },
  { name: "KA", value: "KA" }
];
b2bActiveList: any[] = [
  { name: this.translate.instant('global.label.all_status'), value: "all" },
  { name: this.translate.instant('global.label.active'), value: "active" },
  { name: this.translate.instant('global.label.inactive'), value: "inactive" },
];
srcClassification: any[] = [
  { name: this.translate.instant('global.label.all_type'), value: "all" }
];
srcType: any[] = [
  { name: this.translate.instant('global.label.all_type'), value: "all" }
];
  

  statusTP: any[] = [{ name: this.translate.instant('dte.trade_program.text6'), value: 'publish' }, { name: this.translate.instant('dte.trade_program.text7'), value: 'unpublish' }]

  listGroupTradeProgram: any[] = [];
  listSubGroupTradeProgram: any[] = [];

  audienceFilter: any[] = [
    { name: this.translate.instant('dte.audience.population_blast'), value: "population-blast" },
  ];

  dialogRef: any;
  data_imported: any = [];
  exportTemplate: Boolean;
  previewAudienceList: any[];

  areaFromLogin;
  listLevelArea: any[];
  list: any;
  searchRetailer = new Subject<string>();
  area: Array<any>;

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;
  detailAudience: any;
  initDetailGeoTree: any = {
    zone: false,
    region: false,
    area: false,
  };

  private _onDestroy = new Subject<void>();
  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterSGTP: FormControl = new FormControl();
  public filteredSGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public options: Object = { ...Config.FROALA_CONFIG, placeholderText: "" };
  public audienceFixed: FormControl = new FormControl();
  @ViewChild("downloadLink") downloadLink: ElementRef;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private groupTradeProgramService: GroupTradeProgramService,
    private lotteryService: LotteryService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private dataService: DataService,
    private audienceService: AudienceService,
    private geotreeService: GeotreeService,
  ) {
    this.onLoad = true

    this.detailFormUndian = this.dataService.getFromStorage('detail_lottery');
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

    // this.searchRetailer
    //   .debounceTime(500)
    //   .flatMap((search) => {
    //     return Observable.of(search).delay(500);
    //   })
    //   .subscribe((res) => {
    //     this.searchingRetailer(res);
    //   });
    this.area = dataService.getDecryptedProfile()["area_type"];
    this.detailAudience = dataService.getFromStorage('detail_audience');
    this.parameters = [];

  }

  ngOnInit() {
    this.formUndian = this.formBuilder.group({
      name: ["", Validators.required],
      coin: ["", Validators.required],
      group_trade_program_id: [""],
      sub_group_trade_program_id: [""],
      start_date: [new Date()],
      end_date: [new Date()],
      announcement_date:  [new Date()],
    });

    this.formAudience = this.formBuilder.group({
      // name: ["", Validators.required],
      audience_filter: ["population-blast"],
      panel_count: ["---"],
      est_task_compliance: [""]
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
      // b2b_active: ['', Validators.required],
      // total_required_panel: ['', Validators.required],
    });

    this.initAreaV2();

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

    // merge(
    //   this.formAudience.get('mission_publication_id').valueChanges,
    //   this.formFilter.valueChanges,
    //   this.formFilterRetailer.valueChanges,
    // ).subscribe((res) => {
    //   if (res) {
    //     this.isChecked = false;
    //   }
    // });
    
    this.formUndian.setValue({
      name: this.detailFormUndian.name,
      coin: this.detailFormUndian.coin,
      start_date: this.convertDate(this.detailFormUndian.start_date),
      end_date: this.convertDate(this.detailFormUndian.end_date),
      announcement_date: this.convertDate(this.detailFormUndian.announcement_date),
      group_trade_program_id: parseInt(this.detailFormUndian.trade_creator_group_id, 10) ? this.detailFormUndian.trade_creator_group_id.split(',').map(rs => Number(rs)) : '',
      sub_group_trade_program_id: parseInt(this.detailFormUndian.trade_creator_sub_group_id, 10) ? this.detailFormUndian.trade_creator_sub_group_id.split(',').map(rs => Number(rs))  : '',
    })
    
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
  }

  handleAudienceFilter(value) {
    this.formAudience.get('audience_filter').setValue(value);
    // this.formFilterRetailer.get('b2b_active').enable();
    // this.formFilterRetailer.get('total_required_panel').enable();

    if (value !== 'fixed-panel') {
      this.audienceFixed.setValue('');
    } else {
      this.audienceFixed.setValue(value);
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



//  ---------------

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

        if (!this.initDetailGeoTree.zone) {
          if (this.detailAudience.hasOwnProperty('zones')) {
            const zones = this.detailAudience.zones[0];
            const detailZones = zones > 1 ? this.detailAudience.zones : [];
            this.formFilter.get('zone').setValue(detailZones);
            this.initDetailGeoTree.zone = true
          }
        }
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
            
            if (!this.initDetailGeoTree.region) {
              if (this.detailAudience.hasOwnProperty('regions')) {
                const regions = this.detailAudience.regions[0];
                const detailRegions = regions > 1 ? this.detailAudience.regions : [];
                this.formFilter.get('region').setValue(detailRegions);
                this.initDetailGeoTree.region = true
              }
            }
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
            
            if (!this.initDetailGeoTree.area) {
              if (this.detailAudience.hasOwnProperty('areas')) {
                const areas = this.detailAudience.areas[0];
                const detailAreas = areas > 1 ? this.detailAudience.areas : [];
                this.formFilter.get('area').setValue(detailAreas);
                this.initDetailGeoTree.area = true
              }
            }
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

// -----------------








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

  submit(): void {

    if (this.formUndian.valid) {
      let fd = new FormData();

      let body = {
        _method: 'PUT',
        name: this.formUndian.get('name').value,
        coin: this.formUndian.get('coin').value,
        start_date: this.convertDate(this.formUndian.get('start_date').value),
        end_date: this.convertDate(this.formUndian.get('end_date').value),
        announcement_date: this.convertDate(this.formUndian.get('announcement_date').value),
      }

      fd.append('_method', body._method);
      fd.append('name', body.name);
      fd.append('coin', body.coin);
      fd.append('start_date', body.start_date);
      fd.append('end_date', body.end_date);
      fd.append('announcement_date', body.announcement_date);
      fd.append('trade_creator_group_id[]', this.formUndian.get('group_trade_program_id').value);
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

  submitAudience(): void {

    if (this.formAudience.valid) {
      let fd = new FormData();

      let body = {
        _method: 'PUT',
        name: this.formUndian.get('name').value,
        coin: this.formUndian.get('coin').value,
        start_date: this.convertDate(this.formUndian.get('start_date').value),
        end_date: this.convertDate(this.formUndian.get('end_date').value),
        announcement_date: this.convertDate(this.formUndian.get('announcement_date').value),
      }

      fd.append('_method', body._method);
      fd.append('name', body.name);
      fd.append('coin', body.coin);
      fd.append('start_date', body.start_date);
      fd.append('end_date', body.end_date);
      fd.append('announcement_date', body.announcement_date);
      fd.append('trade_creator_group_id[]', this.formUndian.get('group_trade_program_id').value);
      fd.append('trade_creator_sub_group_id[]', this.formUndian.get('sub_group_trade_program_id').value);

      this.lotteryService.put_audience(fd, { lottery_id: this.detailFormUndian.id }).subscribe(
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
      console.log("err", error);
      this.dataService.showLoading(false);
      this.exportTemplate = false;
      throw error;
    }
  }

  showPanelBlast() {
    // if (this.isDetail) {
    //   const dialogConfig = new MatDialogConfig();
  
    //   dialogConfig.disableClose = true;
    //   dialogConfig.autoFocus = true;
    //   dialogConfig.panelClass = "scrumboard-card-dialog";
    //   dialogConfig.data = {
    //     password: "P@ssw0rd",
    //     dataRows: this.previewAudienceList,
    //     id: this.detailAudience.id
    //   };
  
    //   this.dialogRef = this.dialog.open(
    //     DialogPanelBlastComponent,
    //     {...dialogConfig, minWidth: '600px'}
    //   );
    // }
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
          // mission_publication_id: this.formAudience.get("mission_publication_id").value,
          // audience_filter: audience_filter,
          
          class_groups: this.formFilterRetailer.get("retail_classification").value,
          zones: zones.length ? zones : ["all"],
          regions: region.length ? region : ["all"],
          areas: area.length ? area : ["all"],
        };

        // if (audience_filter === "recommended-panel") {
        //   body['audience_filter_data'] = {
        //     b2b_active: this.formFilterRetailer.get("b2b_active").value,
        //     panel_required: this.formFilterRetailer.get("total_required_panel").value
        //   };
        // }
      } else {
        if (!this.data_imported.length) {
          this.dialogService.openSnackBar({
            message: this.translate.instant('global.label.please_import_file'),
          });
          return;
        }

        body = {
          // mission_publication_id: this.formAudience.get("mission_publication_id").value,
          audience_filter: audience_filter,
          retailers: this.data_imported.map(item => item.id)
        };
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
          this.dialogService.openSnackBar({message : 'Proses Check Berhasil'});// TODO
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
        message: this.translate.instant('global.label.please_complete_data'),
      });
    }
  }

  handleEstimate(value){
    return typeof(value) === 'number' ? `${Math.round(value * 100)}%` : '---';
  }

  getPreviewAudience(id){
    this.audienceService.previewAudience({trade_audience_group_id: id}).subscribe(
      (res) => {
        const {data} = res;
        this.previewAudienceList = data;
      },
      (err) => {
        console.log("err", err);
      })
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

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

}
