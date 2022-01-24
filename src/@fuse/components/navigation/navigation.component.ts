import { Component, Input, ViewEncapsulation } from '@angular/core';
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
    selector     : 'fuse-navigation',
    templateUrl  : './navigation.component.html',
    styleUrls    : ['./navigation.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseNavigationComponent
{
    @Input() layout = 'vertical';
    @Input() navigation: any;

    constructor(private ls: LanguagesService)
    {

    }

    redirectToPrivacy() {
        window.open('https://www.pmiprivacy.com/id/business-partner', '_blank');
    }
}
