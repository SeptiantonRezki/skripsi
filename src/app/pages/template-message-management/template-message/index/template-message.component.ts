import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TemplateMessageService } from 'app/services/template-message-management/template-message.service';

const defaultTemplateWholesaler = [
  {
    "id": 1,
    "title": "Hai, selamat datang di toko kami! Apakah ada informasi yang dapat kami berikan?",
    "body": "Hai, selamat datang di toko kami! Apakah ada informasi yang dapat kami berikan?",
    "user": "wholesaler"
  },
  {
    "id": 2,
    "title": "Pesanan Anda masih dalam proses untuk disiapkan.",
    "body": "Pesanan Anda masih dalam proses untuk disiapkan.",
    "user": "wholesaler"
  },
  {
    "id": 3,
    "title": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "body": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "user": "wholesaler"
  },
  {
    "id": 4,
    "title": "Apakah pesanannya sudah diterima? Jika sudah, mohon untuk lakukan konfirmasi penerimaan (tekan Pesanan Diterima)",
    "body": "Apakah pesanannya sudah diterima? Jika sudah, mohon untuk lakukan konfirmasi penerimaan (tekan Pesanan Diterima)",
    "user": "wholesaler"
  },
  {
    "id": 5,
    "title": "Terima kasih telah berbelanja di toko kami. Semoga pengalaman berbelanja Anda menyenangkan!",
    "body": "Terima kasih telah berbelanja di toko kami. Semoga pengalaman berbelanja Anda menyenangkan!\n\nSilahkan sampaikan kritik dan saran agar kami dapat melayani Anda lebih baik lagi.",
    "user": "wholesaler"
  }
];
const defaultTemplateRetailer = [
  {
    "id": 6,
    "title": "Hai, pesanan saya sudah diproses sampai mana?",
    "body": "Hai, pesanan saya sudah diproses sampai mana?",
    "user": "retailer"
  },
  {
    "id": 7,
    "title": "Mohon info, kapan pesanan saya akan dikirim?",
    "body": "Mohon info, kapan pesanan saya akan dikirim?",
    "user": "retailer"
  },
  {
    "id": 8,
    "title": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "body": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "user": "retailer"
  },
  {
    "id": 9,
    "title": "Apakah pesanan saya jumlah dan harganya sesuai dengan yang saya pesan diaplikasi?",
    "body": "Apakah pesanan saya jumlah dan harganya sesuai dengan yang saya pesan diaplikasi?",
    "user": "retailer"
  },
  {
    "id": 10,
    "title": "Terima kasih!",
    "body": "Terima kasih!",
    "user": "retailer"
  }
];
@Component({
  selector: 'app-template-message',
  templateUrl: './template-message.component.html',
  styleUrls: ['./template-message.component.scss']
})
export class TemplateMessageComponent {

  onLoad: boolean;
  wholesalerTemplates: any;
  retailerTemplates: any;
  deleteListWholesaler: any;
  deleteListRetailer: any;
  indexOnEdit: number;
  listOnEdit: any;
  isSaved: boolean;
  selectedTab: number;

  constructor(
    public tms: TemplateMessageService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.wholesalerTemplates = [];
    this.retailerTemplates = [];
    this.deleteListWholesaler = [];
    this.deleteListRetailer = [];
    this.indexOnEdit = -1;
    this.listOnEdit = [];
    this.isSaved = false;
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.tms.get().subscribe((res: any) => {
      this.wholesalerTemplates = res.data.wholesaler;
      this.retailerTemplates = res.data.retailer;

      if (res.data.wholesaler.length == 0) {
        this.wholesalerTemplates = defaultTemplateWholesaler;
      }
      if (res.data.retailer.length == 0) {
        this.retailerTemplates = defaultTemplateRetailer;
      }
      this.onLoad = false;
    }, error => {
      this.onLoad = false;
      alert(error);
    })
  }

  selectedTabChange(e: any) {
    // console.log(this.selectedTab + " - ",  e);
    this.indexOnEdit = -1;
    if (e !== this.selectedTab) {
      this.selectedTab = e;
    }
  }

