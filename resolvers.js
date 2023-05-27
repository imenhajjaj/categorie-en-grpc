const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// Charger le fichier du protocole gRPC pour le service Catalogue
const catalogueProtoFile = './path/to/catalogue.proto';
const cataloguePackageDefinition = protoLoader.loadSync(catalogueProtoFile);
const catalogueGrpcObject = grpc.loadPackageDefinition(cataloguePackageDefinition);
const catalogueGrpcClient = new catalogueGrpcObject.CatalogueService('localhost:50051', grpc.credentials.createInsecure());

// Charger le fichier du protocole gRPC pour le service Panier
const panierProtoFile = './path/to/panier.proto';
const panierPackageDefinition = protoLoader.loadSync(panierProtoFile);
const panierGrpcObject = grpc.loadPackageDefinition(panierPackageDefinition);
const panierGrpcClient = new panierGrpcObject.PanierService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les champs GraphQL
const resolvers = {
  Query: {
    // Résolveur pour un champ 'produits' qui appelle la méthode gRPC du service Catalogue
    produits: (_, { categorie }) => {
      return new Promise((resolve, reject) => {
        catalogueGrpcClient.GetProduits({ categorie }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.produits);
          }
        });
      });
    },
    // Résolveur pour un champ 'panier' qui appelle la méthode gRPC du service Panier
    panier: (_, { utilisateurId }) => {
      return new Promise((resolve, reject) => {
        panierGrpcClient.GetPanier({ utilisateurId }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.panier);
          }
        });
      });
    },
  },
  Mutation: {
    // Résolveur pour un champ 'ajouterAuPanier' qui appelle la méthode gRPC du service Panier
    ajouterAuPanier: (_, { utilisateurId, produitId }) => {
      return new Promise((resolve, reject) => {
        panierGrpcClient.AjouterProduit({ utilisateurId, produitId }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.message);
          }
        });
      });
    },
  },
};

module.exports = resolvers;
