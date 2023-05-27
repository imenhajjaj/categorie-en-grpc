const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    price: Float!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type Query {
    getProduct(id: ID!): Product
    getAllProducts: [Product]
    getCartItems: [CartItem]
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int!): CartItem
    removeFromCart(productId: ID!): CartItem
    clearCart: Boolean
  }
`;

module.exports = typeDefs;
