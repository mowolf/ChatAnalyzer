// add file listener for chat file
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);

//Read File
function readSingleFile(e) {

  var file = e.target.files[0];

  if ((!file) || (file.type != "text/plain")) {
    console.log("ERROR! No txt file selected!");
    var er = document.getElementById("error");
    er.style.display = "block";
    // hide old results
    var res = document.getElementById("results");
    res.style.display = "none";
    return;
  }

  // Show loading
  var d = document.getElementById("loading");
  d.style.display = "block";

  var reader = new FileReader();

  // execude on load of file
  reader.onload = function(e) {
    //
    var contents = e.target.result;
    // get data in right format
    var structArray = createStructs(createArray(contents));
    // checks if group chat
    // hide error groups
    var d = document.getElementById("groups");
    d.style.display = "none";
    if (structArray.length > 2) {
      // groups not supported yet!

      var div = document.createElement('div');
      div.className = 'col-sm';
      div.innerHTML = "<p>If you get this error even though this is no group chat you have probably copy-pased a chat in your chat. These are all the names I found. Trying to analyze these two people.</p>" +
                        structArray[0].name+structArray[1].name;
      document.getElementById('groups').appendChild(div);

      var res = document.getElementById("groups");
      res.style.display = "block";

      structArray = [structArray[0],structArray[1]];
    }

    displayContents(structArray);

    // Hide Loading
    var d = document.getElementById("loading");
    d.style.display = "none";
    // Hide tutorial
    var d = document.getElementById("tutorial");
    d.style.display = "none";
    // Hide Error
    var d = document.getElementById("error");
    d.style.display = "none";
    // show result page
    var d = document.getElementById("results");
    d.style.display = "block";

  };
  reader.readAsText(file);
}

