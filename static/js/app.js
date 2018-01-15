$('body').on('click', 'ul li a', function(event) {
  var tab = 'lvl' + $(this).attr('id').substr(3);
  rows = ''
  $.each(logs, function(k,v) {
    $.each(v, function(k2,v2) {
      rows += '<tr>';
      rows += '<td>' + k + '</td>';
      rows += '<td>' + v2.level + '</td>';
      rows += '<td>' + items[k2].name + '</td>';
      rows += '</tr>';
    });
  });
  $('#' + tab + ' table tbody').empty().append(rows);
});
