import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'info-preview',
  templateUrl: './info-preview.component.html',
  styleUrls: ['./info-preview.component.scss']
})
export class InfoPreviewComponent implements OnInit, OnChanges {
  
  @Input('preview') preview: any;

  constructor() {

  }

  ngOnChanges(changes) {
    console.log({changes});
    this.preview = changes.preview.currentValue;
  }

  ngOnInit() {
  }

}
