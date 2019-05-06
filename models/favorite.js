'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
  }, {});
  Favorite.associate = function(models) {
    Favorite.belongsTo(models.City)
    Favorite.belongsTo(models.User)
  };
  return Favorite;
};
