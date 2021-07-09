import { Component, OnInit, ViewChild, ElementRef, TemplateRef, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { Lightbox } from 'ngx-lightbox';

import * as _ from 'underscore';
import { Config } from 'app/classes/config';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable, ReplaySubject } from "rxjs";
import { RetailerService } from 'app/services/user-management/retailer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import { takeUntil } from "rxjs/operators";

import { GeotreeService } from "app/services/geotree.service";
import { IdbService } from "app/services/idb.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { PanelPartnershipService } from 'app/services/user-management/private-label/panel-partnership.service';
import { ImportAudienceDialogComponent } from "../import/import-audience-dialog.component";

@Component({
  selector: 'app-panel-partnership-create',
  templateUrl: './panel-partnership-create.component.html',
  styleUrls: ['./panel-partnership-create.component.scss']
})
export class PanelPartnershipCreateComponent {
  onLoad: boolean;
  createForm: FormGroup;
  parameters: Array<string>;
  createFormError: any;
  supplierStatusList: any[] = [
    { name: 'Status Aktif', status: 'active' },
    { name: 'Status Non-Aktif', status: 'inactive' }
  ];
  supplierStatusSelected: any;

  rows: any[];

  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;

  supplierList: any[]

  @ViewChild("downloadLink") downloadLink: ElementRef;
  @ViewChild("singleSelect") singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  public options: Object = Config.FROALA_CONFIG;

  selected = [];
  area: Array<any>;
  queries: any;
  data = [];
  pagination: Page = new Page();

  searchRetailer = new Subject<string>();
  public filterSPL: FormControl = new FormControl();
  public filteredSPL: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  valueChange: Boolean;
  dialogRef: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  selectedTab: number;

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
    private panelPartnershipService: PanelPartnershipService,
    private dialog: MatDialog,
    private geotreeService: GeotreeService,
    private idbService: IdbService
  ) {

    this.rows = [];
    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.area_id_list = this.dataService.getDecryptedProfile()["area_id"];
    this.listLevelArea = [
      {
        id: 1,
        parent_id: null,
        code: "SLSNTL",
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
    console.log(activatedRoute.snapshot.data);
    this.area = dataService.getDecryptedProfile()["area_type"];
    this.parameters = [];
  }

  ngOnInit() {

    this.createForm = this.formBuilder.group({
      namaSupplier: ["", Validators.required],
      status: ["", Validators.required],
      startDateRegistration: ["", Validators.required],
      endDateRegistration: ["", Validators.required],
      startDateProgram: ["", Validators.required],
      endDateProgram: ["", Validators.required],
      title: ["", Validators.required],
      detail: ["", Validators.required],
      business_checkbox: true,
      geotree_checkbox: true,
      type: ["limit"],
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

    this.initAreaV2();
    this.getRetailer();

    this.createForm.valueChanges.subscribe(() => {
      this.valueChange = true;
    });

    this.formFilter.valueChanges.debounceTime(1000).subscribe((res) => {
      // this.searchingRetailer(res);
      this.getRetailer();
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

    this.selected = [];

    this.getSuppliers();

    this.filterSPL.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringSPL();
      });

  }

  filteringSPL() {
    if (!this.supplierList) {
      return;
    }
    // get the search keyword
    let search = this.filterSPL.value;

    this.pagination.per_page = 99999999;
    this.pagination.search = search;
    this.panelPartnershipService.getListSuppliers(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.supplierList = res.data.data;
        this.filteredSPL.next(this.supplierList.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )
    // filter the banks
    this.filteredSPL.next(
      this.supplierList.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getSuppliers() {
    this.pagination.per_page = 99999999;
    this.panelPartnershipService.getListSuppliers(this.pagination).subscribe(
      (res) => {
        console.log("supplierList: ", res.data);
        this.supplierList = res.data.data;
        this.filteredSPL.next(this.supplierList.slice());
        // this.supplierList = res.data;
      },
      (err) => {
        console.log("supplierList: ", err);
      }
    );
  }

  clickMe(input, parameter) {
    if (parameter !== null) {
      console.log("New parameter: " + parameter);
      this.parameters.push(parameter);
      input.value = "";
    }
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
    // this.pagination.area = this.createForm.get('type').value === 'pick-all' ? 1 : area_id;

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
      // this.idbService.getAnyOf(rows).then(result => {
      //   console.log('result', result);
      //   this.selected = result;
      //   this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
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
      //   this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
      // })

      this.loadingIndicator = false;
    });
  }

  selectFn() {
    console.log("jalan");
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

  // changeValue() {
  //   if (this.createForm.get("type").value === "pick-all") {
  //     this.selected = this.rows;
  //   } else {
  //     this.selected = [];
  //   }
  // }

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

  formatDate(val: any) {
    var d = new Date(val);
    let date = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + (d.getDate())).slice(-2)].join('-');
    return date;
  }

  submit() {
    const selectedRetailer = this.selected.length;
    // const limit = this.createForm.get("type").value === "limit";
    let body = {
      supplier_company_id: this.createForm.get("namaSupplier").value,
      name: this.createForm.get("title").value,
      start_date: this.formatDate(this.createForm.get("startDate").value),
      end_date: this.formatDate(this.createForm.get("endDate").value),
      status: this.createForm.get("status").value,
      detail_mechanism: this.createForm.get("detail").value,
      total_audience: selectedRetailer,
    };
    body["retailer_id"] = this.selected.map((item) => item.id);
    // console.log(body);
    this.saveData = true;
    this.panelPartnershipService.create(body).subscribe(
      (res) => {
        this.dialogService.openSnackBar({
          message: "Data Berhasil Disimpan",
        });
        this.router.navigate(["user-management", "panel-partnership"]);
      },
      (err) => {
        // this.dialogService.openSnackBar({ message: err.error.message })
        console.log(err.error.message);
      }
    );
  }

  async exportAudience() {
    this.exportTemplate = true;
    const body = {
      retailer_id:
        this.selected.length > 0 ? this.selected.map((item) => item.id) : [],
    };

    try {
      const response = await this.panelPartnershipService.exportExcel(body).toPromise();
      this.downloadLink.nativeElement.href = response.data;
      this.downloadLink.nativeElement.click();
      this.exportTemplate = false;
    } catch (error) {
      console.log("err", error);
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
              message: "File berhasil diimport",
            });
          });
      }
    });
  }

  setSelectedTab(tab: number) {
    this.selectedTab = tab;
  }

  onChangeTab(event: any) {
    this.selectedTab = event.index;
  }


}