  resetToDefault(index: number, user: string) {
    console.log('index', index);
    console.log('user', user);
    if (user == 'wholesaler') {
      this.wholesalerTemplates[index].title = defaultTemplateWholesaler[index].title;
      this.wholesalerTemplates[index].body = defaultTemplateWholesaler[index].body;
    } else {
      if (user == 'retailer') {
        this.retailerTemplates[index].title = defaultTemplateRetailer[index].title;
        this.retailerTemplates[index].body = defaultTemplateRetailer[index].body;
      }
    }
  }


  resetToDefaultAll(user: string) {
    if (user == 'wholesaler') {
      const match = [...this.deleteListWholesaler, ...this.wholesalerTemplates]
      this.deleteListWholesaler = match.reduce((a, c) => { !a.find(v => v.id === c.id) && a.push(c); return a; }, []);
      this.wholesalerTemplates = defaultTemplateWholesaler.map(item => ({ ...item }));
    } else {
      if (user == 'retailer') {
        const match = [...this.deleteListRetailer, ...this.retailerTemplates]
        this.deleteListRetailer = match.reduce((a, c) => { !a.find(v => v.id === c.id) && a.push(c); return a; }, []);
        this.retailerTemplates = defaultTemplateRetailer.map(item => ({ ...item }));
      }
    }
  }

  addTemplate(user: string) {
    let newTemplate = {
      body: "",
      created_at: "",
      id: "",
      title: "",
      updated_at: "",
      user: user,
    }
    if (user == 'wholesaler') {
      if (this.wholesalerTemplates.length < 5) {
        let indexOnEmpty = [];
        let wt = this.wholesalerTemplates.map((item: any, i: number) => {
          if (item.body == "" || item.title == "") {
            indexOnEmpty.push(i + 1);
          }
          return item;
        });
        Promise.all(wt).then(() => {
          if (indexOnEmpty.length > 0) {
            alert("Judul atau Isi Template Pesan " + JSON.stringify(indexOnEmpty) + " harus diisi!");
          } else {
            this.wholesalerTemplates.push(newTemplate);
            this.listOnEdit.push(newTemplate);
          }
        });
      } else {
        alert("Jumlah Template Telah Mencapai Batas Maksimal (5).")
      }
    }
    if (user == 'retailer') {
      if (this.retailerTemplates.length < 5) {
        let indexOnEmpty = [];
        let wt = this.retailerTemplates.map((item: any, i: number) => {
          if (item.body == "" || item.title == "") {
            indexOnEmpty.push(i + 1);
          }
          return item;
        });
        Promise.all(wt).then(() => {
          if (indexOnEmpty.length > 0) {
            alert("Judul atau Isi Template Pesan " + JSON.stringify(indexOnEmpty) + " harus diisi!");
          } else {
            this.retailerTemplates.push(newTemplate);
            this.listOnEdit.push(newTemplate);
          }
        });
      } else {
        alert("Jumlah Template Telah Mencapai Batas Maksimal (5).")
      }
    }
  }

  onEdit(item: any, i: number, user: string) {
    if (this.indexOnEdit == i) this.indexOnEdit = -1;
    else this.indexOnEdit = i;

  }

  onBlur(item: any, i: number, user: string) {
    if (this.indexOnEdit == i) this.indexOnEdit = -1;
  }

  onDeleteTemplate(item: any, i: number, user: string) {
    if (user == 'wholesaler') {
      this.wholesalerTemplates.splice(i, 1);
      if (item.id !== '')
        this.deleteListWholesaler.push(item);
    }
    if (user == 'retailer') {
      this.retailerTemplates.splice(i, 1);
      if (item.id !== '')
        this.deleteListRetailer.push(item);
    }
  }

