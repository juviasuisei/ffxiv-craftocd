$('.tab-pane').each(function(k, v) { // populate each of the tabs with the 2 empty tables required
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
//  $('table').stickyTableHeaders(); // make the table headings sticky
});
processTable("5"); // default to showing the full data for level 5

var leftovers = {}; // for use with recipes that make more than 1
var twinsies = {}; // for use with recipes that can be made by more than 1 class
var landList = {}; // for use with non-crafting data

$('body').on('click', 'ul li a', function(event) { // only generate the table whenever someone clicks a tab
  var lvl = $(this).attr('id').substr(3);
  processTable(lvl);
});

function processTable(lvl) { // determine how many levels to process
  if(null == lvl.match(/[ABCD]/)) { // check for star classification
    if(lvl > 50) { // after 50 the gaps are no longer every 5
      switch(lvl.toString().substring(1)) { // check the second digit to determine which type
        case '3':
        case '8':
          process(lvl, 3, false); // e.g., 51-53, 56-58
          break;
        case '5':
        case '0':
          process(lvl, 2, false); // e.g., 54-55, 59-60
          break;
      }
    } else { // 50 and before 50 it goes in sets of five
      process(lvl, 5, false); // e.g., 1-5, 6-10
    }
  } else { // if it is a star classification
    process(lvl, 0, true); // special consideration is given regarding the number of stars
  }
}

