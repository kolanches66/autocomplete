var inp = document.getElementById("autocomp__textbox");
var listBox = document.getElementById('autocomp__list');

// костыль для нормальной работы xmlhttp в IE
function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}


function generateUL(array, displayLimit) {
  var ul = document.createElement('ul');

  array.length-1 < displayLimit ? max = array.length-1 : max = displayLimit;

  for(var i = 0; i < max+1; i++) {
    var li = document.createElement('li');

    var leftText = array[i]['string'].slice(0, array[i]['boldStartPos']);
    var boldText = array[i]['string'].slice(
      array[i]['boldStartPos'], 
      array[i]['boldEndPos']
    );
     var rightText = array[i]['string'].slice(
       array[i]['boldEndPos'], 
       array[i]['string'].length
     );
    li.innerHTML = leftText + '<b>' + boldText + '</b>' +rightText;
    ul.appendChild(li);
  }
  // добавочная информация
  if (array.length > displayLimit) {
    var li = document.createElement('li');
    li.innerHTML = 
      "Показано " + max.toString() + " из " + array[array.length-1] + " найденных городов";
    ul.appendChild(li);
    console.log(array[array.length]);
  } else if (array.length == 0) {
    var li = document.createElement('li');
    li.innerHTML = 
      "Ничего не найдено. Такого города нет в списке или вы опечатались";
    ul.appendChild(li);
  }
  var li = document.createElement('li');
  li.innerHTML = 
    "Всего загружено городов: " + array.length.toString();
  ul.appendChild(li);

  return ul;
}

function onchangetext(inp, listBox) {
  onchangetext.oldText = onchangetext.newText;
  onchangetext.newText = inp.value;

  // очищаем, если ничего не введено
  if (inp.value != onchangetext.oldText && inp.value == '') {
    listBox.style.display = 'none';
    listBox.innerHTML = "";
  } 
  
  // если пользователь что-то ввел
  if (inp.value.length >= 1) {
    // если изменился текст
    if (onchangetext.newText != onchangetext.oldText) {
      // очищаем список
      list = [];
      listBox.style.display = '';
      
      function kladrLoad(file, string, displayLimit) {  
        var xmlhttp = getXmlHttp();
        var params = "city=" + encodeURIComponent(string);

        xmlhttp.open('POST', file, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var cities = JSON.parse(xmlhttp.responseText);
            // ищем в списке соответсвие
            findString(cities, list, string, 'City');
            // формируем список
            listBox.innerHTML = "";
            listBox.appendChild(generateUL(list, displayLimit, inp.id));
          }
        };
        xmlhttp.send(params);
      }
      var displayLimit = 10;    // сколько показывать городов в списке
      kladrLoad("kladr.json", inp.value, displayLimit);
    }
  }
  setTimeout(onchangetext, 100, inp, listBox);
}

setTimeout(onchangetext, 100, inp, listBox);