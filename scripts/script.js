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
    getData().then(() => {
      // Now that the data is loaded, call the function to get names
      getNames();
    });

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
      //console.log(extractColumnData(doc, 3))
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
        if (columnIndex === 1) {
          row += '<td>' + formatDate(columnValue) + '</td>';
        }

        else if (columnIndex === 5) { // Check if it's the 6th column (assuming 0-based index)
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

    // Create a temporary div element to hold the HTML content
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = detailsSummary;

    // Pass the div element to the applyBackgroundColorToFirstColumn function
    applyBackgroundColorToFirstColumn(tempDiv);

    // Append the modified HTML to the detailsContainer
    detailsContainer.append(tempDiv.innerHTML);


  });

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

// Attach the event handlers to the checkbox and date input change events
document.querySelectorAll('.filter-checkbox').forEach(function (checkbox) {
  checkbox.addEventListener('change', function () { filterData(false); });
});
document.querySelector('#ocultarEnsayosCheckbox').addEventListener('change', function () { filterData(false); });


document.querySelectorAll('.filter-date').forEach(function (dateInput) {
  dateInput.addEventListener('change', function () { filterData(false); });
});
document.querySelector('#completarDiasButton').addEventListener('click', function () {
  filterData(true);
});
//people = getDropdownData();

