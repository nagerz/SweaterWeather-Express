'use strict';
module.exports = (sequelize, DataTypes) => {
  const Query = sequelize.define('Query', {
    query: DataTypes.STRING
  }, {});
  Query.associate = function(models) {
    Query.belongsTo(models.City)
  };
  return Query;
};