// Display all data
function displayContents(contents) {

  // TODO: add group support (make carousell for groups)
  // TODO: add words per messages and plot the change over time
  // TODO: Make sure all variables are resetted when choosing the next file! -> write initalizer

  // contents is an object: name, message, date, time

  // User specific  ------------------------------------------------
  var wordsPerMessage = [];
  var messagesCount = [0,0];
  for (var i = 0; i < 2; i++) {
  // message Count ----------------------------------------

  messagesCount[i] = contents[i].message.length;

  // Words per message ------------------------------------
  // returns [avergeWordsPerMessage,tolatWords];
  wordsPerMessage[i] = calcWordsPerMessage(contents[i].message);

  // Most used words --------------------------------------
  var Words = getWordCount(contents[i].message);
  // ATTENTION: These strings have some weird invisible space character between "<" and "bild" !!!!
  // TODO: BUG: Support all img variants
  var str4Pic = ["_<‎bild","_<‎picture"];
  var sentPicsIndex = [-1,-1];
  var sentAudioIndex = [-1,-1];
  var sentAudioCount = [0,0];
  var sentPicsCount = [0,0];

  // create &sort most Used array
  mostUsed = [["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],
                    ["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],
                    ["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],["",0],];
  var size = 0;
  for (var key in Words) {
    if (Words.hasOwnProperty(key)) size++;
  }
  for (var key in Words) {
      if (Words.hasOwnProperty(key)) {
        // evaluate the rest
        for (var j = 0; j < size; j++) {
          if (Words[key] > mostUsed[j][1]){
            mostUsed.splice( j, 0, [key, Words[key]]);
            break;
          }
        }
      }
    }

    // evaluate how many pics were sent
    for (var j = 0; j < mostUsed.length; j++) {
      if (mostUsed[j][0] == str4Pic[0]) {
        sentPicsIndex[i] = j;
        sentPicsCount[i] = mostUsed[j][1];
        break;
      }
    }
    // console.log(mostUsed);
    // remove it from the array
    mostUsed.splice(sentPicsIndex[i], 1);

    // --  evaluate how many audio files were sent
    for (var j = 0; j < mostUsed.length; j++) {
      if (mostUsed[j][0] == "_<‎audio") {
        sentAudioIndex[i] = j;
        sentAudioCount[i] = mostUsed[j][1];
        break;
      }
    }
    // remove it from array
    mostUsed.splice(sentAudioIndex[i], 1);

    // renove unwanted words
    // find position of "weggelassen>"
    // TODO: Add other languages
    var endOfMedia = ["_weggelassen>"];

    for (var j = 0; j < mostUsed.length; j++) {
      if (mostUsed[j][0] == endOfMedia[0]) {
        mostUsed.splice(j, 1);
        break;
      }
    }
    for (var j = 0; j < mostUsed.length; j++) {
      if (mostUsed[j][0] == "") {
        mostUsed.splice(sentPicsIndex[j], 1);
        break;
      }
    }
    // filter out most common words

    // Most used emojies

    // HTML CONSTRUCTION ------------------------------------
    var mostUsedHTML ="";
    //console.log(wordsPerMessage[i][1]);
    if (mostUsed.length > 29) {
      max = 30;
    } else {
      max = mostUsed.length;
    }

    for (var j = 0; j < max; j++) {
      mostUsedHTML = mostUsedHTML + "<p>" + mostUsed[j][0].substring(1) +" - "+ Math.round(mostUsed[j][1]/wordsPerMessage[i][1]*1000)/10 + "%</p>";
    }
    var btn = "<button type='button' class='btn' data-toggle='collapse' data-target='#mostUsed"+i+"''>" +
              "<i class='fas fa-chevron-down'></i></button>";


    // clear data from previous analyzations
    if (i == 0) {
      document.getElementById('users').innerHTML = "";
    }
    var div = document.createElement('div');
    div.className = 'col-sm';
    div.innerHTML = "<h4>" + contents[i].name + "</h4>" +
                    "<p> Messages sent: <b>" + messagesCount[i] + "</b></p>" +
                    "<p> Words per Message: <b>" + wordsPerMessage[i][0] + "</b></p>" +
                    "<p> Pictures sent: <b>" + sentPicsCount[i] + "</b></p>" +
                    //"<p> Audio sent:" + sentAudioCount[i] + "</p>" +
                    "<p>"+ btn + "<b> Most used words:</b></p>"+
                    "<div id='mostUsed"+i+"' class='collapse in'>" + mostUsedHTML + "</div>";
    document.getElementById('users').appendChild(div);

  }

  // TODO:words bar Graph
/*
  for (var i = 0; i < 30; i++) {
    barData = mostUsed[i][0];
    barLabes = mostUsed[i][1];
  }
  new Chart(
      document.getElementById("barWords"),
      {
      "type":"bar",
      "data":{"labels":[ ['Monday', ''],"Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "datasets":[
        {"label":barLabes,
        "data":barData,
        "fill":true,"backgroundColor":"rgba(20, 168, 204, 0.2)",
        "borderColor":"rgb(20, 168, 204)",
        "pointBackgroundColor":"rgb(20, 168, 204)",
        "pointBorderColor":"#fff","pointHoverBackgroundColor":"#fff",
        "pointHoverBorderColor":"rgb(20, 168, 204)"}],
        options: {
        legend: {
          display: false
      },
      layout: {
          padding: {
            top: 20
          }
      },
      showLabelsOnBars:true,
      barLabelFontColor:"gray",
      animation: {
          duration: 0
      },
      scales: {
          yAxes: [{
              stacked: true,
              display: false,
              ticks: {
                  beginAtZero:true
              }
          }],
          xAxes: [{
              stacked: true,
              id:"ejeX",
              ticks: {
                  beginAtZero:true,
                  fontSize: 30
                  }}]
          },
          plugins: {
              datalabels: {
                color: 'black',
                font: {size: 24},
                  display: true
              }
          }
      }
      });
*/
  // factors ------------------------------------------------------
  // find who writes more
  if (contents[0].message.length > contents[1].message.length) {
    var n0 = 0;
    var n1 = 1;
  } else {
    var n0 = 1;
    var n1 = 0;
  }
  // calculate factors
  var factorF = Math.round((contents[n0].message.length/contents[n1].message.length)*100)/100;
  var wpmF = Math.round(wordsPerMessage[n0][0]/wordsPerMessage[n1][0]*100)/100;
  var wpm = "And " + contents[n0].name + " messages contain <b>" + wpmF + "</b> times the words of " +contents[n1].name + " messages!</b>";
  var percent = Math.round((wpmF)*factorF*100);
  if (percent >= 1) {
    percent = percent.toString().substring(1,3)  + "</b>% more words!";
  } else {
    percent = percent  + "</b>% less words!";
  }

// Messages per Day Radar -----------------------------------------
  var dayCount = [getMessagesPerDay(contents[0].date), getMessagesPerDay(contents[1].date)];
  new Chart(
        document.getElementById("dayRadar"),
        {
        type:"radar",
        data:{labels:[ ["Sunday", ""],"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        datasets:[
          {label:contents[0].name,
          data:dayCount[0],
          fill:true,
          backgroundColor:"rgba(20, 168, 204, 0.2)",
          borderColor:"rgb(20, 168, 204)",
          pointBackgroundColor:"rgb(20, 168, 204)",
          pointBorderColor:"#fff",
          pointHoverBackgroundColor:"#fff",
          pointHoverBorderColor:"rgb(20, 168, 204)"},
          {label:contents[1].name,
          data:dayCount[1],
          fill:true,
          backgroundColor:"rgba(255, 72, 64, 0.2)",
          borderColor:"rgb(255, 72, 64)",
          pointBackgroundColor:"rgb(255, 72, 64)",
          pointBorderColor:"#fff",
          pointHoverBackgroundColor:"#fff",
          pointHoverBorderColor:"rgb(255, 72, 64)"}]},
        options:{
            elements:{
              line:{
                tension:0,
                borderWidth:3
              }
            },
            scale:{
              ticks: {
                beginAtZero: true
              },
              pointLabels :{
                fontStyle: "bold",
                fontColor: 'black',
                fontSize: 14
              }
            }
          }
        });

// chronological Graph

  // returns struct "date count indexStart"
  messageCount = [countMessages(contents[0].date), countMessages(contents[1].date)];

  // BUG: not in ISO format!!
  formatedStruct = addMissingDays(messageCount);

  // better tooltips
  	Chart.defaults.global.pointHitDetectionRadius = 1;

    var customTooltips = function(tooltip) {
  			// Tooltip Element
  			var tooltipEl = document.getElementById('chartjs-tooltip');

  			if (!tooltipEl) {
  				tooltipEl = document.createElement('div');
  				tooltipEl.id = 'chartjs-tooltip';
  				tooltipEl.innerHTML = '<table></table>';
  				this._chart.canvas.parentNode.appendChild(tooltipEl);
  			}

  			// Hide if no tooltip
  			if (tooltip.opacity === 0) {
  				tooltipEl.style.opacity = 0;
  				return;
  			}

  			// Set caret Position
  			tooltipEl.classList.remove('above', 'below', 'no-transform');
  			if (tooltip.yAlign) {
  				tooltipEl.classList.add(tooltip.yAlign);
  			} else {
  				tooltipEl.classList.add('no-transform');
  			}

  			function getBody(bodyItem) {
  				return bodyItem.lines;
  			}

  			// Set Text
  			if (tooltip.body) {
  				var titleLines = tooltip.title || [];
  				var bodyLines = tooltip.body.map(getBody);

  				var innerHtml = '<thead>';

  				titleLines.forEach(function(title) {
  					innerHtml += '<tr><th>' + title.substring(0,12) + '</th></tr>';
            // the title is the date - we only want to show the day not the time
  				});
  				innerHtml += '</thead><tbody>';

  				bodyLines.forEach(function(body, i) {
  					var colors = tooltip.labelColors[i];
  					var style = 'background:' + colors.backgroundColor;
  					style += '; border-color:' + colors.borderColor;
  					style += '; border-width: 2px';
  					var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
  					innerHtml += '<tr><td>' +span + body + '</td></tr>';
            // body is NAME: Count
  				});
  				innerHtml += '</tbody>';

  				var tableRoot = tooltipEl.querySelector('table');
  				tableRoot.innerHTML = innerHtml;
  			}

  			var positionY = this._chart.canvas.offsetTop;
  			var positionX = this._chart.canvas.offsetLeft;

  			// Display, position, and set styles for font
  			tooltipEl.style.opacity = 1;
  			tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  			tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  			tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
  			tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
  			tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
  			tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
  		};

  //
  var ctx = document.getElementById('chronologicalGraph').getContext('2d');
  ctx.canvas.width = 1400;
  ctx.canvas.height = 500;
  var cfg = {
      type: 'line',
      data: {
      labels: formatedStruct[0].date,
      datasets: [{
        label: contents[0].name,
        data: formatedStruct[0].count,
        type: 'line',
        fill: true,
        steppedLine: true,
        pointRadius: 0,
        lineTension: 0,
        borderWidth: 1,
        pointHoverRadius: 10,
        backgroundColor:"rgba(20, 168, 204, 0.2)",
        borderColor:"rgb(20, 168, 204)",
        pointBackgroundColor:"rgb(20, 168, 204)",
        pointBorderColor:"#fff",
        pointHoverBackgroundColor:"#fff",
        pointHoverBorderColor:"rgb(20, 168, 204)"},
        {
        label: contents[1].name,
        data: formatedStruct[1].count,
        type: 'line',
        fill: false,
        steppedLine: true,
        pointRadius: 0,
        lineTension: 0,
        borderWidth: 1,
        pointHoverRadius: 10,
        backgroundColor:"rgba(255, 72, 64, 0.2)",
        borderColor:"rgb(255, 72, 64)",
        pointBackgroundColor:"rgb(255, 72, 64)",
        pointBorderColor:"#fff",
        pointHoverBackgroundColor:"#fff",
        pointHoverBorderColor:"rgb(255, 72, 64)"}]
    },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              distribution: 'linear',
              time: {
                    unit: 'year'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Number Of Messages'
              }
            }]
          },
          tooltips: {
						enabled: false,
						mode: 'index',
						position: 'nearest',
						custom: customTooltips
					}
        }
  };

  var chart = new Chart(ctx, cfg);

//
// add as html
var wordPDA = Math.round((wordsPerMessage[0][1]+wordsPerMessage[1][1])/(formatedStruct[0].date.length));
var messPDA = Math.round((messagesCount[0]+messagesCount[1])/(formatedStruct[0].date.length));

// clear old data from previous analyzations
document.getElementById('usersRows').innerHTML = "";


var div = document.createElement('div');
div.className = 'mb-0';
div.innerHTML = "<p> You guys write an average of " +messPDA +" messages per day. That's "+ wordPDA + " words per day! </p>" +
                "<p>" + contents[n0].name + " writes <b>" + factorF + "</b> times more messages!" + "</p>" +
                "<p>" + wpm + "</p>" +
                "<p>" + "Overall " + contents[n0].name +" writes <b>" + percent + "</p>";
document.getElementById('usersRows').appendChild(div);
//

// chronological words per messages

  //messages[i].trim().split(/\s+/).length;
/*
  var ctx = document.getElementById('chronologicalGraph2').getContext('2d');
  ctx.canvas.width = 1400;
  ctx.canvas.height = 500;
  var cfg = {
      type: 'line',
      data: {
      labels: formatedData[0][0],
      datasets: [{
        label: contents[0].name,
        data: formatedData[0][1][0],
        type: 'line',
        fill: true,
        steppedLine: true,
        pointRadius: 0,
        lineTension: 0,
        borderWidth: 1,
        pointHoverRadius: 10,
        backgroundColor:"rgba(20, 168, 204, 0.2)",
        borderColor:"rgb(20, 168, 204)",
        pointBackgroundColor:"rgb(20, 168, 204)",
        pointBorderColor:"#fff","pointHoverBackgroundColor":"#fff",
        pointHoverBorderColor:"rgb(20, 168, 204)"},
        {
        label: contents[1].name,
        data: formatedData[0][1][1],
        type: 'line',
        fill: false,
        steppedLine: true,
        pointRadius: 0,
        lineTension: 0,
        borderWidth: 1,
        pointHoverRadius: 10,
        backgroundColor:"rgba(255, 72, 64, 0.2)",
        borderColor:"rgb(255, 72, 64)",
        pointBackgroundColor:"rgb(255, 72, 64)",
        pointBorderColor:"#fff",
        pointHoverBackgroundColor:"#fff",
        pointHoverBorderColor:"rgb(255, 72, 64)"}]
    },
        options: {
      scales: {
        xAxes: [{
          type: 'time',
          distribution: 'linear',
          displayFormats: {
            month:	'MMM YYYY'
          },
          time: {
            min: '03 03 2014'
          },
          unit: 'month'
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Number Of Messages'
          }
        }]
      }
    }
  };
  var chart = new Chart(ctx, cfg);
*/
  // show chat of clicked day ------------------------------------------------
}


