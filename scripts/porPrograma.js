var dataArray;
var headers;
var names;
var namesWithMus;
const urlParameters = new URLSearchParams(window.location.search)
const ensParam = urlParameters.get('ens');
let esCoordEns = false;
if (ensParam) { esCoordEns = true; }

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
            console.log(dataArray);

        });

    });
}

function getData() {
    return new Promise((resolve, reject) => {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw',
            range: 'CRONOGRAMAS!A:I',
        }).then(response => {
            const values = response.result.values;
            //console.log(values);
            dataArray = extractData(values);
            console.log("dataArray: ");
            console.log(dataArray);
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


            showData(dataArray, 1, 10);
            //filterData(false);
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

function getParam() {
    const param = urlParameters.get('progr');
    const h1Element = document.querySelector("h1");
    const title = document.querySelector("title");

    if (h1Element) {
        h1Element.textContent = 'Cronograma de ' + param;
    } else {
        console.error('h1 element not found in the DOM.');
    }

    if (title) {
        title.textContent = param + " - Cronograma";
    } else {
        console.error('title element not found in the DOM.');
    }
    return urlParameters.get('progr');
}

function showData(data, startColumn, endColumn) {

    if (!data || data.length === 0) {
        console.error('No data to display.');
        return;
    }
    const progr = getParam();
    console.log(progr);

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
    var tbody = $('#table-data tbody');


    // Dynamically populate the table data

    for (let i = 1; i < data.length; i++) {
        const rowData = data[i].slice(startColumn - 1, endColumn);
        var rowHTML = '<tr>';
        //console.log(rowData[0]);
        if (rowData[0].includes(progr)) {
            switch (rowData[8]) { // Assuming column 9 is at index 8 (0-based index)
                case 'Ensayo':
                    rowHTML = '<tr style="background-color: #FF0000;">'; // Red background for Value1
                    break;
                case 'Almuerzo':
                    rowHTML = '<tr style="background-color: #00FF00;">'; // Green background for Value2
                    break;
                case 'Transporte':
                    rowHTML = '<tr style="background-color: #0000FF;">'; // Blue background for Value3
                    break;
                case 'Otro':
                    rowHTML = '<tr style="background-color: #FFFF00;">'; // Yellow background for Value4
                    break;
                case 'Cena':
                    rowHTML = '<tr style="background-color: #FF00FF;">'; // Magenta background for Value5
                    break;
                case 'Merienda':
                    rowHTML = '<tr style="background-color: #00FFFF;">'; // Cyan background for Value6
                    break;
                case 'Concierto':
                    rowHTML = '<tr style="background-color: #00FF11;">'; // Cyan background for Value6
                    break;
                default:
                    // Default background color for other values
                    rowHTML = '<tr>';
            }
            rowData.forEach(function (value, columnIndex) {

                if (columnIndex === 1) { // Check if it's the 6th column (assuming 0-based index)
                    // Assuming data[headers[columnIndex]] contains the link
                    rowHTML += '<td>' + longDate(value) + '</td>';
                } else {
                    rowHTML += '<td>' + value + '</td>';
                }
            });

            rowHTML += '</tr>';
            tbody.append(rowHTML)
        }
    }



    // Attach event handlers to the input fields for dynamic filtering
    $('.filter-input').on('input', function () {
        filterData();
    });
    /*
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
    */


}

function extractFirstTwoWords(inputString) {
    // Split the string into an array of words
    const wordsArray = inputString.split(' ');

    // Extract the first two words
    const firstTwoWords = wordsArray.slice(0, 2).join(' ');

    return firstTwoWords;
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


document.addEventListener('DOMContentLoaded', loadClient);