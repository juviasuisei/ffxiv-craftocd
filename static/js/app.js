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
  var fullList = {
    'CRP' : {},
    'BSM' : {},
    'ARM' : {},
    'GSM' : {},
    'LTW' : {},
    'WVR' : {},
    'ALC' : {},
    'CUL' : {},
  };
  $.each(list, function(k,v) {
    $.each(v, function(k2,v2) {
      if(undefined == fullList[k][k2]) {
        fullList[k][k2] = {
          'total' : 0,
          'sub' : 0,
          'ocd' : 0,
          'leve' : 0,
          'quest' : 0
        };
      }
      var ocd = ('CUL' == k && (0 < parseInt(v2.leve) || 0 < parseInt(v2.quest)) ? 0 : 1);
      fullList[k][k2].ocd = ocd;
      fullList[k][k2].leve = parseInt(v2.leve);
      fullList[k][k2].quest = parseInt(v2.quest);
      $.each(logs[k][k2].ingredients, function(k3,v3) {
        var recipes = findRecipe(k3);
        if(0 < recipes.length) {
          var r = parseInt(v3) % recipes.length;
          $.each(recipes, function(k4,v4) {
            fullList = processRecipe(fullList, k3, k4, parseInt(v4)/recipes.length + Math.Max(r--, 0));
          });
        }
      });
    });
  });
  $.each(fullList, function(k,v) {
    $.each(v, function(k2,v2) {
      rows += '<tr>';
      rows += '<td>' + k + '</td>';
      rows += '<td>' + logs[k][k2].level + '</td>';
      rows += '<td>';
      rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
      rows += items[k2].api + '/" class="eorzeadb_link">';
      rows += items[k2].name + '</a></td>';
      rows += '<td>' + (v2.sub + v2.ocd + v2.leve + v2.quest) + '</td>';
      rows += '<td>' + v2.sub + '</td>';
      rows += '<td>' + v2.ocd + '</td>';
      rows += '<td>' + v2.leve + '</td>';
      rows += '<td>' + v2.quest + '</td>';
      rows += '</tr>';
    });
  });
  $('#lvl' + lvl + ' table tbody').empty().append(rows);
}

function findRecipe(id) {
  var recipes = [];
  $.each(logs, function(k,v) {
    $.each(v, function(k2,v2) {
      if(id == k2) {
        recipes.push(k);
        return false;
      }
    });
  });
  return(recipes);
}

function processRecipe(data, type, recipe, qty) {
  
}