// struct factory
// https://stackoverflow.com/questions/502366/structs-in-javascript
function makeStruct(names) {
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i];
    }
  }
  return constructor;
}

// transform data into arrays of lines
function createArray(contents) {

  // Format for normal message:
  // [09.04.18, 10:19:36] Name: MESSAGE
  // announcments do not have a ":" and should be deleted

  // find index of all individual messsages
  lineArray = [];
  indexArray = [];
  delArray = [];

  content = contents;
  // --- support other exportFormats

  if (content.substring(0,1) == "[") {
    s1 = 1;
    s1b = true;
  } else {
    s1 = 0;
    s1b = false;
  }

  // CHECK DD OR D --
  if (!isNaN(content.substring(s1,s1+2))) {
    // Is DD or MM
    l1 = 2;
  } else if (!isNaN(content.substring(s1,s1+1))){
    // D or M
    l1 = 1;
  } else {
    // console.error();
    console.error("Data Format not supported. Error day");
    return;
  }

  // CHECK MM or M --
  if (!isNaN(content.substring(s1+l1+1,s1+l1+1+2))) {
    // Is MM or DD
    l2 = 2;
  } else if (!isNaN(content.substring(s1+l1+1,s1+l1+1+1))){
    // M or D
    l2 = 1;
  } else {
    // console.error();
    console.error("Data Format not supported. Error Month");
    return;
  }
  // CHECK YYY or YY --
  if (!isNaN(content.substring(s1+l1+1+l2+1,s1+l1+1+l2+1+4))) {
    // Is YYYY
    l3 = 4;
  } else if (!isNaN(content.substring(s1+l1+1+l2+1,s1+l1+1+l2+1+2))){
    // M or D
    l3 = 2;
  } else {
    // console.error();
    console.error("Data Format not supported. Error Year");
    return;
  }

  // Seperator 2

  for (var n = 1; n < 5; n++) {
    if ( (!isNaN(content.substring(s1+l1+1+l2+1+l3+n,s1+l1+1+l2+1+l3+n+1))) && (content.substring(s1+l1+1+l2+1+l3+n,s1+l1+1+l2+1+l3+n+1) != " ") ){
      // Is check seperator 2 and return how many characters it has
      s2 = n;
      break;
    }
  }

  // TIME ---
  // THIS IS NOT REPRESENTATIVE as the first might be 12:00 am and the next is 1:00 pm
  // TODO: get rid of this part
  if (!isNaN(content.substring(s1+l1+1+l2+1+l3+s2,s1+l1+1+l2+1+l3+s2+2))) {
    // HH
    t1 = 2
  } else if (!isNaN(content.substring(s1+l1+1+l2+1+l3+s2,s1+l1+1+l2+1+l3+s2+1))) {
    // M or D
    t1 = 1;
  } else {
    // console.error();
    console.error("Data Format not supported. Error t1");
    return;
  }
  // ---

  // t2
  if (!isNaN(content.substring(s1+l1+1+l2+1+l3+s2+t1+1,s1+l1+1+l2+1+l3+s2+t1+1+2))) {
    // HH
    t2 = 2
  } else if (!isNaN(content.substring(s1+l1+1+l2+1+l3+s2+t1+1,s1+l1+1+l2+1+l3+s2+t1+1+1))) {
    // M or D
    t2 = 1;
  } else {
    // console.error();
    console.error("Data Format not supported. Error t2");
    return;
  }
  // t3
  if (!isNaN(content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+2))) {
    // SS
    t3 = 2;
  } else if (!isNaN(content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+1))) {
    // S
    t3 = 1;
  } else {
    t3 = -1;
  }
  // t4 12 h modifier
  if ((content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+2,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+3)) == ".") {
    // p. m. a. m.
    t4 = 6;
    t4String = [" p. m."," a. m."];
  } else if ( ((content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+1,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+2)).toLowerCase() == "a") ||
            ((content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+1,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+2)).toLowerCase() == "p") ) {
    t4 = 3;
    t4String = [" PM"," AM"];
  } else {
    t4 = 0;
    t4toString = "";
  }

  // seperator 3 ---
  if ((content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+3)) == " - ") {
    // SS
    sep3 = 3;
    sep3Char = " - ";
  } else if ((content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+2)) == "] ") {
    // S
    sep3 = 2;
    sep3Char = "] ";
  } else if ((content.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+2)) == ": ") {
    sep3 = 2;
    sep3Char = ": ";
  }
  sep4Char = ": ";
  s4 = 2;

  /*OLD CONSTRUCT
  for (var i = 0; i < contents.length; i++) {
  //  max character length of start:  ~30
    testString = contents.substring(i, i+30 );

    if (isNaN(testString.substring(s1+l1+1+l2+1+l3+s2,s1+l1+1+l2+1+l3+s2+2))) {
      t1 = 1;
    } else {
      t1 = 2;
    }

    if (isNaN(testString.substring(s1,s1+2))) {
      l1 = 1;
    } else {
      l1 = 2;
    }
    if ( ((s1b) == (testString.substring(0,s1) == "["))  && // sb1 false == no [ -> true ; sb1 true == [ --> true
       (!isNaN(testString.substring(s1,s1+l1))) &&        // check if after the sb1 numbers follow
       (!isNaN(testString.substring(s1+l1+1,s1+l1+1+l2)))  && // check for second numbers
       ((testString.substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4,s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3) == sep3Char)) // check if last character is sep3 char
     ) {
       // save index
       indexArray.push(i);
     }


   }*/

   // Message can be in these formats: https://docs.google.com/spreadsheets/d/1mZCE_tFelvqmLh0vIt7vMjU1OYB0etuhwXRl3Fzv6k8/edit#gid=0
   // variables give the index ralative to the start of the message to seperate the data in the next functions
   // s1 +	l1 +	1+	l2 +	1+	l3+	s2+	t1+1+t2+1+t3+t4+sep3+NAME+sep4+text
   // REGEX
   // https://www.debuggex.com/r/4oudOv37eWpW9NMt
   // This regex is used to find the start index of every message (including special messages)
   var re = new RegExp("(\\[?)((\\d{1,4}(\\-|\\/|\\.){1}){2}\\d{2,4})((\\sum\\s|\\s)|\\,\\s|\\.\\s){1}((\\d{1,2}\\:)\\d{2}(:\\d{2})?)(\\s(a|p)?m|\\s(A|P)?M|\\s(a|p)?\\.\\s\\m\\.)?(\\]\\s|\\s\\-\\s|\\:)([^:\\n-.]*)","g");
   //var re = new RegExp("(\\[?)((\\d{1,4}(\\-|\\/|\\.){1}){2}\\d{2,4})((\\sum\\s|\\s)|\\,\\s|\\.\\s){1}((\\d{1,2}\\:)\\d{2}(:\\d{2})?)(\\s(A|P)?M|\\s(a|p)?\\.\\s\\m\\.)?(\\]\\s|\\s\\-\\s|\\:)(.)([^:\\n])(.*)","g");

   var i = 0
   while ((match = re.exec(contents)) != null) {
     //console.log("match found at " + match.index);
     indexArray[i] = match.index;
     i++;
   }

   // split messsages
   for (var i = 0; i < indexArray.length; i++) {
     // fill array
      if (i == indexArray.length - 1) {
        lineArray[i] = contents.substring(indexArray[i], contents.length-1);
      } else {
        lineArray[i] = contents.substring(indexArray[i], indexArray[i+1]);
      }
    }

  // remove any special messages (e.g. lines without ":")
  // e.g. announcments when people get added to groups, security change etc
  var a = 0;
  for (var i = 0; i < lineArray.length; i++)  {
    if (lineArray[i].substring(20,lineArray[i].length).indexOf(":") < 0) {
      // no ":" found. Delete this line
      delArray[a] = i;
      a++;
    }
  }
  // log which lines to remove
  //console.log(delArray);
  for (var i = 0 ; i < a; i++) {
    lineArray.splice(delArray[i]-i,1)
  }
  // This array does contain now one message per line including the complete format
  return lineArray;
}

