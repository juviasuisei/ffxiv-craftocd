$('body').on('click', '#translate', function(event) {
  switch($('.active input').attr('id')) {
    case 'items':
      translateItems($('#data').val());
  }
});

function translateItems(data) {
  console.log(data);
  var items = {};
  $.each(data.split('\n'), function(k,r) {
    var col = r.split('\t');
    items[col[0]] = {
      'name' : col[1],
      'ring' : col[2],
      'fish' : col[3],
      'api' : col[4]
    }
  });
  console.log(items);
  displayJSON(items);
}

function displayJSON(data) {
  console.log(JSON.stringify(data));
  $('#result').val(JSON.stringify(data));
}
