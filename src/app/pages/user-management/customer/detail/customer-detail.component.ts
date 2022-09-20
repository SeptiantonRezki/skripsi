import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'app/services/user-management/customer.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { PagesName } from 'app/classes/pages-name';
import { Utils } from 'app/classes/utils';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent {
  formCustomer: FormGroup;
  onLoad = true;
  permission: any;
  roles: PagesName = new PagesName();
  viewPhoneNumberStatus: Boolean;

  customer_id: any;
  detailCustomer: any;
  listStatus: any[] = [
    { name: this.ls.locale.global.label.active_status, value: "active" },
    { name: this.ls.locale.global.label.inactive_status, value: "inactive" },
    { name: this.ls.locale.global.label.unregistered_status, value: "not-registered" }
  ];

  listLevelArea: any[];
  list: any;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  detailAreaSelected: any[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private customerService: CustomerService,
    private ls: LanguagesService
  ) {
    this.permission = this.roles.getRoles('principal.customer.');

    this.viewPhoneNumberStatus = Object.values(this.permission).indexOf('principal.customer.phone_number_and_DOB_view') > -1;
    this.activatedRoute.url.subscribe(param => {
      this.customer_id = param[2].path;
    })
  }

  ngOnInit() {
    this.customerService.getDetail({ customer_id: this.customer_id }).subscribe(
      res => {
        this.onLoad = false;
        const date = res.birth_date.split('-').reverse().join('/');
        this.formCustomer = this.formBuilder.group({
          status: [res.status],
          fullname: [res.fullname],
          gender: [res.gender === 'male' ? "Laki-laki" : "Perempuan"],
          city: [res.city.name],
          birth_date: [!this.viewPhoneNumberStatus ? Utils.reMaskInput(date, 3) : date],
          id_number: [res.id_number],
          phone: [!this.viewPhoneNumberStatus ? Utils.reMaskInput(res.phone, 4) : res.phone],
          is_smoking: [res.is_smoking === 1 ? 'Ya, Saya Merokok' : 'Tidak, Saya Tidak Merokok'],
          email: [res.email || '-'],
          refferal_name: [res.refferal_name || '-'],
          refferal_code: [res.refferal_code || '-'],
          total_coupon: [res.total_coupon],
          version: res.version
        });

        this.formCustomer.disable();
      },
      err => {
        this.router.navigate(['/user-management', 'customer']);
        this.dialogService.openSnackBar({ message: "Data tidak ditemukan" });
      }
    )
  }

}
