// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  server: "https://sadewa.aturtoko.id",
  // server: "https://dev.ayo-api.dxtr.asia",
  server_service: "https://sadewa.aturtoko.id",
  // server_service: "http://dev.ayo-api.dxtr.asia",
  label: "DEVELOPMENT",
  show_label: true,
  image: "assets/images/ayo/icon/dev.png",
  image_2x: "assets/images/ayo/icon/dev@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Blue@2x.jpg",
  localDev: "http://sampoerna.local",
  qiscus_appIdMC: "zova-efc1mal9p9cjurph", //Staging
};

// export const serviceServer = (server) => {
//   return `http://${server}.ayo-micro.dxtr.asia`;
//   return `https://${server}.api.qa.src.id`;
// };

export const serviceServer = (server) => {
  // return `https://${server}.ayo-micro.dxtr.asia`;
  return `https://${server}.sadewa.aturtoko.id`;
};

export const server = {
  user: "users",
  // user: "user",
  business: "businesses",
  area: "areas",
  // area: "area",
  auth: "auth",
  newsfeed: "newsfeed",
  banner: "banner",
  content: "content",
  product: "product",
  task: "task-management",
  submission: "task-submission",
  coin: "coin",
  community: "community",
  order: "order",
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