// Function to fetch data from Google Sheets
function getData() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw',
      range: 'Listado!E:M',
    }).then(response => {
      const values = response.result.values;
      console.log(values);
      dataArray = extractData(values);
      headers = dataArray[0];
      dataArray.shift();
      dataArray = dataArray.filter(row => row[0].length > 1);
      console.log("Última fila: " + dataArray[dataArray.length - 1][0])
      for (i = 0; i < dataArray.length; i++) {
        var dateParts = dataArray[i][1].split("/");
        var formattedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
        dataArray[i][1] = new Date(formattedDate + 'T00:00')
      }
      console.log(dataArray)


      showData(dataArray, 12, 18);
      filterData(false);
      //convert the values to valid dates

      resolve(dataArray);
    }).catch(error => {
      console.error('Error fetching data:', error);
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
  const urlParams = new URLSearchParams(window.location.search)
  const ensParam = urlParams.get('ens');
  console.log(ensParam);

  // Dynamically populate the table header
  var thead = $('#table-data thead');
  var headerRowHTML = '<tr>';
  headers.forEach(function (header) {
    if (header == "Nombres" && !ensParam) { }
    else {
      headerRowHTML += '<th>' + header + '</th>';
    }
  });
  headerRowHTML += '</tr>';
  thead.html(headerRowHTML);
  // Add a row for input fields
  var inputRowHTML = '<tr id="filtros-texto">';
  var tbody = $('#table-data tbody');
  headers.forEach(function (header) {
    if (header == "Nombres") { }
    else {
      inputRowHTML += '<td class="tooltip"><input type="text" class="filter-input" data-column="' + header + '"><div class="tooltiptext">Escribí los valores que quieras que aparezcan en esta columna, separados por guiones</div></td>';
    }
  });
  inputRowHTML += '</tr>';
  thead.append(inputRowHTML);

  // Dynamically populate the table data

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



  // Attach event handlers to the input fields for dynamic filtering
  $('.filter-input').on('input', function () {
    filterData();
  });

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
async function filterData(completarDias = false) {
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
  var currentMonth = null;

  // Clear existing rows
  tbody.empty().css('width', 'auto');


  // Get the dropdown value and check if the container exists
  var dropdownContainer = $('#dropdown-container');
  var dropdownValue = null;

  // Check if "nombre" parameter exists in the URL
  const urlParams = new URLSearchParams(window.location.search)
  const ensParam = urlParams.get('ens');
  console.log(ensParam);

  if (!ensParam) {
    const nombreParam = urlParams.get('nombre');
    console.log(nombreParam);

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
  var ocultarEnsayosChecked = document.getElementById('ocultarEnsayosCheckbox').checked;

  // Filter and display rows based on checkboxes, date range, dropdown value, and filter input textboxes
  console.log(dataArray);
  var filteredData = dataArray.filter(function (data) {

    var dateInRange = isDateInRange(data[1], fromDate, untilDate);
    var columnaEnsambles = data[6];

    // Check if "Ocultar Ensayos" checkbox is checked and if the word "ensayo" is present in column 6
    var ocultarEnsayosCondition = !ocultarEnsayosChecked || !columnaEnsambles.toLowerCase().includes('ensayo');

    return (
      (selectedValues.length === 0 || contieneValor(columnaEnsambles, selectedValues)) &&
      dateInRange &&
      (!dropdownValue || (data[7] && data[7].match(dropdownValue))) &&
      (passFilter(data, filterValues)) &&
      ocultarEnsayosCondition
    );
  });

  var cantidadPresentaciones = 0;
  var cantidadEnsayos = 0;

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
    var hasEnsayo = data[6].toLowerCase().includes('ensayo');
    if (hasEnsayo) {
      cantidadEnsayos++;
    }
    return !hasEnsayo;
  });

  cantidadPresentaciones = filteredPresentaciones.length;

  // Generate empty rows for days with no activity

  if (completarDias) {
    completarDiasRango();
  }

  // Create the table with the final array
  createTable()

  // Apply background color to the first column based on conditions
  if (dropdownValue) {
    applyBackgroundColorToFirstColumn();
  }
  function formatDate(dateString) {
    var options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }



  // Update the counts in the HTML
  $('#cant-elem').text('Programas: ' + uniquePrograms.size);
  $('#cant-pres').text(' -- Presentaciones: ' + cantidadPresentaciones + ' -- Ensayos: ' + cantidadEnsayos);
  $('#table-data').css('width', 'auto');
  const destroyResizableTable = function (table) {
    const resizers = table.querySelectorAll('.resizer');
    resizers.forEach(function (resizer) {
      resizer.parentNode.removeChild(resizer);
    });
  };

  function createTable() {
    filteredData.forEach(function (data) {
      var rowMonth = new Date(data[1]).getMonth();
      if (currentMonth !== rowMonth) {
        // Insert a separator row with the name of the month
        var monthSeparatorRow = '<tr style="background-color: rgb(32, 99, 145); color: white;font-weight: bold; font-size: 20px; text-align: center !important;"><td colspan="9">' + getMonthName(rowMonth) + '  ' + new Date(data[1]).getFullYear() + '</td></tr>';
        tbody.append(monthSeparatorRow);
        currentMonth = rowMonth; // Update the current month
      }

      var row = '<tr';

      // Add background color based on the value in the first column
      var columnaEnsambles = data[0]; // Assuming the second column contains 'Ensambles'
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
      } else if (columnaEnsambles.startsWith('Día sin')) {
        row += ' style="background-color: #808080;"';
      }

      row += '>';

      data.forEach(function (value, columnIndex) {
        if (columnIndex === 5) { // Check if it's the 6th column (assuming 0-based index)
          // Assuming data[headers[columnIndex]] contains the link
          if (data[0] == "Día sin actividad") { }
          else { row += '<td><a href="' + value + '" target="_blank">Drive</a></td>'; }
        } else if (columnIndex == 7) {
          if (!ensParam) {
            // Do not show names
          } else {
            // Split the value string into an array of names
            const namesArray = value.split('|');
            let shortenedNamesString = ""
            // Filter the names based on the matching names in dropdownValue
            const filteredNames = namesArray.filter(name => dropdownValue.includes(name));
            if (namesArray.length == filteredNames.length) {
              const urlParams = new URLSearchParams(window.location.search)
              const ensParam = urlParams.get('ens');
              shortenedNamesString = `${ensParam} Completo`;
            }
            else {
              // Shorten each name to the first two characters of each word (initials) plus one additional letter

              const shortenedNames = filteredNames.map(name => {
                const initials = name.split(' ').map(word => word.charAt(0) + word.charAt(1).toLowerCase()).join(''); // Get initials of each word

                return initials;
              });

              // Join the shortened names back into a string with "|" separator
              shortenedNamesString = shortenedNames.join('-');
            }

            // Add the shortened names to the row
            row += '<td>' + shortenedNamesString + '</td>';
          }
        } else if (columnIndex == 6) {
          row += '<td';
          if (value.toLowerCase().includes('ensayo')) {
            row += ' style="background-color: #0000FF; color: #FFFFFF;"'; // Apply blue background for 'Ensayo' with white text
          }
          else if(value == 'Sinf, Cuerdas, Maderas, Bronces, Percusión' || value == 'Sinf, Cuerdas, Percusión, Bronces, Maderas'){
            value = "Orquesta Completa";
          }
          // Add the content of the cell
          row += '>' + value + '</td>';
        }
        else if (columnIndex == 1) {
          if (longDate(value).charAt(0) == "D") {
            row += '<td class = "domingo">' + longDate(value) + '</td>'
          }
          else {
            row += '<td>' + longDate(value) + '</td>';
          }
        } else {
          row += '<td>' + value + '</td>';
        }
      });

      row += '</tr>';
      tbody.append(row);
    });
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

function getMonthName(month) {
  var months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}
// Updated function to fetch corresponding value from the spreadsheet and update h1 element
function fetchSpreadsheetValue(nombreParam) {
  const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5m75Pzx8cztbCWoHzjtcXb3CCrP-YfvDnjE__97fYtZjJnNPqEqyytCXGCcPHKRXDsyCDmyzXO5Wj/pubhtml?gid=0&single=true'; // Replace with the actual URL of the external page

  return fetch(spreadsheetUrl)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      console.log(doc);
      const dataAB = extractColumnData(doc, 13); // Extract data from the 28th column (AB column)
      console.log(dataAB);
      // Find the corresponding value in column AB
      const index = dataAB.indexOf(nombreParam);
      if (index !== -1) {
        // If the value is found in column AB, fetch the corresponding value in column D
        const dataD = extractColumnData(doc, 3); // Extract data from the 4th column (D column)
        const valueInD = dataD[index];

        // Update the h1 element with the fetched valueInD
        document.querySelector('h1').innerHTML = `Fechas OFRN de <br>${valueInD}`;
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
      const ensambles = extractColumnData(doc, 2); // Extract data from the 4th column (AB column)
      const miembros = extractColumnData(doc, 3); // Extract data from the 3rd column (AB column)
      console.log(ensambles);
      console.log(miembros);

      // Filter miembros based on the condition that the corresponding ensambles value matches the variable "ens"
      const filteredMiembros = miembros.filter((miembro, index) => ensambles[index].includes(ens));
      console.log(filteredMiembros);
      // Create a string by joining the values of filteredMiembros with "|"
      const resultString = `/${filteredMiembros.join('|')}/`;

      // Use resultString for further processing or display
      console.log(`Ens: ${resultString}`);

      // Rest of your code...
      document.querySelector('h1').innerHTML = `Fechas OFRN de <br>${ens}`;
      document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${ens}`;
      return resultString;
    })
    .catch(error => {
      console.error('Error fetching data from the spreadsheet:', error);
      return null;
    });
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
    if (columnIndex !== -1 && data[columnIndex]) {
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

      // Check if any of the filter values match the cell value
      if (!filterList.some(filter => cellValue.includes(filter))) {
        return false; // Data doesn't pass the filter for this column
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

document.addEventListener('DOMContentLoaded', loadClient);
