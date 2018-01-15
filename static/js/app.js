$('body').on('click', 'ul li a', function(event) {
  var tab = 'lvl' + $(this).attr('id').substr(3);
  rows = ''
  $.each(logs, function(k,v) {
    $.each(v, function(k2,v2) {
      rows += '<tr>';
      rows += '<td>' + k + '</td>';
      rows += '<td>' + v2.level + '</td>';
      rows += '<td>';
      rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
      rows += items[k2].api + '/" class="eorzeadb_link">';
      rows += items[k2].name + '</a></td>';
      rows += '</tr>';
    });
  });
  $('#' + tab + ' table tbody').empty().append(rows);
});
