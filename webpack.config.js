const merge = require('webpack-merge');
const commonConf = require('./config/webpack.common');

module.exports = ({ mode }) => {
  return {
    mode,
    ...merge(commonConf, require(`./config/webpack.${mode}`))
  };
};