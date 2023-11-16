// scripts/script.js

// Define dataArray and headers globally
var dataArray;
var headers;
var names;


function loadClient() {
  gapi.load('client', initClient);
}

function initClient() {
  // Initialize the API client with your API key
  gapi.client.init({
    apiKey: 'AIzaSyAxQ63EFfI-ackr9PrPOxJepog7DDh5_dE',
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  }).then(() => {
    // Call the function to fetch data
    getData().then(() => { getNames() });

  });
}


function getNames() {
  //console.log("getDropdownData")
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5m75Pzx8cztbCWoHzjtcXb3CCrP-YfvDnjE__97fYtZjJnNPqEqyytCXGCcPHKRXDsyCDmyzXO5Wj/pubhtml?gid=0&single=true'; // Replace with the actual URL of the external page
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      console.log(extractColumnData(doc, 3))
      names = extractColumnData(doc, 3);
      names.shift()
      names.sort() // Extract data from the 4th column
      resumenPersonas();
    })
    .catch(error => console.error('Error fetching data:', error));

}
function resumenPersonas() {
  var detailsContainer = $('#people-details');
  if (!detailsContainer.length) {
    console.error("Container not found");
    return;
  }

  detailsContainer.empty();
  console.log(names);

  names.forEach(function (name) {
    // Filtered rows for the current name
    var filteredRows = dataArray.filter(function (data) {
      return data[7].includes(name);
    });

    // Extract unique values from the first column
    var uniquePrograms = new Set(filteredRows.map(function (data) {
      return data[0];
    }));

    // Summary construction
    var detailsSummary = '<details id="' + name + '"><summary>' + name +
      ' - Cantidad de Programas: ' + uniquePrograms.size +
      ' - Cantidad de Presentaciones: ' + filteredRows.length +
      '</summary>';
    detailsSummary += '<table>';

    // Iterate over filtered rows
    filteredRows.forEach(function (data) {
      var row = '<tr';

      if (data[6].startsWith('Sinf')) {
        row += ' style="background-color: #dabcff;"';
      } else if (data[6].startsWith('CFVal')) {
        row += ' style="background-color: #E1C16E;"';
      } else if (data[6].startsWith('CFMon')) {
        row += ' style="background-color: #A8A8A8;"';
      } else if (data[6].startsWith('CFMar')) {
        row += ' style="background-color: #89CFF0;"';
      } else if (data[6].startsWith('CFCuer')) {
        row += ' style="background-color: #ffccff;"';
      }

      row += '>';

      // Iterate over each value in the row (columns 1 to 7)
      for (var columnIndex = 0; columnIndex < 7; columnIndex++) {
        var columnValue = data[columnIndex];

        if (columnIndex === 5) { // Check if it's the 6th column (assuming 0-based index)
          // Assuming data[headers[columnIndex]] contains the link
          row += '<td><a href="' + columnValue + '" target="_blank">Drive</a></td>';
        } else {
          row += '<td>' + columnValue + '</td>';
        }
      }

      row += '</tr>';
      detailsSummary += row;
    });

    detailsSummary += '</table>';
    detailsSummary += '</details>';

    detailsContainer.append(detailsSummary);
  });
}
function extractColumnData(doc, columnIndex) {
  const tableRows = doc.querySelectorAll('table tr');
  const columnData = [];

  tableRows.forEach(function (row) {
    const columns = row.querySelectorAll('td');
    const columnValue = columns[columnIndex].textContent.trim();
    columnData.push(columnValue);
  });

  return columnData;
}


// Attach the event handlers to the checkbox and date input change events
document.querySelectorAll('.filter-checkbox').forEach(function (checkbox) {
  checkbox.addEventListener('change', filterData);
});

document.querySelectorAll('.filter-date').forEach(function (dateInput) {
  dateInput.addEventListener('change', filterData);
});
//people = getDropdownData();

// Function to fetch data from Google Sheets
function getData() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1-pzeyaROPbpJq1r0snrHPfuyjUz3oyfjHxryQdhswwQ',
      range: 'Listado!L:S',
    }).then(response => {
      const values = response.result.values;
      dataArray = extractData(values, 12, 19);
      headers = dataArray[0];
      dataArray.shift();
      showData(dataArray, 12, 18);
      filterData();
      resolve(dataArray);
    }).catch(error => {
      console.error('Error fetching data:', error);
      reject(error);
    });
  });
}
// Function to extract data from the HTML response
function extractData(doc, startColumn, endColumn) {
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

  // Dynamically populate the table header
  var thead = $('#table-data thead');
  var headerRowHTML = '<tr>';
  headers.forEach(function (header) {
    if (header == "Nombres") { }
    else {
      headerRowHTML += '<th>' + header + '</th>';
    }
  });
  headerRowHTML += '</tr>';
  thead.html(headerRowHTML);

  // Dynamically populate the table data
  var tbody = $('#table-data tbody');
  for (let i = 1; i < data.length; i++) {
    const rowData = data[i].slice(startColumn - 1, endColumn);
    var rowHTML = '<tr>';

    rowData.forEach(function (value, columnIndex) {

      if (columnIndex === 5) { // Check if it's the 6th column (assuming 0-based index)
        // Assuming data[headers[columnIndex]] contains the link
        rowHTML += '<td><a href="' + value + '" target="_blank">Drive</a></td>';
      } else {
        rowHTML += '<td>' + value + '</td>';
      }
    });

    rowHTML += '</tr>';
    tbody.append(rowHTML);
  }
}


