const { ApolloServer, gql } = require('apollo-server');
const express = require('express');
const { buildFederatedSchema } = require('@apollo/federation');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
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

// Définir le schéma GraphQL
const typeDefs = gql`
  type Produit {
    id: ID!
    nom: String!
    prix: Float!
  }

  type Panier {
    id: ID!
    utilisateurId: ID!
    produits: [Produit]!
  }

  type Query {
    produits(categorie: String!): [Produit]!
    panier(utilisateurId: ID!): Panier
  }

  type Mutation {
    ajouterAuPanier(utilisateurId: ID!, produitId: ID!): String!
  }
`;

// Définir les résolveurs pour les champs GraphQL
const resolvers = {
  Query: {
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

// Créer le serveur Apollo
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: () => ({}),
});

// Démarrer le serveur Apollo
server.listen().then(({ url }) => {
  console.log(`🚀 Apollo Server ready at ${url}`);
});

const port = 3000;
app.listen(port, () => {
console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});
