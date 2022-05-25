import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { FieldForceService } from "app/services/user-management/field-force.service";
import { DialogService } from "app/services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from "app/services/data.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { commonFormValidator } from "app/classes/commonFormValidator";

@Component({
  selector: "app-field-force-create",
  templateUrl: "./field-force-create.component.html",
  styleUrls: ["./field-force-create.component.scss"],
})
export class FieldForceCreateComponent {
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

  constructor(
    private formBuilder: FormBuilder,
    private fieldForcePrincipal: FieldForceService,
    private dialogService: DialogService,
    private router: Router,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private ls: LanguagesService
  ) {}

  ngOnInit() {
    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.createForm();
    this.addAreas();
    this.setEvents();
  }

  createForm() {
    this.formUser = this.formBuilder.group(
      {
        name: ["", Validators.required],
        username: ["", Validators.required],
        password: ["", [Validators.required, Validators.minLength(8)]],
        password_confirmation: ["", Validators.required],
        classification: [""],
        areas: this.formBuilder.array([], Validators.required),
        type: ["", Validators.required],
        status: [true],
      },
      {
        validator: commonFormValidator.isEqual(
          "password",
          "password_confirmation"
        ),
      }
    );
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
      this.resetAreas();
    });
  }

  addAreas() {
    let areas = this.formUser.get("areas") as FormArray;
    areas.push(
      this.formBuilder.group({
        area_id: [""],
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
      name: this.formUser.get("name").value,
      username: this.formUser.get("username").value,
      type: this.formUser.get("type").value,
      classification: this.formUser.get("classification").value || null,
      areas: areas.value.map(({ area_id }) => area_id[0]),
      password: this.formUser.get("password").value,
      password_confirmation: this.formUser.get("password_confirmation").value,
      status: this.formUser.get("status").value ? "active" : "inactive",
    };
    this.dataService.showLoading(true);
    this.fieldForcePrincipal.create(body).subscribe(
      () => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: "Berhasil dibuat" });
        this.router.navigate(["user-management", "field-force"]);
      },
      () => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: "Terjadi kesalahan" });
      }
    );
  }
}
