import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'partnerRegistered'})
export class PartnerRegisteredFilterPipe implements PipeTransform {
  transform(partnerItems: any[], partnerTypeId: any) {
    if (partnerTypeId === -9) {
      return partnerItems;
    }
    partnerItems = partnerItems.filter((item) => {
      return item && item.partner_type === partnerTypeId;
    });
    partnerItems.unshift({ id: '', partner_name: 'Semua Partner' });
    return partnerItems;
  }
}
