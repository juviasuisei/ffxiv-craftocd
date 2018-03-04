$('.tab-pane').each(function(k, v) {
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
    $('table').stickyTableHeaders();
});
processTable("5");

$('body').on('click', 'ul li a', function(event) {
    var lvl = $(this).attr('id').substr(3);
    processTable(lvl);
});

function processTable(lvl) {
    if(null == lvl.match(/[ABCD]/)) {
        processFive(lvl);
    } else {
        processStar(lvl);
    }
}

function standardLog(k, k2) {
    var blankLog = {
        'sub': 0,
        'ocd': ("1" == items[k2].ring && logs[k][k2].req ? 2 : 1),
        'leve': 0,
        'quest': 0,
    };
    return(blankLog);
}

function standardQuest(data, k, v2) {
    $.each(v2, function(k3, v3) {
        if (undefined == data[k][v3.item]) {
            data[k][v3.item] = {
                'sub': 0,
                'ocd': 0,
                'leve': 0,
                'quest': 0
            };
        }
        data[k][v3.item].quest += parseInt(v3.qty);
    });
    return(data);
}

function processStar(lvl) {
    var tempLogList = {};
    var lvlParts = lvl.match(/(\d+)([ABCD])/);
    var lvlDec = 0;
    switch(lvlParts[2]) {
        case 'A':
            lvlDec = .1;
            break;
        case 'B':
            lvlDec = .2;
            break;
        case 'C':
            lvlDec = .3;
            break;
        case 'D':
            lvlDec = .4;
            break;
    }
    lvl = parseInt(lvlParts[1]) + lvlDec;
    $.each(logs, function(k, v) {
        tempLogList[k] = {};
        $.each(v, function(k2, v2) {
            var recipeLvl = parseFloat(v2.level);
            if (lvl == recipeLvl) {
                tempLogList[k][k2] = standardLog(k, k2);
            }
        });
    });
    $.each(quests, function(k, v) {
        $.each(v, function(k2, v2) {
            var questLvl = parseFloat(k2);
            if (lvl == questLvl) {
                tempLogList = standardQuest(tempLogList, k, v2);
            }
        });
    });
    var handList = {};
    landList = {};
    $.each(tempLogList, function(k, v) {
        $.each(v, function(k2, v2) {
            if (undefined == handList[k + k2]) {
                handList[k + k2] = {
                    'hand': k,
                    'id': k2,
                    'sub': 0,
                    'ocd': 0,
                    'leve': 0,
                    'quest': 0
                };
            }
            var leve = parseInt(v2.leve);
            var quest = parseInt(v2.quest);
            var ocd = (0 == logs[k][k2].req && (0 < leve || 0 < quest) ? 0 : v2.ocd);
            handList[k + k2].ocd = ocd;
            handList[k + k2].leve = leve;
            handList[k + k2].quest = quest;
            handList = processRecipe(handList, k, k2, Math.ceil((ocd + leve + quest) / logs[k][k2].qty), true);
        });
    });
    $.each(handList, function(k, v) {
        if (0 != v.ocd && 0 == logs[v.hand][v.id].req && (0 < v.sub || 0 < v.leve || 0 < v.quest)) {
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
    $.each(landArray, function(k, v) {
        var item = findItem(v[0]);
        rows += '<tr>';
        rows += '<td>';
        rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
        rows += v[0] + '/" class="eorzeadb_link">';
        rows += item.name + '</a></td>';
        rows += '<td>' + v[1] + '</td>';
        rows += '<td><ul>';
        var locations = findLocations(v[0]);
        $.each(locations, function(k2, v2) {
            rows += '<li>' + v2 + '</li>';
        });
        rows += '</ul></td>';
        rows += '</tr>';
    });
    $('#lvl' + lvl + ' .land tbody').empty().append(rows);
    var handArray = [];
    $.each(handList, function(k, v) {
        handArray.push(v);
    });
    handArray.sort(function(a, b) {
        var aLvl = logs[a.hand][a.id].level;
        var bLvl = logs[b.hand][b.id].level;
        if (aLvl > lvl && bLvl <= lvl) {
            return (-1);
        }
        if (bLvl > lvl && aLvl <= lvl) {
            return (1);
        }
        if (aLvl > lvl && bLvl > lvl) {
            return (bLvl - aLvl);
        }
        if (aLvl != bLvl) {
            return (aLvl - bLvl);
        }
        if (a.sub != b.sub) {
            return (bQty - aQty);
        }
        var aQty = a.ocd + a.leve + a.quest + a.sub;
        var bQty = b.ocd + b.leve + b.quest + b.sub;
        if (aQty != bQty) {
            return (bQty - aQty);
        }
        if (a.sub != b.sub) {
            return (b.sub - a.sub);
        }
        var aHand = translateHand(a.hand);
        var bHand = translateHand(b.hand);
        if (aHand != bHand) {
            return (aHand - bHand);
        }
        var aName = items[a.id].name;
        var bName = items[b.id].name;
        if (aName == bName) {
            return (0);
        }
        return (aName > bName ? 1 : -1);
    });
    rows = ''
    $.each(handArray, function(k, v) {
        rows += '<tr>';
        rows += '<td>' + v.hand + '</td>';
        rows += '<td>' + logs[v.hand][v.id].level + '</td>';
        rows += '<td>';
        rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
        rows += v.id + '/" class="eorzeadb_link">';
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

function processFive(lvl) {
    var tempLogList = {};
    lvl = parseInt(lvl);
    $.each(logs, function(k, v) {
        tempLogList[k] = {};
        $.each(v, function(k2, v2) {
            var recipeLvl = parseInt(v2.level);
            if (lvl >= recipeLvl && (lvl - 4) <= recipeLvl) {
                tempLogList[k][k2] = standardLog(k, k2);
            }
        });
    });
    $.each(leves, function(k, v) {
        $.each(v.items, function(k2, v2) {
            var leveLvl = parseInt(k2);
            if (lvl > leveLvl && (lvl - 5) <= leveLvl) {
                $.each(v2, function(k3, v3) {
                    $.each(v3, function(k4, v4) {
                        if (undefined == tempLogList[k3][v4.item]) {
                            tempLogList[k3][v4.item] = {
                                'sub': 0,
                                'ocd': 0,
                                'leve': 0,
                                'quest': 0
                            };
                        }
                        tempLogList[k3][v4.item].leve += parseInt(v4.qty);
                    });
                });
            }
        });
    });
    $.each(quests, function(k, v) {
        $.each(v, function(k2, v2) {
            var questLvl = parseInt(k2);
            if (lvl >= questLvl && (lvl - 4) <= questLvl) {
                tempLogList = standardQuest(tempLogList, k, v2);
            }
        });
    });
    var handList = {};
    landList = {};
    $.each(tempLogList, function(k, v) {
        $.each(v, function(k2, v2) {
            if (undefined == handList[k + k2]) {
                handList[k + k2] = {
                    'hand': k,
                    'id': k2,
                    'sub': 0,
                    'ocd': 0,
                    'leve': 0,
                    'quest': 0
                };
            }
            var leve = parseInt(v2.leve);
            var quest = parseInt(v2.quest);
            var ocd = (0 == logs[k][k2].req && (0 < leve || 0 < quest) ? 0 : v2.ocd);
            handList[k + k2].ocd = ocd;
            handList[k + k2].leve = leve;
            handList[k + k2].quest = quest;
            handList = processRecipe(handList, k, k2, Math.ceil((ocd + leve + quest) / logs[k][k2].qty), true);
        });
    });
    $.each(handList, function(k, v) {
        if (0 != v.ocd && 0 == logs[v.hand][v.id].req && (0 < v.sub || 0 < v.leve || 0 < v.quest)) {
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
    $.each(landArray, function(k, v) {
        var item = findItem(v[0]);
        rows += '<tr>';
        rows += '<td>';
        rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
        rows += v[0] + '/" class="eorzeadb_link">';
        rows += item.name + '</a></td>';
        rows += '<td>' + v[1] + '</td>';
        rows += '<td><ul>';
        var locations = findLocations(v[0]);
        $.each(locations, function(k2, v2) {
            rows += '<li>' + v2 + '</li>';
        });
        rows += '</ul></td>';
        rows += '</tr>';
    });
    $('#lvl' + lvl + ' .land tbody').empty().append(rows);
    var handArray = [];
    $.each(handList, function(k, v) {
        handArray.push(v);
    });
    handArray.sort(function(a, b) {
        var aLvl = logs[a.hand][a.id].level;
        var bLvl = logs[b.hand][b.id].level;
        if (aLvl > lvl && bLvl <= lvl) {
            return (-1);
        }
        if (bLvl > lvl && aLvl <= lvl) {
            return (1);
        }
        if (aLvl > lvl && bLvl > lvl) {
            return (bLvl - aLvl);
        }
        if (aLvl != bLvl) {
            return (aLvl - bLvl);
        }
        if (a.sub != b.sub) {
            return (bQty - aQty);
        }
        var aQty = a.ocd + a.leve + a.quest + a.sub;
        var bQty = b.ocd + b.leve + b.quest + b.sub;
        if (aQty != bQty) {
            return (bQty - aQty);
        }
        if (a.sub != b.sub) {
            return (b.sub - a.sub);
        }
        var aHand = translateHand(a.hand);
        var bHand = translateHand(b.hand);
        if (aHand != bHand) {
            return (aHand - bHand);
        }
        var aName = items[a.id].name;
        var bName = items[b.id].name;
        if (aName == bName) {
            return (0);
        }
        return (aName > bName ? 1 : -1);
    });
    rows = ''
    $.each(handArray, function(k, v) {
        rows += '<tr>';
        rows += '<td>' + v.hand + '</td>';
        rows += '<td>' + logs[v.hand][v.id].level + '</td>';
        rows += '<td>';
        rows += '<a href="https://na.finalfantasyxiv.com/lodestone/playguide/db/item/';
        rows += v.id + '/" class="eorzeadb_link">';
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
    $.each(logs, function(k, v) {
        $.each(v, function(k2, v2) {
            if (id == k2) {
                recipes.push(k);
                return false;
            }
        });
    });
    return (recipes);
}

function processRecipe(data, type, log, qty, add) {
    $.each(logs[type][log].ingredients, function(k, v) {
        var subQty = parseInt(v) * qty;
        var recipes = findRecipe(k);
        var rlen = recipes.length;
        if (0 < rlen) {
            while (subQty > 0) {
                $.each(recipes, function(k2, v2) {
                    if (undefined == data[v2 + k]) {
                        data[v2 + k] = {
                            'hand': v2,
                            'id': k,
                            'sub': 0,
                            'ocd': 0,
                            'leve': 0,
                            'quest': 0
                        }
                    }

                    if(rlen > 1) {
                      var gut = data[v2 + k].sub;
                      var litmus = true;
                      $.each(recipes, function(k3,v3) {
                        if(v3 == v2) {
                          return true;
                        } else if(undefined == data[v3 + k]) {
                          data[v3 + k] = {
                              'hand': v3,
                              'id': k,
                              'sub': 0,
                              'ocd': 0,
                              'leve': 0,
                              'quest': 0
                          }
                          litmus = false;
                        } else if((data[v2 + k].sub - data[v3 + k].sub) > 1) {
                          litmus = false;
                        }
                      });
                      if(false == litmus) {
                        return true;
                      }
                    }

                    if (subQty-- > 0) {
                        if (add) {
                            data[v2 + k].sub += 1;
                        } else {
                            data[v2 + k].sub -= 1;
                        }
                        data = processRecipe(data, v2, k, 1, add);
                    }
                });
            }
        } else {
            if (undefined == landList[k]) {
                landList[k] = 0;
            }
            if (add) {
                landList[k] += subQty;
            } else {
                landList[k] -= subQty;
            }
        }
    });
    $.each(logs[type][log].crystals, function(k, v) {
        subQty = parseInt(v) * qty;
        if (undefined == landList[k]) {
            landList[k] = 0;
        }
        if (add) {
            landList[k] += subQty;
        } else {
            landList[k] -= subQty;
        }
    });
    return (data);
}

function findItem(id) {
    var item = false;
    $.each(items, function(k, v) {
        if (k == id) {
            item = v;
            return false;
        }
    });
    if (false == item) {
        $.each(crystals, function(k, v) {
            if (k == id) {
                item = v;
                return false;
            }
        });
    }
    return (item);
}

function findLocations(id) {
    var locations = [];
    if (undefined != items[id] && "1" == items[id].fish) {
        locations.push('FSH');
    } else if (undefined != items[id] && "1" == items[id].other) {
        locations.push('N/A');
    } else {
        var litmus = false;
        $.each(nodes, function(k, v) {
            $.each(v, function(k2, v2) {
                $.each(v2, function(k3, v3) {
                    $.each(v3, function(k4, v4) {
                        $.each(v4, function(k5, v5) {
                            $.each(v5, function(k6, v6) {
                                $.each(v6.items, function(k7, v7) {
                                    if (v7 == id) {
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
        if (false == litmus) {
            $.each(npcs, function(k, v) {
                $.each(v.items, function(k2, v2) {
                    if (v2 == id) {
                        locations.push('NPC ' + k + ' - ' + v.region + ' - ' + v.map + ' (' + v.x + ', ' + v.y + ')');
                    }
                });
            });
        }
    }
    return (locations);
}

function translateHand(hand) {
    var i = 0;
    switch (hand) {
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
    return (i);
}
