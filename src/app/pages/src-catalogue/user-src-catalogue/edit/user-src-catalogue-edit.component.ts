import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { UserCatalogueService } from 'app/services/src-catalogue/user-catalogue.service';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-user-src-catalogue-edit',
  templateUrl: './user-src-catalogue-edit.component.html',
  styleUrls: ['./user-src-catalogue-edit.component.scss']
})
export class UserSrcCatalogueEditComponent implements OnInit {
  formUserCatalogue: FormGroup;
  detailUser: any;
  shortDetail: any;
  listVendor: Array<any>;
  listRole: Array<any>;
  isDetail: Boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private dialogService: DialogService,
    private userCatalogueService: UserCatalogueService,
    private formBuilder: FormBuilder,
    private vendorService: VendorsService
  ) {
    this.shortDetail = this.dataService.getFromStorage("detail_user_catalogue");
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
  }

  ngOnInit() {
    this.getVendors();
    this.formUserCatalogue = this.formBuilder.group({
      name: ["", Validators.required],
      username: ["",],
      email: ["", [Validators.required, Validators.email]],
      vendor: ["", Validators.required],
      role: ["", Validators.required]
    });

    this.getDetail();
  }

  getDetail() {
    this.userCatalogueService.show({ user_catalogue_id: this.shortDetail.id }).subscribe(res => {
      this.detailUser = res.data;
      this.formUserCatalogue.setValue({
        name: res.data.fullname,
        username: res.data.username ? res.data.username : '',
        email: res.data.email,
        vendor: res.data.vendor_company_id,
        role: res.data.role_id ? res.data.role_id : ''
      })

      if (this.isDetail) this.formUserCatalogue.disable();
    })
  }

  getVendors() {
    this.vendorService.get({ page: 'all' }).subscribe(res => {
      this.listVendor = res.data ? res.data.data : []
    })
  }

  submit() {
    if (this.formUserCatalogue.valid) {
      this.dataService.showLoading(true);
      let body = {
        fullname: this.formUserCatalogue.get('name').value,
        username: this.formUserCatalogue.get('username').value,
        email: this.formUserCatalogue.get('email').value,
        vendor_company_id: this.formUserCatalogue.get('vendor').value,
        role_id: this.formUserCatalogue.get('role').value,
        status: this.detailUser.status
      }

      this.userCatalogueService.update({ user_catalogue_id: this.shortDetail.id }, body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data Berhasil Disimpan"
        });
        this.router.navigate(["src-catalogue", "users"]);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      commonFormValidator.validateAllFields(this.formUserCatalogue);
    }
  }

}
