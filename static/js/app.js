$('.tab-pane').each(function(k,v) {
	var tables = '';
	tables += '<table class="table table-striped table-condensed land">';
	tables += '<thead>';
	tables += '<tr>';
	tables += '<th>Name</th>';
	tables += '<th>Qty</th>';
	tables += '<th>Available</th>';
	tables += '</tr>';
	tables += '</thead>';
	tables += '<tbody></tbody>';
	tables += '</table>';
	tables += '<table class="table table-striped table-condensed hand">';
	tables += '<thead>';
	tables += '<tr>';
	tables += '<th>Class</th>';
	tables += '<th>Level</th>';
	tables += '<th>Name</th>';
	tables += '<th>Total</th>';
	tables += '<th>Ing.</th>';
	tables += '<th>OCD</th>';
	tables += '<th>Leve</th>';
	tables += '<th>Quest</th>';
	tables += '</tr>';
	tables += '</thead>';
	tables += '<tbody></tbody>';
	tables += '</table>';
	$(this).append(tables);
});
processTable(5);


$('body').on('click', 'ul li a', function(event) {
  var lvl = parseInt($(this).attr('id').substr(3));
  processTable(lvl);
});

function processTable(lvl) {
  var tempLogList = {};
  $.each(logs, function(k,v) {
    tempLogList[k] = {};
    $.each(v, function(k2,v2) {
      var recipeLvl = parseInt(v2.level);
      if(lvl >= recipeLvl && (lvl - 4) <= recipeLvl) {
        tempLogList[k][k2] = {
          'sub' : 0,
          'ocd' : ("1" == items[k2].ring ? 2 : 1),
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
            if(undefined == tempLogList[k3][v4.item]) {
              tempLogList[k3][v4.item] = {
                'sub' : 0,
                'ocd' : 0,
                'leve' : 0,
                'quest' : 0
              };
            }
            tempLogList[k3][v4.item].leve += parseInt(v4.qty);
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
          if(undefined == tempLogList[k][v3.item]) {
            tempLogList[k][v3.item] = {
              'sub' : 0,
              'ocd' : 0,
              'leve' : 0,
              'quest' : 0
            };
          }
          tempLogList[k][v3.item].quest += parseInt(v3.qty);
        });
      }
    });
  });
  var handList = {};
	landList = {};
  $.each(tempLogList, function(k,v) {
    $.each(v, function(k2,v2) {
      if(undefined == handList[k + k2]) {
        handList[k + k2] = {
          'hand' : k,
          'id' : k2,
          'sub' : 0,
          'ocd' : 0,
          'leve' : 0,
          'quest' : 0
        };
      }
      var leve = parseInt(v2.leve);
      var quest = parseInt(v2.quest);
			var ocd = (0 == logs[k][k2].req && (0 < leve || 0 < quest) ? 0 : v2.ocd);
      handList[k + k2].ocd = ocd;
      handList[k + k2].leve = leve;
      handList[k + k2].quest = quest;
      handList = processRecipe(handList, k, k2, Math.ceil((ocd + leve + quest)/logs[k][k2].qty), true);
    });
  });
	$.each(handList, function(k,v) {
    if(0 != v.ocd && 0 == logs[v.hand][v.id].req && (0 < v.sub || 0 < v.leve || 0 < v.quest)) {
      handList[k].ocd = 0;
      handList = processRecipe(handList, v.hand, v.id, 1, false);
    }
	});
  var landArray = Object.keys(landList).map(function(k) {
    return [k, landList[k]];
  });
  landArray.sort(function(a, b) {
    return b[1] - a[1];
  });
  var rows = ''
  $.each(landArray, function(k,v) {
    var item = findItem(v[0]);
		rows += '<tr>';
    rows += '<td>';
    rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
    rows += item.api + '/" class="eorzeadb_link">';
    rows += item.name + '</a></td>';
		rows += '<td>' + v[1] + '</td>';
		rows += '<td><ul>';
		var locations = findLocations(v[0]);
		$.each(locations, function(k2,v2) {
			rows += '<li>' + v2 + '</li>';
		});
		rows += '</ul></td>';
		rows += '</tr>';
  });
  $('#lvl' + lvl + ' .land tbody').empty().append(rows);
  var handArray = [];
  $.each(handList, function(k,v) {
    handArray.push(v);
  });
  handArray.sort(function(a,b) {
    var aLvl = logs[a.hand][a.id].level;
    var bLvl = logs[b.hand][b.id].level;
    if(aLvl > lvl && bLvl <= lvl) {
      return(-1);
    }
    if(bLvl > lvl && aLvl <= lvl) {
      return(1);
    }
    if(aLvl > lvl && bLvl > lvl) {
      return(bLvl - aLvl);
    }
    if(aLvl != bLvl) {
      return(aLvl - bLvl);
    }
    var aQty = a.ocd + a.leve + a.quest + a.sub;
    var bQty = b.ocd + b.leve + b.quest + b.sub;
    if(aQty != bQty) {
      return(bQty - aQty);
    }
    if(a.sub != b.sub) {
      return(b.sub - a.sub);
    }
    var aHand = translateHand(a.hand);
    var bHand = translateHand(b.hand);
    if(aHand != bHand) {
      return(aHand - bHand);
    }
    var aName = items[a.id].name;
    var bName = items[b.id].name;
    if(aName == bName) {
        return(0);
    }
    return(aName > bName ? 1 : -1);
  });
  rows = ''
  $.each(handArray, function(k,v) {
    rows += '<tr>';
    rows += '<td>' + v.hand + '</td>';
    rows += '<td>' + logs[v.hand][v.id].level + '</td>';
    rows += '<td>';
    rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
    rows += items[v.id].api + '/" class="eorzeadb_link">';
    rows += items[v.id].name + '</a></td>';
    rows += '<td>' + (v.sub + v.ocd + v.leve + v.quest) + '</td>';
    rows += '<td>' + v.sub + '</td>';
    rows += '<td>' + v.ocd + '</td>';
    rows += '<td>' + v.leve + '</td>';
    rows += '<td>' + v.quest + '</td>';
    rows += '</tr>';
  });
  $('#lvl' + lvl + ' .hand tbody').empty().append(rows);
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

