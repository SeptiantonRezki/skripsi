import { Component, OnInit } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {

  constructor(private fuseConfig: FuseConfigService) {
    this.fuseConfig.setConfig({
      layout: {
        navigation: 'none',
        toolbar   : 'none',
        footer    : 'none'
      }
    });
  }

}
