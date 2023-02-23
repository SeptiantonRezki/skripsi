import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
} from "@angular/forms";
import { FieldForceService } from "app/services/user-management/field-force.service";
import { DialogService } from "app/services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from "app/services/data.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { TranslateService } from "@ngx-translate/core";

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
  removeIndex: number;

  limitLevel: string = "territory";

  locale: any;

  pageId: string;
  isDetail: boolean;
  initDetail: boolean = false;

  isChecked = false;
  checked: boolean;

  emailNotification: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private fieldForcePrincipal: FieldForceService,
    private dialogService: DialogService,
    private router: Router,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private ls: LanguagesService,
    private trans: TranslateService
  ) {
    this.locale = this.ls.locale;
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
    this.formUser = this.formBuilder.group({
      name: [{ value: "", disabled: this.isDetail }, Validators.required],
      username: [{ value: "", disabled: this.isDetail }, Validators.required],
      email: [
        { value: "", disabled: this.isDetail },
        [
          Validators.required,
          Validators.pattern(/@contracted.sampoerna.com$|@sampoerna.com$/),
        ],
      ],
      classification: [{ value: "", disabled: this.isDetail }],
      areas: this.formBuilder.array([], Validators.required),
      type: [{ value: "", disabled: this.isDetail }, Validators.required],
      version: [{ value: "", disabled: true }],
      status: [{ value: true, disabled: this.isDetail }],
      emailNotification: [{ value: false, disabled: this.isDetail }],
    });

    this.formUser.get("emailNotification").valueChanges.subscribe((value) => {
      if (value) {
        this.emailNotification = true;
        commonFormValidator.validators(this.formUser, "email", [
          Validators.required,
          Validators.pattern(/@contracted.sampoerna.com$|@sampoerna.com$/),
        ]);
      } else {
        this.emailNotification = false;
        commonFormValidator.validators(this.formUser, "email", [
          Validators.pattern(/@contracted.sampoerna.com$|@sampoerna.com$/),
        ]);
      }
    });
  }

  getDetails() {
    this.fieldForcePrincipal
      .detail({ fieldforce_id: this.pageId })
      .subscribe((res) => {
        const data = res.data || {};
        const patchData = {
          name: data.fullname,
          username: data.username,
          email: data.email,
          type: data.type,
          status: data.status === "active",
          emailNotification: data.emailNotification === "active",
          classification: data.classification
            ? data.classification.toLowerCase()
            : null,
          version: data.version,
        };
        this.emailNotification = patchData.emailNotification;

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
        if(!this.isDetail){
          this.formUser.get("classification").enable();
          commonFormValidator.validators(this.formUser, "classification", [
            Validators.required,
          ]);  
        }else {
          this.formUser.get("classification").disable();  
          commonFormValidator.validators(this.formUser, "classification");
        }
        this.emailNotification = false;
        commonFormValidator.validators(this.formUser, "email", [
          Validators.pattern(/@contracted.sampoerna.com$|@sampoerna.com$/),
        ]);
      } else {
        this.formUser.get("classification").setValue("");
        this.formUser.get("classification").disable();
        this.formUser.get("email").setValue("");
        this.formUser.get("emailNotification").setValue(false);
        commonFormValidator.validators(this.formUser, "classification");
      }

      this.limitLevel = level;
      if (this.initDetail) this.resetAreas();
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
      titleDialog:
        this.locale.global.button.delete +
        " " +
        this.locale.global.area.geotree,
      captionDialog: this.trans.instant("global.messages.delete_confirm", {
        entity: this.locale.global.area.geotree,
        index: "",
      }),
      confirmCallback: this.removeAreas.bind(this),
      buttonText: [
        this.locale.global.button.delete,
        this.locale.global.button.cancel,
      ],
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
      username: this.formUser.get("username").value,
      email: this.formUser.get("email").value, // email field
      type: this.formUser.get("type").value,
      classification: this.formUser.get("classification").value,
      areas: areas.value.map(({ area_id }) => area_id[0]),
      status: this.formUser.get("status").value ? "active" : "inactive",
      emailNotification: this.formUser.get("emailNotification").value
        ? "active"
        : "inactive", // emailNotification field
    };

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
          this.dialogService.openSnackBar({
            message: this.locale.global.messages.error,
          });
        }
      );
  }
}
