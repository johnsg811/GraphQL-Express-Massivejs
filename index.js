var express = require('express');
const http = require('http');
const massive = require('massive');
var pg = require('pg');
var bodyParser = require('body-parser');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

 
const app = express();
//app.use(bodyParser.json());
massive({
  host: '127.0.0.1',
  port: 5432,
  database: 'dellstore2',
  user: '',
  password: ''
}).then(instance => {
  app.set('dbname', instance);


//GET request for customer
app.get('/customer', (req, res) => {
  var id = 3;
    req.app.get('dbname').postgraphile.customers.find({'customerid =': id}, {}).then(items => {
      res.json(items);
    });
  });
//test
app.get('/api', function(req, res) {
  res.json({
    text: 'test'
  });
});


var schema = buildSchema(`
  type Customer {
    firstname: String!
    lastname: String!
    gender: String!
    name: String!
  }

  type Query {
    getCustomer(customerid: Int): Customer
  }
`);

class Customer {
  constructor(customerData) {
    this.customerid = customerData.customerid;
    this.firstname = customerData.firstname;
    this.lastname = customerData.lastname;
    this.gender = customerData.gender;
  }

  name() {
    return this.firstname + ' ' + this.lastname    
    
  }
}

// The root provides the top-level API endpoints
var root = {
  getCustomer: function ({customerid}) {
    return app.get('dbname').postgraphile.customers.find({'customerid =': customerid}, {}).then(
      customerData => new Customer(customerData[0])
    )
  }
}

/////
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

console.log('localhost:3001/graphql');



// Construct a schema, using GraphQL schema language
// var schema = buildSchema(`
//   type Query {
//     hello: String
//   }
// `);

// var schema = buildSchema(`
//   type Customers {
//     customerid: String
//     firstName: String
//     lastName: String
//   }
//   type Query {
//     getCustomers(customerid: String): Customers
//   }
// `);


// The root provides a resolver function for each API endpoint
// var root = {
//   hello: () => {
//     return 'Hello world!';
//   },
// };

// class Customers {
//   constructor(customerid) {
//     this.customerid = customerid;
//     this.firstName = "Johns";
//   }
// }
// var rootValue = {
//   getCustomers: function (customerid) {
//     return new Customers(customerid);
//   }
// }


http.createServer(app).listen(3001);
});



module.exports = app;



