function findString(array, list, string) {
  var lString = string.toLowerCase();   // меняем регистр искомой строки
  var listCount = 0;
  var limit = 50, max;
  //array.length > limit ? max = limit : max = array.length;
  for (var i=0; i<array.length; i++) {
    var arrString = (array[i]).toLowerCase();   // меняем регистр совпадения
    if (arrString.indexOf(lString) >= 0) {     // если найдено совпадение
      var item = {
        string: array[i],              // здесь оставляем, как есть
      };
      list.push(item);   // добавляем в список
      listCount++;
    }
  }
  console.log(list);
  return listCount;
}