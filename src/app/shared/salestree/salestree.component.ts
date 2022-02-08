import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { debounce } from "lodash";
import { GeotreeService } from "app/services/geotree.service";
import { DataService } from "app/services/data.service";

@Component({
  selector: "salestree",
  templateUrl: "./salestree.component.html",
  styleUrls: ["./salestree.component.scss"],
})
export class SalestreeComponent implements OnInit {
  @Output() areas: EventEmitter<any[]> = new EventEmitter();
  @Output() area: EventEmitter<any[]> = new EventEmitter();
  @Output() areaWithKey: EventEmitter<any[]> = new EventEmitter();
  @Input() limit: any = [{ id: 1, type: "national" }];
  @Input() value: any;

  initArea: boolean = false;
  loadingArea = new FormControl({});
  limitArea: any = {};
  limitAreaIndex: number = 0;

  geoLevel: string[] = [
    "national",
    "division",
    "region",
    "area",
    "salespoint",
    "district",
    "territory",
  ];
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
  form: FormGroup;
  onLoad: boolean = true;

  constructor(
    private fb: FormBuilder,
    private geoService: GeotreeService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadingArea.valueChanges.subscribe((res) => {
      if (this.initArea) return;
      if (Object.keys(res).length) {
        this.dataService.showLoading(true);
      } else {
        this.dataService.showLoading(false);
        this.initArea = true;
      }
    });
    this.createForm();
    for (let level in this.limitArea) {
      this.getLevel(level);
    }
    this.setDefaultValue();
  }

  setLimitArea(data: any) {
    data.forEach((item: any) => {
      if (Array.isArray(item)) {
        this.setLimitArea(item);
      } else {
        const itemIndex = this.geoLevel.indexOf(item.level_desc);
        if (!this.limitArea.hasOwnProperty(item.level_desc))
          this.limitArea[item.level_desc] = [];
        if (this.limitAreaIndex < itemIndex) this.limitAreaIndex = itemIndex;
        this.limitArea[item.level_desc].push(item.id);
      }
    });
  }

  createForm() {
    this.setLimitArea(this.limit);

    this.form = this.fb.group({
      national: [[]],
      division: [[]],
      region: [[]],
      area: [[]],
      salespoint: [[]],
      district: [[]],
      territory: [[]],
    });

    const limitValue = {};
    for (let level in this.limitArea) {
      limitValue[level] = this.limitArea[level];
      this.form.get(level).disable();
    }
    this.form.patchValue(limitValue);

    if (this.value) {
      const value = this.value;
      this.form.patchValue(value);
    }

    const [areaIds, lastAreaKey]: any[] = this.getSelectedAllId();
    this.area.emit(areaIds);
    this.areaWithKey.emit([areaIds, lastAreaKey]);
    this.areas.emit(this.form.getRawValue());

    this.updateForm();
  }

  getLevel(value: string, onClick: boolean = false) {
    const level = this.form.get(value).value;
    const index = this.geoLevel.indexOf(value);

    if (index + 1 <= this.geoLevel.length) {
      if (onClick) {
        const [areaIds, lastAreaKey]: any[] = this.getSelectedAllId();
        this.area.emit(areaIds);
        this.areaWithKey.emit([areaIds, lastAreaKey]);
        this.areas.emit(this.form.getRawValue());
        this.resetLevel(value);
      }

      const fd = new FormData();
      let subLevel = this.geoLevel[index + 1];
      fd.append("area_type", subLevel === "territory" ? "teritory" : subLevel);

      if (level.length) {
        level.forEach((item: any) => {
          fd.append("area_id[]", item);
        });
      } else {
        fd.append("area_id[]", "");
      }

      let loading = this.loadingArea.value;
      loading[subLevel] = true;
      this.loadingArea.setValue(loading);
      this.geoService.getChildFilterArea(fd).subscribe((res) => {
        this.geoList[subLevel] = res.data;
        this.updateForm();
        delete loading[subLevel];
        this.loadingArea.setValue(loading);
      });
    }
  }

  getSelectedLevel = debounce((value) => {
    this.getLevel(value, true);
  }, 500);

  resetLevel(value: any) {
    let current = false;
    this.geoLevel.forEach((item) => {
      if (item === value) {
        current = true;
        return;
      }
      if (current) {
        this.form.get(item).setValue("");
        this.geoList[item] = [];
      }
    });
  }

  updateForm() {
    this.geoLevel.forEach((item, index) => {
      if (index > this.limitAreaIndex) {
        if (this.geoList[item] && this.geoList[item].length) {
          this.form.get(item).enable();
        } else {
          this.form.get(item).disable();
        }
      }
    });
  }

  setDefaultValue() {
    if (!this.value) return;
    this.geoLevel.forEach((level) => {
      if (this.value.hasOwnProperty(level) && this.value[level].length) {
        this.getLevel(level);
      }
    });
  }

  getSelectedAllId() {
    let levelId = [];
    let levelKey = "";
    this.geoLevel.forEach((item) => {
      let lastLevel = this.form.get(item).value;
      if (!lastLevel.length) return false;
      levelId = lastLevel;
      levelKey = item;
    });
    return [levelId, levelKey];
  }

  isChecked(option: any, value: any) {
    return option && value && option.toString() === value.toString();
  }
}
