import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserCatalogueService } from 'app/services/src-catalogue/user-catalogue.service';
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';

@Component({
  selector: 'app-user-src-catalogue-create',
  templateUrl: './user-src-catalogue-create.component.html',
  styleUrls: ['./user-src-catalogue-create.component.scss']
})
export class UserSrcCatalogueCreateComponent implements OnInit {
  // Vertical Stepper
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;

  listRole: Array<any>;
  submitting: Boolean;
  listVendor: Array<any>;
  constructor(
    private formBuilder: FormBuilder,
    private userCatalogueService: UserCatalogueService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private vendorService: VendorsService
  ) {
    this.submitting = false;
    this.verticalStepperStep1Errors = {
      nama: {},
      username: {},
      email: {}
    };

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
  }

  ngOnInit() {
    this.getVendors();
    this.verticalStepperStep1 = this.formBuilder.group({
      nama: ["", Validators.required],
      username: ["", Validators.required],
      email: ["", Validators.required]
    });

    this.verticalStepperStep2 = this.formBuilder.group({
      vendor: ["", Validators.required],
      role: ["", Validators.required]
    });
  }

  getVendors() {
    this.vendorService.get({ page: 'all' }).subscribe(res => {
      console.log('list vendors', res);
      this.listVendor = res.data ? res.data.data : []
    })
  }

  step1() {
    commonFormValidator.validateAllFields(this.verticalStepperStep1);
  }

  step2() {
    commonFormValidator.validateAllFields(this.verticalStepperStep2);
  }

  submit() {
    if (this.verticalStepperStep1.valid && this.verticalStepperStep2) {
      this.dataService.showLoading(true);
      let body = {
        fullname: this.verticalStepperStep1.get('nama').value,
        username: this.verticalStepperStep1.get('username').value,
        email: this.verticalStepperStep1.get('email').value,
        vendor_company_id: this.verticalStepperStep2.get('vendor').value,
        role_id: this.verticalStepperStep2.get('role').value,
        status: "active"
      }

      this.userCatalogueService.create(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data Berhasil Disimpan"
        });
        this.router.navigate(["src-catalogue", "users"]);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      commonFormValidator.validateAllFields(this.verticalStepperStep1);
    }
  }

}
