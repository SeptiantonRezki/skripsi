import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AuthenticationService } from 'app/services/authentication.service';




@Component({
    selector   : 'syarat-ketentuan',
    templateUrl: './syarat-ketentuan.component.html',
    styleUrls  : ['./syarat-ketentuan.component.scss']
})
export class SyaratKetentuanComponent
{
    text:string = '';
    loading:boolean = true;
    constructor(
        private location:Location,
        private authenticationService: AuthenticationService,
    )
    {
        
    }
    ngOnInit() {
        this.authenticationService.getSyaratKetentuan().subscribe((res)=>{
            this.loading = false;
            this.text = res.data[0].body;
        },(e)=>{
            this.loading = false;
        })
    
    }
    
    goBack(){
        this.location.back();
    }
}

//