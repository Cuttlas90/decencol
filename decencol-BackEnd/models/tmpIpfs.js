'use strict';
module.exports = (sequelize, DataTypes) => {
  const TmpIpfs = sequelize.define('TmpIpfs', {
    content: DataTypes.STRING,
    address: DataTypes.STRING,
  }, { timestamps: false, tableName: 'tmpIpfs' });
  TmpIpfs.associate = function (models) {
    // associations can be defined here
  };
  return TmpIpfs;
};