function processRecipe(data, type, log, qty, add) {
  $.each(logs[type][log].ingredients, function(k,v) {
    var subQty = parseInt(v) * qty;
    var recipes = findRecipe(k);
    if(0 < recipes.length) {
      while(subQty > 0) {
        $.each(recipes, function(k2,v2) {
          if(undefined == data[v2+k]) {
            data[v2+k] = {
              'hand' : v2,
              'id' : k,
							'sub' : 0,
							'ocd' : 0,
							'leve' : 0,
							'quest' : 0
						}
					}
					if(subQty-- > 0) {
						if(add) {
							data[v2+k].sub += 1;
						} else {
							data[v2+k].sub -= 1;
						}
						data = processRecipe(data, v2, k, 1, add);
					}
				});
			}
    } else {
			if(undefined == landList[k]) {
				landList[k] = 0;
			}
			if(add) {
				landList[k] += subQty;
			} else {
				landList[k] -= subQty;
			}
		}
  });
  $.each(logs[type][log].crystals, function(k,v) {
		subQty = parseInt(v) * qty;
		if(undefined == landList[k]) {
			landList[k] = 0;
		}
		if(add) {
			landList[k] += subQty;
		} else {
			landList[k] -= subQty;
		}
	});
  return(data);
}

function findItem(id) {
	var item = false;
	$.each(items, function(k,v) {
		if(k == id) {
			item = v;
			return false;
		}
	});
	if(false == item) {
		$.each(crystals, function(k,v) {
			if(k == id) {
				item = v;
				return false;
			}
		});
	}
	return(item);
}

function findLocations(id) {
	var locations = [];
	if(undefined != items[id] && "1" == items[id].fish) {
		locations.push('FSH');
	} else {
		var litmus = false;
		$.each(nodes, function(k,v) {
			$.each(v, function(k2,v2) {
				$.each(v2, function(k3,v3) {
					$.each(v3, function(k4,v4) {
						$.each(v4, function(k5,v5) {
							$.each(v5, function(k6,v6) {
								$.each(v6.items, function(k7,v7) {
									if(v7 == id) {
										litmus = true;
										locations.push(k + ' ' + k2 + ' - ' + k3 + ' - ' + k4 + ' - ' + k5 + ' - ' + v6.level);
									}
								});
							});
						});
					});
				});
			});
		});
		if(false == litmus) {
			$.each(npcs, function(k,v) {
				$.each(v.items, function(k2,v2) {
					if(v2 == id) {
						locations.push('NPC ' + k + ' - ' + v.region + ' - ' + v.map + ' (' + v.x + ', ' + v.y + ')');
					}
				});
			});
		}
	}
	return(locations);
}

function translateHand(hand) {
  var i = 0;
  switch(hand) {
    case 'CRP':
      i = 1;
      break;
    case 'BSM':
      i = 2;
      break;
    case 'ARM':
      i = 3;
      break;
    case 'GSM':
      i = 4;
      break;
    case 'LTW':
      i = 5;
      break;
    case 'WVR':
      i = 6;
      break;
    case 'ALC':
      i = 7;
      break;
    case 'CUL':
      i = 8;
      break;
  }
  return(i);
}