// Function to filter data based on checkboxes and date range
function filterData() {
  // Ensure headers and dataArray are defined
  if (!headers || !dataArray) {
    return;
  }

  var selectedValues = $('.filter-checkbox:checked').map(function () {
    return $(this).val();
  }).get();
  var fromDate = $('#fromDate').val();
  var untilDate = $('#untilDate').val();
  var tbody = $('#table-data tbody');
  var uniqueElements = new Set(); // To store unique elements in the first column

  // Clear existing rows
  tbody.empty();

  // Get the dropdown value and check if the container exists
  var dropdownContainer = $('#dropdown-container');
  var dropdownValue = dropdownContainer.length > 0 ? dropdownContainer.find('select').val() : null;

  // Filter and display rows based on checkboxes, date range, and dropdown value
  dataArray.forEach(function (data) {
    var dateInRange = isDateInRange(data[1], fromDate, untilDate);
    var columnaEnsambles = data[6];
    var columnaProgramas = data[0];

    if (
      (selectedValues.length === 0 || contieneValor(columnaEnsambles, selectedValues)) &&
      dateInRange &&
      (!dropdownValue || data[7].includes(dropdownValue))
    ) {
      uniqueElements.add(columnaProgramas); // Add to the set of unique elements

      var row = '<tr';

      // Add background color based on the value in the first column
      if (columnaEnsambles.startsWith('Sinf')) {
        row += ' style="background-color: #dabcff;"';
      } else if (columnaEnsambles.startsWith('CFVal')) {
        row += ' style="background-color: #E1C16E;"';
      } else if (columnaEnsambles.startsWith('CFMon')) {
        row += ' style="background-color: #A8A8A8;"';
      } else if (columnaEnsambles.startsWith('CFMar')) {
        row += ' style="background-color: #89CFF0;"';
      } else if (columnaEnsambles.startsWith('CFCuer')) {
        row += ' style="background-color: #ffccff;"';
      }

      row += '>';

      data.forEach(function (value, columnIndex) {
        if (columnIndex === 5) { // Check if it's the 6th column (assuming 0-based index)
          // Assuming data[headers[columnIndex]] contains the link
          row += '<td><a href="' + value + '" target="_blank">Drive</a></td>';
        } else if (columnIndex == 7) {
          // Check if it's the 8th column (assuming 0-based index)
          //row += '<td>' + value + '</td>';
        } else {
          row += '<td>' + value + '</td>';
        }
      });

      row += '</tr>';
      tbody.append(row);
    }
    // Check if #encabezadoImprimir exists before manipulating it
    var encabezadoImprimir = $('#encabezadoImprimir');
    if (encabezadoImprimir.length > 0) {
      // Build the header content based on dropdownValue, fromDate, and untilDate
      var headerContent = 'Cronograma de: ' + dropdownValue;

      if (fromDate) {
        headerContent += ' desde: ' + formatDate(fromDate+ 'T00:00');
      }

      if (untilDate) {
        headerContent += ' hasta: ' + formatDate(untilDate+ 'T00:00');
      }

      // Set the content of #encabezadoImprimir
      encabezadoImprimir.html(headerContent);
    }
  });
  function formatDate(dateString) {
    var options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  // Update the counts in the HTML
  $('#cant-elem').text('Cantidad de Programas: ' + uniqueElements.size);
  $('#cant-pres').text(' -- Cantidad de Presentaciones: ' + tbody.find('tr').length);
  const createResizableTable = function (table) {
    const cols = table.querySelectorAll('th');
    [].forEach.call(cols, function (col) {
      // Add a resizer element to the column
      const resizer = document.createElement('div');
      resizer.classList.add('resizer');

      // Set the height
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

  createResizableTable(document.getElementById('table-data'));


}



// Helper function to check if a string starts with any of the selected values
function contieneValor(str, selectedValues) {
  return selectedValues.some(function (value) {
    return str.includes(value);
  });
}

// Helper function to check if a date is in the specified range
function isDateInRange(dateString, fromDate, untilDate) {
  if (!dateString) {
    return true; // Date is not specified, consider it in range
  }

  // Convert the date string to a Date object
  var dateParts = dateString.split("/");
  var formattedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
  var date = new Date(formattedDate);

  var from = fromDate ? new Date(fromDate) : null;
  var until = untilDate ? new Date(untilDate) : null;

  return (!from || date >= from) && (!until || date <= until);
}

// Function to check all checkboxes
function checkAll() {
  var checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = true;
  });
  filterData();
}

// Function to uncheck all checkboxes
function uncheckAll() {
  var checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });
  filterData();
}

// Invoke the getData function
//getData();
document.addEventListener('DOMContentLoaded', loadClient);

document.addEventListener('DOMContentLoaded', function () {
  const createResizableTable = function (table) {
    const cols = table.querySelectorAll('th');
    [].forEach.call(cols, function (col) {
      // Add a resizer element to the column
      const resizer = document.createElement('div');
      resizer.classList.add('resizer');

      // Set the height
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

  createResizableTable(document.getElementById('table-data'));
});

