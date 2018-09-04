import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray
} from "../../../../../../node_modules/@angular/forms";
import { FieldForceService } from "../../../../services/user-management/field-force.service";
import { DialogService } from "app/services/dialog.service";
import {
  Router,
  ActivatedRoute
} from "../../../../../../node_modules/@angular/router";
import { commonFormValidator } from "app/classes/commonFormValidator";

@Component({
  selector: "app-field-force-create",
  templateUrl: "./field-force-create.component.html",
  styleUrls: ["./field-force-create.component.scss"]
})
export class FieldForceCreateComponent {
  // Vertical Stepper
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  formArea: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;

  listLevel: Array<any>;
  submitting: Boolean;
  ObjectArea: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private fieldForcePrincipal: FieldForceService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.submitting = false;
    this.verticalStepperStep1Errors = {
      name: {},
      phone: {}
    };
    this.verticalStepperStep2Errors = {
      level_desc: {}
    };

    this.listLevel = this.activatedRoute.snapshot.data["listLevel"].data;
  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      name: ["", Validators.required],
      phone: ["", Validators.required]
    });

    this.verticalStepperStep2 = this.formBuilder.group({
      level_desc: ["", Validators.required],
      area: this.formBuilder.array([])
    });

    this.verticalStepperStep1.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep1,
        this.verticalStepperStep1Errors
      );
    });

    this.verticalStepperStep2.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep2,
        this.verticalStepperStep2Errors
      );
    });
  }

  createFormArea(): FormGroup {
    return this.formBuilder.group({
      placeHolder: ["", Validators.required],
      packaging_amount: ["", Validators.required],
      level: ["", Validators.required],
      price: ["", Validators.required],
      price_discount: "",
      price_discount_expires_at: ""
    });
  }

  selectionChange(event) {
    this.fieldForcePrincipal
      .getListChildren({ level_desc: event.value })
      .subscribe(res => {
        let ObjectArea = {
          data: res.data,
          title: event.value,
          required: true
        };

        this.ObjectArea.splice(0, this.ObjectArea.length);
        this.ObjectArea.push(ObjectArea);

        let area = this.verticalStepperStep2.get("area") as FormArray;
        while (area.length > 0) {
          area.removeAt(area.length - 1);
        }
        area.push(
          this.formBuilder.group({
            [ObjectArea["title"]]: ["", Validators.required]
          })
        );
      });
  }

  onSelect(param) {
    if (param.event.value.parent_id) {
      this.fieldForcePrincipal
        .getListOtherChildren({
          level_desc: this.verticalStepperStep2.get("level_desc").value,
          parent_id: param.event.value.parent_id
        })
        .subscribe(res => {
          let ObjectArea = {
            data: res.data,
            title: param.event.value.name,
            required: true
          };

          if (param.index !== this.ObjectArea.length - 1) {
            this.ObjectArea.splice(param.index + 1, this.ObjectArea.length);
          }
          this.ObjectArea.push(ObjectArea);

          let area = this.verticalStepperStep2.get("area") as FormArray;
          while (area.length > this.ObjectArea.length) {
            area.removeAt(area.length - this.ObjectArea.length);
          }
          area.push(
            this.formBuilder.group({
              [ObjectArea["title"]]: ["", Validators.required]
            })
          );
        });
    }
  }

  submit() {
    // if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid) {
    //   this.submitting = true;
    //   let body = {
    //     name: this.verticalStepperStep1.get("nama").value,
    //     email: this.verticalStepperStep1.get("email").value,
    //     role_id: this.verticalStepperStep2.get("role").value
    //   };
    //   this.fieldForcePrincipal.create(body).subscribe(
    //     res => {
    //       this.dialogService.openSnackBar({
    //         message: "Data Berhasil Disimpan"
    //       });
    //       this.router.navigate(["user-management", "admin-principal"]);
    //     },
    //     err => {
    //       this.submitting = false;
    //     }
    //   );
    // } else {
    //   commonFormValidator.validateAllFields(this.verticalStepperStep1);
    //   commonFormValidator.validateAllFields(this.verticalStepperStep2);
    // }
    console.log(this.verticalStepperStep2.get("area").value);
  }
}
