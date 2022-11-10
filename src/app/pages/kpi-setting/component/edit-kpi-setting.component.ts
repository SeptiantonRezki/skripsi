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
  AbstractControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "../../../services/data.service";
import { Subject, Observable, ReplaySubject, Subscription } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import * as _ from "underscore";
import { environment } from "environments/environment";
import { IdbService } from "app/services/idb.service";
import { KPIGroupModel } from "app/pages/kpi-setting/kpi-setting.model";
import { commonFormValidator } from "app/classes/commonFormValidator";
import moment from "moment";
import { DialogService } from "app/services/dialog.service";
import { MasterKPIService } from "../../../services/kpi-setting/master-kpi.service";
import { KPISettingService } from "app/services/kpi-setting/kpi-setting.service";
import { GeotreeService } from "app/services/geotree.service";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-edit-kpi-setting.component",
  templateUrl: "./edit-kpi-setting.component.html",
  styleUrls: ["./edit-kpi-setting.component.scss"],
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
  KPSListStart: any[] = [];
  KPSListEnd: any[] = [];

  categories = [
    // { id: "visit", name: "Visit" },
    { id: "brand", name: "Brand" },
    { id: "trade program", name: "Trade Program" },
    { id: "ecosystem", name: "Ecosystem" },
  ];

  brands: Array<any> = [];
  brand_parameters: Array<any> = [];
  trade_program_objectives: Array<any> = [];
  ecosystemParams: Array<any> = [];
  ecosystemBrands: Array<any> = [];

  selected = [];
  area: Array<any>;
  queries: any;
  data = [];

  searchRetailer = new Subject<string>();

  valueChange: Boolean;
  dialogRef: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin: any;

  levelAreas = [
    "national",
    "division",
    "region",
    "area",
    "salespoint",
    "district",
    "territory",
  ];
  limitArea: any = {};
  limitAreaIndex: number = 0;

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  levels: any;

  existingAreas = [];

  tradeProgramList: any = [];

  tradeProgramListReserved: any = [];

  areas: any;

  scrollTradeProgram: boolean = true;

  init: boolean = true;

  // enableEdit: Boolean = true;

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
    private ls: LanguagesService
  ) {
    this.formdataErrors = {
      category: {},
    };

    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.area_id_list = this.dataService.getDecryptedProfile()["area_id"];

    this.levels = {
      national: 1,
      division: 2,
      region: 3,
      area: 4,
      salespoint: 5,
      district: 6,
      territory: 7,
    };

    this.area = dataService.getDecryptedProfile()["area_type"];

    this.setLimitArea(this.areaFromLogin);
  }

  async ngOnInit() {
    this.subscription = this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.paramEdit = params["id"];
      }
    });

    this.masterKPIService.getBrands().subscribe((res) => {
      this.brands = res.map(({ code }) => ({ id: code, name: code }));
    });

    this.masterKPIService.getBrandParameters().subscribe((res) => {
      this.brand_parameters = res.map(({ parameter }) => ({
        id: parameter,
        name: parameter,
      }));
    });

    this.formKPI = this.formBuilder.group({
      start_kps: [null, Validators.required],
      end_kps: [null, Validators.required],
      status: [false, Validators.required],
      kpis: this.formBuilder.array([], Validators.required),
    });

    this.formKPI.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formKPI, this.formdataErrors);
    });

    this.kpiSettingService.getKPSV2({ongoing:true,edit:this.paramEdit}).subscribe((res) => {
      this.KPSListStart = res.map((item: any) => ({
        id: item.id,
        name: this.getKPSLabel(item, "start_date"),
      }));
      this.KPSListEnd = res.map((item: any) => ({
        id: item.id,
        name: this.getKPSLabel(item, "end_date"),
      }));
    });

    this.masterKPIService.getEcosystemParams().subscribe((res) => {
      this.ecosystemParams = res.map(({ parameter }) => ({
        id: parameter,
        name: parameter,
      }));
    });

    this.masterKPIService.getEcosystemBrands().subscribe((res) => {
      this.ecosystemBrands = res.map(({ brand }) => ({
        id: brand,
        name: brand,
      }));
    });

    if (this.paramEdit) {
      this.KPIGroup = await this.kpiSettingService
        .getById(this.paramEdit)
        .toPromise();
      this.setDetail();
    }

    if (!this.paramEdit) this.addKPI();
  }

  getKPSLabel(data: any, date: string) {
    return `${data["kps_number"]} - ${moment(data[date], "YYYY-MM-DD").format(
      "DD/MM/YYYY"
    )}`;
  }

  setLimitArea(data: any) {
    data.forEach((item: any) => {
      if (Array.isArray(item)) {
        this.setLimitArea(item);
      } else {
        const itemIndex = this.levelAreas.indexOf(item.level_desc);
        if (!this.limitArea.hasOwnProperty(item.level_desc))
          this.limitArea[item.level_desc] = [];
        if (this.limitAreaIndex < itemIndex) this.limitAreaIndex = itemIndex;
        this.limitArea[item.level_desc].push(item.id);
      }
    });
  }

  isArrayDiffer(arr1: any, arr2: any) {
    let differ = [];
    if (arr1.length > arr2.length) {
      differ = arr1.filter((item: any) => !arr2.includes(item));
    } else {
      differ = arr2.filter((item: any) => !arr1.includes(item));
    }
    return differ.length > 0;
  }

  getAreaIds(lastSelected: any) {
    const [id, key, onClick] = lastSelected;
    this.lastLevel = { id, key };

    if (onClick) this.getTradeProgramList();
  }

  getAreas(areas: any) {
    this.areas = areas;
  }

  getKpis(pos?: number) {
    const kpis = this.formKPI.controls.kpis as FormArray;
    return pos >= 0 ? kpis.at(pos) : kpis.controls;
  }

  getScrollTradeProgram(current_page: number) {
    this.getTradeProgramList({ per_page: 10, page: current_page + 1 });
  }

  getTradeProgramList(params: any = {}) {
    const kpis: any = this.getKpis();
    const areaIds = this.getCombineAreas();
    this.masterKPIService
      .getTradeProgramObjectives({ area_id: areaIds.join(","), ...params })
      .subscribe((res) => {
        const data = res.data.map(({ trade_program_name }) => ({
          id: trade_program_name,
          name: trade_program_name,
        }));
        this.tradeProgramList =
          params.hasOwnProperty("page") && params.page > 1
            ? [...this.tradeProgramList, ...data]
            : data;
        if (this.init) {
          this.tradeProgramList = [
            ...this.tradeProgramListReserved,
            ...this.tradeProgramList,
          ];
          this.init = false;
        }
        for (let kpi of kpis) {
          if (kpi.get("category").value === "trade program") {
            const exists = this.tradeProgramList.find(
              ({ id }) => id == kpi.get("parameter").value
            );
            if (!exists) kpi.get("parameter").setValue("");
          }
        }
        this.scrollTradeProgram = res.data.length > 0;
      });
  }

  ecosystemParamsChange(pos: any, parameter: any) {
    const kpi: any = this.getKpis(pos);

    kpi.get("parameter").setValue(parameter);
    kpi.get("brand").setValue("");

    if (parameter.toLowerCase() === "private label") {
      this.validator(kpi, "brand", false, [Validators.required]);
    } else {
      this.validator(kpi, "brand", true);
    }
  }

  setDetail() {
    this.formKPI.controls["start_kps"].setValue(this.KPIGroup.start_kps);
    this.formKPI.controls["end_kps"].setValue(this.KPIGroup.end_kps);
    this.existingAreas = this.KPIGroup.areas;

    let kpis = this.formKPI.controls["kpis"] as FormArray;
    for (let kpi_setting of this.KPIGroup.kpi_settings) {
      const brandRequired = kpi_setting.category == "brand";
      kpis.push(
        this.formBuilder.group({
          category: [kpi_setting.category, Validators.required],
          brand: [
            kpi_setting.brand_code,
            ...(brandRequired && [Validators.required]),
          ],
          parameter: [kpi_setting.parameter, [Validators.required]],
        })
      );
      if (kpi_setting.category == "trade program")
        this.tradeProgramListReserved.push({
          id: kpi_setting.parameter,
          name: kpi_setting.parameter,
        });
    }

    if (this.KPIGroup.status == "active") {
      this.formKPI.controls["status"].setValue(true);
      // this.enableEdit = false;
    }

    this.getTradeProgramList({
      area_id: this.KPIGroup.areas.map(({ id }) => id).join(","),
    });
  }

  addKPI() {
    let kpis = this.formKPI.controls["kpis"] as FormArray;
    kpis.push(this.createKPI());
  }

  createKPI(): FormGroup {
    return this.formBuilder.group({
      category: ["", Validators.required],
      brand: [""],
      parameter: [""],
    });
  }

  moveUp(pos: number) {
    let kpis = this.formKPI.controls["kpis"] as FormArray;
    let kpi = kpis.at(pos);
    kpis.removeAt(pos);
    kpis.insert(pos - 1, kpi);
  }

  moveDown(pos: number) {
    let kpis = this.formKPI.controls["kpis"] as FormArray;
    let kpi = kpis.at(pos);
    kpis.removeAt(pos);
    kpis.insert(pos + 1, kpi);
  }

  deleteKPI(pos: number) {
    if((this.formKPI.controls.kpis as FormArray).length !== 1){
      let dialogData = {
        titleDialog: "Hapus KPI",
        captionDialog: `Apa Anda yakin menghapus KPI ${pos + 1}?`,
        confirmCallback: this.confirmDelete.bind(this),
        buttonText: ["Hapus", this.ls.locale.global.button.cancel],
      };
      this.indexDelete = pos;
      this.dialogService.openCustomConfirmationDialog(dialogData);
    }
  }

  deleteArea(id: number) {
    this.existingAreas = this.existingAreas.filter((area) => area.id !== id);
    this.getTradeProgramList();
  }

  confirmDelete() {
    let kpis = this.formKPI.controls.kpis as FormArray;
    kpis.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  resetKPIDetail(pos: number, category: string) {
    const kpis = this.formKPI.controls.kpis as FormArray;
    const kpi = kpis.at(pos);
    const required = [Validators.required];

    kpi.get("category").setValue(category);
    kpi.get("brand").setValue("");
    kpi.get("parameter").setValue("");

    switch (category) {
      case "brand":
        this.validator(kpi, "brand", false, required);
        this.validator(kpi, "parameter", false, required);
        return;
      case "ecosystem":
      case "trade program":
        this.validator(kpi, "brand", true);
        this.validator(kpi, "parameter", false, required);
        return;
      default:
        return;
    }
  }

  validator(form: AbstractControl, name: string, clear: boolean, rules?: any) {
    if (rules) form.get(name).setValidators(rules);
    if (clear) form.get(name).clearValidators();
    form.get(name).updateValueAndValidity();
  }

  getCombineAreas() {
    let existingAreaIds = this.existingAreas.map((area) => area.id);
    let areaIDs = this.lastLevel.id;

    const accountAreaIds = Array.from(
      new Set([...this.limitArea[this.levelAreas[this.limitAreaIndex]]])
    );

    let newAreaIDs = existingAreaIds.length
      ? this.isArrayDiffer(areaIDs, accountAreaIds)
        ? [...existingAreaIds, ...areaIDs]
        : [...existingAreaIds]
      : this.isArrayDiffer(areaIDs, accountAreaIds)
      ? [...areaIDs]
      : [...accountAreaIds];
    newAreaIDs = Array.from(new Set<number>(newAreaIDs));
    return newAreaIDs;
  }

  async submit() {
    if (this.formKPI.valid) {
      let newAreaIDs = this.getCombineAreas();
      let level = this.levels[this.lastLevel.key];

      if (newAreaIDs.length == 0) {
        this.dialogService.openSnackBar({
          message: "Silakan pilih minimal satu area!",
        });
        commonFormValidator.validateAllFields(this.formKPI);
        return;
      }

      let kpis = this.formKPI.controls.kpis as FormArray;
      let kpi_settings = kpis.value.map((kpi, idx) => {
        return {
          category: kpi.category,
          ...(kpi.brand && { brand_code: kpi.brand }),
          ...(kpi.parameter && { parameter: kpi.parameter }),
          priority: idx + 1,
        };
      });
      let body = {
        id: this.paramEdit,
        start_kps: this.formKPI.controls["start_kps"].value,
        end_kps: this.formKPI.controls["end_kps"].value,
        status: this.formKPI.controls["status"].value ? "active" : "inactive",
        kpi_settings,
        area_level: level,
        areas: newAreaIDs,
      };
      let res;
      if (!this.paramEdit) {
        res = await this.kpiSettingService.create(body).toPromise();
      } else {
        body.id = this.paramEdit;
        res = await this.kpiSettingService.update(body).toPromise();
      }

      if (res.status == "success") {
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22,
        });
        this.router.navigate(["kpisetting", "kpi-groups-list"]);
        window.localStorage.removeItem("kps");
      } else {
        this.dialogService.openSnackBar({
          message: "Silakan lengkapi data terlebih dahulu!",
        });
        commonFormValidator.validateAllFields(this.formKPI);
      }
    } else {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!",
      });
      commonFormValidator.validateAllFields(this.formKPI);
    }
  }
}
