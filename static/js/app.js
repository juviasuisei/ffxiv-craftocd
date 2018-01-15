processTable(5);

$('body').on('click', 'ul li a', function(event) {
  var lvl = parseInt($(this).attr('id').substr(3));
  processTable(lvl);
});

function processTable(lvl) {
  var list = {};
  var rows = ''
  $.each(logs, function(k,v) {
    list[k] = {};
    $.each(v, function(k2,v2) {
      var recipeLvl = parseInt(v2.level);
      if(lvl >= recipeLvl && (lvl - 4) <= recipeLvl) {
        list[k][k2] = {
          'sub' : 0,
          'check' : 1,
          'leve' : 0,
          'quest' : 0,
        };
      }
    });
  });
  $.each(leves, function(k,v) {
    $.each(v.items, function(k2,v2) {
      var leveLvl = parseInt(k2);
      if(lvl >= leveLvl && (lvl - 4) <= leveLvl) {
        $.each(v2, function(k3,v3) {
          $.each(v3, function(k4,v4) {
            if(undefined == list[k3][v4.item]) {
              list[k3][v4.item] = {
                'sub' : 0,
                'check' : 0,
                'leve' : 0,
                'quest' : 0
              };
            }
            list[k3][v4.item].leve += parseInt(v4.qty);
          });
        });
      }
    });
  });
  $.each(quests, function(k,v) {
    $.each(v, function(k2,v2) {
      var questLvl = parseInt(k2);
      if(lvl >= questLvl && (lvl - 4) <= questLvl) {
        $.each(v2, function(k3,v3) {
          if(undefined == list[k][v3.item]) {
            list[k][v3.item] = {
              'sub' : 0,
              'check' : 0,
              'leve' : 0,
              'quest' : 0
            };
          }
          list[k][v3.item].quest += parseInt(v3.qty);
        });
      }
    });
  });
  $.each(list, function(k,v) {
    $.each(v, function(k2,v2) {
      rows += '<tr>';
      rows += '<td>' + k + '</td>';
      rows += '<td>' + logs[k][k2].level + '</td>';
      rows += '<td>';
      rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
      rows += items[k2].api + '/" class="eorzeadb_link">';
      rows += items[k2].name + '</a></td>';
      var total = 1 + v2.leve + v2.quest;
      rows += '<td>' + total + '</td>';
      rows += '<td>' + v2.leve + '</td>';
      rows += '<td>' + v2.quest + '</td>';
      rows += '</tr>';
    });
  });
  $('#lvl' + lvl + ' table tbody').empty().append(rows);
}
