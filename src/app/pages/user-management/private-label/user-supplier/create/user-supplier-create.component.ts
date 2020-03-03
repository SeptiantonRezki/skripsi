import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { SupplierCompanyService } from 'app/services/user-management/private-label/supplier-company.service';
import { UserSupplierService } from 'app/services/user-management/private-label/user-supplier.service';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from "../../../../../classes/commonFormValidator";

@Component({
  selector: 'app-user-supplier-create',
  templateUrl: './user-supplier-create.component.html',
  styleUrls: ['./user-supplier-create.component.scss']
})
export class UserSupplierCreateComponent implements OnInit {

  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  verticalStepperStep3: FormGroup;

  onLoad: boolean;
  isLoadingSave: boolean;

  listRole: Array<any>;
  supplierCompanyList: Array<any>;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private supplierCompanyService: SupplierCompanyService,
    private userSupplierService: UserSupplierService,
    private dialogService: DialogService,
  ) {
    this.onLoad = true;
    this.isLoadingSave = false;

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
    // console.log('listROLE', this.listRole);
  }

  ngOnInit() {
    this.initFormBuilder();
    this.getSupplierCompanyList();
  }

  initFormBuilder() {
    this.verticalStepperStep1 = this.formBuilder.group({
      nama: ["", Validators.required],
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]]
    });

    this.verticalStepperStep2 = this.formBuilder.group({
      supplierCompany: ["", Validators.required]
    });

    this.verticalStepperStep3 = this.formBuilder.group({
      role: ["", Validators.required]
    });
  }

  getSupplierCompanyList() {
    this.supplierCompanyService.getList().subscribe(
      res => {
        if (res.status == 'success') {
          this.supplierCompanyList = res.data.data
        } else {
          this.supplierCompanyList = [];
          this.dialogService.openSnackBar({
            message: res.status
          });
        }
      },
      err => {
        console.error(err);
      }
    );
  }
  
  step1() {
    commonFormValidator.validateAllFields(this.verticalStepperStep1);
  }

  step2() {
    commonFormValidator.validateAllFields(this.verticalStepperStep2);
  }

  onSave() {
      if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid && this.verticalStepperStep3.valid) {
        this.isLoadingSave = true;
        const body = {
          fullname: this.verticalStepperStep1.get("nama").value,
          username: this.verticalStepperStep1.get("username").value,
          email: this.verticalStepperStep1.get("email").value,
          supplier_company_id: this.verticalStepperStep2.get("supplierCompany").value,
          role_id: this.verticalStepperStep3.get("role").value,
          status: 'active'
        };
        this.userSupplierService.create(body).subscribe(res => {
          this.dialogService.openSnackBar({
            message: "Data Berhasil Disimpan"
          });
          this.verticalStepperStep1.reset();
          this.verticalStepperStep2.reset();
          this.verticalStepperStep3.reset();
          this.isLoadingSave = false;
          }, err => {
            console.log('err', err);
            this.isLoadingSave = false;
            // this.dialogService.openSnackBar({
            //   message: err.error.message
            // });
            let errorArray = Object.values(err.error.errors);
            this.dialogService.openSnackBar({ message: errorArray[0][0] });
          }
        );
      } else {
        this.dialogService.openSnackBar({
          message: "Data Belum Lengkap"
        });
        commonFormValidator.validateAllFields(this.verticalStepperStep1);
        commonFormValidator.validateAllFields(this.verticalStepperStep2);
        commonFormValidator.validateAllFields(this.verticalStepperStep3);
        this.isLoadingSave = false;
      }
  }

}
