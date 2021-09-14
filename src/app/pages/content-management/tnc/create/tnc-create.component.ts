import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { TncService } from '../../../../services/content-management/tnc.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Config } from 'app/classes/config';
import { HelpService } from 'app/services/content-management/help.service';

@Component({
  selector: 'app-tnc-create',
  templateUrl: './tnc-create.component.html',
  styleUrls: ['./tnc-create.component.scss']
})
export class TncCreateComponent {

  formTnc: FormGroup;
  formTncError: any;

  userGroup: any[] = [
    // { name: "Field Force", value: "field-force" },
    // { name: "Wholesaler", value: "wholesaler" },
    // { name: "Retailer", value: "retailer" },
    // // { name: "Paguyuban", value: "paguyuban" },
    // { name: "Customer", value: "customer" }
  ];
  countryList: any[] = [];
  companyList: any[] = [];

  files: File;
  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private tncService: TncService,
    private helpService: HelpService
  ) {
    this.formTncError = {
      title: {},
      body: {},
      user: {},
      group_id: {},
      country: {},
    };
  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required],
      is_notif: [false],
      group_id: [""],
      country: ["", Validators.required]
    });

    this.getUserGroups();
    this.getCountryList();
    this.getCompanyList();

    this.formTnc.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTnc, this.formTncError);
    });
  }

  removeImage(): void {
    this.files = undefined;
  }

  getUserGroups() {
    this.helpService.getListUser().subscribe(
      (res: any) => {
        console.log('getListUser', res);
        this.userGroup = res.data.map((item: any) => {
          return (
            { name: item, value: item }
          );
        });
      },
      err => {
        this.userGroup = [];
        console.error(err);
      }
    );
  }

  getCountryList(){
    this.helpService.getCountry().subscribe(
      res => {
        this.countryList = res.data;
      },
      err => {
        this.countryList = [];
        console.error(err);
      }
    );
  }

  getCompanyList() {
    this.tncService.getCompanyList().subscribe(res => {
      this.companyList = res.data;
    })
  }

  submit(): void {
    if (this.formTnc.valid) {
      let body: Object = {
        title: this.formTnc.get("title").value,
        body: this.formTnc.get("body").value,
        user: this.formTnc.get("user").value,
        type: "terms-conditions",
        is_notif: this.formTnc.get('is_notif').value === true ? 1 : 0,
        group_id: this.formTnc.get("group_id").value,
        country: this.formTnc.get("country").value,
      };

      this.tncService.create(body).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "terms-and-condition"]);
          this.dialogService.openSnackBar({
            message: "Data berhasil disimpan"
          });
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formTnc);
    }
  }

}
