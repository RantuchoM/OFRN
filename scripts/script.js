// scripts/script.js

// Define dataArray and headers globally
var dataArray;
var headers;


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
    getData();
  });
}

function fetchData2() {
  // Make a request to the Google Sheets API to get values from the "Listado!L:R" range
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1-pzeyaROPbpJq1r0snrHPfuyjUz3oyfjHxryQdhswwQ',
    range: 'Listado!L:s',
  }).then(response => {
    const values = response.result.values;
    console.log('Data from "Listado!L:R":', values);
    // Process the data as needed
  }, error => {
    console.error('Error fetching data:', error);
  });
}

// Attach the event handlers to the checkbox and date input change events
document.querySelectorAll('.filter-checkbox').forEach(function (checkbox) {
  checkbox.addEventListener('change', filterData);
});

document.querySelectorAll('.filter-date').forEach(function (dateInput) {
  dateInput.addEventListener('change', filterData);
});

// Function to fetch data from Google Sheets
function getData() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1-pzeyaROPbpJq1r0snrHPfuyjUz3oyfjHxryQdhswwQ',
    range: 'Listado!L:S',
  }).then(response => {
      const values = response.result.values;
      dataArray = extractData(values, 12, 19); // Extract and assign data globally
      headers = dataArray[0]
      //console.log(dataArray[0])
      dataArray.shift()
      showData(dataArray, 12, 18); // Pass the data to showData function with startColumn and endColumn
      filterData(); // Call filterData after data is processed
    })
    .catch(error => console.error('Error fetching data:', error));
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
    if(header == "Nombres"){}
    else{
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

  // Clear existing rows
  tbody.empty();

  // Get the dropdown value and check if the container exists
  var dropdownContainer = $('#dropdown-container');
  var dropdownValue = dropdownContainer.length > 0 ? dropdownContainer.find('select').val() : null;

  // Filter and display rows based on checkboxes, date range, and dropdown value
  dataArray.forEach(function (data) {
    var dateInRange = isDateInRange(data[1], fromDate, untilDate);
    var firstColumnValue = data[0]; // Assuming date is in the first column
    console.log(`Dropdown: ${dropdownValue}`)
    if (
      (selectedValues.length === 0 || startsWithSelectedValue(firstColumnValue, selectedValues)) &&
      dateInRange &&
      (!dropdownValue || data[7].includes(dropdownValue))
    ) {
      var row = '<tr';

      // Add background color based on the value in the first column
      if (firstColumnValue.startsWith('Sinf')) {
        row += ' style="background-color: #dabcff;"';
      } else if (firstColumnValue.startsWith('CFVal')) {
        row += ' style="background-color: #E1C16E;"';
      } else if (firstColumnValue.startsWith('CFMon')) {
        row += ' style="background-color: #A8A8A8;"';
      } else if (firstColumnValue.startsWith('CFMar')) {
        row += ' style="background-color: #89CFF0;"';
      } else if (firstColumnValue.startsWith('CFCuer')) {
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
  });
}


// Helper function to check if a string starts with any of the selected values
function startsWithSelectedValue(str, selectedValues) {
    return selectedValues.some(function (value) {
        return str.startsWith(value);
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
