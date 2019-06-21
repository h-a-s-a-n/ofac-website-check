const axios = require('axios')
const Papa = require('papaparse')

async function getList() {
  try {
    const response = await axios.get('https://www.treasury.gov/ofac/downloads/consolidated/cons_prim.csv')
    let csv = response.data
    parseData(csv)
  } catch (error) {
    console.error(error);
  }
}
function parseData(csv) {
  let parsed = Papa.parse(csv)
  let websites = []
  for (let row of parsed.data) {
    for (let field of row) {
      if (field.includes('Website ')) {
        if (field.includes('; ')) {
          let delimited = field.split('; ')
          for (let string of delimited) {
            if (string.includes('Website')) {
              websites.push({
                uid: parseInt(row[0]),
                name: row[1],
                website: string.replace('Website ', '').replace(/https?:\/\//, '').replace(/\/.*/, '').replace('alt. ', '').toLowerCase()
              })
            }
          }
        } else {
          websites.push({
            uid: parseInt(row[0]),
            name: row[1],
            website: field.replace('Website ', '').replace(/\.$/, '').replace().replace(/https?:\/\//, '').replace(/\/.*/, '').replace('alt. ', '').toLowerCase()
          })
        }
      }
    }
  }
  checkHost(websites)
}

async function checkHost(websites) {
  for (let i in websites) {
    let item = websites[i]
    setTimeout(function(){
      axios.get('https://domains.ext.cftools.net/api/v1/domains/' + item.website).then(function(response){
        if (response.data[0].status == 'error') {
          console.log(response.data[0].domain + " ERROR")
        } else {
          console.log(response.data[0].domain + '\t' + response.data[0].lookup.address + '\t' + response.data[0].lookup.asn + '\t' + response.data[0].lookup.description)
        }
      })
    }, (i*500))
  }
}

getList()
