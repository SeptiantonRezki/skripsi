import { Component } from '@angular/core';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-medal-badge-component',
  templateUrl: './medal-badge-component.html',
  styleUrls: ['./medal-badge-component.scss']
})
export class MedalBadgeComponent {

  onLoad: boolean;

  medalSelected: any;
  dataIndexMedal: any;
  dataCreateMedal: any;

  constructor(
    private ls: LanguagesService
  ) {
    this.medalSelected = 'MEDAL_LIST';
    this.onLoad = false;
  }
  medalChanges(event: any) {
    if (event !== null) {
      if (event.selected !== null) {
        this.medalSelected = event.selected;
        if (event.selected === 'MEDAL_EDIT') {
          this.dataCreateMedal = event.data;
        } else {
          this.dataCreateMedal = null;
        }
      }
    }
  }

  selectedTabChange(event: any) {

  }

}
