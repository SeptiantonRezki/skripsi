import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'app/services/user-management/customer.service';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent {
  formCustomer: FormGroup;
  onLoad = true;
  
  customer_id: any;
  detailCustomer: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" }
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
    private customerService: CustomerService
  ) {
    this.activatedRoute.url.subscribe(param => {
      this.customer_id = param[2].path;
    })
  }

  ngOnInit() {
    this.customerService.getDetail({ customer_id: this.customer_id }).subscribe(
      res => {
        this.onLoad = false;
        this.formCustomer = this.formBuilder.group({
          status: [res.status],
          fullname: [res.fullname],
          gender: [res.gender === 'male' ? "Laki-laki" : "Perempuan"],
          city: [res.city.name],
          birth_date: [res.birth_date.split('-').reverse().join('/')],
          id_number: [res.id_number],
          phone: [res.phone],
          is_smoking: [res.is_smoking === 1 ? 'Ya, Saya Merokok' : 'Tidak, Saya Tidak Merokok'],
          email: [res.email || '-'],
          refferal_name: [res.refferal_name || '-'],
          refferal_code: [res.refferal_code || '-']
        });

        this.formCustomer.disable();
        console.log(this.formCustomer.getRawValue())
      },
      err => {
        this.router.navigate(['/user-management', 'customer']);
        this.dialogService.openSnackBar({ message: "Data tidak ditemukan" });
      }
    )
  }

}
