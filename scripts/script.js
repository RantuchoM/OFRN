// scripts/script.js

// Define dataArray and headers globally
var dataArray;
var girasArray;
var headers;
var names;
var namesWithMus;
const urlParameters = new URLSearchParams(window.location.search)
const ensParam = urlParameters.get('ens');
console.log(ensParam)
let esCoordEns = false;
let primeraVez = true;
let totalCols = 4;
if (ensParam) { esCoordEns = true; totalCols = 5 }



function loadClient() {
  gapi.load('client', initClient);
}

function initClient() {
  // Initialize the API client with your API key
  gapi.client.init({
    apiKey: 'AIzaSyAxQ63EFfI-ackr9PrPOxJepog7DDh5_dE',
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  }).then(() => {
    getGirasFromTextFiles()
  }).then(() => {
    //setValueTest()
    // Call the function to fetch data
    getDataFromTextFiles().then(() => {
      // Now that the data is loaded, call the function to get names
      getNames();
      getNamesWithMus();

    });


  })
}


function getNames() {
  //console.log("getDropdownData")
  const url = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/integrantes.txt'; // Replace with the actual URL of the external page
  return fetch(url)
    .then(response => response.text())
    .then(base64Text => {
      doc = decodeAndRevertGeneral(base64Text);


      //const parser = new DOMParser();
      //const doc = dataArray;
      //console.log(extractColumnData(doc, 3))
      names = doc.map(n => n[3])
      //console.log(names)
      names.shift()
      names.sort() // Extract data from the 4th column
      //console.log(names)
      resumenPersonas();
    })
    .catch(error => console.error('Error fetching data:', error));
}
function getNamesWithMus() {
  //console.log("Names withMus")
  const url = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/integrantes.txt'; // Replace with the actual URL of the external page
  return fetch(url)
    .then(response => response.text())
    .then(base64Text => {
      doc = decodeAndRevertGeneral(base64Text);
      let allNames = doc.map(n => n[3]); // Assuming 3rd column contains names
      allNames.shift(); // Remove header
      let allMus = doc.map(n => n[9])
      //console.log(allNames)

      //allMus.shift();
      //console.log(allMus)
      // Filter names based on the presence of musical terms in column 10
      namesWithMus = allNames.filter(name => {

        const musValue = allMus[allNames.indexOf(name) + 1];
        //console.log(name + " - " + musValue + " - " + ["Maderas", "Percusión", "Cuerdas", "Bronces"].some(keyword => musValue.includes(keyword)));
        if (musValue) {
          return (name != '') && ["Maderas", "Percusión", "Cuerdas", "Bronces"].some(keyword => musValue.includes(keyword));
        }
        else { return false }
      });

      // Sorting names alphabetically
      //console.log("Nombres filtrados")
      //console.log(namesWithMus)
      resumenPersonas();


    })
    .catch(error => {
      console.error('Error fetching data:', error);
      return []; // Return an empty array in case of an error
    });
}

function resumenPersonas() {
  //console.log("Resumen Personas")
  var detailsContainer = $('#people-details');
  var mostrarDetalleCheckbox = $('#mostrarDetalle');
  var mostrarProduccion = $('#mostrarProduccion');
  var namesResumen;

  if (!detailsContainer.length) {
    console.error("Container not found");
    return;
  }

  detailsContainer.empty();

  if (mostrarProduccion.is(':checked')) {
    namesResumen = names;
  } else {
    namesResumen = namesWithMus;
  }

  // Initialize tableHTML with headers
  var tableHTML = '';
  if (!mostrarDetalleCheckbox.is(':checked')) {
    tableHTML = '<table id="people-details-table" class="display"><thead>' +
      '<tr>' +
      '<th rowspan="2">Names</th>' +
      '<th colspan="4">Sinf</th>' +
      '<th colspan="4">CF</th>' +
      '<th colspan="4">Ensambles</th>' +
      '<th colspan="4">Totals</th>' +
      '</tr>' +
      '<tr>' +
      '<th>Pres</th><th>Prog</th><th>Ens</th><th>EnsGir</th>' +
      '<th>Pres</th><th>Prog</th><th>Ens</th><th>EnsGir</th>' +
      '<th>Pres</th><th>Prog</th><th>Ens</th><th>EnsGir</th>' +
      '<th>Pres</th><th>Prog</th><th>Ens</th><th>EnsGir</th>' +
      '</tr>' +
      '</thead><tbody>';
  }

  namesResumen.forEach(function (name) {
    var filteredRows = dataArray.filter(function (data) {
      return data[7].includes(name);
    });

    var sinfRows = filteredRows.filter(function (data) {
      return data[0].includes('Sinf ');
    });

    var cfRows = filteredRows.filter(function (data) {
      return data[0].includes('CF ');
    });

    var ensambleRows = filteredRows.filter(function (data) {
      return !data[0].includes('Sinf ') && !data[0].includes('CF ');
    });

    var countPresentacionesSinf = sinfRows.length - countEnsayos(sinfRows);
    var countPresentacionesCF = cfRows.length - countEnsayos(cfRows);
    var countPresentacionesEnsamble = ensambleRows.length - countEnsayos(ensambleRows);

    var countProgramasSinf = countUniquePrograms(sinfRows);
    var countProgramasCF = countUniquePrograms(cfRows);
    var countProgramasEnsamble = countUniquePrograms(ensambleRows);

    var countEnsayosSinf = countEnsayosSinGiras(sinfRows);
    var countEnsayosCF = countEnsayosSinGiras(cfRows);
    var countEnsayosEnsamble = countEnsayosSinGiras(ensambleRows);

    var countEnsayosGirasSinf = countEnsayos(sinfRows) - countEnsayosSinGiras(sinfRows);
    var countEnsayosGirasCF = countEnsayos(cfRows) - countEnsayosSinGiras(cfRows);
    var countEnsayosGirasEns = countEnsayos(ensambleRows) - countEnsayosSinGiras(ensambleRows);


    // Total counts
    var totalCountPresentaciones = countPresentacionesSinf + countPresentacionesCF + countPresentacionesEnsamble;
    var totalCountProgramas = countProgramasSinf + countProgramasCF + countProgramasEnsamble;
    var totalCountEnsayos = countEnsayosSinf + countEnsayosCF + countEnsayosEnsamble;
    var totalCountEnsayosSinGiras = countEnsayosGirasSinf + countEnsayosGirasCF + countEnsayosGirasEns;

    if (mostrarDetalleCheckbox.is(':checked')) {
      // Build details summary
      var detailsSummary = '<details id="' + name + '"><summary>' + name +
        ' - Cantidad de Programas: ' + totalCountProgramas +
        ' - Cantidad de Presentaciones: ' + totalCountPresentaciones +
        ' - Cantidad de Ensayos: ' + totalCountEnsayos +
        '</summary>';
      detailsSummary += '<table>';

      // Iterate over filtered rows
      filteredRows.forEach(function (data) {
        var row = '<tr';
        var backgroundColors = {
          'Sinf': '#dabcff',
          'CF Val': '#E1C16E',
          'CF Mon': '#A8A8A8',
          'CF Mar': '#89CFF0',
          'CFCuer': '#ffccff'
          // Add more entries as needed
        };

        var prefix = Object.keys(backgroundColors).find(key => data[0].includes(key));

        if (prefix && backgroundColors[prefix]) {
          row += ' style="background-color: ' + backgroundColors[prefix] + ';"';
        }
        row += '>';

        // Iterate over each value in the row (columns 1 to 7)
        for (var columnIndex = 0; columnIndex < 7; columnIndex++) {
          var columnValue = data[columnIndex];
          if (columnIndex === 1) {
            row += '<td class="center">' + formatDate(columnValue) + '</td>';
          } else if (columnIndex === 5) { // Check if it's the 6th column
            // Assuming data[headers[columnIndex]] contains the link
            row += '<td class="center"><a href="' + columnValue + '" target="_blank">Drive</a></td>';
          } else {
            row += '<td class="center">' + columnValue + '</td>';
          }
        }

        row += '</tr>';
        detailsSummary += row;
      });

      detailsSummary += '</table>';
      detailsSummary += '</details>';

      // Append detailsSummary to tableHTML
      tableHTML += detailsSummary;

    } else {
      // Only show a single line in the table for each name
      tableHTML += '<tr><td>' + name +
        '</td><td class="center">' + countPresentacionesSinf + '</td><td class="center">' + countProgramasSinf + '</td><td class="center">' + countEnsayosSinf + '</td><td>' + countEnsayosGirasSinf +
        '</td><td class="center">' + countPresentacionesCF + '</td><td class="center">' + countProgramasCF + '</td><td class="center">' + countEnsayosCF + '</td><td>' + countEnsayosGirasCF +
        '</td><td class="center">' + countPresentacionesEnsamble + '</td><td class="center">' + countProgramasEnsamble + '</td><td class="center">' + countEnsayosEnsamble + '</td><td>' + countEnsayosGirasEns +
        '</td><td class="center">' + totalCountPresentaciones + '</td><td class="center">' + totalCountProgramas + '</td><td class="center">' + totalCountEnsayos + '</td><td>' + totalCountEnsayosSinGiras + '</td></tr>';;
    }
  });

  // Close the table if mostrarDetalle checkbox is not checked
  if (!mostrarDetalleCheckbox.is(':checked')) {
    tableHTML += '</table>';
  }

  // Append the final HTML to the detailsContainer outside the loop
  detailsContainer.append(tableHTML);
  if (!mostrarDetalleCheckbox.is(':checked')) {
    $('#people-details-table').DataTable({ pageLength: 100, dom: 'lrtip', resizable: true });
  }

  function buildTypeRows(rows, backgroundColor) {
    var typeRows = '';
    rows.forEach(function (data) {
      var row = '<tr style="background-color: ' + backgroundColor + ';">';
      for (var columnIndex = 0; columnIndex < 7; columnIndex++) {
        var columnValue = data[columnIndex];
        if (columnIndex === 1) {
          row += '<td class="center">' + formatDate(columnValue) + '</td>';
        } else if (columnIndex === 5) {
          row += '<td class="center"><a href="' + columnValue + '" target="_blank">Drive</a></td>';
        } else {
          row += '<td class="center">' + columnValue + '</td>';
        }
      }
      row += '</tr>';
      typeRows += row;
    });
    return typeRows;
  }

  function countEnsayos(rows) {
    return rows ? rows.filter(function (data) {
      return data[6].includes('Ensayo');
    }).length : 0;
  }
  function countEnsayosSinGiras(rows) {
    return rows ? rows.filter(function (data) {
      return data[6].includes('Ensayo') && !data[6].includes('de Gira');
    }).length : 0;
  }

  function countUniquePrograms(rows) {
    return new Set(rows.map(function (data) {
      return data[0];
    })).size;
  }
}



