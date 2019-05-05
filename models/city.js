'use strict';
module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    long: DataTypes.DECIMAL
  }, {});
  City.associate = function(models) {
    City.hasMany(models.Query)
    City.hasMany(models.Favorite)
    City.belongsToMany(models.User, { through: 'Favorite', as: 'User' });
  };
  return City;
};
