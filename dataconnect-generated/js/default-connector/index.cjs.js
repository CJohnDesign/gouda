const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'gouda',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

