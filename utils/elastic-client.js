const { Client } = require("@elastic/elasticsearch");
const elasticClient = new Client({
  node: process.env.ELASTIC_NODE_KEY,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});
module.exports={elasticClient}