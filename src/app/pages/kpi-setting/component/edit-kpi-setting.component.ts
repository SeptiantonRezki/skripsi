import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from '../../../services/data.service';
import { Subject, Observable, ReplaySubject, Subscription } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import * as _ from "underscore";
import { environment } from "environments/environment";
import { IdbService } from "app/services/idb.service";
import {KPIGroupModel} from 'app/pages/kpi-setting/kpi-setting.model';
import { commonFormValidator } from "app/classes/commonFormValidator";
import * as moment from 'moment';
import { DialogService } from "app/services/dialog.service";
import { MasterKPIService } from '../../../services/kpi-setting/master-kpi.service';
import { KPISettingService } from "app/services/kpi-setting/kpi-setting.service";
import { GeotreeService } from "app/services/geotree.service";

@Component({
  selector: 'app-edit-kpi-setting.component',
  templateUrl: './edit-kpi-setting.component.html',
  styleUrls: ['./edit-kpi-setting.component.scss']
})
export class EditKPISettingComponent implements OnInit {
  formKPI: FormGroup;
  formdataErrors: any;
  paramEdit: any = null;

  indexDelete: any;

  private subscription: Subscription;
  KPIGroup: KPIGroupModel;

  loadingIndicator: Boolean;
  saveData: Boolean;

  KPSList: any;

  categories = [
    'visit', 'brand', 'trade program', 'ecosystem'
  ];

  brands: Array<any>;
  brand_parameters: Array<any>;
  trade_program_objectives: Array<any>;

  selected = [];
  area: Array<any>;
  queries: any;
  data = [];

  searchRetailer = new Subject<string>();

  valueChange: Boolean;
  dialogRef: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  levels: any;

