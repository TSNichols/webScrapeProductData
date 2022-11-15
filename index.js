const puppeteer = require('puppeteer')
const fs = require('fs')

async function run () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const baseURL = 'https://www.blackdiamondequipment.com'
  // const productPageURL = '/en_US/shop/climbing-ropes/'
  const productPageURL = '/en_US/shop/helmets/'
  // const productPageURL = '/en_US/shop/harnesses/'
  // const productPageURL = '/en_US/shop/rock-protection/'

  const fileName = `BD_${(productPageURL.match(/\/[\w-]+\/$/))[0].replaceAll('/','')}.json`

  // Go to product page
  await page.goto( baseURL + productPageURL )
  await page.waitForNavigation({waitUntil: 'domcontentloaded'})

  // TODO: look for "Load More" button

  // Get all products from product page URL
  var products = await page.evaluate( () => 
    Array.from( document.querySelectorAll('.product-card') ).map( (product) => ({
      name: product.querySelector('.product-title').textContent,
      link: product.querySelector('a').getAttribute('href'),
    }))
  )

  // Go to each product and pull data
  for (let i = 0; i < products.length; i++) {
    await page.goto( baseURL + products[i].link )
    await page.waitForNavigation({waitUntil: 'domcontentloaded'})

    // Get product data from page
    const productData = {
      description: (await page.$('.product-description')) ? await page.$eval('.product-description', el => el.textContent) : null,
      bullets: await page.$$eval('.product-bullets li', el => el.map( (bullet) => bullet.textContent )),
      specs: await page.$$eval('.tech-spec-item', itemArray => itemArray.map( (item) => ({
        label: item.querySelector('.tech-spec-label').textContent,
        value: item.querySelector('.tech-spec-value').textContent,
      }))),
      images: await page.$$eval('.alternate-image-container img', el => el.map( (img) => img.getAttribute('data-src') )),
    }

    // find all variant data
    var variants = []
    var arrIndex = 0
    // find all swatch-wrapper options
    const swatches = await page.$$('.swatch-wrapper')
    // iterate and click through each swatch and do...
    if (swatches.length !== 0 ) { // swatches found...
      for (let j = 0; j < swatches.length; j++) {
        var swatch = swatches[j]
        await swatch.click()
        // find all choice-wrappers
        var choices = await page.$$('.choice-wrapper')
        if (choices.length !== 0) { // choices found...
          for (let k = 0; k < choices.length; k++) {
            // iterate through each choice-wrapper
            var choice = choices[k]
            // click each choice
            await choice.click()
            // record prices
            // TODO: pull out to own function to use repeats (args: swatches, choices, arrIndex?)
            variants[arrIndex] = {
              item: await page.$eval('.item-number', el => (((el.textContent).replace('Item', '')).replace('#','')).trim() ),
              swatch: await swatch.$eval( 'input' , el => el.value ),
              choice: await choice.$eval( 'input' , el => el.value ),
              price: {
                list: (await page.$('.regular-price')) ? await page.$eval('.regular-price', el => (el.textContent.match(/\W\d+\W\d+/))[0] ) : null,
                sale: (await page.$('.sale-price')) ? await page.$eval('.sale-price', el => (el.textContent.match(/\W\d+\W\d+/))[0]) : null,
              },
            }
            arrIndex += 1
          }
        } else {  // no choices found...
          variants[arrIndex] = {
            item: await page.$eval('.item-number', el => (((el.textContent).replace('Item', '')).replace('#','')).trim() ),
            swatch: await swatch.$eval( 'input' , el => el.value ),
            choice: null,
            price: {
              list: (await page.$('.regular-price')) ? await page.$eval('.regular-price', el => (el.textContent.match(/\W\d+\W\d+/))[0] ) : null,
              sale: (await page.$('.sale-price')) ? await page.$eval('.sale-price', el => (el.textContent.match(/\W\d+\W\d+/))[0]) : null,
            },
          }
        }
      }
    } else { // No swatches found - look for choices
      var choices = await page.$$('.choice-wrapper')
      if (choices.length !== 0) { // choices found...
        for (let k = 0; k < choices.length; k++) {
          // iterate through each choice-wrapper
          var choice = choices[k]
          // click each choice
          await choice.click()
          // record prices
          variants[arrIndex] = {
            item: await page.$eval('.item-number', el => (((el.textContent).replace('Item', '')).replace('#','')).trim() ),
            swatch: null,
            choice: await choice.$eval( 'input' , el => el.value ),
            price: {
              list: (await page.$('.regular-price')) ? await page.$eval('.regular-price', el => (el.textContent.match(/\W\d+\W\d+/))[0] ) : null,
              sale: (await page.$('.sale-price')) ? await page.$eval('.sale-price', el => (el.textContent.match(/\W\d+\W\d+/))[0]) : null,
            },
          }
          arrIndex += 1
        }
      } else {  // No choices found
        variants[arrIndex] = {
          item: await page.$eval('.item-number', el => (((el.textContent).replace('Item', '')).replace('#','')).trim() ),
          swatch: null,
          choice: null,
          price: {
            list: (await page.$('.regular-price')) ? await page.$eval('.regular-price', el => (el.textContent.match(/\W\d+\W\d+/))[0] ) : null,
            sale: (await page.$('.sale-price')) ? await page.$eval('.sale-price', el => (el.textContent.match(/\W\d+\W\d+/))[0]) : null,
          },
        }
      }
    }

    // Merge Data
    products[i] = {...products[i], ...productData, variants: variants}
  }

  // Write data to file
  fs.writeFile(fileName, JSON.stringify(products), (err) => {
    if (err) throw err
    console.log('File Saved')
  })
  
  // Close browser
  await browser.close()
}

run() 
