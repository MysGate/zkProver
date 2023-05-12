import express from 'express'
import bodyParser from 'body-parser'


const app = express()
app.use(bodyParser.json())

app.post('/proof', (request, response) => {
  const data = request.body
  console.log('post data', data)

  response.send({proof: "123"})
})

const server = app.listen(2000, () => {
  console.log(`visit: http://localhost:2000/proof`)
})