  enableEdit: Boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private kpiSettingService: KPISettingService,
    private masterKPIService: MasterKPIService,
    private route: ActivatedRoute,
    private geotreeService: GeotreeService,
  ) {

    this.formdataErrors = {
      category: {}
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

    this.levels = {
      national: 1,
      zone: 2,
      region: 3,
      area: 4,
      salespoint: 5,
      district: 6,
      territory: 7
    };

    this.area = dataService.getDecryptedProfile()["area_type"];
  }

  async ngOnInit() {
    this.subscription = this.route.params.subscribe((params) => {
      if (params['id']) {
        this.paramEdit = params['id'];
      }
    });

    this.masterKPIService.getBrands().subscribe((res) => {
      this.brands = res
    })

    this.masterKPIService.getBrandParameters().subscribe((res) => {
      this.brand_parameters = res
    })
    this.masterKPIService.getTradeProgramObjectives().subscribe((res) =>{
      this.trade_program_objectives = res
    })

    this.formKPI = this.formBuilder.group({
      start_kps: [null, Validators.required],
      end_kps: [null, Validators.required],
      status: [false, Validators.required],
      kpis: this.formBuilder.array([], Validators.required)
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

    this.formKPI.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formKPI, this.formdataErrors);
    });

    this.KPSList = await this.kpiSettingService.getKPS(this.paramEdit).toPromise();
    
    if(this.paramEdit) {
      this.KPIGroup = await this.kpiSettingService.getById(this.paramEdit).toPromise();
      this.setDetail();
    }
  }

  setDetail() {
    this.formKPI.controls['start_kps'].setValue(this.KPIGroup.start_kps);
    this.formKPI.controls['end_kps'].setValue(this.KPIGroup.end_kps);

    let kpis = this.formKPI.controls['kpis'] as FormArray;
    for(let kpi_setting of this.KPIGroup.kpi_settings){
      let brandRequired = kpi_setting.category == 'brand' || kpi_setting.category == 'trade program';
      let parameterRequired = kpi_setting.category == 'brand' || kpi_setting.category == 'trade program';
      kpis.push(this.formBuilder.group({
        category: [kpi_setting.category, Validators.required],
        brand: [kpi_setting.brand_code, ...(brandRequired && [Validators.required])],
        parameter: [kpi_setting.parameter, ...(parameterRequired && [Validators.required])]
      }))
    }

    if(this.KPIGroup.status == 'active') {
      this.formKPI.controls['status'].setValue(true);
      this.enableEdit = false;
    }
  }

  addKPI() {
    let kpis = this.formKPI.controls['kpis'] as FormArray;
    kpis.push(this.createKPI());
  }

  createKPI(): FormGroup {
    return this.formBuilder.group({
      category: ['', Validators.required],
      brand: [''],
      parameter: ['']
    })
  }

  moveUp(pos) {
    let kpis = this.formKPI.controls['kpis'] as FormArray;
    let kpi = kpis.at(pos);
    kpis.removeAt(pos);
    kpis.insert(pos-1, kpi);
  }

  moveDown(pos) {
    let kpis = this.formKPI.controls['kpis'] as FormArray;
    let kpi = kpis.at(pos);
    kpis.removeAt(pos);
    kpis.insert(pos+1, kpi);
  }

  initAreaV2() {
    let areas = this.dataService.getDecryptedProfile()["areas"] || [];
    console.log('initArea', areas);
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

          if(isExist) {
            this.list[this.parseArea(level.type)] = [...this.list[this.parseArea(level.type)]];
          } else {
            this.list[this.parseArea(level.type)] = [...this.list[this.parseArea(level.type)], level];
          }
          
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

  deleteKPI(pos) {
    let dialogData = {
      titleDialog: 'Hapus KPI',
      captionDialog: `Apa Anda yakin menghapus KPI ${pos+1}?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    }
    this.dialogService.openCustomConfirmationDialog(dialogData);
  }

  confirmDelete() {
    let kpis = this.formKPI.controls.kpis as FormArray;
    kpis.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  resetKPIDetail(pos) {
    let kpis = this.formKPI.controls.kpis as FormArray;
    let kpi = kpis.at(pos);
    
    let category = kpi.get('category').value
    
    kpi.get('brand').setValue('');
    kpi.get('parameter').setValue('');

    let brandRequired = category == 'brand' || category == 'trade program';
    let parameterRequired = category == 'brand' || category == 'trade program';

    if(brandRequired) {
      kpi.get('brand').setValidators([Validators.required]);
    } else {
      kpi.get('brand').setValidators(null);
    }
    if(parameterRequired) {
      kpi.get('parameter').setValidators([Validators.required]);
    } else {
      kpi.get('parameter').setValidators(null);
    }
    this.formKPI.updateValueAndValidity();
  }

  async submit() {
    if(this.formKPI.valid) {
      let areaSelected = Object.entries(this.formFilter.getRawValue())
        .map(([key, value]) => ({ key, value }))
        .filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
        
      console.log("areaSelected", areaSelected);


      let lastAreaSelected = areaSelected[areaSelected.length - 1];
      let areaIDs: any;
      if(typeof lastAreaSelected.value == 'number') {
        areaIDs = [lastAreaSelected.value];
      } else {
        areaIDs = lastAreaSelected.value;
      }

      let level = this.levels[lastAreaSelected.key];

      if(areaIDs.length == 0) {
        this.dialogService.openSnackBar({ message: "Silakan pilih minimal satu area!" });
        commonFormValidator.validateAllFields(this.formKPI);
        return;
      }

      let kpis = this.formKPI.controls.kpis as FormArray;
      let kpi_settings = kpis.value.map((kpi, idx) => {
        return {
          category: kpi.category,
          ...(kpi.brand && {brand_code: kpi.brand}),
          ...(kpi.parameter && {parameter: kpi.parameter}),
          priority: idx + 1
        };
      })
      let body = {
        id: this.paramEdit,
        start_kps: this.formKPI.controls['start_kps'].value,
        end_kps: this.formKPI.controls['end_kps'].value,
        status: this.formKPI.controls['status'].value ? 'active': 'inactive',
        kpi_settings,
        area_level: level,
        areas: areaIDs
      };
      let res;
      if(!this.paramEdit) {
        res = await this.kpiSettingService.create(body).toPromise();
      }
      else {
        body.id = this.paramEdit;
        res = await this.kpiSettingService.update(body).toPromise();
      }

      if(res.status == 'success') {
        this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan" });
        this.router.navigate(["kpisetting", "kpi-groups-list"]);
        window.localStorage.removeItem("kps");
      }
      else {
        this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
        commonFormValidator.validateAllFields(this.formKPI);
      }
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formKPI);
    }
  }
}
