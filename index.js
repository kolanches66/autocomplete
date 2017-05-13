var http = require('http'),
    fs = require('fs');
var formidable = require('formidable');

function kladrSelectStrings(array, string, byField) {
  var arrOut = [], limit = 50;
  var lString = string.toLowerCase();   // меняем регистр искомой строки

  for (var i=0, counter=0; i<array.length; i++) {
    var arrString = (array[i][byField]).toLowerCase();   // меняем регистр строки из массива
    if (arrString.indexOf(lString) >= 0) {     // если найдено совпадение
      if (counter < limit) {
        arrOut.push(array[i][byField]);
        //console.log(arrOut[i][byField]);
      }   // добавляем в свежий массив, если не превышает лимит
      counter++;             // поднимаем счетчик
    }
  }
    
  var list = {
    array: arrOut.sort(),
    realCount: counter
  };

  return list;
  // return {list: list.sort(), foundCount: foundCount};
}

http.createServer(function (req, res) {
  var req_url = req.url;
  
  //  добавляем index.html при '/' на конце
  if (req_url.search(/\/$/) !== -1) {
    req_url += 'index.html';
  }
//  process.stdout.write(req_url);

  // возвращаем not found
  if (!fs.existsSync('.' + req_url)) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("404 Not Found");
    process.stdout.write(req_url + " : " + "404 Not Found")
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

        var arr = JSON.parse(data);
        //console.log(arr.length);
        res.writeHead(200, {'Content-Type': 'application/json'});
        // process.stdout.write(req_url + " : " + "OK");
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

            var list = kladrSelectStrings(arr, postCity, 'City');
            res.write(JSON.stringify(list));
            res.end();
          });
        }
        // если метод не POST, то просто возвращаем весь файл
        else {
          res.write(JSON.stringify(arr));
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
        process.stdout.write(req_url + " : OK\n");
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