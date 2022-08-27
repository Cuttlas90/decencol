'use strict';
module.exports = (sequelize, DataTypes) => {
  const Files = sequelize.define('Files', {
    creatorId: 'integer',
    sharedWith: 'integer',
    creatorAddress: DataTypes.STRING,
    sharedWithAddress: DataTypes.STRING,
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
