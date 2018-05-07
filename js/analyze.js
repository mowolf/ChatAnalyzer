/// ----------------------------- \ GENERAL Config START /------------------------------

// If you notice that your picture cont = 0 please add the identifier of your language in
// lowercase and adding a "_" to the start e.g. "<Media" -> "_<media"
// ATTENTION: These strings might have some weird invisible space character between "<" and "media" !!!!
// ATTENTION: BE SURE TO COPY AND PASTE FROM YOUR CHAT LOG !!!!
var str4Pic = ["_<‎bild","_<‎media", "_<‎picture", "<‎attached>"];

// If you notice that your audio cont = 0 please add the identifier of your language in
// ATTENTION: BE SURE TO COPY AND PASTE FROM YOUR CHAT LOG !!!!
var str4Audio = ["_<‎audio"];

// If you notice words that are not part of your chat (i.g. identifiers) of your language in
// ATTENTION: PLEASE BE SURE TO COPY AND PASTE FROM YOUR CHAT LOG !!!!
var unwantedWords = ["_","_weggelassen>", "_ommited>"];

/// ----------------------------- \ GENERAL Config END /--------------------------------

// TODO: add group support (make carousell for groups)
// TODO: add words per messages and plot the change over time
// TODO: Make sure all variables are resetted when choosing the next file! -> write initalizer
// TODO: filter out most common words
// TODO: Most used emojies

/// ----------------------------- \ Code /----------------------------------------------

// file listener
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);


