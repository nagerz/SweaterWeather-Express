var express = require('express');
var router = express.Router();
var User = require('../../../models').User;
var Query = require('../../../models').Query;
var City = require('../../../models').City;
var Forecast = require('../../../pojos/forecast');

var pry = require('pryjs');
const fetch = require('node-fetch');
//eval(pry.it)

router.get("/", function(req, res, next) {
  let queryLocation = req.query.location;
  if (req.body.api_key){
    User.findOne({
      where: {
        api_key: req.body.api_key
      }
    }).then(function(user){
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
          var forecast = new Forecast();
          return forecast.updateForecast(query.City)
        })
        .then(forecast => {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(forecast.data);
        })
        .catch(() => {
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
                    var forecast = new Forecast();
                    return forecast.updateForecast(city)
                  })
                  .then(forecast => {
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).send(forecast.data);
                  })
                })
              }else{
                var forecast = new Forecast();
                forecast.updateForecast(city)
                .then(forecast => {
                  res.setHeader("Content-Type", "application/json");
                  res.status(200).send(forecast.data);
                })
              }
            })
            // .catch(() => {
            //   City.create({
            //     city: geodata.city,
            //     state: geodata.state,
            //     lat: geodata.lat,
            //     long: geodata.long,
            //   })
            //   .then(city => {
            //     //use city for forecast
            //   })
            // })
          })
          .catch(error => {
            res.setHeader("Content-Type", "application/json");
            res.status(400).send({ error: "invalid search location"});
          })
        })
      }
    })
  }else{
    res.setHeader("Content-Type", "application/json");
    res.status(401).send({ error: "unauthorized" });
  };
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



// function makeCity(query){
//     return City.create({
//       city: query,
//       state: "test",
//       lat: 1,
//       long: 1
//     })
//     .then(function(city){
//       return (city);
//     })
//     .catch(error => {
//       eval(pry.it)
//       return (error);
//     })
// };
//
// function makeQuery(queryLocation, city){
//   Query.findOrCreate({
//     where: {query: queryLocation, CityId: city.id}
//     })
//   .then(query => {
//     return (query);
//   })
//   .catch(error => {
//     eval(pry.it)
//     return (error);
//   })
// };
//
// function geodata(){
//   eval(pry.it)
//
//   var data = {};
//   // data[:geo_lat] = geolocation()[:results][0][:geometry][:location][:lat]
//   // data[:geo_long] = geolocation()[:results][0][:geometry][:location][:lng]
//   // data[:geo_city] = geolocation()[:results][0][:address_components][0][:long_name]
//   // data[:geo_state] = geolocation()[:results][0][:address_components][2][:short_name]
//   return data;
// }

module.exports = router;