// Function to toggle details element
function toggleDetails(name) {
  var detailsElement = document.getElementById(name);
  if (detailsElement) {
    detailsElement.open = !detailsElement.open;
  }
}



// Function to extract data from the specified column
function extractColumnData(doc, columnIndex) {
  const tableRows = Array.from(doc.querySelectorAll('table tr'));
  const columnData = [];

  for (let i = 1; i < tableRows.length; i++) {
    const rowData = tableRows[i].querySelectorAll('td');
    if (rowData.length > columnIndex) {
      const cellValue = rowData[columnIndex].textContent.trim();
      // Check if the cell value is not empty before adding to columnData
      if (cellValue !== "") {
        columnData.push(cellValue);
      }
    }
  }

  return columnData;
}

function extractAllColumnData(doc, columnIndex) {
  const tableRows = Array.from(doc.querySelectorAll('table tr'));
  const columnData = [];

  for (let i = 1; i < tableRows.length; i++) {
    const rowData = tableRows[i].querySelectorAll('td');
    if (rowData.length > columnIndex) {
      const cellValue = rowData[columnIndex].textContent;


      columnData.push(cellValue);

    }
  }

  return columnData;
}
try {
  // Attach the event handlers to the checkbox and date input change events
  document.querySelectorAll('.filter-checkbox').forEach(function (button) {
    button.addEventListener('click', function () { filterData(); });
  });
  document.querySelector('#ocultarEnsayosButton').addEventListener('click', function () { filterData(); });
  document.querySelector('#ocultarEnsGirButton').addEventListener('click', function () { filterData(); });
  document.querySelector('#ocultarDiasVaciosButton').addEventListener('click', function () { filterData(); });
}
catch { }


