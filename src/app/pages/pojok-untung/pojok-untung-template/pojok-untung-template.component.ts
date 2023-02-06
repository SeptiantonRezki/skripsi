import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DataService } from 'app/services/data.service';
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
      name: "Template Pojok Untung Test"
    },
  ];

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private dataService: DataService,
    private ls: LanguagesService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.rows;
  }

  addTemplate() {
    this.router.navigate(["pojok-untung", "template-pojok-untung", "create"]);
  }

  editTemplate(param?: any): void {
    this.dataService.setToStorage("edit_template_pojok_untung", param);
    this.router.navigate(["pojok-untung", "template-pojok-untung", "edit", param.id]);
  }

}
