const { match } = require('assert')
const fs = require('fs')
const { ConsoleMessage } = require('puppeteer')
const data = fs.readFileSync('BD_climbing-ropes.json', 'utf8')
var productArray = JSON.parse(data)

const isContainsText = function (matchArray) {
  if (typeof matchArray === 'object') {
    for (const el of matchArray) { if ( isNaN(Number(el)) ) {return true} }
    return false
  } else {
    return ( isNaN(Number(matchArray)) ) ? true : false
  }
}

const toWholePercent = function (num) {
  if (Number(num) < 1) {
    let percent = (Number(num) * 100)
    return (percent % 1 === 0) ? Number(parseInt(percent)) : Number(percent.toFixed(1))
  } else {
    return (Number(num) % 1 === 0) ? Number(parseInt(num)) : Number(Number(num).toFixed(1))
  }
}

var specsProdArray = productArray.map( (productEntry) => ( productEntry.specs ) )

//TODO: take specs and put in standardized format - see template below
// Object Template
const specTemplate = {
  // ropeType: [],
  // halfMark: null,
  // weight: null,
  // slippage: null,
  // dynamicElong: { single: null, half: null, twin: null, },
  // staticElong: { single: null, half: null, twin: null, },
  falls: { single: null, half: null, twin: null, },
  // impactForce: { single: null, half: null, twin: null, },
}

//TODO: intermediate file to compare later - DELETE ME
// const fileName = 'specsArray.json'
// fs.writeFile(fileName, JSON.stringify(specsProdArray), (err) => {
//   if (err) throw err
//   console.log(`File Saved: ${fileName}`)
// })


// Create empty array with deep cloned template
const formattedProductArray = []
for (let i = 0; i < specsProdArray.length; i++) {
  formattedProductArray.push(structuredClone(specTemplate))
}

// dynamicElong ( 0.33 -> 33 ) ( 33% -> 33)
// staticElong ( 0.33 -> 33 ) ( 33% -> 33)
// ropeType (Single, Half, Twin, Half/Twin, Single/Half/Twin, Static)


// regex match - returns array of either single number (> or < 1) / 2 numbers / 3 numbers / or number string pair
const elongRegex = /(\d+\.?\d+)|\d(?=\s?\%)|(single)|(half)|(twin)/gi
const fallsRegex = /(\d+)|(single)|(half)|(twin)/gi