document.querySelectorAll('.filter-date').forEach(function (dateInput) {
  dateInput.addEventListener('change', function () { filterData(false); });
});
/*document.querySelector('#completarDiasButton').addEventListener('click', function () {
  filterData(true);
});*/
//people = getDropdownData();
function getDataFromTextFiles() {
  // URLs of the text files
  const txtFileUrl1 = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/backup.txt';
  const txtFileUrl2 = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/backup2025.txt';

  // Fetch both text files
  return Promise.all([fetch(txtFileUrl1), fetch(txtFileUrl2)])
    .then(responses => {
      // Check if all responses are OK
      if (!responses.every(response => response.ok)) {
        throw new Error('Failed to fetch one or more text files');
      }
      // Read both as text
      return Promise.all(responses.map(response => response.text()));
    })
    .then(([base64Text1, base64Text2]) => {
      // Decode and process both files
      let dataArray1 = decodeAndRevertText(base64Text1);
      let dataArray2 = decodeAndRevertText(base64Text2);

      // Merge the headers (assuming the headers are identical)
      headers = dataArray1[0];
      dataArray1.shift();
      dataArray2.shift();

      // Combine the data arrays
      dataArray = [...dataArray1, ...dataArray2];

      // Filter and process the combined data array
      dataArray = dataArray.filter(row => row[0] !== undefined);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i][1] = new Date(dataArray[i][1]);

        const inputString = dataArray[i][2];
        if (inputString.includes('Sat')) {
          const date = new Date(inputString);

          // Extract hours and minutes
          let hours = date.getHours();
          const minutes = (date.getMinutes() + 1) % 60;
          if (minutes === 0) {
            hours = (hours + 1) % 24;
          }

          // Format the time as HH:mm
          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          dataArray[i][2] = formattedTime;
        }
      }

      // Floating filters (UI setup)
      let floatingFiltros = document.getElementById('floatingFiltros');
      let offsetX, offsetY;
      let isDragging = false;

      floatingFiltros.addEventListener('mousedown', startDragging);
      floatingFiltros.addEventListener('touchstart', startDragging);
      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag);
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchend', stopDragging);

      function startDragging(event) {
        if (event.type === 'mousedown') {
          offsetX = event.clientX - floatingFiltros.getBoundingClientRect().left;
          offsetY = event.clientY - floatingFiltros.getBoundingClientRect().top;
        } else if (event.type === 'touchstart') {
          offsetX = event.touches[0].clientX - floatingFiltros.getBoundingClientRect().left;
          offsetY = event.touches[0].clientY - floatingFiltros.getBoundingClientRect().top;
        }

        isDragging = true;
      }

      function drag(event) {
        event.preventDefault();

        if (isDragging) {
          let x, y;
          if (event.type === 'mousemove') {
            x = event.clientX - offsetX;
            y = event.clientY - offsetY;
          } else if (event.type === 'touchmove') {
            x = event.touches[0].clientX - offsetX;
            y = event.touches[0].clientY - offsetY;
          }

          let maxX = window.innerWidth - floatingFiltros.offsetWidth;
          let maxY = window.innerHeight - floatingFiltros.offsetHeight;
          x = Math.min(Math.max(x, 0), maxX);
          y = Math.min(Math.max(y, 0), maxY);

          floatingFiltros.style.left = x + 'px';
          floatingFiltros.style.top = y + 'px';
        }
      }

      function stopDragging() {
        isDragging = false;
      }

      filterData(false);

      // Show or toggle data based on view
      if (!isMobileView()) {
        // showData(dataArray, 12, 18);
      } else {
        // toggleFiltros();
      }

      function isMobileView() {
        return window.innerWidth <= 768;
      }

      console.log(dataArray); // Combined and processed data
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function getGirasFromTextFiles() {
  // URLs of the text files
  var txtFileUrl1 = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/giras2.txt';
  var txtFileUrl2 = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/giras3.txt';

  // Fetch both text files
  return Promise.all([fetch(txtFileUrl1), fetch(txtFileUrl2)])
    .then(responses => {
      // Check if all responses are OK
      if (!responses.every(response => response.ok)) {
        throw new Error('Failed to fetch one or more text files');
      }
      // Read both as text
      return Promise.all(responses.map(response => response.text()));
    })
    .then(([base64Text1, base64Text2]) => {
      // Decode and process both files
      let girasArray1 = decodeAndRevertText(base64Text1);
      let girasArray2 = decodeAndRevertText(base64Text2);

      // Filter out undefined rows
      girasArray1 = girasArray1.filter(row => row[0] !== undefined);
      girasArray2 = girasArray2.filter(row => row[0] !== undefined);

      // Combine both arrays (e.g., concatenate)
      girasArray = [...girasArray1, ...girasArray2];

      console.log(girasArray);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


//getDataFromTextFile();
// Function to decode Base64 encoded text and revert accent replacements
function decodeAndRevertText(base64Text) {
  // Add padding to the Base64 text if needed
  /*while (base64Text.length % 4) {
    base64Text += '=';
  }

  // Decode Base64
  var decodedText = atob(base64Text.replace(/-/g, '+').replace(/_/g, '/'));*/

  // Reverse the replacement of accented vowels
  var revertedText = revertAccentedVowels(base64Text);

  // Split the text into an array based on the specified delimiter ("/")
  var dataArray = revertedText.split('=/');
  //console.log(dataArray.length);

  // Split each data entry based on the reversed characters ("=/")
  dataArray = dataArray.map(data => data.split('+/'));

  //console.log(dataArray);
  return dataArray;
}
function decodeAndRevertGeneral(base64Text) {
  // Add padding to the Base64 text if needed
  /*while (base64Text.length % 4) {
    base64Text += '=';
  }

  // Decode Base64
  var decodedText = atob(base64Text.replace(/-/g, '+').replace(/_/g, '/'));*/

  // Reverse the replacement of accented vowels
  var revertedText = revertAccentedVowels(base64Text);

  // Split the text into an array based on the specified delimiter ("/")
  var data = revertedText.split('=/');
  //console.log(dataArray.length);

  // Split each data entry based on the reversed characters ("=/")
  data = data.map(data => data.split('+/'));

  //console.log(dataArray);
  return data;
}

// Function to revert the replacement of accented vowels
function revertAccentedVowels(text) {
  // Define a mapping of non-accented counterparts to their accented vowels
  var nonAccentedToAccentedMap = {
    '//a': 'á',
    '//e': 'é',
    '//i': 'í',
    '//o': 'ó',
    '//u': 'ú',
    '//A': 'Á',
    '//E': 'É',
    '//I': 'Í',
    '//O': 'Ó',
    '//U': 'Ú',
  };

  // Use a regular expression to replace non-accented counterparts with their accented vowels
  var revertedText = text.replace(/\/\/[aeiouAEIOU]/g, function (match) {
    return nonAccentedToAccentedMap[match];
  });

  return revertedText;
}
function setValueTest() {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw',
    range: 'Listado!A15',
    valueInputOption: 'USER_ENTERED',
    values: [["123"]]
  }).then(function (response) {
    console.log(response);
  });
}
function updateOneCell() {
  var spreadsheetId = "someSpreadsheetId";
  var request = {
    majorDimension: "ROWS",
    values: [[new Date()]]
  };
  Sheets.Spreadsheets.Values.update(
    request,
    spreadsheetId,
    "Sheet1!A1",
    { valueInputOption: "USER_ENTERED" }
  );
}
// Function to fetch data from Google Sheets
function getData() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw',
      range: 'Listado!E:O',
    }).then(response => {
      setValueTest();
      const values = response.result.values;
      //console.log(values);
      dataArray = extractData(values);
      headers = dataArray[0];
      dataArray.shift();
      //console.log(dataArray);
      dataArray = dataArray.filter(row => row[0] != undefined);
      //console.log("Última fila: " + dataArray[dataArray.length - 1][0])
      for (i = 0; i < dataArray.length; i++) {
        var dateParts = dataArray[i][1].split("/");
        var formattedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
        dataArray[i][1] = new Date(formattedDate + 'T00:00')
      }
      //console.log(dataArray)

      if (!isMobileView()) {
        //showData(dataArray, 12, 18);

      }
      else {
        //toggleFiltros();
      }
      let floatingFiltros = document.getElementById('floatingFiltros');
      let offsetX, offsetY;
      let isDragging = false;

      floatingFiltros.addEventListener('mousedown', startDragging);
      floatingFiltros.addEventListener('touchstart', startDragging);
      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag);
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchend', stopDragging);

      function startDragging(event) {
        if (event.type === 'mousedown') {
          offsetX = event.clientX - floatingFiltros.getBoundingClientRect().left;
          offsetY = event.clientY - floatingFiltros.getBoundingClientRect().top;
        } else if (event.type === 'touchstart') {
          offsetX = event.touches[0].clientX - floatingFiltros.getBoundingClientRect().left;
          offsetY = event.touches[0].clientY - floatingFiltros.getBoundingClientRect().top;
        }

        isDragging = true;
      }

      function drag(event) {
        event.preventDefault();

        if (isDragging) {
          let x, y;
          if (event.type === 'mousemove') {
            x = event.clientX - offsetX;
            y = event.clientY - offsetY;
          } else if (event.type === 'touchmove') {
            x = event.touches[0].clientX - offsetX;
            y = event.touches[0].clientY - offsetY;
          }

          let maxX = window.innerWidth - floatingFiltros.offsetWidth;
          let maxY = window.innerHeight - floatingFiltros.offsetHeight;
          x = Math.min(Math.max(x, 0), maxX);
          y = Math.min(Math.max(y, 0), maxY);

          floatingFiltros.style.left = x + 'px';
          floatingFiltros.style.top = y + 'px';
        }
      }

      function stopDragging() {
        isDragging = false;
      }



      filterData();
      //convert the values to valid dates
      function isMobileView() {
        // You can adjust the breakpoint value as needed
        return window.innerWidth <= 768; // Example: consider screen width <= 768px as mobile view
      }
      resolve(dataArray);
    }).catch(error => {
      console.error('Error fetching data:', error);
      document.getElementById('table-data').innerHTML = '<p style="color: red; text-align: center">No funciona Google en este momento</p>'
      reject(error);
    });

  });
}
// Function to extract data from the HTML response
function extractData(doc) {
  const tableRows = doc;
  const extractedData = [];

  if (tableRows.length < 1) {
    console.error('No data found in the table.');
    return extractedData;
  }

  headers = tableRows[0];
  //console.log(tableRows)

  //
  /*for (let i = 1; i < tableRows.length; i++) {
      const rowData = Array.from(tableRows[i].querySelectorAll('td')).map(td => td.textContent.trim());
      const extractedRow = rowData.slice(startColumn - 1, endColumn);
      extractedData.push(extractedRow);
  }*/

  return tableRows;
}

