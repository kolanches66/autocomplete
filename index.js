var http = require('http'),
    fs = require('fs');
var formidable = require('formidable');

// *** добавить limit через POST
function listFromBigList(bigList, needle, fieldName) {
  var list = [], limit = 50;
  needle = needle.toLowerCase();   // меняем регистр искомой строки
  var re = new RegExp('^' + needle, 'i');

  for (var i=0, foundCount=0; i<bigList.length; i++) {
    var haystack = (bigList[i][fieldName]).toLowerCase();   // меняем регистр строки из массива
    //if (haystack.indexOf(needle) >= 0) {     // если найдено совпадение
    if (haystack.search(re) !== -1) {
      if (foundCount < limit) {
        list.push(bigList[i][fieldName]);
      }   // добавляем в массив, если не превышает лимит
      foundCount++;   
    }
  }

  return {list: list.sort(), foundCount: foundCount};
}

http.createServer(function (req, res) {
  if (req.url.search(/\/$/) !== -1) {
    req.url += 'index.html';
  }

  if (!fs.existsSync('.' + req.url)) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("404 Not Found");
    process.stdout.write(req.url + " : " + "404 Not Found")
    process.stdout.write(" : " + req.method + '\n');
    res.end();
  }

  // обрабатывае запросы на получение html, css и js файлов
  getFile('html', 'text/html', req, res);
  getFile('css', 'text/css', req, res);
  getFile('js', 'text/js', req, res);

  if(req.url.indexOf('.json') != -1 && fs.existsSync('.' + req.url)) {
    // 
    // - - для kladr.json -- предобработка
    // 
    if (req.url.indexOf('kladr.json') != -1) {
      fs.readFile('.' + req.url, 'utf8', function (err, data) {
        if (err) throw err;

        var bigList = JSON.parse(data);
        //console.log(arr.length);
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf8',  'Access-Control-Allow-Origin': '*'});
        // process.stdout.write(req.url + " : " + "OK");
        // process.stdout.write(" : " + req.method + '\n');

        if (req.method == 'POST') {
          var form = new formidable.IncomingForm();
          form.parse(req, function(err, fields, files) {
            // hCode2String -- для конвертации html-кодов (&#1089;&#1091;&#1093; ...)
            // postString -- это введенная в поле строка, по ней делаем выборку
            //var string = fields.city;

            function hCode2String(string){
              return string.replace(/&#([0-9]+);/g, 
                function(a) {
                  return String.fromCharCode(Number(a));
                }
              );
            }
            var postCity = hCode2String(fields.city);

            var list = listFromBigList(bigList, postCity, 'City');
            //console.log(list);
            res.write(JSON.stringify(list));
            res.end();
          });
        }
        // если метод не POST, то просто возвращаем весь файл
        else {
          res.write(JSON.stringify(bigList));
          res.end();
        }
      });
    }
    // 
    // - - для остальных файлов .json -- просто чтение
    else {
      fs.readFile('.' + req.url, 'utf8', function (err, data) {
        if (err) throw err;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(data);
        process.stdout.write(req.url + " : OK\n");
        res.end();
      });
    }
  }

}).listen(8888);
console.log('Server has started on the port 8888');

function getFile(format, contentType, req, res) {
  var formatRegExp = new RegExp('\.'+format+'$', 'i');
  if(req.url.search(formatRegExp) != -1 && fs.existsSync('.' + req.url)){
    fs.readFile('.' + req.url, function (err, data) {
      if (err) console.log(err);
      res.writeHead(200, {'Content-Type': contentType});
      res.write(data);
      process.stdout.write(req.url + " : OK\n");
      res.end();
    });
  } 
}