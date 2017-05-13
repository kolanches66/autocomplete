 function showProps(obj, objName) {
   var result = "";
   for (var i in obj) {
     if (obj.hasOwnProperty(i)) {
         result += objName + "." + i + " = " + obj[i]+ "\n";
     }
   }
   return result;
 }


// Костыль для нормальной работы xmlhttp в старых версиях IE
function getXmlHttp(){var a;try{a=new ActiveXObject("Msxml2.XMLHTTP")}catch(b){try{a=new ActiveXObject("Microsoft.XMLHTTP")}catch(b){a=!1}}return a||"undefined"==typeof XMLHttpRequest||(a=new XMLHttpRequest),a}


var Autocomplete = function(inputSelector, listBoxSelector, jsonFileName, jsonPostParam, listLimit) {
  
  // -- Параметры

  // селекторы и DOM элементы, полученные из селекторов
  this.inputSelector = inputSelector;
  this.listBoxSelector = listBoxSelector;
  this.inputs = document.querySelectorAll(inputSelector);
  this.input = document.querySelector(inputSelector);
  this.listBox = document.querySelector(listBoxSelector);
  
  // название файла JSON и название POST параметра который добавляем при обращении к файлу
  // (при этом значение параметра — введенная в input строка)
  this.jsonFileName = jsonFileName;
  this.jsonPostParam = jsonPostParam;

  // список, который отдает нам сервер
  this.list = [];
  // максимальное кол-во элементов в списке
  this.listLimit = listLimit;
  // всего найдено совпадений
  this.foundCount;

  // текущее состояние автокомплита
  this.status = 'default';
  
  // для обнаружения изменений в input
  this.oldText = '';
  this.newText = '';


  // -- Методы --

  this.init = function() {
    setInterval(this.onTimer, 1, this);
  };

  // # Получаем список в формате JSON от сервера
  this.getList = function () {  
    var that = this;

    var xmlhttp = getXmlHttp();
    //var params = this.jsonParamName + "=" + encodeURIComponent(this.input.value);
    var params = this.jsonPostParam + "=" + encodeURIComponent(this.input.value);

    xmlhttp.open('POST', this.jsonFileName, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        // ответ сервера на наш запрос
        var result = JSON.parse(xmlhttp.responseText);
        // получаем список из [displayLimit] элементов и кол-во найденных в файле
        that.list = result.list;
        that.foundCount = result.foundCount;
        // генерируем UL список подходящих городов
        that.listBox.innerHTML = "";
        that.listBox.appendChild(that.generateAutocomplete());
      }
    };
    // отправляем введенную в input строку
    xmlhttp.send(params);
  };

  this.selectItem = function() {
  };

  // # Генерация UL-списка из массива
  this.generateAutocomplete = function() {
    //var that = this;

    var ul = document.createElement('ul'), 
        li;
    
    // ???
    // зачем нам нужен max ???
    var max;
    this.list.length-1 < this.listLimit ? max = this.list.length : max = this.listLimit;

    // регулярка при помощи которой выделяем введенную часть в каждом пункте
    var re = new RegExp('('+this.input.value+')', 'i');

    // генерация UL-списка из списка, полученного от сервера
    for(var i = 0; i < max; i++) {
      var itemName = this.list[i];
      li = document.createElement('li');

      // выделяем введенную часть
      var liText = itemName.replace(re, '<b>$1</b>');
      // при нажатии на пункт — выбранное значение копируется в input и список закрывается
      liText = '<a onclick="selectItem(\''+itemName+'\');">' + liText + '</a>';
      li.innerHTML = liText;

      ul.appendChild(li);
    }
    
    // добавочная информация под пунктами
    if (this.list.length != 0) {
      this.status = 'found';
      
      li = document.createElement('li');
      li.innerHTML = "Показано " + max + " из " + this.foundCount + " найденных городов";
      ul.appendChild(li);

      // если найдено только одно совпадение
      if (this.list.length == 1) {
        if (this.list[0].toLowerCase() == this.input.value.toLowerCase()) {
          this.status = 'one found';
        }
      }
    } else { 
      status = 'not found';
      li = document.createElement('li');
      li.innerHTML = "Не найдено";
      ul.appendChild(li);
    }
    return ul;
  };

  // # Фиксирует изменения input
  this.oldNewText = function(oldText, newText) {
    this.oldText = oldText;
    this.newText = newText;
  };

  // # Событие таймера
  this.onTimer = function (that) {
    that.oldNewText(that.newText, that.input.value);

    // очищаем, если ничего не введено
    if (that.input.value != that.oldText && that.input.value == '') {
      that.listBox.style.display = 'none';
      that.listBox.innerHTML = "";
    } 
    
    // если пользователь что-то ввел
    if (that.input.value.length >= 1) {
      // если изменился текст
      if (that.newText != that.oldText) {
        // очищаем список и показываем его
        that.listBox.style.display = '';
        // *** ПОПРОБОВАТЬ getList с return
        that.getList();
      }
    }
  };
  
  // наконец, инициализация 
  this.init();

  // this.showValues = function() {
  //   for (var i=0; i<this.inputs.length; i++) {
  //     alert(this.inputs[i].value);
  //   }
  // }
}