// Function to show data received from the server
function showData(data, startColumn, endColumn) {

  if (!data || data.length === 0) {
    console.error('No data to display.');
    return;
  }

  //console.log(ensParam);

  // Dynamically populate the table header
  var thead = $('#table-data thead');
  var headerRowHTML = '<tr>';
  var order = [0, 1, 2, 3, 4, 6, 8, 9]
  if (esCoordEns) { order.push(7); }
  for (o = 0; o < order.length; o++) {
    headerRowHTML += '<th style="padding: 10px">' + headers[order[o]] + '</th>';
  }
  headerRowHTML += '</tr>';
  thead.append(headerRowHTML);
  var inputRowHTML = '<tr id="filtros-texto">';
  for (o = 0; o < order.length; o++) {
    var tbody = $('#table-data tbody');
    inputRowHTML += '<th class="tooltip"><input type="text" class="filter-input" data-column="' + headers[order[o]] + '" style="width: 80%"><div class="tooltiptext">Escribí los valores que quieras que aparezcan en esta columna, separados por guiones</div></th>';

  }
  inputRowHTML += '</tr>';
  thead.append(inputRowHTML);

  var debounceTimer;

  $('.filter-input').on('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      filterData();
    }, 1500); // Adjust the delay time (in milliseconds) as needed
  });



}


