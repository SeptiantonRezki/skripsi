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
    constructor(
      private router: Router,
      private dataService: DataService,
      private ls: LanguagesService,
      private translate: TranslateService,
    )
    {

    }
}
