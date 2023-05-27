const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('catalog.proto');
const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

// Array de produits simulé
const products = [
  { id: '1', name: 'Product 1', price: 10.99 },
  { id: '2', name: 'Product 2', price: 20.99 },
  { id: '3', name: 'Product 3', price: 30.99 },
];

function getProductById(call, callback) {
  const { id } = call.request;
  const product = products.find((p) => p.id === id);
  if (!product) {
    callback({ code: grpc.status.NOT_FOUND, message: 'Product not found' });
    return;
  }
  callback(null, product);
}

function getAllProducts(call) {
  products.forEach((product) => call.write(product));
  call.end();
}

function main() {
  const server = new grpc.Server();
  server.addService(catalogProto.CatalogService.service, {
    GetProductById: getProductById,
    GetAllProducts: getAllProducts,
  });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
  console.log('Catalog service started on port 50051');
}

main();