//Read File
function readSingleFile(e) {

  // handle file
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

  // Show loading icon
  var d = document.getElementById("loading");
  d.style.display = "block";

  // clear old Stuff
  document.getElementById('groupTableRows').innerHTML = "";
  document.getElementById('users').innerHTML = "";
  document.getElementById('groupInfo').innerHTML = "";

  // hide Stuff
  document.getElementById("groupInfo").style.display = "none";
  document.getElementById("group").style.display = "none";
  document.getElementById("1on1chat").style.display = "none";


  // executes on load of file
  var reader = new FileReader();
  reader.onload = function(e) {

    var contents = e.target.result;
    // get data in right format
    var structArray = createStruct(contents);
    var userStruct = filterUsers(structArray);

    // structArray: Formatted line data in the form of a struct with the keys: name date time message
    //              name: "Name Surname"
    //              date: "YYYY-MM-DD"
    //              time: "HH:MM:SS"
    //              each key represents an array, the index represents the line number
    //              e.g. structArray.date[0] is the date of the first line
    // userStruct: array of structs with the keys: name date time message
    //           : for every person there is one struct, same format as above, index represents messageNumber of name

    // checks if group chat
    if (userStruct.length > 2) {
      // GROUP CHAT ----------------------------------------------------------------------

      // TODO: What to do when this is a normal chat misidentified as a group chat?
      // TODO: ADd button that analyzes as normal chat with the first two names

      // Show Error four Groups
      var div = document.createElement('div');
      div.className = 'col-sm';
      div.innerHTML = "<p>If this is no group chat you have probably copy-pased a chat in your chat. Please open your chat file and eliminate the other people.</p>";

      var erG = document.getElementById("groupInfo");
      erG.appendChild(div);
      erG.style.display = "block";

      document.getElementById("group").style.display = "block";


      displayGroup(userStruct);
    } else {
      // NORMAL CHAT ----------------------------------------------------------------------
      displayChat(userStruct);
      document.getElementById("1on1chat").style.display = "block";
      document.getElementById("groupTable").style.display = "none";
    }

    // CLEAN HTML -------------------------------------------------------------------------
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

// NOTE: this is the function that gets executed on normal chats
// Display normal 1 on 1 chat data
function displayChat(content) {

  // contents is an object: name, message, date, time

  // USER SPECIFIC  ------------------------------------------------------------------------------------
  var wordsPerMessage = [];
  var messagesCount = [0,0];
  for (var i = 0; i < 2; i++) {
    // message Count ----------------------------------------
    messagesCount[i] = content[i].message.length;

    // Words per message ------------------------------------
    // returns [avergeWordsPerMessage,tolalWords];
    wordsPerMessage[i] = calcWordsPerMessage(content[i].message);

    // Most used words --------------------------------------
    var words = getMostUsedWords(content[i].message)
    var mostUsed = words.mostUsed;
    var sentPicsCount = words.sentPicsCount;
    var sentAudioCount = words.sentAudioCount;


    // HTML CONSTRUCTION ------------------------------------
    if (mostUsed.length > 29) {
      max = 30;
    } else {
      max = mostUsed.length;
    }

    var mostUsedHTML ="";
    for (var j = 0; j < max; j++) {
      mostUsedHTML = mostUsedHTML + "<p>" + mostUsed[j][0].substring(1) +" - "+ Math.round(mostUsed[j][1]/wordsPerMessage[i][1]*1000)/10 + "%</p>";
    }
    var btn = "<button type='button' class='btn' data-toggle='collapse' data-target='#mostUsed"+i+"''>" +
              "<i class='fas fa-chevron-down'></i></button>";

    var div = document.createElement('div');
    div.className = 'col-sm';
    div.innerHTML = "<h4 data-letters='" + content[i].name.match(/\b\w/g).join('') + "'></h4>" +
                    "<h4>" + content[i].name + "</h4>" +
                    "<p> Messages sent: <b>" + messagesCount[i] + "</b></p>" +
                    "<p> Words per Message: <b>" + wordsPerMessage[i][0] + "</b></p>" +
                    "<p> Pictures sent: <b>" + sentPicsCount + "</b></p>" +
                    "<p> Audio sent:<b>" + sentAudioCount + "</b></p>" +
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

  // Messages per Day Radar -----------------------------------------------------------------------------
  var dayCount = [getMessagesPerDay(content[0].date), getMessagesPerDay(content[1].date)];
  new Chart(
        document.getElementById("dayRadar"),
        {
        type:"radar",
        data:{labels:[ ["Sunday", ""],"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        datasets:[
          {label:content[0].name,
          data:dayCount[0],
          fill:true,
          backgroundColor:"rgba(20, 168, 204, 0.2)",
          borderColor:"rgb(20, 168, 204)",
          pointBackgroundColor:"rgb(20, 168, 204)",
          pointBorderColor:"#fff",
          pointHoverBackgroundColor:"#fff",
          pointHoverBorderColor:"rgb(20, 168, 204)"},
          {label:content[1].name,
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

  // CHRONOLOGICAL GRAPH --------------------------------------------------------------------------------
  // returns struct "date count indexStart"
  messageCount = [countMessages(content[0].date), countMessages(content[1].date)];
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

  // graph
  var ctx = document.getElementById('chronologicalGraph').getContext('2d');
  ctx.canvas.width = 1400;
  ctx.canvas.height = 500;
  var cfg = {
      type: 'line',
      data: {
      labels: formatedStruct[0].date,
      datasets: [{
        label: content[0].name,
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
        label: content[1].name,
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


  // GLOBAL FACTORS -----------------------------------------------------------------------------------

  // clear old data from previous analyzations
  document.getElementById('usersRows').innerHTML = "";

  if (content[0].message.length > content[1].message.length) {
    var n0 = 0;
    var n1 = 1;
  } else {
    var n0 = 1;
    var n1 = 0;
  }

  var factorF = Math.round((content[n0].message.length/content[n1].message.length)*100)/100;
  var wpmF = Math.round(wordsPerMessage[n0][0]/wordsPerMessage[n1][0]*100)/100;
  var wpm = "And " + content[n0].name + " messages contain <b>" + wpmF + "</b> times the words of " +content[n1].name + " messages!</b>";
  var percent = Math.round((wpmF)*factorF*100);

  if (percent >= 1) {
    percent = percent.toString().substring(1,3)  + "</b>% more words!";
  } else {
    percent = percent  + "</b>% less words!";
  }

  var wordPDA = Math.round((wordsPerMessage[0][1]+wordsPerMessage[1][1])/(formatedStruct[0].date.length));
  var messPDA = Math.round((messagesCount[0]+messagesCount[1])/(formatedStruct[0].date.length));

  var div = document.createElement('div');
  div.className = 'mb-0';
  div.innerHTML = "<p> You guys write an average of " +messPDA +" messages per day. That's "+ wordPDA + " words per day! </p>" +
                  "<p>" + content[n0].name + " writes <b>" + factorF + "</b> times more messages!" + "</p>" +
                  "<p>" + wpm + "</p>" +
                  "<p>" + "Overall " + content[n0].name +" writes <b>" + percent + "</p>";
  document.getElementById('usersRows').appendChild(div);

  // CHRONOLOGICAL WORDS PER MESSAGE -----------------------------------------------------------------------
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

// NOTE: this is the function that gets executed on group chats
function displayGroup(content) {
var wordsPerMessage = [];
var messagesCount = [];
// personal STATS
for (var i = 0; i < content.length; i++) {
  // message Count ----------------------------------------
  messagesCount[i] = content[i].message.length;

  // Words per message ------------------------------------
  // returns [avergeWordsPerMessage,tolalWords];
  wordsPerMessage[i] = calcWordsPerMessage(content[i].message);

  // Most used words --------------------------------------
  var words = getMostUsedWords(content[i].message)
  var mostUsed = words.mostUsed;
  var sentPicsCount = words.sentPicsCount;
  var sentAudioCount = words.sentAudioCount;

  // HTML

  // display table
  document.getElementById("groupTable").style.display = "block";

  // set max
  if (mostUsed.length > 3) {
    var max = 3;
  } else {
    var max = mostUsed.length;
  }
  var mostUsedHTML ="";
  for (var j = 0; j < max; j++) {
    mostUsedHTML = mostUsedHTML + mostUsed[j][0].substring(1) +" - "; //+ Math.round(mostUsed[j][1]/wordsPerMessage[i][1]*1000)/10 + "% | ";
  }

  // create rows
  var tableRows = document.createElement('tr');

  if (sentPicsCount == 0) {
    sentPicsCount = "";
  }
  if (sentAudioCount == 0) {
    sentAudioCount = "";
  }

  tableRows.innerHTML = "<th scope='row'>"+"<h4 data-letters='" + content[i].name.match(/\b\w/g).join('') + "'></h4>"+"</th>" +
                        "<td>"+content[i].name+"</td>" +
                        "<td>"+messagesCount[i]+"</td>" +
                        "<td>"+wordsPerMessage[i][0]+"</td>"+
                        "<td>"+sentPicsCount+"</td>" +
                        "<td>"+sentAudioCount+"</td>" +
                        "<td>"+mostUsedHTML+"</td>";

  document.getElementById('groupTableRows').appendChild(tableRows);


}

// sort table by most messages
sortTable(1);


}

// FUNCTIONS ----------------- ------ ------ ------ ------

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
function createStruct(content) {
   // Message can be in these formats: https://docs.google.com/spreadsheets/d/1mZCE_tFelvqmLh0vIt7vMjU1OYB0etuhwXRl3Fzv6k8/edit#gid=0
   // variables give the index ralative to the start of the message to seperate the data in the next functions
   // s1 +	l1 +	1+	l2 +	1+	l3+	s2+	t1+1+t2+1+t3+t4+sep3+NAME+sep4+text
   // REGEX
   // https://www.debuggex.com/r/G5iGDvohGF8krt8Y
   // This regex is used to find the start index of every message (including special messages)
   var re = new RegExp("(\\[?)((\\d{1,4}(\\-|\\/|\\.){1}){2}\\d{2,4})((\\s.{1,3}\\s|\\s)|,\\s|\\.\\s){1}(((\\d{1,2}\\:)\\d{2}(:\\d{2})?)(\\s(a|p)?m|\\s(A|P)?M|\\s(a|p)?\\.\\s\\m\.)?)(\\]\\s|\\s\\-\\s|\\:)","g");
   // regex to find ending of name
   // var reD = new RegExp("([:-])");
   var reD = new RegExp("(:)");

   var indexArray = [];
   var messageStartIndexArray = [];
   var nameArray = [];
   var timeArray = [];
   var dateArray = [];

   var i = 0
   while ((match = re.exec(content)) != null) {
     //console.log("match found at " + match.index);
     indexArray[i] = match.index;
     // currently this array stores the index after the identifier
     messageStartIndexArray[i] = match[0].length;
     //nameArray[i] = match[16];
     timeArray[i] = match[7];
     dateArray[i] = match[2];
     i++;
   }

   // create messsages
   var messageArray = [];
   var nameLengthArray = [];
   var temp = "";

   for (var i = 0; i < indexArray.length; i++) {

      if (i == indexArray.length - 1) {
        temp = content.substring(indexArray[i]+messageStartIndexArray[i], content.length-1);
      } else {
        temp = content.substring(indexArray[i]+messageStartIndexArray[i], indexArray[i+1]);
      }

      // search for a name and add it's length to the index
      match = reD.exec(temp);
      if (match != null) {
        nameLengthArray[i] = match.index ;
        // update name
        nameArray[i] = temp.substring(0,match.index);
      } else {
        nameLengthArray[i] = 0 ;
        // update name
        nameArray[i] = "ER: NO NAME FOUND";
      }

      // fill array // +2 gets rid of ": " before the start of the message
      if (i == indexArray.length - 1) {
        messageArray[i] = content.substring(indexArray[i]+messageStartIndexArray[i]+nameLengthArray[i]+2, content.length);
      } else {
        messageArray[i] = content.substring(indexArray[i]+messageStartIndexArray[i]+nameLengthArray[i]+2, indexArray[i+1]);
      }
    }

  // remove any special messages (e.g. lines without ":")
  // e.g. announcments when people get added to groups, security change etc
  var delArray = [];
  var a = 0;
  for (var i = 0; i < nameArray.length; i++)  {
    if (nameArray[i] == "ER: NO NAME FOUND") {
      // no ":" found. Delete this line
      delArray[a] = i;
      a++;
    }
  }

  for (var i = 0 ; i < a; i++) {
    messageArray.splice(delArray[i]-i,1);
    nameArray.splice(delArray[i]-i,1);
    timeArray.splice(delArray[i]-i,1);
    dateArray.splice(delArray[i]-i,1);
  }

  var Item = makeStruct("name date time message");
  var struct = new Item(nameArray, dateArray, timeArray, messageArray);

  return struct;
}

// transform lineArray into structs --------
function filterUsers(structArray) {

  var uniqueNames = findNames(structArray.name);
  var userStruct = [];

  // regex
  var reTime = new RegExp("((\\d{1,2})\:(\\d{1,2})((:)(\\d{1,2}))?)(\\s(a|p)?m|\\s(A|P)?M|\\s(a|p)?\\.\\s\m\\.)?");
  var reDate = new RegExp("((\\d{1,2})(\\-|\\/|\\.))((\\d{1,2})(\\-|\\/|\\.))(\\d{2,4})");


  // note if DD:MM -> true or MM:DD -> false
  var ddmm = false;
  for (var j = 0; j < structArray.date.length; j++) {
    testMatch = reDate.exec(structArray.date[j]);

    if (parseInt(testMatch[2]) > 12) {
      var ddmm = true;
      break;
    }
  }


  for (j = 0; j < uniqueNames.length; j++) {

    var name = uniqueNames[j];
    var date = [];
    var time = [];
    var message = [];
    var nameLength = uniqueNames[j].length;
    var a = 0;
    var Item = makeStruct("name date time message");

    // splice messages
    for (var i = 0; i < structArray.date.length; i++) {
      if ( structArray.name[i] == name ) {

        timeMatch = reTime.exec(structArray.time[i]);
        dateMatch = reDate.exec(structArray.date[i]);

        if (ddmm) {
          var dd = dateMatch[2];
          var mm = dateMatch[5];
        } else {
          var dd = dateMatch[5];
          var mm = dateMatch[2];
        }
        var yyyy = dateMatch[7];

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
        var pm = 0;
        if (timeMatch[7] != null) {
          if (timeMatch[7].length > 2) {
            if (timeMatch[7].substring(1,2).toLowerCase() == "p") {
              pm = 12;
            }
          }
        }

        var ss = "00";
        var hh = parseInt(timeMatch[2]) + pm;
        var mm = timeMatch[3];
        if (timeMatch[6] != null) {
          ss = timeMatch[6];
          if (ss.length == 0) {
            ss = "00";
          }
        }

        if (hh.length == 1) {
          hh = "0" + parseString(hh);
        }
        if (mm.length == 1) {
          mm = "0" + mm;
        }


        time[a] = hh+":"+mm+":"+ss;

        // message
        message[a] = structArray.message[i];

        a++;
      }
    }
    // save data to struct
    var user = new Item(name, date, time, message);
    userStruct.push(user);
  }
  // return
  return userStruct;
}

// find names of the people
function findNames(names) {

  var uniqueNames = [];
  $.each(names, function(i, el){
    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
  });

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


// returns an orderd struct with words and how often they are used
function getMostUsedWords(messages) {

  // Most used words --------------------------------------
  var Words = getWordCount(messages);

  var sentPicsIndex = -1;
  var sentAudioIndex = -1;
  var sentAudioCount = 0;
  var sentPicsCount = 0;
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
    for (var k = 0; k < str4Pic.length; k++) {
      if (mostUsed[j][0] == str4Pic[k]) {
        sentPicsIndex = j;
        sentPicsCount = mostUsed[j][1];
        break;
      }
    }
  }
  // remove it from the array
  mostUsed.splice(sentPicsIndex, 1);

  // --  evaluate how many audio files were sent
  for (var j = 0; j < mostUsed.length; j++) {
    for (var k = 0; k < str4Audio.length; k++) {
      if (mostUsed[j][0] == str4Audio[k]) {
        sentAudioIndex = j;
        sentAudioCount = mostUsed[j][1];
        break;
      }
    }
  }
  // remove it from array
  mostUsed.splice(sentAudioIndex, 1);

  // remove all unwanted words
  var id = 0
  var indexToDel = [];
  for (var j = 0; j < mostUsed.length; j++) {
    for (var k = 0; k < unwantedWords.length; k++) {
      if (mostUsed[j][0] == unwantedWords[k]) {
        indexToDel[id] = j;
        id++;
      }
    }
  }
  id = 0;

  for (var j = 0; j < indexToDel.length; j++) {
    mostUsed.splice(indexToDel[j]-id, 1);
    id++;
  }

  return { mostUsed: mostUsed,
          sentPicsCount: sentPicsCount,
          sentAudioCount: sentAudioCount
          };
}

// helper function to count words
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

// --- TABEL SORTER

function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("myTable");
  switching = true;
  //Set the sorting direction to ascending:
  dir = "desc";
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];

      if (x.innerHTML == "") {
        x = "0";
      } else {
        x = parseFloat(x.innerHTML);
      }
      if (y.innerHTML == "") {
        y = "0";
      } else {
        y = parseFloat(y.innerHTML);
      }

      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x > y) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x < y) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "desc") {
        dir = "asc";
        switching = true;
      }
    }
  }
}
