import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-dialog-kategori-misi",
  templateUrl: "./dialog-kategori-misi.component.html",
  styleUrls: ["./dialog-kategori-misi.component.scss"],
})
export class DialogKategoriMisiComponent implements OnInit {
  form: FormGroup;
  pageName = this.translate.instant('dte.pengaturan_attribute_misi.text5');
  titleParam = {entity: this.pageName};

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogKategoriMisiComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: "",
    });
  }

  submit(form) {
    this.dialogRef.close(`${form.value.name}`);
    // console.log(`${form.value}`);

    this.pengaturanAttributeMisiService.createKategoriMisi(form.value).subscribe(
      (res) => {
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(["dte", "pengaturan-attribute-misi"]);
      },
      (err) => {
        this.dialogService.openSnackBar({ message: err.error.message })
        console.log(err.error.message);
      }
    )
  }
}
