// Import Data from file
const fs = require('fs')
const data = fs.readFileSync('BD_ropesFormatted.json', 'utf8')
var productArray = JSON.parse(data)

const mongoose = require('mongoose')
const { db } = require('./models/rope')
const Rope = require('./models/rope')
const DB = "GearDB"

mongoose.connect(`mongodb://localhost:27017/${DB}`)
    .then(()=> { 
        console.log(`Connected to ${DB}`)
    })
    .catch(err => {
        console.log(`Failed to connect to ${DB}`)
        console.log(err)
    })

//TODO: Rewrite/write schemas to match data.
const createEntries = function (numNew) {
  var arr = []
  for (let i = 1; i <= numNew; i++) {
      var r = new Rope
      r.brand = getRand(brands)
      r.diameter = (getRand(diameters)).toFixed(1)
      r.length = getRand(lengths)
      r.name = r.diameter.toFixed(1) + " " + getRand(keywords)
      r.base = getBasePrice(r.diameter, r.length)
      r.falls = getRand(falls)
      r.dynElong = getRand(dynElongs)
      r.staElong = getRand(staElongs)
      r.halfMark = getRand(bools)
      r.weight = getWeight(r.diameter)
      r.uiaaRated.single = getRand(bools)
      r.uiaaRated.half = getRand(bools)
      r.uiaaRated.twin = getRand(bools)
      for (let j = 0; j < sellers.length; j++) {
          let disc = getRand(discounts)
          let total = (r.base*(1-(disc/100))).toFixed(2)
          let sellerObj = {
              name: sellers[j],
              basePrice: r.base,
              discount: disc,
              totalPrice: total,
          }
          r.seller.push(sellerObj)
      }
      arr.push(r)
  }
  //TODO: Write Seller data to Seller Collection instead of Rope.
  //TODO: Seller data is all data independent of product and product type.
  Rope.insertMany(arr, function(error, docs){
      console.log(`${numNew} documents inserted to ropes collection`)
      mongoose.disconnect()
          .then(()=> { 
              console.log(`Disconnected from ${DB}`)
          })
          .catch(err => {
              console.log(`Failed to disconnect from ${DB}`)
              console.log(err)
          })
  })
}

createEntries()