// transform lineArray into structs --------
function createStructs(lineArray) {

  var uniqueNames = findNames(lineArray);
  var structArray = [];

  //console.log(lineArray);

  for (i = 0; i < uniqueNames.length; i++) {

    var date = [];
    var time = [];
    var message = [];
    var name = uniqueNames[i];
    var nameLength = name.length;
    var a = 0;

    // log name that is processed
    //console.log(name);

    // note if DD:MM or MM:DD
    var ddmm = false;
    for (var j = 0; j < lineArray.length; j++) {
      if (parseInt(lineArray[j].substring(s1,s1+l1)) > 12) {
        var ddmm = true;
        break;
      }
    }

    // splice messages
    for (var j = 0; j < lineArray.length; j++) {
      if ( lineArray[j].substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3, s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3 + nameLength) == name ) {

        // date to YYYY-MM-DD
        if (ddmm) {
          dd = lineArray[j].substring(s1,s1+l1)
          mm = lineArray[j].substring(s1+l1+1,s1+l1+1+l2);
        } else {
          dd = lineArray[j].substring(s1+l1+1,s1+l1+1+l2);
          mm = lineArray[j].substring(s1,s1+l1);
        }
        yyyy = lineArray[j].substring(s1+l1+1+l2+1,s1+l1+1+l2+1+l3);

        if (dd.length == 1) {
          dd = "0" + dd;
        }
        if (mm.length == 1) {
          mm = "0" + mm;
        }
        if (yyyy.length == 2) {
          yyyy = "20" + yyyy;
        }

        date[a] = yyyy+"-"+mm+"-"+dd;

        // time to HH:MM:SS
        hh = lineArray[j].substring(s1+l2+1+l2+1+l3+s2, s1+l1+1+l2+1+l3+s2+t1);
        mm = lineArray[j].substring(s1+l2+1+l2+1+l3+s2+t1+1, s1+l1+1+l2+1+l3+s2+t1+1+t2);
        ss = lineArray[j].substring(s1+l2+1+l2+1+l3+s2+t1+1+t2+1, s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3);

        if (hh.length == 1) {
          hh = "0" + hh;
        }
        if (mm.length == 1) {
          mm = "0" + mm;
        }
        if (ss.length == 1) {
          ss = "0" + ss;
        }
        if (ss.length == 0) {
          ss = "00";
        }
        time[a] = hh+":"+mm+":"+ss;

        // message
        message[a] = lineArray[j].substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3+uniqueNames[i].length+s4);
        a++;
      }
    }
    //console.log(message);
    // save data to struct
    var Item = makeStruct("name date time message");
    var user = new Item(name, date, time, message);
    structArray.push(user);
  }
  // log users

  // return
  return structArray;
}

