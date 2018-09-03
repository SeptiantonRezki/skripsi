import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/admin-principal.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-admin-principal-create",
  templateUrl: "./admin-principal-create.component.html",
  styleUrls: ["./admin-principal-create.component.scss"]
})
export class AdminPrincipalCreateComponent {
  // Vertical Stepper
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;

  listRole: Array<any>;
  submitting: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private adminPrincipalService: AdminPrincipalService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.submitting = false;
    this.verticalStepperStep1Errors = {
      nama: {},
      email: {}
    };
    this.verticalStepperStep2Errors = {
      role: {}
    };

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      nama: ["", Validators.required],
      email: ["", Validators.required]
    });

    this.verticalStepperStep2 = this.formBuilder.group({
      role: ["", Validators.required]
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

  submit() {
    if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid) {
      this.submitting = true;

      let body = {
        name: this.verticalStepperStep1.get("nama").value,
        email: this.verticalStepperStep1.get("email").value,
        role_id: this.verticalStepperStep2.get("role").value
      };

      this.adminPrincipalService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: "Data Berhasil Disimpan"
          });
          this.router.navigate(["user-management", "admin-principal"]);
        },
        err => {
          this.submitting = false;
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.verticalStepperStep1);
      commonFormValidator.validateAllFields(this.verticalStepperStep2);
    }
  }
}
