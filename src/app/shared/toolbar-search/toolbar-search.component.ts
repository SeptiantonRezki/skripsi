import { Component,Input } from '@angular/core';

@Component({
    selector   : 'toolbar-search',
    templateUrl: './toolbar-search.component.html',
    styleUrls  : ['./toolbar-search.component.scss']
})
export class ToolbarSearchComponent
{
	@Input() navigation: any;


    constructor()
    {
    	
    }

    ngOnInit(){
    	console.log('check navigation',this.navigation)
    }
}
