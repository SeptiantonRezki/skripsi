import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { TemplateMessageService } from 'app/services/template-message-management/template-message.service';

const defaultTemplate = [
    {
      "id": 0,
      "title": "Hai, selamat datang di toko kami! Apakah ada informasi yang dapat kami berikan?",
      "body": "Hai, selamat datang di toko kami! Apakah ada informasi yang dapat kami berikan?"
    },
    {
      "id": 1,
      "title": "Pesanan Anda masih dalam proses untuk disiapkan.",
      "body": "Pesanan Anda masih dalam proses untuk disiapkan."
    },
    {
      "id": 2,
      "title": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
      "body": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?"
    },
    {
      "id": 3,
      "title": "Apakah pesanannya sudah diterima? Jika sudah, mohon untuk lakukan konfirmasi penerimaan (tekan Pesanan Diterima)",
      "body": "Apakah pesanannya sudah diterima? Jika sudah, mohon untuk lakukan konfirmasi penerimaan (tekan Pesanan Diterima)"
    },
    {
      "id": 4,
      "title": "Terima kasih telah berbelanja di toko kami. Semoga pengalaman berbelanja Anda menyenangkan!\nSilahkan sampaikan kritik dan saran agar kami dapat melayani Anda lebih baik lagi.",
      "body": "Terima kasih telah berbelanja di toko kami. Semoga pengalaman berbelanja Anda menyenangkan!\nSilahkan sampaikan kritik dan saran agar kami dapat melayani Anda lebih baik lagi."
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
        defaultTemplate.map((item: any) => {
          item.user = 'wholesaler';
          return this.wholesalerTemplates.push(item);
        });
      }
      if (res.data.retailer.length == 0) {
        defaultTemplate.map((item: any) => {
          item.user = 'retailer';
          return this.retailerTemplates.push(item);
        });
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
    if(e !== this.selectedTab) {
      this.selectedTab = e;
    }
  }

  resetToDefault(index: number, user: string) {
    if (user == 'wholesaler') {
      this.wholesalerTemplates[index] = defaultTemplate[index];
      this.wholesalerTemplates[index].user = user;
    } else {
    if (user == 'retailer') {
      this.retailerTemplates[index] = defaultTemplate[index];
      this.retailerTemplates[index].user = user;
    }
    }
  }

  resetToDefaultAll(user: string) {
    if (user == 'wholesaler') {
      this.deleteListWholesaler = this.wholesalerTemplates;
      this.wholesalerTemplates = [];
      defaultTemplate.map((item: any) => {
        item.user = 'wholesaler';
        return this.wholesalerTemplates.push(item);
      });
    } else {
      if (user == 'retailer') {
        this.deleteListRetailer = this.retailerTemplates;
        this.retailerTemplates = [];
        defaultTemplate.map((item: any) => {
          item.user = 'retailer';
          return this.retailerTemplates.push(item);
        });
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
            indexOnEmpty.push(i+1);
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
            indexOnEmpty.push(i+1);
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
    if (user == 'wholesaler'){
      this.wholesalerTemplates.splice(i, 1);
      if(item.id !== '')
        this.deleteListWholesaler.push(item);
    }
    if (user == 'retailer'){
      this.retailerTemplates.splice(i, 1);
      if(item.id !== '')
        this.deleteListRetailer.push(item);
    }
  }

  async deleteTemplates(body: FormData, user: string) {
    return await this.tms.delete(body).subscribe((res) => {
      console.log('deleted');
      if(user == "wholesaler") this.deleteListWholesaler = [];
      if(user == "retailer") this.deleteListRetailer = [];
    }, error => {
      console.log('delete failed', error);
    });
  }

  async onSaveTemplate(user: string){
    let error = false;
    let error2 = false;
    this.indexOnEdit = -1;
    let bodySave = new FormData();
    let bodyDelete = new FormData();
    if (user == "wholesaler") {
        if (this.deleteListWholesaler.length > 0) {
          let deleteReady = await this.deleteListWholesaler.map((item: any, i: number) => {
            bodyDelete.append('ids['+i+']', item.id);
          });
          await Promise.all(deleteReady).then(async () => {
            await this.deleteTemplates(bodyDelete, user);
          });
        }
        let templateReady = await this.wholesalerTemplates.map((item: any, i: number) => {
          if (item.title !== '' && item.body !== '') {
            if (item.body.toString().length < 500 ) { 
              bodySave.append('template['+i+'][id]', item.id);
              bodySave.append('template['+i+'][title]', item.title);
              bodySave.append('template['+i+'][body]', item.body);
              bodySave.append('template['+i+'][user]', item.user);
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
            if(!error2) {
              this.onLoad = true;
              await this.tms.create(bodySave).subscribe((res_: any) => {
                this.indexOnEdit = -1;
                this.isSaved = true;
                this.onLoad = true;
                this.tms.get().subscribe((res: any) => {
                  this.wholesalerTemplates = res.data.wholesaler;
                  this.retailerTemplates = res.data.retailer;
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

    if (user == "retailer") {
      if (this.deleteListRetailer.length > 0) {
        let deleteReady = await this.deleteListRetailer.map((item: any, i: number) => {
          bodyDelete.append('ids['+i+']', item.id);
        });
        await Promise.all(deleteReady).then(async () => {
          await this.deleteTemplates(bodyDelete, user);
        });
      }
      let templateReady = await this.retailerTemplates.map((item: any, i: number) => {
        if (item.title !== '' && item.body !== '') {
          if (item.body.toString().length < 500 ) { 
            bodySave.append('template['+i+'][id]', item.id);
            bodySave.append('template['+i+'][title]', item.title);
            bodySave.append('template['+i+'][body]', item.body);
            bodySave.append('template['+i+'][user]', item.user);
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
          if(!error2) {
            await this.tms.create(bodySave).subscribe((res_: any) => {
              this.indexOnEdit = -1;
              this.isSaved = true;
              this.onLoad = true;
              this.tms.get().subscribe((res: any) => {
                this.wholesalerTemplates = res.data.wholesaler;
                this.retailerTemplates = res.data.retailer;
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