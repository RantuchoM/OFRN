var dataRes;
var dataArrayRes; // Ensure dataArray is defined globally

function getDropdownData() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5m75Pzx8cztbCWoHzjtcXb3CCrP-YfvDnjE__97fYtZjJnNPqEqyytCXGCcPHKRXDsyCDmyzXO5Wj/pubhtml?gid=0&single=true';

  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      dataRes = extractColumnData(doc, 3);
      console.log(dataRes);
      return dataRes;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function getDataRes() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw',
      range: 'Listado!E:M',
    }).then(response => {
        const values = response.result.values;
        dataArrayRes = extractData(values, 12, 19); // Extract and assign data globally
        //headers = dataArray[0];
        dataArrayRes.shift();
        console.log(dataArray.length);
        for (i = 0; i < dataArrayRes.length; i++) {
          var dateParts = dataArrayRes[i][1].split("/");
          var formattedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
          dataArrayRes[i][1] = "Hola" //new Date(formattedDate + 'T00:00');
        }
        //showData(dataArray, 12, 18); // Pass the data to showData function with startColumn and endColumn
        //filterData(); // Call filterData after data is processed
        resolve(); // Resolve the promise when data is processed
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        reject(error); // Reject the promise on error
      });
  });
}
function formatDate(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
  return formatCustom(date, options);
}

function formatCustom(date, options) {
  const day = padZero(date.getDate());
  const month = getMonthName(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${options.weekday ? getDayName(date.getDay()) + ', ' : ''}${day} ${month} ${year}`;
}

function padZero(value) {
  return value < 10 ? '0' + value : value;
}

function getDayName(day) {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[day];
}

function resumenPersonas() {
  var detailsContainer = $('#people-details');
  if (!detailsContainer.length) {
    console.error("Container not found");
    return;
  }

  detailsContainer.empty();

  // Ensure dataArray is defined in the scope or passed as a parameter
  data.forEach(function (name) {
    var detailsSummary = '<details id="' + name + '"><summary>' + name + '</summary>';
    detailsSummary += '<table>';

    dataArray.forEach(function (data) {
      var linkColumn = '<td><a href="' + data[5] + '" target="_blank">Drive</a></td>';
      var dateColumn = '<td>' + formatDate(data[1]) + '</td>'; // Apply formatDate to the second column

      if (data[7].includes(name)) {
        var row = '<tr';

        if (data[6].includes('Sinf')) {
          row += ' style="background-color: #dabcff;"';
        } else if (data[6].includes('CFVal')) {
          row += ' style="background-color: #E1C16E;"';
        } else if (data[6].includes('CFMon')) {
          row += ' style="background-color: #A8A8A8;"';
        } else if (data[6].includes('CFMar')) {
          row += ' style="background-color: #89CFF0;"';
        } else if (data[6].includes('CFCuer')) {
          row += ' style="background-color: #ffccff;"';
        }

        row += '>';
        row += linkColumn;
        row += dateColumn; // Add the formatted date column
        row += '</tr>';

        detailsSummary += row;
      }
    });

    detailsSummary += '</table>';
    detailsSummary += '</details>';

    detailsContainer.append(detailsSummary);
  });
}



getDropdownData().then(function() {
  // Ensure dataArray is set after the data is fetched
  getDataRes().then(function() {
    resumenPersonas();
  }).catch(error => {
    // Handle the error if needed
    console.error('Error in getData:', error);
  });
}).catch(error => {
  // Handle the error if needed
  console.error('Error in getDropdownData:', error);
});
function loadClient2() {
    gapi.load('client', initClient);
  }
  
  function initClient2() {
    // Initialize the API client with your API key
    gapi.client.init({
      apiKey: 'AIzaSyAxQ63EFfI-ackr9PrPOxJepog7DDh5_dE',
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(() => {
      // Call the function to fetch data
      getDataRes();
    });
  }
document.addEventListener('DOMContentLoaded', loadClient2);