function process(lvl, range, star) { // build the object of data to be used to generate the table
  if(true == star) { // get the dot version of the star levels
    var lvlParts = lvl.match(/(\d+)([ABCD])/); // split apart the digits from the designation
    var lvlDec = ''; // default value in case it failes
    switch(lvlParts[2]) { // the second half of the regex results has the designation
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
    var lvlFloat = parseInt(lvlParts[1]) + lvlDec; // create the float version by combining the two parts
  }
  var handList = {}; // the object to be built up
  $.each(logs, function(k, v) { // loop through the crafting logs looking for ones that match
    $.each(v, function(k2, v2) { // loop through each class' data looking for ones that match
      var recipeLvl = parseInt(v2.level); // ensure the level of the recipe is an integer
      var recipeLvlFloat = parseFloat(v2.level); // create the float version as well
      if((true == star && lvlFloat == recipeLvlFloat) || // if it is a star it should be an exact match OR
        (lvl >= recipeLvl && // high end of the range we're looking for
        (lvl - range + 1) <= recipeLvl && // low end of the range we're looking for
        -1 == v2.level.indexOf('.'))) { // this recipe isn't a star recipe (parseInt will deceptively turn those into what look like regular recipes)
        handList[k + k2] = standardLog(); // generate an empty record
        handList[k + k2].hand = k; // set the class
        handList[k + k2].id = k2; // set the lodestone ID
        handList[k + k2].ocd = ("1" == items[k2].ring && logs[k][k2].req ? 2 : 1) // set the OCD value (2 if it is a ring; otherwise 1)
      }
    });
  });
  $.each(leves, function(k, v) { // loop through the leves looking for ones that match
    $.each(v.items, function(k2, v2) { // leves are organized by leve giver; loop through each giver's data
      var leveLvl = parseFloat(k2); // ensure the level of the leve is a float
      if((true == star && lvlFloat == leveLvl) || // if it is a star it should be an exact match OR
        (lvl > leveLvl && // high end of the range we're looking for
        (lvl - range) <= leveLvl)) { // low end of the range we're looking for
        $.each(v2, function(k3, v3) { // levels of a leve giver are organized by class; loop through each class' data
          $.each(v3, function(k4, v4) { // each class has multiple leve turn-ins; loop through each turn-in to add it
            if(undefined == handList[k3 + v4.item]) { // if this item is not in the list generated above instantiate a blank sub-object for the item
              handList[k3 + v4.item] = standardLog(); // generate an empty record
              handList[k3 + v4.item].hand = k3; // set the class
              handList[k3 + v4.item].id = v4.item; // set the lodestone ID
            }
            handList[k3 + v4.item].leve += parseInt(v4.qty); // increase the current item's leve quantity
          });
        });
      }
    });
  });
  $.each(quests, function(k, v) { // loop thorugh the quests looking for ones that match
    $.each(v, function(k2, v2) { // quests are organized by class; loop through each class' data
      var questLvl = parseFloat(k2); // ensure the level of the quest is a float
      if((true == star && lvlFloat == questLvl) || // if it is a star it should be an exact match OR
        (false == star && // not a star
        lvl >= questLvl && // high end of the range we're looking for
        (lvl - range + 1) <= questLvl)) { // low end of the range we're looking for
        $.each(v2, function(k3, v3) { // each level of a quest can have multiple turn-ins; loop through each turn-in to add it
          if(undefined == handList[k + v3.item]) { // if this item is not in the list generated above instantiate a blank sub-object for the item
            handList[k + v3.item] = standardLog(); // generate an empty record
            handList[k + v3.item].hand = k; // set the class
            handList[k + v3.item].id = v3.item; // set the lodestone ID
          }
          handList[k + v3.item].quest += parseInt(v3.qty); // increase the current item's quest quantity
        });
      }
    });
  });
  leftovers = {}; // blank out leftovers
  twinsies = {}; // blank out twinsies
  landList = {}; // blank out the land list
  $.each(handList, function(k, v) { // loop through all the crafting logs
    handList[k].ocd = (0 == logs[v.hand][v.id].req && (0 < v.leve || 0 < v.quest) ? 0 : v.ocd); // if the item wasn't required and a leve or quest requires it, reset OCD to 0
    var total = v.ocd + v.leve + v.quest; // shortcut for total needed
    var produced = parseInt(logs[v.hand][v.id].qty); // shortcut for total produced
    var needed = Math.ceil(total/produced); // shortcut for total crafts required
    if(1 < produced) { // if this item produces more than 1
      leftovers[k] = { 'left' : (needed * produced) - total, 'qty' : produced }; // add it to the tracker
    }
    handList = processRecipe(handList, v.hand, v.id, needed, true); // process the recipe for the amount needed
  });
  $.each(handList, function(k, v) { // loop through one last time to back out of any OCD items that are no longer needed
    if(0 != v.ocd && // if the item was being done for OCD
      0 == logs[v.hand][v.id].req && // and it isn't required
      0 < v.sub) { // and it ended up being used as a sub-item in another recipe
        handList = processRecipe(handList, v.hand, v.id, v.ocd, false); // re-process the recipe removing the instance crafted just for OCD
        handList[k].ocd = 0; // set its OCD value back to 0
    }
  });

  // all the below is not yet commented but works as intended; basically the objects get flipped into arrays and then looped through writing out table rows
  // this definitely seems like it could be made more efficient
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
        var lvlShow = logs[v.hand][v.id].level.toString();
        if(null != lvlShow.match(/\./)) {
            var lvlParts = lvlShow.match(/(\d+)\.(\d+)/);
            lvlShow = lvlParts[1];
            lvlParts[2] = parseInt(lvlParts[2]);
            while(lvlParts[2]-- > 0) {
                lvlShow += '<span class="small">&#x2605;</span>';
            }
        }
        rows += '<td>' + lvlShow + '</td>';
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

function standardLog() { // used when generating a blank record in the crafting log
    var blankLog = {
        'hand' : '', // crafting class of the item
        'id' : '', // lodestone ID of the item
        'sub': 0, // how many are needed because it is a prerequisite ingredient
        'ocd': 0, // how many are needed for OCD
        'leve': 0, // how many are needed for relevant leves
        'quest': 0, // how many are needed for relevant quests
    };
    return(blankLog);
}

function processRecipe(data, type, log, qty, add) {
  $.each(logs[type][log].ingredients, function(k, v) { // loop through all the ingredients in the item being processed
    var subQty = parseInt(v) * qty; // get the true number needed of the ingredient
    var recipes = findRecipe(k); // locate all instances of the ingredient
    var rlen = recipes.length; // length is used enough it should be calculated once for efficiency
    if(0 < rlen) { // if the array isn't empty it means it can be crafted
      $.each(recipes, function(k2, v2) { // loop through the recipes
        if(undefined == data[v2 + k]) { // if this item is not in the list generated above instantiate a blank sub-object for the item
          data[v2 + k] = standardLog(); // generate an empty record
          data[v2 + k].hand = v2; // set the class
          data[v2 + k].id = k; // set the lodestone ID
        }
      });
      while(subQty-- > 0) { // process each sub quantity one at a time
        var loopid = recipes[0] + k; // default to using the first item in the recipes results
        var produced = logs[recipes[0]][k].qty; // default to using the first item in the recipe results' quantity produced
        if(rlen > 1) { // if there is more than one recipe keep it balanced
          loopid = twinsies[k].types[twinsies[k].pointer] + k; // use the recipe being pointed to
          produced = logs[twinsies[k].types[twinsies[k].pointer]][k].qty; // use the quantity produced of the recipe being pointed to
          twinsies[k].pointer = (twinsies[k].pointer + 1) % twinsies[k].modulus; // update the pointer to the next item
        }
        if(undefined != leftovers[loopid]) { // check if this is an item that produces more than 1
          if(0 < leftovers[loopid].left) { // if there are items leftover from the last crafting
            if(true == add) { // if this is an addition process
              data[loopid].sub++; // add one to the sub-ingredient counter
              leftovers[loopid].left--; // use up one of the leftovers
            } else { // if this is a subtraction process
              data[loopid].sub--; // remove one from the sub-ingredient counter
              leftovers[loopid].left++; // add back a leftover
              if(leftovers[loopid].left == leftovers[loopid].qty) { // if this caused us to have an entire craft's worth leftover
                data = processRecipe(data, loopid.substr(0,3), loopid.substr(3), 1, false); // incept, removing one craft's worth of that ingredient
              }
            }
          } else { // if there are no items left over from the last crafting
            if(true == add) { // if this is an addition process
              data[loopid].sub++; // add one to the sub-ingredient counter
              leftovers[loopid].left = leftovers[loopid].qty - 1; // reset the tracker but use up one
              data = processRecipe(data, loopid.substr(0,3), loopid.substr(3), 1, true); // incept, adding one craft's worth of that ingredient
            } else { // if this is a subtraction process
              data[loopid].sub--; // remove one from the sub-ingredient counter
              leftovers[loopid].left++; // add back a leftover
            }
          }
        } else { // if this is an item that only produces one
          if(true == add) { // if this is an addition process
            data[loopid].sub++; // add one to the sub-ingredient counter
          } else { // if this is a subtraction process
            data[loopid].sub--; // remove one from the sub-ingredient counter
          }
          data = processRecipe(data, loopid.substr(0,3), loopid.substr(3), 1, add); // incept, processing the change in sub-ingredient counts
        }
      }
    } else { // this is an item that cannot be crafted
      if(undefined == landList[k]) { // check if this is already in the land list
        landList[k] = 0; // instantiate it if not
      }
      if(true == add) { // if this is an addition process
        landList[k] += subQty; // add the sub quantity to the land tracker
      } else { // if this is a substraction process
        landList[k] -= subQty; // remove the sub quantity from the land tracker
      }
    }
  });
  $.each(logs[type][log].crystals, function(k, v) { // loop through all the crystals in the item being processed
    subQty = parseInt(v) * qty; // get the true number needed of the crystal
    if(undefined == landList[k]) { // check if this is already in the land list
      landList[k] = 0; // instantiate it if not
    }
    if(true == add) { // if this is an addition process
      landList[k] += subQty; // add the sub quantity to the land tracker
    } else { // if this is a substraction process
      landList[k] -= subQty; // remove the sub quantity from the land tracker
    }
  });
  return(data); // return the modified data
}

function findRecipe(id) {
  var recipes = []; // instantiate an empty return array
  $.each(logs, function(k, v) { // loop through all the classes
    $.each(v, function(k2, v2) { // loop through all the recipes in a class
      if(id == k2) { // if the recipe ID matches
        recipes.push(k); // add it to the array
        if(1 < parseInt(v2.qty) && undefined == leftovers[k + k2]) { // if the recipe produces more than 1 and it isn't already in the leftovers tracker
          leftovers[k + k2] = { 'left' : 0, 'qty' : parseInt(v2.qty) }; // instantiate the tracker
        }
        return false; // stop looping through this class because there should only be a maximum of one per class
      }
    });
  });
  if(1 < recipes.length) { // if there is more than one result ensure it is in the twinsies tracker
    if(undefined == twinsies[id]) { // if it doesn't exist already in the tracker
      twinsies[id] = { 'types' : [], 'pointer' : 0, 'modulus' : recipes.length }; // instantiate the tracker
      $.each(recipes, function(k, v) { // loop through the found recipes populating it
        twinsies[id].types.push(v); // add the class
      });
    }
  }
  return (recipes); // return the recipes array
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
