import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { WholesalerService } from "../../../../services/user-management/wholesaler.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-wholesaler-create',
  templateUrl: './wholesaler-create.component.html',
  styleUrls: ['./wholesaler-create.component.scss']
})
export class WholesalerCreateComponent{
// Vertical Stepper
verticalStepperStep1: FormGroup;
verticalStepperStep2: FormGroup;
verticalStepperStep3: FormGroup;

verticalStepperStep1Errors: any;
verticalStepperStep2Errors: any;
verticalStepperStep3Errors: any;

submitting: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private WholesalerService: WholesalerService,
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
        area: {}
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
        area: ["", Validators.required]
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
          phone: '0' + this.verticalStepperStep2.get("phone").value,
          areas: [this.verticalStepperStep3.get("area").value]
        };
  
        this.WholesalerService.create(body).subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Disimpan"
            });
            this.router.navigate(["user-management", "wholesaler"]);
          },
          err => {
            this.submitting = false;
          }
        );
      } else {
        commonFormValidator.validateAllFields(this.verticalStepperStep1);
        commonFormValidator.validateAllFields(this.verticalStepperStep2);
        commonFormValidator.validateAllFields(this.verticalStepperStep3);
      }
    }

}