// Function to filter data based on checkboxes and date range
async function filterData(completarDias = false) {
  // Ensure headers and dataArray are defined
  if (!headers || !dataArray) {
    console.log("No headers or dataArray defined")
    return;
  }


  var selectedValues = $('.filter-checkbox.active').map(function () {
    return $(this).val();
  }).get();


  var fromDate = $('#fromDate').val();
  var untilDate = $('#untilDate').val();
  var tbody = $('#table-data tbody');
  var currentMonth = null;
  var currentDay = 0;


  // Clear existing rows
  //tbody.empty().css('width', 'auto');


  // Get the dropdown value and check if the container exists
  var dropdownContainer = $('#dropdown-container');
  var dropdownValue = null;



  if (!ensParam) {
    const nombreParam = urlParameters.get('nombre');
    //console.log(nombreParam);

    if (!nombreParam) {
      // Proceed with the original functionality
      dropdownValue = dropdownContainer.length > 0 ? dropdownContainer.find('select').val() : null;

    } else {
      // Fetch the corresponding value from the spreadsheet
      try {
        dropdownValue = await fetchSpreadsheetValue(nombreParam);
        console.log(`El valor del nombre es ${dropdownValue}`);
      } catch (error) {
        console.error('Error fetching spreadsheet value:', error);
      }
    }
  }
  else {
    try {
      dropdownValue = await fetchEnsamble(ensParam);
      console.log(`El valor de ens es ${dropdownValue}`);
    } catch (error) {
      console.error('Error fetching ensamble value:', error);
    }
  }

  // Get values from filter input textboxes
  var filterValues = {};
  $('.filter-input').each(function () {
    var column = $(this).data('column');
    var value = $(this).val().trim();
    filterValues[column] = value.toLowerCase(); // Convert to lowercase for case-insensitive comparison
  });
  if (dropdownValue) {
    document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${dropdownValue}`;
  }
  console.log(`El valor2 del nombre es ${dropdownValue}`);

  // Check if "Ocultar Ensayos" checkbox is checked
  var ocultarEnsayosChecked = !document.getElementById('ocultarEnsayosButton').classList.contains('active');
  var ocultarEnsGirChecked = !document.getElementById('ocultarEnsGirButton').classList.contains('active');

  // Filter and display rows based on checkboxes, date range, dropdown value, and filter input textboxes
  //console.log(dataArray);
  var filteredData = dataArray.filter(function (data) {

    var dateInRange = isDateInRange(data[1], fromDate, untilDate);
    var columnaEnsambles = data[6];
    var esCancelado = false;

    if (data.length > 10) { esCancelado = data[10].toLowerCase().match('cancelado') };

    // Check if "Ocultar Ensayos" checkbox is checked and if the word "ensayo" is present in column 6
    var ocultarEnsayosCondition = !ocultarEnsayosChecked || !columnaEnsambles.toLowerCase().includes('ensayo') || columnaEnsambles.toLowerCase().includes('gira');
    var ocultarEnsGirCondition = !ocultarEnsGirChecked || !columnaEnsambles.toLowerCase().includes('gira');

    return (
      (selectedValues.length === 0 || contieneValor(columnaEnsambles, selectedValues)) &&
      dateInRange &&
      (!dropdownValue || (data[7] && data[7].toLowerCase().match(dropdownValue.toLowerCase()))) &&
      !esCancelado &&
      (passFilter(data, filterValues)) &&
      ocultarEnsayosCondition && ocultarEnsGirCondition
    );
  });
  console.log(girasArray);
  console.log(selectedValues);
  var filteredGiras = girasArray.filter(function (gira) {
    var isNombre = dropdownValue ? gira[1].toLowerCase().match(dropdownValue.toLowerCase()) : true;
    var isEnsamble = (selectedValues.length === 0 || contieneValor(gira[2], selectedValues))
    return (isNombre && isEnsamble);
  })

  console.log(filteredGiras);
  
  console.log(filteredData)
  var nombresGiras = filteredGiras.map(n => n[0]);
  var inicioGiras = filteredGiras.map(n => new Date(n[3]));
  console.log(inicioGiras);
  var finGiras = filteredGiras.map(n => new Date(n[4]));
  var linkGiras = filteredGiras.map(n => n[5]);

  var cantidadPresentaciones = 0;
  var cantidadEnsayos = 0;
  var cantidadEnsGir = 0;

  var uniquePrograms = new Set(filteredData
    .filter(function (data) {
      return !data[0].includes('♪'); // Exclude values with "♪" in data[0]
    })
    .filter(function (data) {
      return !data[6].toLowerCase().includes('ensayo'); // Exclude values with "♪" in data[0]
    })
    .map(function (data) {
      return data[0];
    }));

  var filteredPresentaciones = filteredData.filter(function (data) {
    var hasEnsayo = data[6].toLowerCase().includes('ensayo') && !data[6].toLowerCase().includes('gira');
    var hasEnsGir = data[6].toLowerCase().includes('ensayo') && data[6].toLowerCase().includes('gira');
    if (hasEnsGir) {
      cantidadEnsGir++;
    }
    else if (hasEnsayo) {
      cantidadEnsayos++;
    }

    return !hasEnsayo && !hasEnsGir;
  });

  cantidadPresentaciones = filteredPresentaciones.length;

  // Generate empty rows for days with no activity

  if (completarDias) {
    completarDiasRango();
  }

  // Create the table with the final array
  createView();

  // Apply background color to the first column based on conditions
  /*if (dropdownValue) {
    applyBackgroundColorToFirstColumn();
  }*/
  function formatDate(dateString) {
    var options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }



  // Update the counts in the HTML
  $('#cant-elem').text('Programas: ' + uniquePrograms.size);
  $('#cant-pres').text(' -- Presentaciones: ' + cantidadPresentaciones + ' -- Ensayos: ' + cantidadEnsayos + ' -- Ensayos de Gira/Progr.: ' + cantidadEnsGir);
  //$('#table-data').css('width', 'auto');
  const destroyResizableTable = function (table) {
    const resizers = table.querySelectorAll('.resizer');
    resizers.forEach(function (resizer) {
      resizer.parentNode.removeChild(resizer);
    });
  };

  function createTableAsCards() {
    var table = document.getElementById('table-data');
    // Check if the table exists
    if (!table) {
      console.error("Table not found");
      return;
    }
    let width1;
    let width2;
    let width3;
    let width4;

    if (isMobileView()) {
      width1 = '18';
      width2 = '30';
      width3 = '40';
      width4 = '10';

      console.log('Es vista móvil');
    }
    else {
      width1 = '18';
      width2 = '30';
      width3 = '15';
      width4 = '30';
      console.log('No es vista móvil');

    }

    var tbody = table.getElementsByTagName('tbody')[0];
    // Clear existing rows
    tbody.innerHTML = '';

    // Object to store detailed rows by date
    var detailedRowsByDate = {};

    filteredData.forEach(function (data) {
      let estado;
      var rowDay = data[1];
      var formattedDate = semiLongDate(rowDay);

      // Check if detailed rows for this date already exist
      if (!detailedRowsByDate[rowDay]) {
        detailedRowsByDate[rowDay] = [];
      }

      // Construct the detailed row
      //var detailedRow = '<tr class="detailed-row" data-date="' + formattedDate + '" style="text-align: center; display: none">';
      var tipoPres = "";
      var tipoCelda = ""; //Para el detalle en la tercer column
      if (data[8].toLowerCase().includes('presentación')) { tipoPres = " presentacion"; tipoCelda = "Concierto" }
      else if (data[6].includes('Gira/Progr')) { tipoPres = ' ensayoGira'; tipoCelda = 'Ensayo Gira/CF' }
      else { tipoPres = ' ensayo'; tipoCelda = data[6] }
      var detailedRow = '<tr class="detailed-row' + tipoPres + '" data-date="' + rowDay + '"style="width: 100%; text-align: center; padding: 1px; display: none;';


      detailedRow += '"><td style="width: ' + width1 + '%">'
      //let estado;
      let estadoColor = '';

      if (data[10] == undefined || !esCoordEns) {
        estado = '';
      } else {
        switch (data[10]) {
          case 'REVISAR':
            estadoColor = 'red';
            break;
          case 'Auto-gestionado':
            estadoColor = 'blue';
            break;
          case 'Confirmado':
            estadoColor = 'green';
            break;
          case 'CANCELADO':
            estadoColor = 'purple';
            break;
          case 'Pedido':
            estadoColor = 'yellow';
            break;
          case 'Estimado':
            estadoColor = 'orange';
            break;
          default:
            estadoColor = '';
        }

        estado = estadoColor
          ? '<span style="background: ' + estadoColor + ';">' + data[10] + '</span>'
          : '<span>' + data[10] + '</span>';
      }
      //FECHA
      detailedRow += '<p>' + [data[2], estado].filter(Boolean).join("</p><p>") + '</p>';
      detailedRow += '</td><td style="width: ' + width2 + '%">'
      //Lugares
      detailedRow += '<p>' + [data[3], data[4]].filter(Boolean).join('</p><p>') + '</p>';
      detailedRow += '</td><td style="width: ' + width3 + '%">'
      //Agregar tipo de programa
      var tipo;
      if (data[0] != "Sin programa asign.") {
        var progrs = data[0].split(' ♪ ');
        var drives = data[5].split(' ♪ ');
        var programColored = "";
        var planillas = data[11].split(' ♪ ');
        var planilla = '';
        // Process each value separately
        for (var i = 0; i < progrs.length; i++) {
          var backgroundColor;

          if (progrs[i].includes('Sinf')) {
            backgroundColor = '#5f51db';
            tipo = "Sinf";
          } else if (progrs[i].includes('CF Val')) {
            backgroundColor = '#E1C16E';
            tipo = "CFVal";
          } else if (progrs[i].includes('CF Mon')) {
            backgroundColor = '#A8A8A8';
            tipo = "CFMon";
          } else if (progrs[i].includes('CF Mar')) {
            backgroundColor = '#89CFF0';
            tipo = "CFMar";
          } else if (progrs[i].includes('CFCuer')) {
            backgroundColor = '#ffccff';
            tipo = "CFCuer";
          } else {
            backgroundColor = '#baee29';
            tipo = data[6].replace('Ensayo de ', '').replace('Gira/Progr. ', '');
            tipo = tipo.split(' ')[0];

          }
          if (esCoordEns) {
            planilla = ' <a href="' + planillas[i] + '" style="background: lightblue; text-decoration: none;" >☁︎</a> ';
          }

          programColored += '<a href="' + drives[i] + '" style="background: ' + backgroundColor + '"> ' + progrs[i].substring(0, 12) + ' </a>' + planilla + '<br>';

        }
        if (!tipo) { tipo = "Sin asignar" }
        detailedRow += '<p style="line-height: 1;"> <span style="font-size: 0.7em">' + tipoCelda + '</span><br>' + programColored + '</p>';
      }
      else {
        detailedRow += '<p> <span style="font-size: 0.7em">' + tipoCelda + '</span><br>Sin asignar</p>';
        tipo = data[6].replace('Ensayo de ', '').replace('Gira/Progr. ', '');
        tipo = tipo.split(' ')[0];
      }
      if (data[6].includes('Ensayo de')) { tipo = data[6].replace('Ensayo de ', '').replace('Gira/Progr. ', ''); tipo = tipo.split(' ')[0]; }

      //OBSERVACIONES
      var obs = data[8]
      if (data[8].includes('Integrado')) {
        obs = data[8].replace('Ensayo Integrado:', '');
      }
      let obsDisplay;
      if (isMobileView()) { obsDisplay = 'p' }
      else { obsDisplay = 'td' }
      if (data[8] != "Presentación") { detailedRow += '<' + obsDisplay + '><i>Observ: </i>' + obs + '</p>' }
      else { detailedRow += '<' + obsDisplay + '><i>Observ: </i>' + data[9] + '</p>' }

      //else { row += '<p>Partic: ' + data[6] + '</p>' };
      if (esCoordEns) {
        const namesArray = data[7].split('|');
        let namesString = ""
        // Filter the names based on the matching names in dropdownValue
        let cantidadNombres = dropdownValue.split("|");
        let filteredNames = namesArray.filter(name => dropdownValue.includes(name));
        if (cantidadNombres.length == filteredNames.length) {

          namesString = `${ensParam} Completo`;
        }
        else {
          var nombresCompletosChecked = document.getElementById('mostrarNombresButton').classList.contains('active');
          // Shorten each name to the first two characters of each word (initials) plus one additional letter
          if (nombresCompletosChecked || isMobileView()) { }
          else {
            filteredNames = filteredNames.map(name => {
              const initials = name.split(' ').map(word => word.charAt(0) + word.charAt(1).toLowerCase()).join(''); // Get initials of each word

              return initials;
            });
          }

          // Join the shortened names back into a string with "|" separator
          namesString = filteredNames.join('-');
        }

        // Add the shortened names to the row
        if (isMobileView()) {
          if (cantidadNombres.length == filteredNames.length) {
            detailedRow += `<td class= "partEns" style="width: ${width4}%; cursor: pointer;" title="${namesString}">Comp</td>`;
          }
          else {
            detailedRow += `<td class= "partEns" style="width: ${width4}%; cursor: pointer;" title="${namesString}">${filteredNames.length}/${cantidadNombres.length}</td>`;

          }
        }
        else {
          detailedRow += '<td style="width: 15%;">' + namesString + '</td>';
        }
      }



      detailedRow += '</td> <!–-tipo: ' + tipo + '  -–><!–-hora: ' + data[2] + '  /hora-–><!–-obs: ' + obs + '  /obs-–></tr>';

      // Push detailed row to the corresponding date
      detailedRowsByDate[rowDay].push(detailedRow);
    });

    // Create summary rows and attach event listeners
    for (var date in detailedRowsByDate) {
      var rowMonth = new Date(date).getMonth();
      var rowDay = new Date(date);
      var isOcultarDias = !document.querySelector('#ocultarDiasVaciosButton').classList.contains('active');
      if (!isOcultarDias) {
        var diff = (rowDay - currentDay) / 1000 / 24 / 60 / 60
        if (diff > 1 && currentDay !== 0) {
          //tbody.append('<tr><td><h3>'+diff+'</h3><p>Día sin actividad</p></td></tr>');
          for (i = 1; i < diff; i++) {
            let nextDay = new Date(currentDay.getTime() + i * 24 * 60 * 60 * 1000); // Adding i days

            rowMonth = nextDay.getMonth();
            if (currentMonth !== rowMonth) {
              // Insert a separator row with the name of the month
              var monthSeparatorRow = '<tr style="width: 100%; height: 30px; background-color: rgb(32, 99, 145); color: white;font-weight: bold; font-size: 15px; text-align: center !important;"><td colspan="' + totalCols + '">' + getMonthName(rowMonth) + '  ' + new Date(date).getFullYear() + '</td></tr>';
              tbody.insertAdjacentHTML('beforeend', monthSeparatorRow);

            }
            currentMonth = rowMonth; // Update the current month
            function isSameDay(date1, date2) {
              return new Date(date1).getTime() === new Date(date2).getTime();
            }
            let fD = semiLongDate(nextDay);
            let dom = '';
            if (fD.startsWith('D')) { dom = ' style ="color:blue"'; }
            tbody.insertAdjacentHTML('beforeend', '<tr style="text-align: center;background: linear-gradient(rgb(196, 193, 193),rgb(196, 193, 193), white) content-box;font-size: 14px; height: 17px;"><td colspan="' + totalCols + '" ' + dom + '><p>' + fD + '</p></td></tr>');
            if (fD.startsWith('D')) { tbody.insertAdjacentHTML('beforeend', '<tr><td colspan="' + totalCols + ' style="height: 5px; background-color: gray;"></td></tr>'); };
          };
        }
      }

      currentDay = rowDay
      if (currentMonth !== rowMonth) {
        // Insert a separator row with the name of the month
        var monthSeparatorRow = '<tr style="width: 100%; height: 40px; background-color: rgb(32, 99, 145); color: white;font-weight: bold; font-size: 20px; text-align: center !important;"><td colspan="' + totalCols + '">' + getMonthName(rowMonth) + '  ' + new Date(date).getFullYear() + '</td></tr>';
        tbody.insertAdjacentHTML('beforeend', monthSeparatorRow);
        currentMonth = rowMonth; // Update the current month
      }
      function isSameDay(date1, date2) {
        return new Date(date1).getTime() === new Date(date2).getTime();
      }
      //console.log(inicioGiras)
      //console.log(nextDay)

      if (inicioGiras.some(date => isSameDay(date, currentDay))) {
        // Find the index of matching date in inicioGiras
        const giraIndex = inicioGiras.findIndex(date => isSameDay(date, currentDay));
        // Use the index to access the corresponding element in nombresGiras
        var estaGira = nombresGiras[giraIndex];
        var esteLink = linkGiras[giraIndex];
        tbody.insertAdjacentHTML('beforeend', '<tr class="sepGira"><td colspan="' + totalCols + '"><a href="' + esteLink + '">' + estaGira + '</a></td></tr>');

      }



      const events = detailedRowsByDate[date];
      const presentaciones = events.filter(event => event.includes("presentacion")).length;
      const ensGira = events.filter(event => event.includes("ensayoGira")).length;
      const ensayos = events.length - presentaciones - ensGira;
      let tipoResumen;

      if (presentaciones === events.length) {
        tipoResumen = " presentacion";
      } else if (ensGira === events.length) {
        tipoResumen = " ensayoGira";
      } else if (ensayos === events.length) {
        tipoResumen = " ensayo";
      } else {
        tipoResumen = " mixto";
      }

      const esUnico = (events.length == 1)
      var summaryRow = '<tr class="summary-row' + tipoResumen + '" data-date="' + date + '" style="cursor: pointer; text-align: center; background: linear-gradient(light green, white); font-size: 18px;">';
      summaryRow += '<td colspan="' + totalCols + '"><p>' + semiLongDate(new Date(date)) + ' - ';

      if (esUnico) {
        if (presentaciones == 1) {
          summaryRow += `<span class="tipoNegrita tipoSubr">Concierto`;
        }
        else if (ensGira == 1) {
          summaryRow += '<span class="tipoNegrita">EnsGira';
        }
        else {
          summaryRow += `<span class="tipoNegrita">Ensayo`;
        }
        summaryRow += `</span>: ${events[0].substring(events[0].indexOf("hora: ") + 6, events[0].indexOf(" /hora-–>"))}`;
        if (!isMobileView()) {
          summaryRow += ` || <span class="cursiva">${events[0].substring(events[0].indexOf("obs: ") + 5, events[0].indexOf(" /obs-–>"))}</span>`;
        }
      } else {

        let ensStr;
        let presStr;
        let ensGirStr;
        if (ensayos > 1) {
          ensStr = ensayos + ' <span class="tipoNegrita">Ensayos</span>';
        } else if (ensayos === 1) {
          ensStr = ' 1 <span class="tipoNegrita">Ensayo</span>';
        }

        if (presentaciones > 1) {
          presStr = presentaciones + ' <span class="tipoNegrita tipoSubr">Conciertos</span>';
        } else if (presentaciones === 1) {
          presStr = '1 <span class="tipoNegrita tipoSubr">Concierto</span>';
        }

        if (ensGira > 1) {
          ensGirStr = ensGira + ' <span class="tipoNegrita">EnsGira</span>';
        } else if (ensGira === 1) {
          ensGirStr = '1 <span class="tipoNegrita">EnsGira</span>';
        }


        summaryRow += ensStr ? (ensStr + (ensGirStr ? ", " + ensGirStr : "") + (presStr ? ", " + presStr : "")) : (ensGirStr ? ensGirStr + (presStr ? ", " + presStr : "") : presStr);

      }



      var tipos = new Set(events.map(str => {
        // Find the starting and ending positions of "THIS"
        const startPos = str.indexOf("tipo: ") + 6; // Skip "tipo: "
        const endPos = str.indexOf("  -–>");

        // Extract the value
        return str.substring(startPos, endPos);
      }));

      var tipoPrograma = ""
      if (tipos.size == 1) {
        for (const tipo of tipos) {
          tipoPrograma = tipo;
          break; // Exit the loop after getting the first element
        }
      }
      else { tipoPrograma = "Varios" }
      summaryRow += ` (${tipoPrograma})`

      summaryRow += '</p></td></tr>';
      tbody.insertAdjacentHTML('beforeend', summaryRow);
      if (finGiras.some(date => isSameDay(date, currentDay))) {
        // Similar logic for Fin Gira
        const giraIndex = finGiras.findIndex(date => isSameDay(date, currentDay));
        var estaGira = nombresGiras[giraIndex];
        tbody.insertAdjacentHTML('beforeend', '<tr class="sepGira"><td colspan="' + totalCols + '"></td></tr>');
      }

      // Insert detailed rows into tbody but keep them hidden initially
      detailedRowsByDate[date].forEach(function (detailedRow) {

        tbody.insertAdjacentHTML('beforeend', detailedRow);
        if (esUnico) {
          tbody.lastChild.style.display = 'none';

        }
        else {
          tbody.lastChild.classList.add('chico');
        }
      });

    }

    // Add event listeners to summary rows for toggling detailed rows
    var summaryRows = document.querySelectorAll('.summary-row');
    summaryRows.forEach(function (row) {
      row.addEventListener('click', function () {
        var date = this.getAttribute('data-date');
        this.classList.toggle('desplegado')
        var detailedRows = document.querySelectorAll('.detailed-row[data-date="' + date + '"]');
        detailedRows.forEach(function (detailedRow) {
          detailedRow.style.display = (detailedRow.style.display === 'none') ? 'table-row' : 'none';
        });
      });
    });
    if (isMobileView()) {
      const tableCell = document.querySelectorAll('.partEns'); // Replace with the actual selector for your table cell

      tableCell.forEach(function (thisCell) {
        thisCell.addEventListener('click', function () {
          const fullNames = this.getAttribute('title');
          // You can customize the popup implementation here
          floatingElement.textContent = fullNames;
          floatingElement.style.display = 'block';
        });
      });
    }
  }



  // Function to determine if the current view is mobile or not
  function isMobileView() {
    // You can adjust the breakpoint value as needed
    return window.innerWidth <= 768; // Example: consider screen width <= 768px as mobile view
  }

  // Function to create either table or cards based on the view
  function createView() {
    if (isMobileView()) {
      createTableAsCards();
    } else {
      //createTable().then(setColumnWidths);
      createTableAsCards();

    }
  }

  // Call createView initially when the page loads
  //createView();

  function setColumnWidths() {
    var table = document.querySelector('#table-data');
    var columns = table.querySelectorAll('td');

    var columnWidths = [17, 8, 20, 5, 10, 8, 12, 10, 10]; // Percentage values

    columns.forEach(function (column, index) {
      column.style.width = columnWidths[index] + '%';
    });

    if (!esCoordEns) {
      deleteColumn('table-data', 8);
    }
    function deleteColumn(tableId, columnIndex) {
      var table = document.getElementById(tableId);

      if (table) {
        for (var i = 0; i < table.rows.length; i++) {
          var row = table.rows[i];

          for (var j = 0; j < row.cells.length; j++) {
            var cell = row.cells[j];

            // Check if the cell overlaps with the target column
            if (columnIndex >= j && columnIndex < j + cell.colSpan) {
              // Adjust colspan if the cell spans multiple columns
              if (cell.colSpan > 1) {
                cell.colSpan--;

                // Adjust the loop counter to skip cells covered by colspan
                j += cell.colSpan - 1;
              } else {
                // Delete the cell if it doesn't have colspan
                row.deleteCell(j);
              }
            }
          }
        }

        // Check if the table has a thead section
        if (table.tHead) {
          for (var rowIdx = 0; rowIdx < table.tHead.rows.length; rowIdx++) {
            var headerRow = table.tHead.rows[rowIdx];

            // Check if the header row has cells
            if (headerRow && headerRow.cells) {
              for (var k = 0; k < headerRow.cells.length; k++) {
                var headerCell = headerRow.cells[k];

                // Check if the header cell overlaps with the target column
                if (columnIndex >= k && columnIndex < k + headerCell.colSpan) {
                  // Adjust colspan if the header cell spans multiple columns
                  if (headerCell.colSpan > 1) {
                    headerCell.colSpan--;

                    // Adjust the loop counter to skip cells covered by colspan
                    k += headerCell.colSpan - 1;
                  } else {
                    // Delete the header cell if it doesn't have colspan
                    headerRow.deleteCell(k);
                  }
                }
              }
            }
          }
        }
      } else {
        console.error("Table not found");
      }
    }



  }




  function completarDiasRango() {
    var currentDate = fromDate ? new Date(fromDate + 'T00:00') : dataArray[0][1];
    var endDate = untilDate ? new Date(untilDate + 'T00:00') : dataArray[dataArray.length - 1][1];
    console.log(dataArray[dataArray.length - 1][1])
    console.log("Current: " + currentDate)
    console.log("End: " + endDate)
    var daysInRange = Math.floor((endDate - currentDate) / (24 * 60 * 60 * 1000)) + 1;

    // Get the div element for displaying messages
    var errorMessageElement = document.getElementById('errorMessage');

    if (daysInRange > 600) {
      // Display a message to the user
      errorMessageElement.textContent = 'Reducí el rango a 60 días o menos';
    } else {
      // Clear any previous messages
      errorMessageElement.textContent = '';

      // Continue with the rest of your existing code
      while (currentDate <= endDate) {
        var formattedDate = formatDate(currentDate);

        // Check if the formatted date is not in filteredData
        var dayWithoutActivity = filteredData.every(function (data) {
          return formatDate(data[1]) !== formattedDate;
        });

        if (dayWithoutActivity) {
          filteredData.push(['Día sin actividad', new Date(currentDate), '', '', '', '', '', '', '', '']);
        }

        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      // Sort the combined array by date
      filteredData.sort(function (a, b) {
        return a[1] - b[1];
      });
    }
  }
  const createResizableTable = function (table) {
    destroyResizableTable(table); // Remove existing resizers
    const cols = table.querySelectorAll('th');
    [].forEach.call(cols, function (col) {
      const resizer = document.createElement('div');
      resizer.classList.add('resizer');
      resizer.style.height = `${table.offsetHeight}px`;
      col.appendChild(resizer);
      createResizableColumn(col, resizer);
    });
  };

  const createResizableColumn = function (col, resizer) {
    let x = 0;
    let w = 0;

    const mouseDownHandler = function (e) {
      x = e.clientX;

      const styles = window.getComputedStyle(col);
      w = parseInt(styles.width, 10);

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);

      resizer.classList.add('resizing');
    };

    const mouseMoveHandler = function (e) {
      const dx = e.clientX - x;
      col.style.width = `${w + dx}px`;
    };

    const mouseUpHandler = function () {
      resizer.classList.remove('resizing');
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
  };

  // Clear any existing event listeners on the table headers
  $('#table-data th .resizer').off('mousedown mousemove mouseup');

  // Destroy existing resizable table
  destroyResizableTable(document.getElementById('table-data'));

  // Allow a slight delay for existing event listeners to be removed
  setTimeout(function () {
    // Create the resizable table after adjusting the width
    createResizableTable(document.getElementById('table-data'));
  }, 100);

}




//filterData();

function getMonthName(month) {
  var months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}
// Updated function to fetch corresponding value from the spreadsheet and update h1 element
function fetchSpreadsheetValue(nombreParam) {
  const spreadsheetUrl = 'https://raw.githubusercontent.com/RantuchoM/OFRN/main/integrantes.txt'; // Replace with the actual URL of the external page

  return fetch(spreadsheetUrl)
    .then(response => response.text())
    .then(base64Text => {
      //const parser = new DOMParser();
      doc = decodeAndRevertText(base64Text);
      //console.log(doc);


      const dataAB = doc.map(n => n[13]) // Extract data from the 28th column (AB column)
      console.log(dataAB);
      //console.log(dataAB);
      // Find the corresponding value in column AB
      const index = dataAB.indexOf(nombreParam);
      if (index !== -1) {
        // If the value is found in column AB, fetch the corresponding value in column D
        const dataD = doc.map(n => n[3]); // Extract data from the 4th column (D column)
        const valueInD = dataD[index];

        // Update the h1 element with the fetched valueInD
        document.querySelector('h1').innerHTML = `Calendario OFRN de <br>${valueInD}`;
        document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${valueInD}`;
        return valueInD;
      } else {
        console.error('No matching value found in column AB.');
        return null;
      }
    })
    .catch(error => {
      console.error('Error fetching data from the spreadsheet:', error);
      return null;
    });
}
function fetchEnsamble(ens) {
  const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5m75Pzx8cztbCWoHzjtcXb3CCrP-YfvDnjE__97fYtZjJnNPqEqyytCXGCcPHKRXDsyCDmyzXO5Wj/pubhtml?gid=0&single=true'; // Replace with the actual URL of the external page


  return fetch(spreadsheetUrl)
    .then(response => response.text())
    .then(html => {

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      console.log(ens);
      const ensambles = extractColumnData(doc, 2); // Extract data from the 4th column
      const miembros = extractColumnData(doc, 3); // Extract data from the 3rd column
      console.log(ensambles);
      console.log(miembros);

      // Filter miembros based on the condition that the corresponding ensambles value matches the variable "ens"
      const filteredMiembros = miembros.filter((miembro, index) => ensambles[index].includes(ens));
      //console.log(filteredMiembros);
      // Create a string by joining the values of filteredMiembros with "|"
      const resultString = `${filteredMiembros.join('|')}`;

      // Use resultString for further processing or display
      //console.log(`Ens: ${resultString}`);

      // Rest of your code...
      document.querySelector('h1').innerHTML = `${ens} <br> Coordinación`;
      document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${ens}`;
      return resultString;
    })
    .catch(error => {
      console.error('Error fetching data from the spreadsheet:', error);
      return null;
    });
}
function semiLongDate(date) {
  var options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  var formattedDate = date.toLocaleDateString('es-ES', options);

  // Extract and format day, month, and year
  var parts = formattedDate.split(' ');
  var dayOfWeek = parts[0].charAt(0).toUpperCase() + parts[0].slice(1); // Capitalize the first letter
  var day = parts[1].padStart(2, '0'); // Ensure two digits for the day
  var monthAbbreviation = parts[2];
  var year = parts[3];

  return `${dayOfWeek} ${day}/${monthAbbreviation}`;
}

function longDate(date) {
  var options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
  var formattedDate = date.toLocaleDateString('es-ES', options);

  // Extract and format day, month, and year
  var parts = formattedDate.split(' ');
  var dayOfWeek = parts[0].charAt(0).toUpperCase() + parts[0].slice(1); // Capitalize the first letter
  var day = parts[1].padStart(2, '0'); // Ensure two digits for the day
  var monthAbbreviation = parts[3];
  var year = parts[5];

  return `${dayOfWeek} ${day}/${monthAbbreviation}/${year}`;
}
// Helper function to check if data passes filter input textboxes
function passFilter(data, filterValues) {
  for (var column in filterValues) {
    var columnIndex = headers.indexOf(column);
    if (columnIndex !== -1 && data[columnIndex] !== undefined && data[columnIndex] !== null) {
      var cellValue = data[columnIndex];

      var filterValue = filterValues[column].toLowerCase(); // Convert to lowercase for case-insensitive comparison

      // Check if the column represents a date
      if (columnIndex === 1) {
        // If it's a date column, convert the cell value to the longDate string
        cellValue = longDate(cellValue).toString().toLowerCase();
      } else {
        // If it's not a date column, convert the value to a string
        cellValue = cellValue.toString().toLowerCase();
      }

      // Split filterValue by dash to get multiple values
      var filterList = filterValue.split('-').map(value => value.trim());

      // Filter out empty values from filterList
      filterList = filterList.filter(value => value !== '');

      // Check if any of the filter values match the cell value
      if (filterList.length > 0) {
        // Check if the last filter value ends with a dash
        const lastFilter = filterList[filterList.length - 1];
        if (cellValue == "" && filterValue.endsWith('-')) { return true }
        // Check if the cellValue includes any non-empty filter value
        if (!(lastFilter.endsWith('-') && cellValue === '')) {
          if (!filterList.some(filter => cellValue.includes(filter))) {
            return false; // Data doesn't pass the filter for this column
          }

        }
      }
    }
  }
  return true; // Data passes all filter input textboxes
}




function applyBackgroundColorToFirstColumn(table) {
  table = table || document.getElementById('table-data');
  var rows = table.getElementsByTagName('tr');

  // Iterate over rows (skip the header row)
  for (var i = 1; i < rows.length; i++) {
    var currentRow = rows[i];
    var currentFirstColumn = currentRow.cells[0].textContent;

    // Check if the value in the second column is repeated, but the value in the first column is different
    for (var j = i + 1; j < rows.length; j++) {
      var nextRow = rows[j];

      // Check if the colspan is not equal to 9
      if (currentRow.cells[0].colSpan !== 9 && nextRow.cells[0].colSpan !== 9) {
        var nextFirstColumn = nextRow.cells[0].textContent;
        var nextSecondColumn = nextRow.cells[1].textContent;

        if (nextSecondColumn === currentRow.cells[1].textContent && nextFirstColumn !== currentFirstColumn) {
          currentRow.cells[0].style.backgroundColor = 'orange';
          currentRow.cells[0].style.fontWeight = 'bold';
          nextRow.cells[0].style.backgroundColor = 'orange';
          nextRow.cells[0].style.fontWeight = 'bold';
        }
      }
    }
  }
}


function formatDate(dateString) {
  var options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Helper function to check if a string starts with any of the selected values
function contieneValor(str, selectedValues) {
  return selectedValues.some(function (value) {
    return str.includes(value);
  });
}

// Helper function to check if a date is in the specified range
function isDateInRange(date, fromDate, untilDate) {
  if (!date) {
    return true; // Date is not specified, consider it in range
  }

  var from = fromDate ? new Date(fromDate + 'T00:00') : null;
  var until = untilDate ? new Date(untilDate + 'T00:00') : null;

  return (!from || date >= from) && (!until || date <= until);
}

// Function to check all checkboxes
function checkAll() {
  var checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach(function (checkbox) {
    checkbox.classList.add('active');
  });
  filterData();
}

// Function to uncheck all checkboxes
function uncheckAll() {
  var checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach(function (checkbox) {
    checkbox.classList.remove('active');
  });
  filterData();
}


function toggleFiltros() {
  const floatingFiltros = document.getElementById('floatingFiltros');
  floatingFiltros.classList.toggle('show');
  const toggleButton = document.getElementById('toggleFiltros');
  if (toggleButton.textContent == "⇓ Mostrar filtros") { toggleButton.textContent = "⇑ Ocultar filtros" }
  else { toggleButton.textContent = "⇓ Mostrar filtros"; }
}
document.addEventListener('DOMContentLoaded', loadClient);

agregarOcultar();
