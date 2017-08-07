var express = require('express')
var app = express()
var path = require('path')

console.log('Hello, welcome to Styleguide starter kit');

app.get('/demo', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/demo.html'))
})

app.get('/styleguide', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/styleguide.html'))
})

app.listen(4500, function () {
  console.log('Example app listening on port 4500!')
})

app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/src', express.static(path.join(__dirname, '/src')))