// find names of the people
function findNames(lineArray) {
  names = [];
  messages = [];
  group = false;

  for (var i = 0; i< lineArray.length; i++){
    // second occurence of ":" marks end of NAME
    if (isNaN(lineArray[i].substring(s1+l1+1+l2+1+l3+s2,s1+l1+1+l2+1+l3+s2+2))) {
      t1 = 1;
    } else {
      t1 = 2;
    }
    if (isNaN(lineArray[i].substring(s1+l1+1+l2+1+l3+s2+t1+1,s1+l1+1+l2+1+l3+s2+t1+1+2))) {
      t2 = 1;
    } else {
      t2 = 2;
    }
    if (isNaN(lineArray[i].substring(s1,s1+2))) {
      l1 = 1;
    } else {
      l1 = 2;
    }
    if (isNaN(lineArray[i].substring(s1+l1+1,s1+l1+1+2))) {
      l2 = 1;
    } else {
      l2 = 2;
    }

    firstIndex = s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3;
    secondIndex = lineArray[i].substring(s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3).indexOf(": ") + s1+l1+1+l2+1+l3+s2+t1+1+t2+1+t3+t4+sep3;

    // log
    //console.log( lineArray[i].substring(21, lineArray[i].length - 1) );
    //console.log( secondIndex );

    names[i] = lineArray[i].substring(firstIndex,secondIndex);
  }

  var uniqueNames = [];
  $.each(names, function(i, el){
    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
  });

  // check if its a group
  //if uniqueNames.length > 3 {
  //  group = true;
  //}

  //console.log(uniqueNames);
  return uniqueNames;
}

