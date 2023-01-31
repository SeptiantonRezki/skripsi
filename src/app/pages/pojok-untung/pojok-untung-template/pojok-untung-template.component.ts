import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pojok-untung-template',
  templateUrl: './pojok-untung-template.component.html',
  styleUrls: ['./pojok-untung-template.component.scss']
})
export class PojokUntungTemplateComponent implements OnInit {
  rows: any[] = [
    {
      id: 1,
      name: "Template Test 1"
    },
    {
      id: 2,
      name: "Template Test 2"
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

  addTemplate() {
    this.router.navigate(["pojok-untung", "template-pojok-untung", "create"]);
  }

  editTemplate(): void {
    this.router.navigate(["pojok-untung", "template-pojok-untung", "edit"]);
  }

}
