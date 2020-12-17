import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';

const defaultTemplateVendor = [
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

@Component({
  selector: 'app-vendor-template-message',
  templateUrl: './vendor-template-message.component.html',
  styleUrls: ['./vendor-template-message.component.scss']
})
export class VendorTemplateMessageComponent implements OnInit {
  indexOnEdit: number;
  listOnEdit: any;
  isSaved: boolean;
  onLoad: boolean;
  vendorTemplates: any;
  deleteListVendor: any;

  constructor(
    public dialog: MatDialog,
    private vendorService: VendorsService
  ) {
    this.onLoad = true;
    this.vendorTemplates = [];
    this.deleteListVendor = [];
    this.indexOnEdit = -1;
    this.listOnEdit = [];
    this.isSaved = false;
  }

  ngOnInit() {
    this.vendorService.getChatTemplate().subscribe(res => {
      console.log('res', res);
      this.vendorTemplates = res.data;
      if (this.vendorTemplates.length === 0) this.vendorTemplates = defaultTemplateVendor;
      this.onLoad = false;
    })
  }

  resetToDefault(index: number) {
    console.log('index', index);
    this.vendorTemplates[index].title = defaultTemplateVendor[index].title;
    this.vendorTemplates[index].body = defaultTemplateVendor[index].body;
  }


  resetToDefaultAll() {
    const match = [...this.deleteListVendor, ...this.vendorTemplates]
    this.deleteListVendor = match.reduce((a, c) => { !a.find(v => v.id === c.id) && a.push(c); return a; }, []);
    this.vendorTemplates = defaultTemplateVendor.map(item => ({ ...item }));
  }

  addTemplate() {
    let newTemplate = {
      body: "",
      created_at: "",
      id: "",
      title: "",
      updated_at: "",
      type: "available"
    }
    if (this.vendorTemplates.length <= 10) {
      let indexOnEmpty = [];
      let wt = this.vendorTemplates.map((item: any, i: number) => {
        if (item.body == "" || item.title == "") {
          indexOnEmpty.push(i + 1);
        }
        return item;
      });
      Promise.all(wt).then(() => {
        if (indexOnEmpty.length > 0) {
          alert("Judul atau Isi Template Pesan " + JSON.stringify(indexOnEmpty) + " harus diisi!");
        } else {
          this.vendorTemplates.push(newTemplate);
          this.listOnEdit.push(newTemplate);
        }
      });
    } else {
      alert("Jumlah Template Telah Mencapai Batas Maksimal (10).")
    }
  }

  onEdit(item: any, i: number) {
    if (this.indexOnEdit == i) this.indexOnEdit = -1;
    else this.indexOnEdit = i;

  }

  onBlur(item: any, i: number) {
    if (this.indexOnEdit == i) this.indexOnEdit = -1;
  }

  onDeleteTemplate(item: any, i: number) {
    this.vendorTemplates.splice(i, 1);
    if (item.id !== '')
      this.deleteListVendor.push(item);
  }

  async onSaveTemplate(user: string) {
    let error = false;
    let error2 = false;
    this.indexOnEdit = -1;
    let bodySave = {
      templates: []
    };
    // let bodyDelete = new FormData();
    // if (this.deleteListVendor.length > 0) {
    //   // let deleteReady = await this.deleteListVendor.map((item: any, i: number) => {
    //   //   bodyDelete.append('ids['+i+']', item.id);
    //   // });
    //   // // await Promise.all(deleteReady).then(async () => {
    //   // //   await this.deleteTemplates(bodyDelete, user);
    //   // // });
    // } else {
    let templateReady = await this.vendorTemplates.map((item: any, i: number) => {
      if (item.title !== '' && item.body !== '') {
        if (item.body.toString().length < 500) {
          bodySave.templates.push({
            id: item.id,
            title: item.title,
            body: item.body,
            type: item.type
          });
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
          await this.vendorService.saveChatTemplate(bodySave).subscribe((res_: any) => {
            this.indexOnEdit = -1;
            this.isSaved = true;
            this.onLoad = true;
            this.vendorService.getChatTemplate().subscribe((res: any) => {
              this.vendorTemplates = res.data;
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
    // }
  }

}
