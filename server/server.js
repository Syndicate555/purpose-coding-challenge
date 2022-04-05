import express from 'express'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import morgan from 'morgan'
// import Promise from 'bluebird'
import JSONToCSV from 'json2csv'
import { fileURLToPath } from 'url'
import cors from 'cors'
import dotenv from 'dotenv'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

// Configuring cors
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)
app.use(express.json({ extended: false }))
// Logging the HTTP requests in the console
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'))
}

const writeIt = ({ path, data }) =>
  new Promise((res, rej) =>
    fs.writeFile(path, data, (err) => {
      if (err) {
        return rej(err)
      }
      console.log(`File Saved to ${path}`)
      return res()
    }),
  )
app.get('/', async (req, res) => {
  const CURRENT_DATE = new Date('2020-11-26')

  try {
    const options = {
      method: 'GET',
      url: process.env.URL,
    }
    const response = await axios(options)
    if (response && response.status === 200 && response.data) {
      // formatting the data to be inside an array
      const keys = Object.keys(response.data)
      const data = keys.map((item) => {
        response.data[item].fund_id = item
        return response.data[item]
      })

      // filtering out the funds that have older data
      const outdatedFunds = data.filter((fund) => {
        for (const seriesId in fund.series) {
          const date = new Date(fund.series[seriesId].latest_nav.date)
          if (date < CURRENT_DATE) {
            return fund
          }
        }
      })

      return res.json(outdatedFunds).status(200)
    } else {
      return res.json({ message: 'No fund data available' })
    }
  } catch (error) {
    console.log(error.message)
    return res.status(404).json({
      message: 'Failed to retrieve fund data',
      server_response: error.message,
    })
  }
})
app.post('/submit', async (req, res) => {
  try {
    const data = req.body
    // Saving the form data locally to a csv
    const jsonToCsv = JSONToCSV.parse
    const csv = jsonToCsv(data, {
      fields: ['new_date', 'funds'],
    })
    await writeIt({
      path: path.join(__dirname, 'csv', 'new-fund-data.csv'),
      data: csv,
    }).then(() => console.log('write succesful'))

    const options = {
      method: 'GET',
      url: process.env.URL,
    }
    const response = await axios(options)
    let fundData
    if (response && response.status === 200 && response.data) {
      fundData = response.data
    }
    // looping through the data retrieved from the provided API enpoint and overwrting the aum and date values with the new values from the form
    data.funds.forEach((item) => {
      item.series.forEach((fund) => {
        fundData[item.fund_id].aum = item.aum
        fundData[item.fund_id].series[fund.series_id].latest_nav.date =
          data.new_date
        fundData[item.fund_id].series[fund.series_id].latest_nav.value =
          fund.latest_nav.value
      })
    })

    // Saving the modified fund data with the new date and aum values
    let saveData = JSON.stringify(fundData)
    fs.writeFile('fundData.json', saveData, (err) => {
      if (err) throw err
      console.log('Data written to file')
    })

    return res.json(fundData).status(200)
  } catch (error) {
    return res.status(404).json({
      message: 'Failed to update fund data',
      server_response: error.message,
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server Listening on ${PORT}`)
})
