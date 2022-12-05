const puppeteer = require('puppeteer')
const fs = require('fs')

// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5867/ropes.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5874/harnesses.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5873/climbing-equipment.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5878/carabiners.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5877/belay-devices.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5875/helmets.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5879/slings-and-cords.json
// https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5880/climbing-and-bouldering-accessories.json

// https://static.mammut.com/cdn-cgi/image/width=32,quality=85,f=auto,metadata=none/master/2010-04190-11284_main-grey_205816.jpg //TODO: for images

// https://www.mammut.com/api/us/en/data/stock-price/2010-04190 //TODO: for price / stock checking
// https://www.mammut.com/api/us/en/data/cf-category/5867

// https://www.mammut.com/us/en/products/2010-04190/  //TODO: product data - need to scrape or find api

// const fileName = 'mammut_productData.json'
// fetch('https://www.mammut.com/_next/data/EuT31dD8MxOj7GMOm4hiu/us/en/category/5867/ropes.json')
//   .then((response) => response.json())
//   .then((data) => {
//     var targetData = data.pageProps.serverState.initialResults.mammut_test_products_us_en.results[0].hits
//     var prodArray = targetData.map( (product) => ({
//       sku: product.sku,
//       name: product.name,
//       shortDescription: product.shortDescription,
//       price: product.price,
//       originalPrice: product.originalPrice,
//       variants: product.variants.map((variant) => ({
//         image: variant.image,
//         imageTransparent: variant.imageTransparent,
//         sizes: variant.sizes,
//         color: variant.colorRopeFinishing,
//       })),
//       inStock: product.inStock,
//       onSale: product.onSale,
//     }))
//     fs.writeFile(fileName, JSON.stringify(prodArray), (err) => {
//       if (err) throw err
//       console.log(`File Saved: ${fileName}`)
//     })
//   })

async function getMammutProductData (productPageURL) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const baseURL = 'https://www.mammut.com/us/en/products/'

  const fileName = 'Mammut_ropesData.json'

  // Go to product page
  await page.goto( baseURL + productPageURL )
  await page
    .waitForNavigation({waitUntil: 'domcontentloaded'})
    .catch(() => {})

  var product = {}
  product.sku = productPageURL

  product.description = await page.evaluate( () => 
    Array.from( document.querySelectorAll('[class^="PDPInfo_description_"] > *') ).map( child => child.textContent )
  )

  product.attributes = await page.evaluate( () =>
    Array.from( document.querySelectorAll('[class^="PDPAccordionItem_container_"]')).map( (container) => (
      {
        title: container.querySelector('[class^="CollapsibleSection_title_"]').textContent,
        contents: Array.from(container.querySelectorAll('li')).map( (listItem) => (
                {
                  values: Array.from(listItem.querySelectorAll(':scope > *')).map(listItemText => listItemText.textContent)
                }
              ))
      }
    ))
  )

  // Write data to file
  fs.writeFile(fileName, JSON.stringify(product), (err) => {
    if (err) throw err
    console.log(`File Saved: ${fileName}`)
  })
  
  // Close browser
  await browser.close()
}

getMammutProductData('2290-00990')