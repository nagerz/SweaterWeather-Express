'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    password_digest: DataTypes.STRING,
    api_key: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Favorite)
    User.belongsToMany(models.City, { through: 'Favorite', as: 'City' });
  };
  return User;
};
