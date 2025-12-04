// rantuchom/ofrn/OFRN-9598defe3bd7b48a95976c21f8d31ab539880106/scripts/resumen.js

// ELIMINADAS LAS DECLARACIONES CONST/LET QUE CAUSABAN CONFLICTO DE ÁMBITO.

var dataRes;
var dataArrayRes; 
var integrantesData;


function getIntegrantesDataForResumen() {
  return new Promise((resolve, reject) => {
    
    // Usamos las variables globales definidas en script.js o valores por defecto
    const SHEET_ID = window.INTEGRANTES_SHEET_ID || '1Wwd9Z0ZYwsKSI60KVHwsazR8bnvOWQdGVhSlhmjl-Y0';
    const RANGE = window.INTEGRANTES_RANGE || 'General!A:W';

    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    }).then(response => {
      integrantesData = response.result.values;
      if (!integrantesData) { return reject(new Error("No data returned from Integrantes Sheet.")); }
      resolve();
    }).catch(error => {
      console.error('Error fetching Integrantes data for Resumen:', error);
      reject(error);
    });
  });
}

function getDropdownData() {
  return getIntegrantesDataForResumen();
}

function getDataRes() {
  return new Promise((resolve, reject) => {
    // Usamos la variable global de OLD_DATA_SHEET_ID o valor por defecto
    const SHEET_ID = window.OLD_DATA_SHEET_ID || '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw';
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Listado!E:M', 
    }).then(response => {
        const values = response.result.values;
        dataArrayRes = values; 
        
        if (dataArrayRes && dataArrayRes.length > 0) {
            dataArrayRes.shift(); 
            for (let i = 0; i < dataArrayRes.length; i++) {
                const dateValue = dataArrayRes[i][1];
                if (dateValue) {
                    const dateParts = dateValue.split("/");
                    if (dateParts.length === 3) {
                        const formattedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
                        dataArrayRes[i][1] = new Date(formattedDate + 'T00:00');
                    }
                }
            }
        }
        resolve(); 
      })
      .catch(error => {
        console.error('Error fetching data for Resumen:', error);
        reject(error); 
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
function getMonthName(month) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1];
}


function resumenPersonas() {
  var detailsContainer = $('#people-details');
  if (!detailsContainer.length || !integrantesData) {
    console.error("Container or Integrantes Data not found");
    return;
  }
  detailsContainer.empty();

  // Columna NOMBRE Y APELLIDO es índice 3
  const names = integrantesData.map(n => n[3] || '');
  names.shift(); 
  
  if (!window.dataArrayRes) {
      console.error("Fechas (dataArrayRes) no cargadas.");
      return;
  }
  
  const data = window.dataArrayRes; 

  names.forEach(function (name) {
    if (!name) return; 

    var detailsSummary = '<details id="' + name + '"><summary>' + name + '</summary>';
    detailsSummary += '<table>';

    data.forEach(function (dataRow) {
      
      var linkColumn = '<td><a href="' + (dataRow[5] || '#') + '" target="_blank">Drive</a></td>';
      var dateColumn = '<td>' + (dataRow[1] instanceof Date ? formatDate(dataRow[1]) : dataRow[1]) + '</td>'; 

      if ((dataRow[7] || '').includes(name)) {
        var row = '<tr';
        const ensamble = dataRow[6] || '';

        if (ensamble.includes('Sinf')) { row += ' style="background-color: #dabcff;"';
        } else if (ensamble.includes('CFVal')) { row += ' style="background-color: #E1C16E;"';
        } else if (ensamble.includes('CFMon')) { row += ' style="background-color: #A8A8A8;"';
        } else if (ensamble.includes('CFMar')) { row += ' style="background-color: #89CFF0;"';
        } else if (ensamble.includes('Jazz')) { row += ' style="background-color: #ffccff;"'; }

        row += '>';
        row += linkColumn;
        row += dateColumn; 
        row += '</tr>';

        detailsSummary += row;
      }
    });

    detailsSummary += '</table>';
    detailsSummary += '</details>';

    detailsContainer.append(detailsSummary);
  });
}

// Llama a la carga de datos y luego a la inicialización
getIntegrantesDataForResumen().then(function() {
  getDataRes().then(function() {
    resumenPersonas();
  }).catch(error => {
    console.error('Error in getData:', error);
  });
}).catch(error => {
  console.error('Error in getDropdownData:', error);
});

function loadClient2() {
    gapi.load('client', initClient2);
  }
  
  function initClient2() {
    gapi.client.init({
      apiKey: 'AIzaSyAxQ63EFfI-ackr9PrPOxJepog7DDh5_dE',
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(() => {
      getDataRes();
    });
  }
document.addEventListener('DOMContentLoaded', loadClient2);