import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { WholesalerService } from "../../../../services/user-management/wholesaler.service";

@Component({
  selector: 'app-wholesaler-edit',
  templateUrl: './wholesaler-edit.component.html',
  styleUrls: ['./wholesaler-edit.component.scss']
})
export class WholesalerEditComponent{
  formWs: FormGroup;
  formdataErrors: any;

  detailWholesaler: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "A" },
    { name: "Status Non Aktif", value: "I" }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private WholesalerService: WholesalerService
  ) {
    this.formdataErrors = {
      name: {},
      address: {},
      code: {},
      owner: {},
      phone: {},
      status: {},
      area_code: {}
    };

    this.detailWholesaler = this.dataService.getFromStorage(
      "detail_wholesaler"
    );
    // console.log(this.detailWholesaler);
  }

  ngOnInit() {
    this.formWs = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      code: ["", Validators.required],
      owner: ["", Validators.required],
      phone: ["", Validators.required],
      status: ["", Validators.required],
      area_code: ["", Validators.required]
    });

    this.formWs.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formWs, this.formdataErrors);
    });

    this.setDetWholesaler();
  }

  setDetWholesaler() {
    this.formWs.setValue({
      name: this.detailWholesaler.name,
      address: this.detailWholesaler.address,
      code: this.detailWholesaler.code,
      owner: this.detailWholesaler.owner,
      phone: (this.detailWholesaler.phone) ? parseInt(this.detailWholesaler.phone): '',
      status: this.detailWholesaler.status,
      area_code: this.detailWholesaler.area_code
    });
  }

  submit() {
    // console.log(this.formWs);
    if (this.formWs.valid) {
      let body = {
        _method: "PUT",
        name: this.formWs.get("name").value,
        address: this.formWs.get("address").value,
        business_code: this.formWs.get("code").value,
        owner: this.formWs.get("owner").value,
        phone: '0' + this.formWs.get("phone").value,
        areas: [this.formWs.get("area_code").value],
        status: this.formWs.get("status").value
      };

      this.WholesalerService
        .put(body, { wholesaler_id: this.detailWholesaler.id })
        .subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            this.router.navigate(["user-management", "wholesaler"]);
            window.localStorage.removeItem("detail_wholesaler");
          },
          err => {}
        );
    } else {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!"
      });
    }
  }
}
