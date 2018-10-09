export class TemplateBanner {
  getTemplateBanner(toko) {
    const listBanner = [
      {
        "id": 1,
        "name": "TEMPLATE A",
        "title": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        "button_text": "SELENGKAPNYA",
        "class": "template-a",
        "image": "../../../../../assets/images/ayo/banner-template/Banner1.png",
        "button_class": "white",
        "product": ""
      },
      {
        "id": 2,
        "name": "TEMPLATE B",
        "image": "../../../../../assets/images/ayo/banner-template/Banner2.png",
        "title": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        "button_text": "SELENGKAPNYA",
        "class": "template-b",
        "button_class": "white",
        "product": ""
      },
      {
        "id": 3,
        "name": "TEMPLATE C",
        "image": "../../../../../assets/images/ayo/banner-template/Banner3.png",
        "title": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        "button_text": "SELENGKAPNYA",
        "class": "template-c",
        "button_class": "white",
        "product": ""
      },
      {
        "id": 4,
        "name": "TEMPLATE D",
        "image": "../../../../../assets/images/ayo/banner-template/Banner4.png",
        "title": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        "button_text": "SELENGKAPNYA",
        "class": "template-d",
        "button_class": "red",
        "product": ""
      },
      {
        "id": 5,
        "name": "TEMPLATE E",
        "image": "../../../../../assets/images/ayo/banner-template/Banner5.png",
        "title": `Promo hari ini di ${toko}`,
        "button_text": "SELENGKAPNYA",
        "class": "template-e",
        "button_class": "white",
        "product": "../../../../../assets/images/ayo/banner-template/dummy.jpg"
      },
      {
        "id": 6,
        "name": "TEMPLATE F",
        "image": "../../../../../assets/images/ayo/banner-template/Banner6.png",
        "title": "",
        "button_text": "",
        "class": "",
        "button_class": "",
        "product": ""
      }
    ]

    return listBanner;
  }
}