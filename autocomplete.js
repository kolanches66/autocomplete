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
  // 
  this.minChars = 2;

  // текущее состояние автокомплита
  this.status = 'empty';
  this.windowFocus;
  this.inputFocus;
  
  // для обнаружения изменений в input
  this.oldText = '';
  this.newText = '';


  // -- Вспомогательные методы
  
  // Костыль для нормальной работы xmlhttp в старых версиях IE
  function getXmlHttp(){var a;try{a=new ActiveXObject("Msxml2.XMLHTTP")}catch(b){try{a=new ActiveXObject("Microsoft.XMLHTTP")}catch(b){a=!1}}return a||"undefined"==typeof XMLHttpRequest||(a=new XMLHttpRequest),a}
  
  // Для нормальной обработки событий
  function addEvent(el, type, handler){
    if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
  }


  // -- Методы --

  this.init = function() {
    var that = this;
    
    setInterval(this.onTimer, 1, that);
    
    this.input.onfocus = function() {   
      that.inputFocus = true;
      
      // уничтожаем все лишние стили
      that.input.classList.remove('autocomp__textbox--warning');
      that.input.classList.remove('autocomp__textbox--error');
      switch(that.status) {
        case 'not found':
        case 'found':
        case 'one found':
        case 'selected':
          that.listBoxShow();
          break;
      }
    };
    
    this.input.onblur = function() {
      that.inputFocus = false;
      
      switch(that.status) {
        case 'not found':
          that.input.classList.add('autocomp__textbox--error');
          that.listBoxHide();
          break;
        case 'found':
          that.input.classList.add('autocomp__textbox--error');
          //alert('Выберите значение из списка');
          that.listBoxHide();
          break;
        case 'one found':
          that.selectItem(that.list[0]);
          that.listBoxHide();
          break;
      }
    };
  };

  // # Получаем список в формате JSON от сервера
  this.getList = function () {     // *** ПОПРОБОВАТЬ getList с return
    var that = this;
    
    var start = new Date();

    var xmlhttp = getXmlHttp();
    //var params = this.jsonParamName + "=" + encodeURIComponent(this.input.value);
    var params = this.jsonPostParam + "=" + encodeURIComponent(this.input.value);

    xmlhttp.open('POST', this.jsonFileName, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        // ответ сервера на наш запрос
        var result = JSON.parse(xmlhttp.responseText);
        // получаем список из [displayLimit] элементов и кол-во найденных в файле
        that.list = result.list;
        that.foundCount = result.foundCount;
        // генерируем UL список подходящих городов
        that.listBox.innerHTML = "";
        that.listBox.appendChild(that.generateAutocomplete());
        
        console.log("Delta: " + (new Date() - start) + " ms");
      }
    };
    // отправляем введенную в input строку
    xmlhttp.send(params);
  };
  
  // # Фиксирует изменения input
  this.oldNewText = function(oldText, newText) {
    this.oldText = oldText;
    this.newText = newText;
  };
  
  this.changeText = function(text) {
    this.input.value = text;
    this.oldNewText(text, text);
  };
  
  // # Скрываем список
  this.listBoxHide = function() {
    this.listBox.style.display = 'none';
    this.listBox.innerHTML = '';
  };
  
  // # Показываем список
  this.listBoxShow = function() {
    this.getList();
    this.listBox.style.display = '';
  };
  
  this.selectItem = function(text) {
    this.status = 'selected';
    this.changeText(text);
    this.listBoxHide();
  };

  // # Генерация UL-списка из массива
  this.generateAutocomplete = function() {
    var that = this;

    var ul = document.createElement('ul'),
        li, a;
    
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
      
      a = document.createElement('a');
      a.name = itemName;
      // выделяем введенную часть
      a.innerHTML = itemName.replace(re, '<b>$1</b>');
      
      addEvent(a, 'mousedown', function() {
        that.status = 'selected';
        that.changeText(this.name);
        that.listBoxHide();
      });
      
      li.appendChild(a);
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
      this.status = 'not found';
      li = document.createElement('li');
      li.innerHTML = "Не найдено";
      ul.appendChild(li);
    }
    return ul;
  };

  // # Событие таймера
  this.onTimer = function (that) {
    that.oldNewText(that.newText, that.input.value);
    
    that.listBox.style.width = 'auto';
    // подтягиваем ширину, если надо
    if (that.listBox.offsetWidth < that.input.offsetWidth) {
      that.listBox.style.width = that.input.offsetWidth + 'px';
    } else {
      that.listBox.style.width = 'auto';
    }
    
    if (that.status === 'not found' && that.inputFocus) {
      that.input.classList.add('autocomp__textbox--warning');
    } else {
      that.input.classList.remove('autocomp__textbox--warning');
    }

    if (that.input.value.length < that.minChars) {
      that.input.classList.remove('autocomp__textbox--warning');
      that.input.classList.remove('autocomp__textbox--error');
      that.listBoxHide();
    } else {         // если больше 2-ух символов (по-умолчанию)
      if (that.newText !== that.oldText) {  // если изменился текст
        that.listBoxShow();
      }
    }
  };
  
  this.init();

};