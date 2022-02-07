import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'underscoreToCapitalize'
})
export class UnderscoreToCapitalizePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    return value ? value.split('_').map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(' ') : '';
  }

}
