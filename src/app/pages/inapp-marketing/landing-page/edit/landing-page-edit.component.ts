import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { LandingPageService } from "app/services/inapp-marketing/landing-page.service";
import { Router, ActivatedRoute } from "@angular/router";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { Config } from 'app/classes/config';
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-landing-page-edit",
  templateUrl: "./landing-page-edit.component.html",
  styleUrls: ["./landing-page-edit.component.scss"]
})
export class LandingPageEditComponent {
  formPageGroup: FormGroup;
  formPageError: any;
  idPage: any;
  detailPage: any;
  onLoad: boolean;

  listStatus: any[] = [
    { name: "Status Aktif", value: 1 },
    { name: "Status Non Aktif", value: 0 }
  ];

  files: File;
  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private dataService: DataService,
    private landingPageService: LandingPageService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.formPageError = {
      title: "",
      body: ""
    };

    // this.activatedRouter.url.subscribe(param => {
    //   this.idPage = param[2].path;
    // })

    // this.activatedRouter.queryParams.subscribe(params => {
    //   console.log(params)
    // })
    this.detailPage = this.dataService.getFromStorage("detail_page");
  }

  ngOnInit() {
    this.formPageGroup = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      status: [1, Validators.required]
    });

    this.formPageGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.formPageGroup,
        this.formPageError
      );
    });

    this.getDetailPage();
  }

  getDetailPage() {
    // this.staticPageService.get({ id_page: this.idPage }).subscribe(res => {
    //   this.onLoad = false;
    //   let response = res.data.filter(item => { return item.id == this.idPage });
    //   console.log(this.idPage);
    //   console.log(response)

    //   this.formPageGroup.get('title').setValue(response[0].title);
    //   this.formPageGroup.get('body').setValue(response[0].body);
    // })
    if (this.detailPage) {
      this.formPageGroup.get("title").setValue(this.detailPage.title);
      this.formPageGroup.get("body").setValue(this.detailPage.body);
    } else {
      this.router.navigate(["inapp-marketing", "page"]);
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formPageGroup.status === "VALID") {
      let body: Object = {
        _method: "PUT",
        title: this.formPageGroup.get("title").value,
        body: this.formPageGroup.get("body").value,
        status: this.formPageGroup.get("status").value
      };

      this.landingPageService
        .update(body, { page_id: this.detailPage.id })
        .subscribe(
          res => {
            // this.loadingIndicator = false;
            this.router.navigate(["advertisement", "landing-page"]);
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            window.localStorage.removeItem("detail_page");
          },
          err => {
            // this.dialogService.openSnackBar({ message: err.error.message });
            // this.loadingIndicator = false;
          }
        );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formPageGroup);
    }
  }
}
