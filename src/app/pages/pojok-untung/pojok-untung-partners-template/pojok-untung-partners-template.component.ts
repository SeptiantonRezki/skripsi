import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pojok-untung-partners-template',
  templateUrl: './pojok-untung-partners-template.component.html',
  styleUrls: ['./pojok-untung-partners-template.component.scss']
})
export class PojokUntungPartnersTemplateComponent implements OnInit {

  rows: any[] = [
    {
      id: 1,
      name: "Pembukaan Rekening",
      alias: "Buka Rekening",
      partner_name: "BRI",
      type: "Keuangan"
    },
    {
      id: 2,
      name: "Pengaktifan QRIS",
      alias: "Aktifkan QRIS Statis",
      partner_name: "BRI",
      type: "Keuangan"
    },
    {
      id: 3,
      name: "Pendaftaran BPJSTK",
      alias: "Daftra BPJSTK",
      partner_name: "BPJS",
      type: "Asuransi"
    }
  ];

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private ls: LanguagesService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.rows;
  }

  addTemplatePartner() {
    this.router.navigate(["pojok-untung", "partners-template", "create"]);
  }

  editTemplatePartner(): void {
    this.router.navigate(["pojok-untung", "partners-template", "edit"]);
  }

}
