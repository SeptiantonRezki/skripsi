import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { TncService } from '../../../../services/content-management/tnc.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';
import { Config } from 'app/classes/config';
import { HelpService } from 'app/services/content-management/help.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { PagesName } from 'app/classes/pages-name';
@Component({
  selector: 'app-tnc-edit',
  templateUrl: './tnc-edit.component.html',
  styleUrls: ['./tnc-edit.component.scss']
})
export class TncEditComponent {

  formTnc: FormGroup;
  formTncError: any;
  detailTnc: any;

  userGroup: any[] = [
    // { name: "Field Force", value: "field-force" },
    // { name: "Wholesaler", value: "wholesaler" },
    // { name: "Retailer", value: "retailer" },
    // // { name: "Paguyuban", value: "paguyuban" },
    // { name: "Customer", value: "customer" }
  ];
  countryList: any[] = [];
  companyList: any[] = [];
  roles: PagesName = new PagesName();
  files: File;
  public options: Object = Config.FROALA_CONFIG;
  permission: {}
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private tncService: TncService,
    private dataService: DataService,
    private helpService: HelpService,
    private ls: LanguagesService
  ) {
    this.formTncError = {
      title: {},
      body: {},
      user: {},
      group_id: {},
      country: {},
    };
    this.permission = this.roles.getRoles('principal.syaratketentuan');
    this.detailTnc = this.dataService.getFromStorage('detail_tnc');
  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required],
      is_notif: [false],
      group_id: [""],
      country: ["", Validators.required],
    });

    this.getUserGroups();
    this.getCountryList();
    this.getCompanyList();

    this.formTnc.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTnc, this.formTncError);
    });

    this.formTnc.setValue({
      title: this.detailTnc.title,
      user: this.detailTnc.user,
      body: this.detailTnc.body,
      is_notif: false,
      group_id: this.detailTnc.group_id || "",
      country: this.detailTnc.country_code
    })
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

  getCountryList() {
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
        _method: "PUT",
        title: this.formTnc.get("title").value,
        body: this.formTnc.get("body").value,
        user: this.formTnc.get("user").value,
        type: "terms-conditions",
        is_notif: this.formTnc.get('is_notif').value === true ? 1 : 0,
        group_id: this.formTnc.get("group_id").value,
        country: this.formTnc.get("country").value,
      };

      this.tncService.put(body, { content_id: this.detailTnc.id }).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "terms-and-condition"]);
          this.dialogService.openSnackBar({ message: "Data berhasil diubah" }); // TODO
          window.localStorage.removeItem('detail_tnc');
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" }); // TODO
      commonFormValidator.validateAllFields(this.formTnc);
    }
  }

}
