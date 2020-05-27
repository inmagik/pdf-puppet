import express from "express"
import bodyParser from "body-parser"
import { urlToPdf } from "./pdf"
import { urlToPng } from "./screenshot"

const app = express()

app.use(bodyParser.json())

app.post('/', urlToPdf)
app.post('/screenshot/', urlToPng)

const port = process.env.PORT || 3040

app.listen(port, () => {
  console.log(`pdf-puppet listening on port ${port}`)
})