  async deleteTemplates(body: FormData, user: string) {
    return await this.tms.delete(body).subscribe((res) => {
      console.log('deleted');
      if (user == "wholesaler") this.deleteListWholesaler = [];
      if (user == "retailer") this.deleteListRetailer = [];
      this.onSaveTemplate(user);
    }, error => {
      console.log('delete failed', error);
      alert('Failed to Save Template')
    });
  }

  async onSaveTemplate(user: string) {
    let error = false;
    let error2 = false;
    this.indexOnEdit = -1;
    let bodySave = new FormData();
    let bodyDelete = new FormData();
    if (user == "wholesaler") {
      console.log('this.deleteListWholesaler', this.deleteListWholesaler)
      if (this.deleteListWholesaler.length > 0) {
        let deleteReady = await this.deleteListWholesaler.map((item: any, i: number) => {
          bodyDelete.append('ids[' + i + ']', item.id);
        });
        await Promise.all(deleteReady).then(async () => {
          await this.deleteTemplates(bodyDelete, user);
        });
      } else {
        let templateReady = await this.wholesalerTemplates.map((item: any, i: number) => {
          if (item.title !== '' && item.body !== '') {
            if (item.body.toString().length < 500) {
              bodySave.append('template[' + i + '][id]', item.id);
              bodySave.append('template[' + i + '][title]', item.title);
              bodySave.append('template[' + i + '][body]', item.body);
              bodySave.append('template[' + i + '][user]', item.user);
              return item;
            } else {
              error2 = true;
            }
          } else {
            error = true;
          }
        });
        await Promise.all(templateReady).then(async () => {
          if (!error) {
            if (!error2) {
              this.onLoad = true;
              await this.tms.create(bodySave).subscribe((res_: any) => {
                this.indexOnEdit = -1;
                this.isSaved = true;
                this.onLoad = true;
                this.tms.get().subscribe((res: any) => {
                  this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesaler : res.data.wholesaler;
                  this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailer : res.data.retailer;
                  this.onLoad = false;
                }, error => {
                  this.onLoad = false;
                  this.isSaved = false
                  alert(error);
                });
                setTimeout(() => {
                  this.isSaved = false
                }, 1500);
              }, error => {
                this.onLoad = false;
                this.isSaved = false
                alert(error);
              });
            } else {
              this.onLoad = false;
              alert('Maksimal Teks Template 500 Karakter!')
            }
          } else {
            this.onLoad = false;
            alert('Lengkapi bagian template yang masih kosong!')
          }
        });
      }
    }

    if (user == "retailer") {
      if (this.deleteListRetailer.length > 0) {
        let deleteReady = await this.deleteListRetailer.map((item: any, i: number) => {
          bodyDelete.append('ids[' + i + ']', item.id);
        });
        await Promise.all(deleteReady).then(async () => {
          await this.deleteTemplates(bodyDelete, user);
        });
      } else {
        let templateReady = await this.retailerTemplates.map((item: any, i: number) => {
          if (item.title !== '' && item.body !== '') {
            if (item.body.toString().length < 500) {
              bodySave.append('template[' + i + '][id]', item.id);
              bodySave.append('template[' + i + '][title]', item.title);
              bodySave.append('template[' + i + '][body]', item.body);
              bodySave.append('template[' + i + '][user]', item.user);
              return item;
            } else {
              error2 = true;
            }
          } else {
            error = true;
          }
        });
        await Promise.all(templateReady).then(async () => {
          if (!error) {
            if (!error2) {
              await this.tms.create(bodySave).subscribe((res_: any) => {
                this.indexOnEdit = -1;
                this.isSaved = true;
                this.onLoad = true;
                this.tms.get().subscribe((res: any) => {
                  this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesaler : res.data.wholesaler;
                  this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailer : res.data.retailer;
                  this.onLoad = false;
                });
                setTimeout(() => {
                  this.isSaved = false
                }, 1500);
              });
            } else {
              this.onLoad = false;
              alert('Maksimal Teks Template 500 Karakter!')
            }
          } else {
            this.onLoad = false;
            alert('Lengkapi bagian template yang masih kosong!')
          }
        });
      }
    }
  }




}