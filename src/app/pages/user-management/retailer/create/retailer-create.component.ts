import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { RetailerService } from "../../../../services/user-management/retailer.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-retailer-create',
  templateUrl: './retailer-create.component.html',
  styleUrls: ['./retailer-create.component.scss']
})
export class RetailerCreateComponent{
// Vertical Stepper
verticalStepperStep1: FormGroup;
verticalStepperStep2: FormGroup;
verticalStepperStep3: FormGroup;
verticalStepperStep4: FormGroup;

verticalStepperStep1Errors: any;
verticalStepperStep2Errors: any;
verticalStepperStep3Errors: any;
verticalStepperStep4Errors: any;

submitting: Boolean;

listType: any[] = [
  { name: "General Trade", value: "General Trade" },
  { name: "Modern Trade", value: "Modern Trade" }
];

listIC: any[] = [
  { name: "NON-SRC", value: "NON-SRC" },
  { name: "SRC", value: "SRC" }
];

  constructor(
    private formBuilder: FormBuilder,
    private RetailerService: RetailerService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute
    ) { 
      this.submitting = false;
      this.verticalStepperStep1Errors = {
        name: {},
        address: {},
        business_code: {}
      };
      this.verticalStepperStep2Errors = {
        owner: {},
        phone: {}
      };
      this.verticalStepperStep3Errors = {
        area: {},
        latitude: {},
        longitude: {}
      };
      this.verticalStepperStep4Errors = {
        type: {},
        InternalClassification: {}
      };
    }
  
    ngOnInit() {
      this.verticalStepperStep1 = this.formBuilder.group({
        name: ["", Validators.required],
        address: ["", Validators.required],
        business_code: ["", Validators.required], 
      });
  
      this.verticalStepperStep2 = this.formBuilder.group({
        owner: ["", Validators.required],
        phone: ["", Validators.required]
      });
  
      this.verticalStepperStep3 = this.formBuilder.group({
        area: ["", Validators.required],
        latitude: [""],
        longitude: [""],
      });
  
      this.verticalStepperStep4 = this.formBuilder.group({
        type: ["", Validators.required],
        InternalClassification: ["", Validators.required]
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
  
      this.verticalStepperStep3.valueChanges.subscribe(() => {
        commonFormValidator.parseFormChanged(
          this.verticalStepperStep3,
          this.verticalStepperStep3Errors
        );
      });
  
      this.verticalStepperStep4.valueChanges.subscribe(() => {
        commonFormValidator.parseFormChanged(
          this.verticalStepperStep4,
          this.verticalStepperStep4Errors
        );
      });
    }
  
    selectionChange(event) {
      console.log(event.value);
    }
  
    submit() {
      if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid) {
        this.submitting = true;
  
        let body = {
          name: this.verticalStepperStep1.get("name").value,
          address: this.verticalStepperStep1.get("address").value,
          business_code: this.verticalStepperStep1.get("business_code").value,
          owner: this.verticalStepperStep2.get("owner").value,
          phone: '+62' + this.verticalStepperStep2.get("phone").value,
          areas: [this.verticalStepperStep3.get("area").value],
          latitude: this.verticalStepperStep3.get("latitude").value,
          longitude: this.verticalStepperStep3.get("longitude").value,
          type: this.verticalStepperStep4.get("type").value,
          InternalClassification: this.verticalStepperStep4.get("InternalClassification").value
        };
  
        this.RetailerService.create(body).subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Disimpan"
            });
            this.router.navigate(["user-management", "retailer"]);
          },
          err => {
            this.submitting = false;
          }
        );
      } else {
        commonFormValidator.validateAllFields(this.verticalStepperStep1);
        commonFormValidator.validateAllFields(this.verticalStepperStep2);
        commonFormValidator.validateAllFields(this.verticalStepperStep3);
        commonFormValidator.validateAllFields(this.verticalStepperStep4);
      }
    }

}
