var fs = require('fs')
var path = require('path')
var test = require('tape')
var index = require('../')

test('exists template.ejs', function (t) {
    var actual = fs.existsSync('template.ejs')

    t.same(actual, true)
    t.end()
})

test('exists style.css', function (t) {
    var actual = fs.existsSync('style.css')

    t.same(actual, true)
    t.end()
})

test('return path', function (t) {
    var _path = path.resolve(__dirname, '..')
    t.same(index, _path)
    t.end()
})