//TODO: copy spec template - then overwrite values
//TODO: search through specs to find containing words - write its formatted value to predefined spec name
for (let i = 0; i < specsProdArray.length; i++) {
  specsProdArray[i].forEach( obj => {
      // if ((obj.label).includes('Type')) { formattedProductArray[i].ropeType.push(obj.value) }
      // if ((obj.label).includes('Half')) { formattedProductArray[i].halfMark = obj.value }
      // if ((obj.label).includes('Weight')) { formattedProductArray[i].weight = obj.value }
      // if ((obj.label).includes('Slippage')) { formattedProductArray[i].slippage = obj.value }
      // if ((obj.label).toLowerCase().includes('dynamic')) { // find values for each rope type
      //   // find values and rope type
      //   let matchVals = (obj.value).match(elongRegex)
      //   // regex match array contains text
      //   if (isContainsText(matchVals)) {
      //     // match array contains even number of elements
      //     if (matchVals.length % 2 === 0) {
      //       // if first value is text assign next number else opposite
      //       if (isContainsText(matchVals[0])) {
      //         for (let j = 0; j < matchVals.length; j+=2) {
      //           if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[j+1]) }
      //           if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[j+1]) }
      //           if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[j+1]) }
      //         }
      //       } else {
      //         for (let j = 1; j < matchVals.length; j+=2) {
      //           if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[j-1]) }
      //           if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[j-1]) }
      //           if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[j-1]) }
      //         }
      //       }
      //     } else { // contains text but odd number length (ie - [3.6, Half, Twin])
      //       // find the numbers in matchArray
      //       var numIndexes = []
      //       for (let j = 0; j < matchVals.length; j++) {
      //         if ( !isNaN(Number(matchVals[j])) ) {numIndexes.push(j)}
      //       }
      //       // first value in matchArray is text
      //       if (isContainsText(matchVals[0])) {
      //         for (let j = 0; j < numIndexes.length; j++) {
      //           for (let k = 0; k < matchVals.length; k++) {
      //             if ( j > 0 ) {
      //               if ( (k < numIndexes[j]) && (k > numIndexes[j-1]) ) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             } else {
      //               if (k < numIndexes[j]) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             }
      //           }
      //         }
      //       } else { // first value in matchArray is number
      //         for (let j = 0; j < numIndexes.length; j++) {
      //           for (let k = 0; k < matchVals.length; k++) {
      //             if ( j < numIndexes.length-1 ) {
      //               if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             } else {
      //               if (k > numIndexes[j]) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             }
      //           }
      //         }
      //       }
      //     }
        
      //   } else { // match array contains only numbers
      //     switch (matchVals.length) {
      //       case 1: 
      //         formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[0])
      //         break
      //       case 2:
      //         formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[0])
      //         formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[1])
      //         break
      //       case 3:
      //         formattedProductArray[i].dynamicElong.single = toWholePercent(matchVals[0])
      //         formattedProductArray[i].dynamicElong.half = toWholePercent(matchVals[1])
      //         formattedProductArray[i].dynamicElong.twin = toWholePercent(matchVals[2])
      //         break
      //     }
      //   }
      // }
      // if ((obj.label).toLowerCase().includes('static')) { // find values for each rope type
      //   let matchVals = (obj.value).match(elongRegex)
      //   // regex match array contains text
      //   if (isContainsText(matchVals)) {
      //     // match array contains even number of elements
      //     if (matchVals.length % 2 === 0) {
      //       // if first value is text assign next number else opposite
      //       if (isContainsText(matchVals[0])) {
      //         for (let j = 0; j < matchVals.length; j+=2) {
      //           if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].staticElong.single = toWholePercent(matchVals[j+1]) }
      //           if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].staticElong.half = toWholePercent(matchVals[j+1]) }
      //           if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[j+1]) }
      //         }
      //       } else {
      //         for (let j = 1; j < matchVals.length; j+=2) {
      //           if (matchVals[j].toLowerCase().includes('single')) { formattedProductArray[i].staticElong.single = toWholePercent(matchVals[j-1]) }
      //           if (matchVals[j].toLowerCase().includes('half')) { formattedProductArray[i].staticElong.half = toWholePercent(matchVals[j-1]) }
      //           if (matchVals[j].toLowerCase().includes('twin')) { formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[j-1]) }
      //         }
      //       }
      //     } else { // contains text but odd number length (ie - [3.6, Half, Twin])
      //       // find the numbers in matchArray
      //       var numIndexes = []
      //       for (let j = 0; j < matchVals.length; j++) {
      //         if ( !isNaN(Number(matchVals[j])) ) {numIndexes.push(j)}
      //       }
      //       // first value in matchArray is text
      //       if (isContainsText(matchVals[0])) {
      //         for (let j = 0; j < numIndexes.length; j++) {
      //           for (let k = 0; k < matchVals.length; k++) {
      //             if ( j > 0 ) {
      //               if ( (k < numIndexes[j]) && (k > numIndexes[j-1]) ) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             } else {
      //               if (k < numIndexes[j]) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             }
      //           }
      //         }
      //       } else { // first value in matchArray is number
      //         for (let j = 0; j < numIndexes.length; j++) {
      //           for (let k = 0; k < matchVals.length; k++) {
      //             if ( j < numIndexes.length-1 ) {
      //               if ( (k > numIndexes[j]) && (k < numIndexes[j+1]) ) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             } else {
      //               if (k > numIndexes[j]) {
      //                 if (matchVals[k].toLowerCase().includes('single')) {  formattedProductArray[i].staticElong.single = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('half')) {  formattedProductArray[i].staticElong.half = toWholePercent(matchVals[numIndexes[j]]) }
      //                 if (matchVals[k].toLowerCase().includes('twin')) {  formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[numIndexes[j]]) }
      //               }
      //             }
      //           }
      //         }
      //       }
      //     }
      //   } else { // match array contains only numbers
      //     switch (matchVals.length) {
      //       case 1: 
      //         formattedProductArray[i].staticElong.single = toWholePercent(matchVals[0])
      //         break
      //       case 2:
      //         formattedProductArray[i].staticElong.half = toWholePercent(matchVals[0])
      //         formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[1])
      //         break
      //       case 3:
      //         formattedProductArray[i].staticElong.single = toWholePercent(matchVals[0])
      //         formattedProductArray[i].staticElong.half = toWholePercent(matchVals[1])
      //         formattedProductArray[i].staticElong.twin = toWholePercent(matchVals[2])
      //         break
      //     }
      //   }
      // }
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
  //     if ((obj.label).includes('Impact')) { formattedProductArray[i].impactForce.single = obj.value }
  })
}



const fileName = 'specTemplate.json'
fs.writeFile(fileName, JSON.stringify(formattedProductArray), (err) => {
  if (err) throw err
  console.log(`File Saved: ${fileName}`)
})


