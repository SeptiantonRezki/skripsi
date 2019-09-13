import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GeneralService } from 'app/services/general.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

  panel: any;
  onLoad: Boolean;
  listHelp: any[];

  constructor(
    private generalService: GeneralService,
    private sanitizer: DomSanitizer
  ) {
    this.panel = 'kontak';
    this.onLoad = true;
  }

  ngOnInit() {
    this.generalService.getSupport().subscribe(res => {
      this.listHelp = res.data;
      this.onLoad = false;
    })
  }

  openPanel(param) {
    this.panel = param;
  }

  openDynamicPanel(param) {
    this.panel = { ...param, body: this.sanitizer.bypassSecurityTrustHtml(param['body']) };
  }

}
