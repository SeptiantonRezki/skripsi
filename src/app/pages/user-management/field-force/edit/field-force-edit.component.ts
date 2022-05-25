import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { FieldForceService } from "app/services/user-management/field-force.service";
import { DialogService } from "app/services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from "app/services/data.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { commonFormValidator } from "app/classes/commonFormValidator";

@Component({
  selector: "app-field-force-edit",
  templateUrl: "./field-force-edit.component.html",
  styleUrls: ["./field-force-edit.component.scss"],
})
export class FieldForceEditComponent {
  listType: any = [
    { id: "asm", name: "Manager" },
    { id: "spv", name: "Supervisor" },
    { id: "field-force", name: "Field Force" },
  ];
  listClassification: any = [
    { id: "ree", name: "REE" },
    { id: "wee", name: "WEE" },
  ];
  areaFromLogin: any;
  formUser: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  removeIndex: number;

  limitLevel: string = "territory";

  pageId: string;
  isDetail: boolean;
  initDetail: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private fieldForcePrincipal: FieldForceService,
    private dialogService: DialogService,
    private router: Router,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private ls: LanguagesService
  ) {
    this.activatedRoute.url.subscribe((params) => {
      this.pageId = params[2].path;
      this.isDetail = params[1].path === "detail" ? true : false;
    });
  }

  ngOnInit() {
    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.createForm();
    this.getDetails();
    this.setEvents();
  }

  createForm() {
    this.formUser = this.formBuilder.group(
      {
        name: [{ value: "", disabled: true }],
        username: [{ value: "", disabled: true }],
        password: [""],
        password_confirmation: [""],
        classification: [{ value: "", disabled: this.isDetail }],
        areas: this.formBuilder.array([], Validators.required),
        type: [{ value: "", disabled: this.isDetail }, Validators.required],
        version: [{ value: "", disabled: true }],
        status: [{ value: true, disabled: this.isDetail }],
      },
      {
        validator: commonFormValidator.isEqual(
          "password",
          "password_confirmation"
        ),
      }
    );
  }

  getDetails() {
    this.fieldForcePrincipal
      .detail({ fieldforce_id: this.pageId })
      .subscribe((res) => {
        const data = res.data || {};
        const patchData = {
          name: data.fullname,
          username: data.username,
          type: data.type,
          status: data.status === "active",
          classification: data.classification
            ? data.classification.toLowerCase()
            : null,
          version: data.version,
        };

        const areas = Object.values(data.geotree).map((value) => value);
        this.addAreas(areas);

        this.formUser.patchValue(patchData);
        this.initDetail = true;
      });
  }

  setEvents() {
    this.formUser.get("type").valueChanges.subscribe((value: string) => {
      let level = "territory";
      if (value === "spv") level = "district";
      if (value === "asm") level = "area";
      if (value === "field-force") {
        commonFormValidator.validators(this.formUser, "classification", [
          Validators.required,
        ]);
      } else {
        commonFormValidator.validators(this.formUser, "classification");
      }
      this.limitLevel = level;
      if (this.initDetail) this.resetAreas();
    });

    this.formUser.get("password").valueChanges.subscribe((value: string) => {
      if (value) {
        commonFormValidator.validators(this.formUser, "password_confirmation", [
          Validators.required,
        ]);
      } else {
        commonFormValidator.validators(this.formUser, "password_confirmation");
      }
    });
  }

  addAreas(list: any = [""]) {
    let areas = this.formUser.get("areas") as FormArray;
    for (let item of list)
      areas.push(
        this.formBuilder.group({
          area_id: [""],
          areas: [item],
        })
      );
  }

  dialogRemoveAreas(index: number) {
    this.removeIndex = index;
    let data = {
      titleDialog: "Hapus Geotree",
      captionDialog: "Apakah anda yakin untuk menghapus Geotree ini ?",
      confirmCallback: this.removeAreas.bind(this),
      buttonText: ["Hapus", "Batal"],
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  removeAreas() {
    let areas = this.formUser.get("areas") as FormArray;
    areas.removeAt(this.removeIndex);
    this.dialogService.brodcastCloseConfirmation();
  }

  resetAreas() {
    let areas = this.formUser.get("areas") as FormArray;
    while (areas.length) areas.removeAt(0);
    this.addAreas();
  }

  getAreaIds(obj: any, i: number) {
    const [id, key, onClick] = obj;
    const areas = this.formUser.get("areas") as FormArray;
    const area = areas.at(i).get("area_id");
    area.setValue(id);
    if (key !== this.limitLevel) {
      setTimeout(() => {
        if (onClick) {
          area.markAsDirty();
          area.markAsTouched();
        }
        area.setErrors({ required: true });
      }, 0);
    }
  }

  submit() {
    if (!this.formUser.valid) {
      commonFormValidator.markAllAsTouched(this.formUser);
      return;
    }
    let areas = this.formUser.get("areas") as FormArray;
    let body = {
      _method: "PUT",
      name: this.formUser.get("name").value,
      type: this.formUser.get("type").value,
      classification: this.formUser.get("classification").value || null,
      areas: areas.value.map(({ area_id }) => area_id[0]),
      status: this.formUser.get("status").value ? "active" : "inactive",
    };
    if (this.formUser.get("password").value) {
      body["password"] = this.formUser.get("password").value;
      body["password_confirmation"] = this.formUser.get(
        "password_confirmation"
      ).value;
    }
    this.dataService.showLoading(true);
    this.fieldForcePrincipal
      .put(body, { fieldforce_id: this.pageId })
      .subscribe(
        () => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: "Berhasil diubah" });
          this.router.navigate(["user-management", "field-force"]);
        },
        () => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: "Terjadi kesalahan" });
        }
      );
  }
}
