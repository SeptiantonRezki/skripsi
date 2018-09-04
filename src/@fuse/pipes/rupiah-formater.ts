import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the RupiahFormaterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'rupiahFormater',
})
export class RupiahFormaterPipe implements PipeTransform {
    transform(value: number,
        currencySign: string = 'Rp ',
        decimalLength: number = 0, 
        chunkDelimiter: string = '.', 
        decimalDelimiter:string = ',',
        chunkLength: number = 3): string {

        value /= 1;

        let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')'
        let num = value.toFixed(Math.max(0, ~~decimalLength));

        return currencySign+(decimalDelimiter ? num.replace('.', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
    }
}
