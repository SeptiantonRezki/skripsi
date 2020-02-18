export const environment = {
  production: true,
  server: "https://api.qa.src.id",
  server_service: "https://api.qa.src.id",
  label: "MICROSERVICES QA",
  show_label: false,
  image: "assets/images/ayo/AYO_SRC_(Master).png",
  image_2x: "assets/images/ayo/AYO_SRC_(Master)@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Red@2x.jpg"
};

export const serviceServer = (server) => {
  return `https://${server}.api.qa.src.id`;
}

export const server = {
  user: "users",
  business: "businesses",
  area: "areas",
  auth: "auth",
  newsfeed: "newsfeed",
  banner: "banner",
  content: "contentstatic",
  product: "product",
  task: "task-management",
  submission: "task-submission",
  coin: "coin-management",
  community: "community"
}