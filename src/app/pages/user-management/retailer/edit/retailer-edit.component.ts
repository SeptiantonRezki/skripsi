import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { RetailerService } from "../../../../services/user-management/retailer.service";

@Component({
  selector: 'app-retailer-edit',
  templateUrl: './retailer-edit.component.html',
  styleUrls: ['./retailer-edit.component.scss']
})

export class RetailerEditComponent {
  formRetailer: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;

  detailRetailer: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" },
    { name: "Status Tidak terdaftar", value: "not-registered" }
  ];

  listType: any[] = [
    { name: "General Trade", value: "General Trade" },
    { name: "Modern Trade", value: "Modern Trade" }
  ];
  
  listIC: any[] = [
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "SRC", value: "SRC" }
  ];  

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private RetailerService: RetailerService
  ) {
    this.onLoad = false;
    this.formdataErrors = {
      name: {},
      address: {},
      business_code: {},
      owner: {},
      phone: {},
      status: {},
      area: {},
      latitude: {},
      longitude: {},
      type: {},
      InternalClassification: {}
    };

    this.detailRetailer = this.dataService.getFromStorage(
      "detail_retailer"
    );

    console.log(this.detailRetailer);
  }

  ngOnInit() {
    

    this.formRetailer = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      business_code: ["", Validators.required],
      owner: ["", Validators.required],
      phone: ["", Validators.required],
      status: ["", Validators.required],
      area: ["", Validators.required],
      latitude: [""],
      longitude: [""],
      type: ["", Validators.required],
      InternalClassification: ["", Validators.required]
    });
    this.formRetailer.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRetailer, this.formdataErrors);
    });

    this.setDetailRetailer();
    
    if(this.formRetailer.get('status').value === 'not-registered'){
      this.formRetailer.get('status').disable();
    }else{
      this.listStatus = [
        { name: "Status Aktif", value: "active" },
        { name: "Status Non Aktif", value: "inactive" }
      ];
    }
    this.onLoad = true;
  }

  setDetailRetailer() {
    this.formRetailer.setValue({
      name: this.detailRetailer.name,
      address: this.detailRetailer.address,
      business_code: this.detailRetailer.code,
      owner: this.detailRetailer.owner,
      phone: this.detailRetailer.phone.replace('+62', ''),
      status: this.detailRetailer.status,
      area: this.detailRetailer.area_id[0],
      latitude: this.detailRetailer.latitude,
      longitude: this.detailRetailer.longitude,
      type: this.detailRetailer.type_hms,
      InternalClassification: this.detailRetailer.classification
    });
    
    // console.log(this.formRetailer.get('status').value);
  }

  submit() {
    if (this.formRetailer.valid) {
      let body = {
        _method: "PUT",
        name: this.formRetailer.get("name").value,
        address: this.formRetailer.get("address").value,
        business_code: this.formRetailer.get("business_code").value,
        owner: this.formRetailer.get("owner").value,
        phone: '+62' + this.formRetailer.get("phone").value,
        status: this.formRetailer.get("status").value,
        areas: [this.formRetailer.get("area").value],
        latitude: this.formRetailer.get("latitude").value,
        longitude: this.formRetailer.get("longitude").value,
        type: this.formRetailer.get("type").value,
        InternalClassification: this.formRetailer.get("InternalClassification").value
      };

      this.RetailerService
        .put(body, { retailer_id: this.detailRetailer.id })
        .subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            this.router.navigate(["user-management", "retailer"]);
            window.localStorage.removeItem("detail_retailer");
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
