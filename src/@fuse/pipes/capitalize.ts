import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toCapitalize'})
export class CapitalizePipe implements PipeTransform {
  transform(value: string, args: any[] = []) {
    return value ? String(value).replace(/\b\w/g, l => l.toUpperCase()) : '';
  }
}
