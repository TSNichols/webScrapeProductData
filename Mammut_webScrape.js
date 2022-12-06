const puppeteer = require('puppeteer')
const fs = require('fs')

//! The encrypted? key in these links changes daily? so ideally find another solution
//! Should only have to run these every once in a while and use API below to get price updates - revisit this later
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
// https://www.mammut.com/api/us/en/data/cf-category/5867 //? Looks like just data for how they setup their filters

// https://www.mammut.com/us/en/products/2010-04190/  //* product data from base sku

async function fetchProductJson (fetchURL) {
  var prodArray = []
  await fetch(fetchURL)
    .then((response) => response.json())
    .then((data) => {
      var productData = data.pageProps.serverState.initialResults.mammut_test_products_us_en.results[0].hits
      prodArray = productData.map( (product) => ({
        sku: product.sku,
        name: product.name,
        brand: "Mammut",
        description: null,
        attributes: null,
        variants: product.variants.map((variant) => ({
          image: variant.image,
          imageTransparent: variant.imageTransparent,
          sizes: variant.sizes,
          color: variant.colorRopeFinishing,
        })),
      }))
      const fileName = 'Mammut_fetchData.json'
      fs.writeFile(fileName, JSON.stringify(prodArray), (err) => {
        if (err) throw err
        console.log(`File Saved: ${fileName}`)
      })
    })
}

async function getMammutProductData (saveAs) {
  const data = fs.readFileSync('Mammut_fetchData.json', 'utf8')
  var prodArray = JSON.parse(data)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const baseURL = 'https://www.mammut.com/us/en/products/'
  
  // Get product data for each base sku
  for (let i = 0; i < prodArray.length; i++) {
    // Go to product page
    console.log(`Getting product data for entry ${i+1} of ${prodArray.length}: ${prodArray[i].sku}`)
    try {
      await page.goto( baseURL + prodArray[i].sku )
    } catch (e) {
      if (e instanceof puppeteer.TimeoutError) {
        console.log(`Page load timed out for SKU: ${prodArray[i].sku}`)
        //TODO: write another loop to retry failed page loads
        continue
      }
    }
    
    // Get description data
    prodArray[i].description = await page.evaluate( () => 
      Array.from( document.querySelectorAll('[class^="PDPInfo_description_"] > *') ).map( child => child.textContent )
    )
    
    // Get spec data
    prodArray[i].attributes = await page.evaluate( () =>
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
  }
        
  // Write data to file
  fs.writeFile(saveAs, JSON.stringify(prodArray), (err) => {
    if (err) throw err
    console.log(`File Saved: ${saveAs}`)
  })
  
  // Close browser
  await browser.close()
}

// fetchProductJson('https://www.mammut.com/_next/data/NzZYR-6p4UjTqfrd6JfvV/us/en/category/5867/ropes.json')
getMammutProductData('Mammut_ropeData.json')
