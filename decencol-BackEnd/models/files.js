'use strict';
module.exports = (sequelize, DataTypes) => {
  const Files = sequelize.define('Files', {
    creatorId: 'integer',
    creatorAddress: DataTypes.STRING,
    ipfsAddress: DataTypes.STRING,
    createDateTime: 'timestamp with time zone',
    lastUpdate: 'timestamp with time zone',
    fileName: DataTypes.STRING,
  }, {timestamps:false,tableName:'files'});
  Files.associate = function(models) {
    // associations can be defined here
  };
  return Files;
};
