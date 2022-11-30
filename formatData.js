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
function capitalize (s) { return s && s[0].toUpperCase() + s.slice(1) }


var specsProdArray = productArray.map( (productEntry) => ( productEntry.specs ) )


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
const formattedProductArray = []
for (let i = 0; i < specsProdArray.length; i++) {
  formattedProductArray.push(structuredClone(specTemplate))
}


const typeRegex = /(single)|(half)|(twin)|(static)/gi
const weightRegex = /(^\d+\.?\d+)(?!\s?(oz))/g
const elongRegex = /(\d+\.?\d+)|\d(?=\s?\%)|(single)|(half)|(twin)/gi
const fallsRegex = /(\d+)|(single)|(half)|(twin)/gi
const impactRegex = /(\d+\.?\d+)|\d(?=\s?(kn))|(single)|(half)|(twin)/gi


//TODO: refactor code to reduce repeat - args(obj to search, search word for label, regex, template objectName)
for (let i = 0; i < specsProdArray.length; i++) {
  if (specsProdArray[i].length === 0) { continue }
  specsProdArray[i].forEach( obj => {
      if ((obj.label).toLowerCase().includes('type')) {
        var matchVals = (obj.value).match(typeRegex)
        matchVals.forEach( el => { capitalize(el) } )
        formattedProductArray[i].ropeType = matchVals
      }
      if ((obj.label).toLowerCase().includes('half')) { //TODO: [Mark, Bi-Pattern, Bi-Color]
        if ((obj.value).toLowerCase().includes('yes')) {
          formattedProductArray[i].halfMark = 'Yes'
        } else if ((obj.value).toLowerCase().includes('no')) {
          formattedProductArray[i].halfMark = 'No'
        }
      }
      if ((obj.label).toLowerCase().includes('weight')) { 
        let matchVals = (obj.value).match(weightRegex)
        formattedProductArray[i].weight = matchVals[0]
      }
      //TODO: Currently doesn't contain meaningful data
      // if ((obj.label).includes('Slippage')) { formattedProductArray[i].slippage = obj.value }
      if ((obj.label).toLowerCase().includes('dynamic')) { // find values for each rope type
        // find values and rope type
        let matchVals = (obj.value).match(elongRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[j-1]) }
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
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[0])
              break
            case 2:
              formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[0])
              formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[1])
              break
            case 3:
              formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[0])
              formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[1])
              formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
      if ((obj.label).toLowerCase().includes('static')) { // find values for each rope type
        let matchVals = (obj.value).match(elongRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].staticElong.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].staticElong.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].staticElong.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].staticElong.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[j-1]) }
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
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              formattedProductArray[i].staticElong.single = toWholePercent(matchVals[0])
              break
            case 2:
              formattedProductArray[i].staticElong.half = toWholePercent(matchVals[0])
              formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[1])
              break
            case 3:
              formattedProductArray[i].staticElong.single = toWholePercent(matchVals[0])
              formattedProductArray[i].staticElong.half = toWholePercent(matchVals[1])
              formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
      if ((obj.label).toLowerCase().includes('falls')) { // find values for each rope type
        let matchVals = (obj.value).match(fallsRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].falls.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].falls.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].falls.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].falls.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].falls.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].falls.twin = toWholePercent(matchVals[j-1]) }
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
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].falls.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].falls.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].falls.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              formattedProductArray[i].falls.single = toWholePercent(matchVals[0])
              break
            case 2:
              formattedProductArray[i].falls.half = toWholePercent(matchVals[0])
              formattedProductArray[i].falls.twin = toWholePercent(matchVals[1])
              break
            case 3:
              formattedProductArray[i].falls.single = toWholePercent(matchVals[0])
              formattedProductArray[i].falls.half = toWholePercent(matchVals[1])
              formattedProductArray[i].falls.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
      if ((obj.label).toLowerCase().includes('impact')) { // find values for each rope type
        let matchVals = (obj.value).match(impactRegex)
        // regex match array contains text
        if (isContainsText(matchVals)) {
          // match array contains even number of elements
          if (matchVals.length % 2 === 0) {
            // if first value is text assign next number else opposite
            if (isContainsText(matchVals[0])) {
              for (let j = 0; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].impactForce.single = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].impactForce.half = toWholePercent(matchVals[j+1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[j+1]) }
              }
            } else {
              for (let j = 1; j < matchVals.length; j+=2) {
                if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].impactForce.single = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].impactForce.half = toWholePercent(matchVals[j-1]) }
                if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[j-1]) }
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
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k < numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            } else { // first value in matchArray is number
              for (let j = 0; j < numIndexes.length; j++) {
                for (let k = 0; k < matchVals.length; k++) {
                  if ( j < numIndexes.length-1 ) {
                    if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  } else {
                    if (k > numIndexes[j]) {
                      if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].impactForce.single = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].impactForce.half = toWholePercent(matchVals[numIndexes[j]]) }
                      if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[numIndexes[j]]) }
                    }
                  }
                }
              }
            }
          }
        } else { // match array contains only numbers
          switch (matchVals.length) {
            case 1: 
              formattedProductArray[i].impactForce.single = toWholePercent(matchVals[0])
              break
            case 2:
              formattedProductArray[i].impactForce.half = toWholePercent(matchVals[0])
              formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[1])
              break
            case 3:
              formattedProductArray[i].impactForce.single = toWholePercent(matchVals[0])
              formattedProductArray[i].impactForce.half = toWholePercent(matchVals[1])
              formattedProductArray[i].impactForce.twin = toWholePercent(matchVals[2])
              break
          }
        }
      }
  })
}


const fileName = 'specsArrayFormatted.json'
fs.writeFile(fileName, JSON.stringify(formattedProductArray), (err) => {
  if (err) throw err
  console.log(`File Saved: ${fileName}`)
})