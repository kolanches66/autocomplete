var http = require('http'),
    fs = require('fs');
var formidable = require('formidable');

function kladrSelectStrings(array, string, byField) {
  var arrOut = [], limit = 50;
  var lString = string.toLowerCase();   // меняем регистр искомой строки

  for (var i=0, counter=0; i<array.length; i++) {
    var arrString = (array[i][byField]).toLowerCase();   // меняем регистр строки из массива
    if (arrString.indexOf(lString) >= 0) {     // если найдено совпадение
      if (counter < limit) arrOut.push(array[i]);   // добавляем в свежий массив, если не превышает лимит
      counter++;             // поднимаем счетчик
    }
  }
  var item ={ Id: counter, City: counter.toString() };
  arrOut.push(item);
  return arrOut;
}

http.createServer(function (req, res) {
  var req_url = req.url;

  //  добавляем index.html при '/' на конце
  if (req_url.lastIndexOf('/') == req_url.length-1) {
    req_url += 'index.html';
  }

  // возвращаем not found
  if (!fs.existsSync('.' + req_url)) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("404 Not Found");
    process.stdout.write(req_url + " : " + "404 Not Found")
    process.stdout.write(" : " + req.method + '\n');
    res.end();
  }

  if(req_url.indexOf('.html') != -1 && fs.existsSync('.' + req_url))
  {
    fs.readFile('.' + req_url, function (err, data) {
      if (err) console.log(err);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      process.stdout.write(req_url + " : OK\n");
      res.end();
    });
  }

  if(req.url.indexOf('.js') != -1 && req.url.indexOf('.json') == -1 && fs.existsSync('.' + req.url))
  {
    fs.readFile('.' + req.url, function (err, data) {
      if (err) console.log(err);
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.write(data);
      process.stdout.write(req_url + " : OK\n");
      res.end();
    });
  }

  if(req.url.indexOf('.json') != -1 && fs.existsSync('.' + req.url)) {
    // 
    // - - для kladr.json -- предобработка
    // 
    if (req.url.indexOf('kladr.json') != -1) {
      fs.readFile('.' + req.url, 'utf8', function (err, data) {
        if (err) throw err;

        var arr = JSON.parse(data);
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
                function(str, a, offset, s) {
                  return String.fromCharCode(Number(a));
                }
              );
            }

            var postCity = hCode2String(fields.city);
            //process.stdout.write(fields.string + " : " + subStr);

            //var t = new Date();
            //process.stdout.write(" - " + t.getHours() + ":" + t.getMinutes()+ ":" + t.getSeconds() + '\n');

            var list = kladrSelectStrings(arr, postCity, 'City');
            //console.log(list);
            res.write(JSON.stringify(list));
            //t = new Date();
            //process.stdout.write(" - " + t.getHours() + ":" + t.getMinutes()+ ":" + t.getSeconds() + '\n');
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

  if(req.url.indexOf('.css') != -1){
    fs.readFile('.' + req.url, function (err, data) {
      if (err) console.log(err);
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.write(data);
      process.stdout.write(req_url + " : OK\n");
      res.end();
    });
  } 

}).listen(8888);
console.log('Server has started on the port 8888');