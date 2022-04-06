import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';

import { SupplierCompanyService } from 'app/services/user-management/private-label/supplier-company.service';
import { UserSupplierService } from 'app/services/user-management/private-label/user-supplier.service';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from "../../../../../classes/commonFormValidator";
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-user-supplier-edit',
  templateUrl: './user-supplier-edit.component.html',
  styleUrls: ['./user-supplier-edit.component.scss']
})
export class UserSupplierEditComponent implements OnInit {
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  verticalStepperStep3: FormGroup;

  onLoad: boolean;
  isLoadingSave: boolean;
  isDetail: boolean;

  listRole: Array<any>;
  supplierCompanyList: Array<any>;
  detailUserSupplier: any;
  userSupplierStatusSelected: any;
  userSupplierId: any;
  userSupplierStatusList: any[] = [
    { name: this.ls.locale.global.label.active, status: 'active' },
    { name: this.ls.locale.global.label.inactive, status: 'inactive' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private supplierCompanyService: SupplierCompanyService,
    private userSupplierService: UserSupplierService,
    private dialogService: DialogService,
    private router: Router,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.isLoadingSave = false;

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;

    this.activatedRoute.url.subscribe(param => {
      this.isDetail = param[1].path === 'detail' ? true : false;
      this.userSupplierId = param[2].path;
    });
  }

  async ngOnInit() {
    await this.initFormBuilder();
    this.getSupplierCompanyList();
  }

  async initFormBuilder() {
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

    try {
      const response = await this.userSupplierService.detail({ userSupplierId: this.userSupplierId }).toPromise();
      if (response && response.status == 'success' && response.data) {
        this.detailUserSupplier = response.data;
        // console.log('response'+this.detailUserSupplier.fullname, this.detailUserSupplier);
        this.verticalStepperStep1.get('nama').setValue(this.detailUserSupplier.fullname);
        this.verticalStepperStep1.get('username').setValue(this.detailUserSupplier.username);
        this.verticalStepperStep1.get('email').setValue(this.detailUserSupplier.email);
        this.verticalStepperStep2.get('supplierCompany').setValue(this.detailUserSupplier.supplier_company_id);
        this.verticalStepperStep3.get('role').setValue(this.detailUserSupplier.role_id);
        this.userSupplierStatusSelected = this.detailUserSupplier.status;
      }
    } catch (error) {
      if (error.status === 404) {
        this.dialogService.openSnackBar({ message: "Data tidak ditemukan" });
        this.router.navigate(["user-management", "supplier-user"]);
      }
      throw error;
    }    
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
          _method: 'PUT',
          fullname: this.verticalStepperStep1.get("nama").value,
          username: this.verticalStepperStep1.get("username").value,
          email: this.verticalStepperStep1.get("email").value,
          supplier_company_id: this.verticalStepperStep2.get("supplierCompany").value,
          role_id: this.verticalStepperStep3.get("role").value,
          status: this.userSupplierStatusSelected
        };
        this.userSupplierService.update(body, { userSupplierId: this.detailUserSupplier.id }).subscribe(res => {
          this.dialogService.openSnackBar({
            message: "Berhasil Mengubah Data"
          });
          this.isLoadingSave = false;
          this.router.navigate(["user-management", "supplier-user"]);
          }, err => {
            console.log('err', err);
            this.isLoadingSave = false;
            this.dialogService.openSnackBar({
              message: err.error.message
            });
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
