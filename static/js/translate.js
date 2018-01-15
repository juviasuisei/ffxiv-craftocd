$('body').on('click', '#translate', function(event) {
  switch($('.active input').attr('id')) {
    case 'items':
      translateItems($('#data').val());
      break;
    case 'crystals':
      translateItems($('#data').val());
      break;
  }
});

function translateItems(data) {
  var temp_items = {};
  $.each(data.split('\n'), function(k,r) {
    var col = r.split('\t');
    temp_items[col[0]] = {
      'name' : col[1],
      'ring' : col[2],
      'fish' : col[3],
      'api' : col[4]
    }
  });
  displayJSON(temp_items);
}

function translateCrystals(data) {
  var temp_crystals = {};
  $.each(data.split('\n'), function(k,r) {
    var col = r.split('\t');
    temp_crystals[col[0]] = {
      'name' : col[1],
      'api' : col[4]
    }
  });
  displayJSON(temp_crystals);
}

function displayJSON(data) {
  $('#result').text(JSON.stringify(data));
}
