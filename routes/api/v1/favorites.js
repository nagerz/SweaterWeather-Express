var express = require('express');
var router = express.Router();
var User = require('../../../models').User;
var Query = require('../../../models').Query;
var City = require('../../../models').City;
var Favorite = require('../../../models').Favorite;
var Forecast = require('../../../pojos/forecast');

var pry = require('pryjs');
const fetch = require('node-fetch');
//eval(pry.it)

router.post("/", function(req, res, next) {
  let queryLocation = req.query.location;
  if (req.body.api_key){
    User.findOne({
      where: {
        api_key: req.body.api_key
      },
      include: 'City'
    })
    .then(user => {
      if(!user){
        res.setHeader("Content-Type", "application/json");
        res.status(401).send({ error: "unauthorized" });
      }else if(!queryLocation){
        res.setHeader("Content-Type", "application/json");
        res.status(400).send({ error: "missing search location" });
      }else{
        Query.findOne({
          where: {
            query: queryLocation
          },
          include: 'City'
        })
        .then(query => {
          if(!query){

            geolocate(queryLocation)
            .then(data => {
              var geodata = {}
              geodata["lat"] = data.results[0].geometry.location.lat
              geodata["long"] = data.results[0].geometry.location.lng
              geodata["city"] = data.results[0].address_components[0].long_name
              if (data.results[0].address_components[2] != undefined){
                geodata["state"] = data.results[0].address_components[2].short_name
              }
              City.findOne({
                where: {city: geodata.city}
              })
              .then(city => {
                if(city == null){
                  City.create({
                    city: geodata.city,
                    state: geodata.state,
                    lat: geodata.lat,
                    long: geodata.long,
                  })
                  .then(city => {
                    Query.create({
                      query: queryLocation,
                      CityId: city.id
                    })
                    .then(query => {
                      Favorite.findOne({
                        where: {
                          UserId: user.id,
                          CityId: city.id
                        }
                      })
                      .then(favorite => {
                        if (!favorite){
                          Favorite.create({
                            UserId: user.id,
                            CityId: city.id
                          })
                          .then(favorite => {
                            if (city.state){
                              var location = city.city + ", " + city.state
                            }else{
                              var location = city.city
                            }
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).send({"message": location + " has been added to your favorites"});
                          })
                          .catch(error => {
                            res.setHeader("Content-Type", "application/json");
                            res.status(500).send({error})
                          })
                        }else{
                          res.setHeader("Content-Type", "application/json");
                          res.status(401).send({ error: "Already favorited" });
                        }
                      })
                    })
                  })
                }else{
                  Query.create({
                    query: queryLocation,
                    CityId: city.id
                  })
                  .then(query => {
                    Favorite.findOne({
                      where: {
                        UserId: user.id,
                        CityId: city.id
                      }
                    })
                    .then(favorite => {
                      if (!favorite){
                        Favorite.create({
                          UserId: user.id,
                          CityId: query.City.id
                        })
                        .then(favorite => {
                          if (query.City.state){
                            var location = query.City.city + ", " + query.City.state
                          }else{
                            var location = query.City.city
                          }
                          res.setHeader("Content-Type", "application/json");
                          res.status(200).send({"message": location + " has been added to your favorites"});
                        })
                        .catch(error => {
                          res.setHeader("Content-Type", "application/json");
                          res.status(500).send({error})
                        })
                      }else{
                        res.setHeader("Content-Type", "application/json");
                        res.status(401).send({ error: "Already favorited" });
                      }
                    })
                  })
                }
              })
            })
            .catch(error => {
              res.setHeader("Content-Type", "application/json");
              res.status(400).send({ error: "invalid search location"});
            })
          }else{
            Favorite.findOne({
              where: {
                UserId: user.id,
                CityId: query.City.id
              }
            })
            .then(favorite => {
              if (!favorite){
                Favorite.create({
                  UserId: user.id,
                  CityId: query.City.id
                })
                .then(favorite => {
                  if (query.City.state){
                    var location = query.City.city + ", " + query.City.state
                  }else{
                    var location = query.City.city
                  }
                  res.setHeader("Content-Type", "application/json");
                  res.status(200).send({"message": location + " has been added to your favorites"});
                })
                .catch(error => {
                  res.setHeader("Content-Type", "application/json");
                  res.status(500).send({error})
                })
              }else{
                res.setHeader("Content-Type", "application/json");
                res.status(401).send({ error: "Already favorited" });
              }
            })
          }
        })
        .catch(error => {
          res.setHeader("Content-Type", "application/json");
          res.status(400).send({ error: "query find failure"});
        })
      }
    })
    .catch(error => {
      //user findone failure catch
    })
  }else{
    res.setHeader("Content-Type", "application/json");
    res.status(401).send({ error: "unauthorized" });
  }
});

router.get("/", function(req, res, next) {
  if (req.body.api_key){
    User.findOne({
      where: {
        api_key: req.body.api_key
      },
      include: 'City'
    })
    .then(user => {
      if(!user){
        res.setHeader("Content-Type", "application/json");
        res.status(401).send({ error: "unauthorized" });
      }else{
        if(user.City.length == 0){
          res.setHeader("Content-Type", "application/json");
          res.status(400).send({ error: "No cities have been favorited" });
        }else{
          res.setHeader("Content-Type", "application/json");
          res.status(401).send({ error: "list favorites" });
        }
      }
    })
    .catch(error => {
      //user findone failure catch
      res.setHeader("Content-Type", "application/json");
      res.status(400).send({ error: "missing search location" });
    })
  }else{
    res.setHeader("Content-Type", "application/json");
    res.status(401).send({ error: "unauthorized" });
  }
});

function geolocate(query){
  let service = "https://maps.googleapis.com/maps/api/geocode/json?address="
  let address = query
  let key = "&key=" + process.env.GOOGLE_PLACES_API_KEY
  let url = service + address + key

  return new Promise((resolve, reject) => {
    fetch(url)
    .then(response => response.json())
    .then(result => {
      if(result.status == "OK"){
        resolve(result)
      }else{
        reject(result.error_message)
      }
    })
  })
};

module.exports = router;
