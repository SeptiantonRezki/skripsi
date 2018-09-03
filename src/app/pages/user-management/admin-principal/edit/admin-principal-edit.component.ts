import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/admin-principal.service";

@Component({
  selector: "app-admin-principal-edit",
  templateUrl: "./admin-principal-edit.component.html",
  styleUrls: ["./admin-principal-edit.component.scss"]
})
export class AdminPrincipalEditComponent {
  formAdmin: FormGroup;
  formdataErrors: any;

  listRole: Array<any>;
  detailAdminPrincipal: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "passive" }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private adminPrincipalService: AdminPrincipalService
  ) {
    this.formdataErrors = {
      name: {},
      email: {},
      role: {}
    };

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
    this.detailAdminPrincipal = this.dataService.getFromStorage(
      "detail_admin_principal"
    );
  }

  ngOnInit() {
    this.formAdmin = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      role: ["", Validators.required],
      status: [""],
      password: [""],
      confirmation_password: [""]
    });

    this.formAdmin.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formAdmin, this.formdataErrors);
    });

    this.setDetailAdminPrincipal();
  }

  setDetailAdminPrincipal() {
    this.formAdmin.setValue({
      name: this.detailAdminPrincipal.fullname,
      email: this.detailAdminPrincipal.email,
      role: this.detailAdminPrincipal.role_id,
      status: this.detailAdminPrincipal.status,
      password: "",
      confirmation_password: ""
    });
  }

  submit() {
    if (this.formAdmin.valid) {
      let body = {
        _method: "PUT",
        name: this.formAdmin.get("name").value,
        email: this.formAdmin.get("email").value,
        role_id: this.formAdmin.get("role").value,
        status: this.formAdmin.get("status").value
      };

      this.adminPrincipalService
        .put(body, { principal_id: this.detailAdminPrincipal.id })
        .subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            this.router.navigate(["user-management", "admin-principal"]);
            window.localStorage.removeItem("detail_admin_principal");
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
