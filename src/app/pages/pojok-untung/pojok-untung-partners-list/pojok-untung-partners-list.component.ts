import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pojok-untung-partners-list',
  templateUrl: './pojok-untung-partners-list.component.html',
  styleUrls: ['./pojok-untung-partners-list.component.scss']
})
export class PojokUntungPartnersListComponent implements OnInit {

  rows: any[] = [
    {
      id: 1,
      name: "Shafwah",
      type: "Perjalanan",
      status: "Aktif"
    },
    {
      id: 2,
      name: "BRI",
      type: "Keuangan",
      status: "Tidak Aktif"
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

  addPartner() {
    this.router.navigate(["pojok-untung", "partners-list", "create"]);
  }

  editPartner(param?: any): void {
    this.router.navigate(["pojok-untung", "partners-list", "edit", param.id]);
  }

}