function addMissingDays(data) {
  var formatedStruct = [];
  var Item = makeStruct("date count");

  for(i = 0; i < data.length; i++) {
    var count = [];
    // Returns an array of dates between the two dates
    var getDates = function(startDate, endDate) {
      var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
      while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
      }
      return dates;
    };

    var dates = getDates(new Date(data[i].date[0]), new Date(data[i].date[data[i].date.length-1]));

    for (k = 0; k < dates.length; k ++) {
      // DD MM YY-> D MMM YY
      var index = data[i].date.indexOf(moment(dates[k]).format('YYYY-MM-DD'));
      if (index == -1) {
        count[k] = 0;
      } else {
        count[k] = data[i].count[index];
      }
    }

    var obj = new Item(dates, count);
    formatedStruct.push(obj);
  }

  return formatedStruct;
}

// ----- ---- ---- PERSONAL STATS -------------------- //

// activity by day of week
function getMessagesPerDay(dates) {
  var dayCount = [0,0,0,0,0,0,0];

  // evaluate and count
  for (var i = 0; i < dates.length; i++) {
    var d = new Date(dates[i]);
    var dayNum = d.getDay();
    dayCount[dayNum]++;
  }

  return dayCount;
}

// activity by time
// returns struct "date count indexStart"
function countMessages(dates) {
  // init
  var date = [];
  var count = [];
  var indexStart = [];

  // loop
  for (var i = 0; i < dates.length; i++) {

    if (i == 1) {
      var temp = dates[0];
      date[0] = dates[0];
      count[0] = 1;
      indexStart[0] = 0;
      var r = 0;
    }
    else if (temp != dates[i]) {
      r++;
      temp = dates[i]
      date[r] = dates[i];
      count[r] = 1;
      indexStart[r] = i;
    } else {
      count[r]++;
    }

  }

  // save to struct
  //var dateCount = [];
  var Item = makeStruct("date count indexStart");
  var struct = new Item(date, count, indexStart);
  //dateCount.push(struct);

  return struct;
}

// activity by hour

// count words per person

// counts how often you use every word
// thanks to https://stackoverflow.com/a/6565353/7151828
function getWordCount(messages) {
    var wordCounts = { };
    var words = messages.join(" ").split(/[\b\s(?:,| )+]/);

  for (var i = 0; i < words.length; i++) {
    wordCounts["_" + words[i].toLowerCase()] = (wordCounts["_" + words[i].toLowerCase()] || 0) + 1;
  }
  //console.log(wordCounts);
  return wordCounts;
}

// 30 most used emoji per person

// ---- ---- ---- TOTAL STATS

// average words per message
function calcWordsPerMessage(messages) {
  var tlt = 0;
  for (var i = 0; i < messages.length; i++) {
    tlt = tlt + messages[i].trim().split(/\s+/).length;
  }
  return [(Math.round(tlt/messages.length*100)/100),tlt];
}

// average messages per day
