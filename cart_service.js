const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('cart.proto');
const cartProto = grpc.loadPackageDefinition(packageDefinition).cart;

// Array de panier simulé
const cartItems = [];

function addToCart(call, callback) {
  const { productId, quantity } = call.request;
  const cartItemId = generateCartItemId();
  const cartItem = { id: cartItemId, productId, quantity };
  cartItems.push(cartItem);
  callback(null, cartItem);
}

function removeFromCart(call, callback) {
  const { cartItemId } = call.request;
  const index = cartItems.findIndex((item) => item.id === cartItemId);
  if (index === -1) {
    callback({ code: grpc.status.NOT_FOUND, message: 'Cart item not found' });
    return;
  }
  const removedItem = cartItems.splice(index, 1)[0];
  callback(null, removedItem);
}

function getCart(call) {
  cartItems.forEach((item) => call.write(item));
  call.end();
}

function generateCartItemId() {
  // Génère un ID unique pour l'élément du panier
  return Math.random().toString(36).substring(2, 15);
}

function main() {
  const server = new grpc.Server();
  server.addService(cartProto.CartService.service, {
    AddToCart: addToCart,
    RemoveFromCart: removeFromCart,
    GetCart: getCart,
  });
  server.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
  server.start();
  console.log('Cart service started on port 50052');
}

main();
