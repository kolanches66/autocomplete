function findString(array, list, string, byField) {
  var lString = string.toLowerCase();   // меняем регистр искомой строки
  var listCount = 0;
  var limit = 50, max;
  //array.length > limit ? max = limit : max = array.length;
  for (var i=0; i<array.length; i++) {
    var arrString = (array[i][byField]).toLowerCase();   // меняем регистр совпадения
    boldStartPos = arrString.indexOf(lString);
    if (boldStartPos >= 0) {     // если найдено совпадение
      boldEndPos = boldStartPos + string.length;
      var item = {
        string: array[i][byField],              // здесь оставляем, как есть
        boldStartPos: boldStartPos, 
        boldEndPos: boldEndPos
      };
      list.push(item);   // добавляем в список
      listCount++;
    }
  }
  //console.log(list);
  return listCount;
}