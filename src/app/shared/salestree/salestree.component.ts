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
  @Input() multiple: boolean = true;
  @Input() limitLevel: string;
  @Input() disabled: boolean = false;

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
    if (this.limitLevel) {
      let nextGeoLevel = [];
      let pop = false;
      for (let level of this.geoLevel) {
        if (pop) continue;
        nextGeoLevel.push(level);
        if (this.limitLevel === level) pop = true;
      }
      this.geoLevel = nextGeoLevel;
    }
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
        let levelDesc = item.level_desc;
        if (levelDesc === "teritory") levelDesc = "territory";
        const itemIndex = this.geoLevel.indexOf(levelDesc);
        if (!this.limitArea.hasOwnProperty(levelDesc))
          this.limitArea[levelDesc] = [];
        if (this.limitAreaIndex < itemIndex) this.limitAreaIndex = itemIndex;
        this.limitArea[levelDesc].push(item.id);
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
    this.form.patchValue(this.parseValue(limitValue));

    if (this.value) {
      const value = this.value;
      this.form.patchValue(this.parseValue(value));
    }

    const [areaIds, lastAreaKey]: any[] = this.getSelectedAllId();
    this.area.emit(areaIds);
    this.areaWithKey.emit([areaIds, lastAreaKey, false]);
    this.areas.emit(this.form.getRawValue());

    this.updateForm();
  }

  parseValue(data: any) {
    if (this.multiple) return data;
    let nextData = {...data};
    for (let level in data) nextData[level] = nextData[level][0];
    return nextData;
  }

  getLevel(value: string, onClick: boolean = false) {
    let level = this.form.get(value).value;
    let index = this.geoLevel.indexOf(value);

    if (index + 1 <= this.geoLevel.length) {
      if (onClick) {
        this.resetLevel(value);
        const [areaIds, lastAreaKey]: any[] = this.getSelectedAllId();
        this.area.emit(areaIds);
        this.areas.emit(this.form.getRawValue());
        this.areaWithKey.emit([areaIds, lastAreaKey, onClick]);
      }

      let subLevel = this.geoLevel[index + 1];
      if (!subLevel) return;

      const fd = new FormData();
      fd.append("area_type", subLevel === "territory" ? "teritory" : subLevel);

      if (level && !Array.isArray(level)) level = [level];

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
        if (this.disabled) {
          this.form.get(item).disable();
        } else {
          if (this.geoList[item] && this.geoList[item].length) {
            this.form.get(item).enable();
          } else {
            this.form.get(item).disable();
          }
        }
      }
    });
  }

  setDefaultValue() {
    if (!this.value) return;
    this.geoLevel.forEach((level) => {
      if (
        this.value.hasOwnProperty(level) &&
        !this.limitArea.hasOwnProperty(level) &&
        this.value[level].length
      ) {
        this.getLevel(level);
      }
    });
  }

  getSelectedAllId() {
    let levelId = [];
    let levelKey = "";
    this.geoLevel.forEach((item) => {
      let lastLevel = this.form.get(item).value;
      if (lastLevel && !Array.isArray(lastLevel)) lastLevel = [lastLevel];
      if (!lastLevel || !lastLevel.length) return false;
      levelId = lastLevel;
      levelKey = item;
    });
    return [levelId, levelKey];
  }

  isChecked(option: any, value: any) {
    return option && value && option.toString() === value.toString();
  }

  isLimit(area: string) {
    return this.geoLevel.indexOf(area) >= 0;
  }
}
