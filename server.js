const express = require('express');
const bodyParser = require('body-parser');
const utils = require("./src/utils.js");

const app = express()
app.use(bodyParser.json())

app.post('/proof/generate', async(request, response) => {
  const data = request.body
  console.log('post data', data)
  const [a, b, c, publicInfo] = await utils.generateProof(data.addr, data.url, data.cmtIdx, data.txhash);
  const proof = {a, b, c}
  console.log("proof", proof);
  console.log("publicInfo", publicInfo);
  response.status(200).json({proof, publicInfo})
})

const server = app.listen(3000, () => {
  console.log(`visit: http://localhost:3000/proof/generate`);
})
