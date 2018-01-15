$('body').on('click', '#translate', function(event) {
  switch($('.active input').attr('id')) {
    case 'items':
      translateItems($('#data').val());
      break;
    case 'crystals':
      translateCrystals($('#data').val());
      break;
    case 'logs':
      translateLogs($('#data').val());
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

function translateLogs(data) {
  var temp_logs = {
    'CRP' : {},
    'BSM' : {},
    'ARM' : {},
    'GSM' : {},
    'LTW' : {},
    'WVR' : {},
    'ALC' : {},
    'CUL' : {}
  };
  $.each(data.split('\n'), function(k,r) {
    var col = r.split('\t');
    temp_logs[col[1]][findID(col[0])] = {
      'name' : col[0],
      'level' : col[2],
      'qty' : col[3],
      'crystals' : splitSeries(col[4], col[5], col[6], col[7]),
      'ingredients' : splitSeries(col[8], col[8], col[9], col[10], col[11], col[12], col[13], col[14], col[15], col[16])
    }
  });
  displayJSON(temp_logs);
}
function translateCrystals(data) {
  var temp_crystals = {};
  $.each(data.split('\n'), function(k,r) {
    var col = r.split('\t');
    temp_crystals[col[0]] = {
      'name' : col[1],
      'api' : col[2]
    }
  });
  displayJSON(temp_crystals);
}

function findID(name) {
  var id = false;
  $.each(crystals, function(k,v) {
    if(name == v.name) {
      id = k;
      break;
    }
  });
  if(false == id) {
    $.each(items, function(k,v) {
      if(name == v.name) {
        id = k;
        break;
      }
    });
  }
  if(false == id) {
    console.log(name);
  }
  return(id);
}

function splitSeries() {
  var sets = {};
  i = 0
  while(undefined != arguments[i]) {
    sets[findID(arguments[i + 1])] = arguments[i];
    i += 2;
  }
  return(sets);
}

function displayJSON(data) {
  $('#result').text(JSON.stringify(data));
}
