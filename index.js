var http = require('http'),
    fs = require('fs');
var formidable = require('formidable');



var server = new http.Server();


server.on('request', function (req, res) {
  // '/' --> '/index.html'
  req.url = formatURL(req.url);

  
  // Error 404
  if (!fs.existsSync('.' + req.url)) {    
    generatePage(req.url, res, 'text/html', '404 Not Found');
  }


  // Get html, css and js files
  var contentType = {
    html: "text/html",
    css:  "text/css",
    js:   "text/js"
  };
  
  for (var key in contentType) {
    getFile(key, contentType[key], req, res);
  }


  // JSON
  if (req.url.search(/\.json$/i) !== -1 && fs.existsSync('.' + req.url)) {
    if (req.url.search(/kladr\.json$/i) !== -1) {
      fs.readFile('.' + req.url, 'utf8', function (err, data) {
        if (err) throw err;

        var bigList = JSON.parse(data);
        
        // Simply give a JSON file
        if (req.method !== 'POST') {
          simplyGetFile(res, 'application/json; charset=utf8', JSON.stringify(bigList))
        } else {
          var form = new formidable.IncomingForm();
          
          form.parse(req, function(err, fields, files) {            
            var list = listFromBigList(bigList, fields.city, 'City');
            
            // Give a parsed JSON file
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf8', 
                                'Access-Control-Allow-Origin': '*'});
            res.write(JSON.stringify(list));
            res.end();
          });
          
        }
      });
    }
    // 
    // - - для остальных файлов .json -- просто чтение
    else {
      fs.readFile('.' + req.url, 'utf8', function (err, data) {
        if (err) throw err;
        
        simplyGetFile(res, 'application/json; charset=utf8', data)
      });
    }
  }

});

server.listen(2052);

console.log('Server has started on the port 2052');



function formatURL(url) {
  if (url.search(/\/$/) !== -1) {
    url += 'index.html';
  }  
  return url;
}

function generatePage(url, res, contentType, text) {
  res.writeHead(200, {'Content-Type': contentType});
  res.write(text);
  process.stdout.write(url + " : " + text)
  res.end();
}

function simplyGetFile(res, contentType, content) {
  res.writeHead(200, {'Content-Type': contentType});
  res.write(content);
  res.end();
}

function getFile(format, contentType, req, res) {
  var formatRegExp = new RegExp('\.'+format+'$', 'i');
  if(req.url.search(formatRegExp) !== -1 && fs.existsSync('.' + req.url)){
    fs.readFile('.' + req.url, function (err, data) {
      if (err) console.log(err);
      res.writeHead(200, {'Content-Type': contentType});
      res.write(data);
      process.stdout.write(req.url + " : OK\n");
      res.end();
    });
  } 
}


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