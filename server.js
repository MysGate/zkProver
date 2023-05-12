import express from 'express'
import bodyParser from 'body-parser'


const app = express()
app.use(bodyParser.json())


app.get('/hello', (request, response) => {
  // localhost:2000/hello?a=123&b=456
  const query = request.query
  console.log(query)  // { a: '123', c: '456' }

  let data = {
    foo: 111,
    bar: 222,
  }
  data = JSON.stringify(data)
  response.send(data)
})


app.post('/world', (request, response) => {
  const data = request.body
  console.log('post data', data)

  response.send('123')
})


const server = app.listen(2000, () => {
  console.log(`visit: http://localhost:2000/hello`)
})
