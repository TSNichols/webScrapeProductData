const fs = require('fs')
const data = fs.readFileSync('BD_climbing-ropes.json', 'utf8')
var productArray = JSON.parse(data)


function isContainsText (matchArray) {
  if (typeof matchArray === 'object') {
    for (const el of matchArray) { if ( isNaN(Number(el)) ) {return true} }
    return false
  } else {
    return ( isNaN(Number(matchArray)) ) ? true : false
  }
}
function toWholePercent (num) {
  if (Number(num) < 1) {
    let percent = (Number(num) * 100)
    return (percent % 1 === 0) ? Number(parseInt(percent)) : Number(percent.toFixed(1))
  } else {
    return (Number(num) % 1 === 0) ? Number(parseInt(num)) : Number(Number(num).toFixed(1))
  }
}
function capitalize (str) { return str && str[0].toUpperCase() + str.slice(1) }


var prodSpecsArray = productArray.map( (productEntry) => ( productEntry.specs ) )
var prodLinksArray = productArray.map( (productEntry) => ( productEntry.link ) )


for (let i = 0; i < prodLinksArray.length; i++) {
  prodLinksArray[i] = prodLinksArray[i].replace(/\?.*/, '')
}


const specTemplate = {
  ropeType: [],
  halfMark: null,
  weight: null,
  // slippage: null,
  dynamicElong: { single: null, half: null, twin: null, },
  staticElong: { single: null, half: null, twin: null, },
  falls: { single: null, half: null, twin: null, },
  impactForce: { single: null, half: null, twin: null, },
}


// Create empty array with deep cloned template
const prodSpecsArrayFormatted = []
for (let i = 0; i < prodSpecsArray.length; i++) {
  prodSpecsArrayFormatted.push(structuredClone(specTemplate))
}


const typeRegex = /(single)|(half)|(twin)|(static)/gi
const weightRegex = /(^\d+\.?\d+)(?!\s?(oz))/g
const elongRegex = /(\d+\.?\d+)|\d(?=\s?\%)|(single)|(half)|(twin)/gi
const fallsRegex = /(\d+)|(single)|(half)|(twin)/gi
const impactRegex = /(\d+\.?\d+)|\d(?=\s?(kn))|(single)|(half)|(twin)/gi


//TODO: refactor code to reduce repeat - args(obj to search, search word for label, regex, template objectName)
for (let i = 0; i < prodSpecsArray.length; i++) {
  if (prodSpecsArray[i].length === 0) { continue }
  prodSpecsArray[i].forEach( spec => {
      if ((spec.label).toLowerCase().includes('type')) {
        var matchVals = (spec.value).match(typeRegex)
        matchVals.forEach( el => { capitalize(el) } )
        prodSpecsArrayFormatted[i].ropeType = matchVals
      }
      if ((spec.label).toLowerCase().includes('half')) { //TODO: [Mark, Bi-Pattern, Bi-Color]
        if ((spec.value).toLowerCase().includes('yes')) {
          prodSpecsArrayFormatted[i].halfMark = 'Yes'
        } else if ((spec.value).toLowerCase().includes('no')) {
          prodSpecsArrayFormatted[i].halfMark = 'No'
        }
      }
      if ((spec.label).toLowerCase().includes('weight')) { 
        let matchVals = (spec.value).match(weightRegex)
        prodSpecsArrayFormatted[i].weight = matchVals[0]
      }
      //TODO: Slippage currently doesn't contain meaningful data
      // if ((spec.label).includes('Slippage')) { prodSpecsArrayFormatted[i].slippage = spec.value }
      if ((spec.label).toLowerCase().includes('dynamic')) { // find values for each rope type
        // find values and rope type
        let matchVals = (spec.value).match(elongRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[j-1]) }
              }
            }
          } else { // contains text but odd number length (ie - [3.6, Half, Twin])
            // find the numbers in matchArray
            var numIndexes = []
            for (let j = 0; j < matchVals.length; j++) {
              if ( !isNaN(Number(matchVals[j])) ) {numIndexes.push(j)}
            }
            // first value in matchArray is text
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j > 0 ) {
                    if ( (k < numIndexes[j]) && (k > numIndexes[j-1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[0])
              break
            case 2:
              prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[1])
              break
            case 3:
              prodSpecsArrayFormatted[i].dynamicElong.single = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].dynamicElong.half = toWholePercent(matchVals[1])
              prodSpecsArrayFormatted[i].dynamicElong.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
      if ((spec.label).toLowerCase().includes('static')) { // find values for each rope type
        let matchVals = (spec.value).match(elongRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[j-1]) }
              }
            }
          } else { // contains text but odd number length (ie - [3.6, Half, Twin])
            // find the numbers in matchArray
            var numIndexes = []
            for (let j = 0; j < matchVals.length; j++) {
              if ( !isNaN(Number(matchVals[j])) ) {numIndexes.push(j)}
            }
            // first value in matchArray is text
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j > 0 ) {
                    if ( (k < numIndexes[j]) && (k > numIndexes[j-1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[0])
              break
            case 2:
              prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[1])
              break
            case 3:
              prodSpecsArrayFormatted[i].staticElong.single = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].staticElong.half = toWholePercent(matchVals[1])
              prodSpecsArrayFormatted[i].staticElong.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
      if ((spec.label).toLowerCase().includes('falls')) { // find values for each rope type
        let matchVals = (spec.value).match(fallsRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[j-1]) }
              }
            }
          } else { // contains text but odd number length (ie - [3.6, Half, Twin])
            // find the numbers in matchArray
            var numIndexes = []
            for (let j = 0; j < matchVals.length; j++) {
              if ( !isNaN(Number(matchVals[j])) ) {numIndexes.push(j)}
            }
            // first value in matchArray is text
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j > 0 ) {
                    if ( (k < numIndexes[j]) && (k > numIndexes[j-1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[0])
              break
            case 2:
              prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[1])
              break
            case 3:
              prodSpecsArrayFormatted[i].falls.single = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].falls.half = toWholePercent(matchVals[1])
              prodSpecsArrayFormatted[i].falls.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
      if ((spec.label).toLowerCase().includes('impact')) { // find values for each rope type
        let matchVals = (spec.value).match(impactRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[j-1]) }
              }
            }
          } else { // contains text but odd number length (ie - [3.6, Half, Twin])
            // find the numbers in matchArray
            var numIndexes = []
            for (let j = 0; j < matchVals.length; j++) {
              if ( !isNaN(Number(matchVals[j])) ) {numIndexes.push(j)}
            }
            // first value in matchArray is text
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j > 0 ) {
                    if ( (k < numIndexes[j]) && (k > numIndexes[j-1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[0])
              break
            case 2:
              prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[1])
              break
            case 3:
              prodSpecsArrayFormatted[i].impactForce.single = toWholePercent(matchVals[0])
              prodSpecsArrayFormatted[i].impactForce.half = toWholePercent(matchVals[1])
              prodSpecsArrayFormatted[i].impactForce.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
  })
}

for (let i = 0; i < productArray.length; i++) {
  productArray[i].link = prodLinksArray[i]
  productArray[i].specs = prodSpecsArrayFormatted[i]
}


const fileName = 'BD_ropesFormatted.json'
fs.writeFile(fileName, JSON.stringify(productArray), (err) => {
  if (err) throw err
  console.log(`File Saved: ${fileName}`)
})