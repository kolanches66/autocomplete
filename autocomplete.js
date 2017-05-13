var inp = document.getElementById("autocomp__textbox");
var listBox = document.getElementById('autocomp__list');
var cityCount = 0;

// костыль для нормальной работы xmlhttp в старых версиях IE
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

// AJAX
function kladrLoad(file, string, displayLimit) {  
  var xmlhttp = getXmlHttp();
  var params = "city=" + encodeURIComponent(string);

  xmlhttp.open('POST', file, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var cities = JSON.parse(xmlhttp.responseText);
      cityCount = cities.realCount;
      console.log(cities.array.length);
      // генерируем UL список подходящих городов
      listBox.innerHTML = "";
      listBox.appendChild(generateUL(cities.array, displayLimit, inp.id));
    }
  };
  // отправляем введенную юзером строку
  xmlhttp.send(params);
}


function generateUL(array, displayLimit) {
  var ul = document.createElement('ul');
  var li;

  array.length-1 < displayLimit ? max = array.length : max = displayLimit;

  for(var i = 0; i < max; i++) {
    li = document.createElement('li');
    var city = array[i];
    var cityRegExp = new RegExp('('+inp.value+')', 'i');
    
    // выделяем введенную часть города
    var liString = city.replace(cityRegExp, '<b>$1</b>');
    liString = '<a onclick="selectCity(\''+city+'\');">' + liString + '</a>';
    li.innerHTML = liString;
    ul.appendChild(li);
  }
  
  // добавочная информация
  if (array.length != 0) {
    li = document.createElement('li');
    li.innerHTML = "Показано " + max + " из " + cityCount + " найденных городов";
    ul.appendChild(li);
  } else {
    li = document.createElement('li');
    li.innerHTML = "Ничего не найдено";
    ul.appendChild(li);
  }

  return ul;
}

function changeTextHide() {
  onchangetext.oldText = inp.value;
  onchangetext.newText = inp.value;
}

function listBoxHide() {
  listBox.style.display = 'none';
  listBox.innerHTML = "";
}

function selectCity(city) {
  inp.value = city;
  changeTextHide();
  listBoxHide();
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
      // очищаем список и показываем его
      list = [];
      listBox.style.display = '';
      
      var displayLimit = 10;    // сколько показывать городов в списке
      // ??? изменить название kladrLoad
      kladrLoad("kladr.json", inp.value, displayLimit);
    }
  }
}

// отлавливаем изменения
setInterval(onchangetext, 1, inp, listBox);