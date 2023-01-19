import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector   : 'area-configuration',
    templateUrl: './area-configuration.component.html',
    styleUrls  : ['./area-configuration.component.scss']
})
export class AreaConfiguration
{
    pageName = "Area Configuration";

    onLoad: boolean;
    selectedArea: any[] = [];
    selectedAll: boolean = false;
    selectedAllId: any[] = [];
    Country: any = '';

    constructor(
      private router: Router,
      private dataService: DataService,
      private ls: LanguagesService,
      private translate: TranslateService,
    )
    {
      this.onLoad = false;
    }

    ngOnInit() {
      if (this.ls.selectedLanguages == 'id') {
        this.Country = 'ID';
      }
      else if (this.ls.selectedLanguages == 'km') {
        this.Country = 'KH';
      }
      else if (this.ls.selectedLanguages == 'en-ph') {
        this.Country = 'PH';
      }
    }

    getSelectedArea(value: any) {
      this.selectedArea = value;
    }

    getSelectedAll(value: any) {
      this.selectedAll = value;
    }

    getSelectedAllId(value: any) {
      this.selectedAllId = value;
    }
}
