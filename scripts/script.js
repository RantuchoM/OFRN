// scripts/script.js

// Define global data arrays and constants
var dataArray;
var girasArray;
var headers;
var names;
var namesWithMus;
var integrantesData; // Data de la hoja General

// Variables de Google Sheets (usadas en window para evitar conflictos de ámbito)
window.INTEGRANTES_SHEET_ID = '1Wwd9Z0ZYwsKSI60KVHwsazR8bnvOWQdGVhSlhmjl-Y0';
window.INTEGRANTES_RANGE = 'General!A:W'; 
window.DATA_SHEET_ID = '1Cvnr4ZPsrP1zER_FRv2cXs-57S7YYAeESmtLRJ069Y8';
window.DATA_RANGE = 'GitHub!A:L'; // backup2025
window.GIRAS_RANGE = 'Auxiliar!O:T'; // giras3
window.OLD_DATA_SHEET_ID = '1l4t9hnGrJhpxWii8WbqxO9yWd_oOLaxx3BT8oxGFHFw'; // ID de Resumen

// Variables de URL (usadas en window para evitar conflictos de ámbito)
window.urlParameters = new URLSearchParams(window.location.search)
window.ensParam = window.urlParameters.get('ens');
window.esCoordEns = false;
window.totalCols = 4;
if (window.ensParam) { window.esCoordEns = true; window.totalCols = 5 }

// Variables locales (usando var o const si son usadas solo en este archivo)
let primeraVez = true;


// ====================================================================
// 1. CARGA E INICIALIZACIÓN PRINCIPAL (Carga Secuencial por API)
// ====================================================================

function loadClient() {
  gapi.load('client', initClient);
}

function initClient() {
  // Inicialización del cliente de la API de Google
  gapi.client.init({
    apiKey: 'AIzaSyAxQ63EFfI-ackr9PrPOxJepog7DDh5_dE',
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  }).then(() => {
    // 1. Obtener datos de Integrantes (necesarios para filtros de personas)
    return getIntegrantesDataFromSheets();
  }).then(() => {
    // 2. Obtener datos de Giras
    return getGirasFromSheets();
  }).then(() => {
    // 3. Obtener datos principales
    return getDataFromSheets();
  }).then(() => {
    // 4. Procesar nombres
    getNames();
    getNamesWithMus();
  }).then(() => {
    // La función filterData es llamada por dropdown.js una vez que el dropdown está listo
  }).catch(error => {
    console.error('Initialization error:', error);
    document.getElementById('table-data').innerHTML = '<p style="color: red; text-align: center">Error al cargar los datos. Verifique la conexión o el acceso a Google Sheets.</p>';
  });
}

// ====================================================================
// 2. FUNCIONES DE OBTENCIÓN DE DATOS POR API
// ====================================================================

function getIntegrantesDataFromSheets() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: window.INTEGRANTES_SHEET_ID,
      range: window.INTEGRANTES_RANGE,
    }).then(response => {
      integrantesData = response.result.values;
      if (!integrantesData) {
        return reject(new Error("No data returned from Integrantes Sheet."));
      }
      resolve();
    }).catch(error => {
      console.error('Error fetching Integrantes data from Sheets:', error);
      reject(error);
    });
  });
}

function getDataFromSheets() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: window.DATA_SHEET_ID,
      range: window.DATA_RANGE,
    }).then(response => {
      const values = response.result.values;
      if (!values || values.length === 0) {
        return reject(new Error("No data returned from Main Data Sheet."));
      }

      headers = values[0];
      dataArray = values.slice(1);

      dataArray = dataArray.filter(row => row[0] !== undefined);

      for (let i = 0; i < dataArray.length; i++) {
        // Conversión de fecha (Columna B / índice 1)
        const dateValue = dataArray[i][1];
        if (dateValue) {
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            dataArray[i][1] = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
          } else {
             dataArray[i][1] = new Date(dateValue);
          }
        }
        
        // Asignación de hora (Columna C / índice 2)
        const timeString = dataArray[i][2];
        if (timeString && timeString.includes('Sat')) { 
            const date = new Date(timeString);
            let hours = date.getHours();
            const minutes = (date.getMinutes() + 1) % 60;
            if (minutes === 0) { hours = (hours + 1) % 24; }
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            dataArray[i][2] = formattedTime;
        }
      }

      // Código de arrastre de filtros (Mantenido para funcionalidad UI)
      let floatingFiltros = document.getElementById('floatingFiltros');
      if (floatingFiltros) {
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
      }
      
      resolve();
    }).catch(error => {
      console.error('Error fetching Main Data from Sheets:', error);
      reject(error);
    });
  });
}

function getGirasFromSheets() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: window.DATA_SHEET_ID,
      range: window.GIRAS_RANGE,
    }).then(response => {
      const values = response.result.values;
      if (!values || values.length <= 1) { 
        girasArray = []; 
        return resolve();
      }

      girasArray = values.slice(1);
      girasArray = girasArray.filter(row => row[0] !== undefined);

      // Conversión de fechas (Columna R / índice 3 y Columna S / índice 4)
      for (let i = 0; i < girasArray.length; i++) {
          const dateStart = girasArray[i][3];
          const dateEnd = girasArray[i][4];
          
          if (dateStart) {
            const parts = dateStart.split('/');
            if (parts.length === 3) {
              girasArray[i][3] = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            } else {
              girasArray[i][3] = new Date(dateStart);
            }
          }

          if (dateEnd) {
            const parts = dateEnd.split('/');
            if (parts.length === 3) {
              girasArray[i][4] = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            } else {
              girasArray[i][4] = new Date(dateEnd);
            }
          }
      }

      resolve();
    }).catch(error => {
      console.error('Error fetching Giras data from Sheets:', error);
      reject(error);
    });
  });
}


// ====================================================================
// 3. FUNCIONES DE PROCESAMIENTO DE DATOS DE INTEGRANTES
// ====================================================================

function getNames() {
  if (!integrantesData) return [];
  
  // Columna NOMBRE Y APELLIDO es índice 3
  names = integrantesData.map(n => n[3] || '');
  names.shift() 
  names = names.filter(n => n !== ''); 
  names.sort() 
  try { resumenPersonas(); } catch(e) { console.warn("resumenPersonas requires data not yet loaded."); }
  return names
}

function fetchdeMus(colIndex) {
  if (!integrantesData) return [];
  
  // colIndex: 13 (ORGÁNICOS) o 3 (NOMBRE Y APELLIDO)
  let ensamblFetch = integrantesData.map(n => n[colIndex] || '');
  ensamblFetch.shift()

  return ensamblFetch
}

function getNamesWithMus() {
  if (!integrantesData) return [];
  
  // Columna NOMBRE Y APELLIDO (índice 3)
  let allNames = integrantesData.map(n => n[3] || '');
  // Columna INSTRUMENTO (índice 9)
  let allMus = integrantesData.map(n => n[9] || '');

  allNames.shift();
  allMus.shift(); 
  
  namesWithMus = allNames.filter((name, index) => {
    const musValue = allMus[index];
    if (musValue) {
      return (name !== '') && ["Maderas", "Percusión", "Cuerdas", "Bronces"].some(keyword => musValue.includes(keyword));
    }
    return false;
  });

  try { resumenPersonas(); } catch(e) { console.warn("resumenPersonas requires data not yet loaded."); }
  return namesWithMus;
}

function fetchSpreadsheetValue(nombreParam) {
  if (!integrantesData) return Promise.resolve(null);

  const data = integrantesData;
  // Columna Identificador (índice 20)
  const dataAB = data.map(n => n[20] || ''); 
  
  const index = dataAB.indexOf(nombreParam);
  if (index !== -1) {
    // Columna Nombre y Apellido (índice 3)
    const dataD = data.map(n => n[3] || ''); 
    const valueInD = dataD[index];

    document.querySelector('h1').innerHTML = `Calendario OFRN de <br>${valueInD}`;
    document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${valueInD}`;
    return valueInD;
  } else {
    console.error('No matching value found in Identificador column.');
    return null;
  }
}

function fetchEnsamble(ens) {
  return Promise.all([fetchdeMus(13), fetchdeMus(3)]) // 13: ORGÁNICOS, 3: NOMBRE Y APELLIDO
    .then(([ensamblesResult, miembrosResult]) => {
      const ensambles = ensamblesResult;
      const miembros = miembrosResult;

      const filteredMiembros = miembros.filter((miembro, index) => ensambles[index] && ensambles[index].includes(ens));
      const resultString = filteredMiembros.join('|');

      document.querySelector('h1').innerHTML = `${ens} <br> Coordinación`;
      document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${ens}`;
      return resultString;
    })
    .catch(error => {
      console.error('Error fetching Ensamble data:', error);
      return null;
    });
}


// ====================================================================
// 4. FUNCIONES AUXILIARES Y LÓGICA DE FILTRADO/DISPLAY
// ====================================================================

function resumenPersonas() {
  var detailsContainer = $('#people-details');
  var mostrarDetalleCheckbox = $('#mostrarDetalle');
  var mostrarProduccion = $('#mostrarProduccion');
  var namesResumen;

  if (!detailsContainer.length || !dataArray || !names || !namesWithMus) {
    console.log("Container or Data not fully loaded in resumenPersonas.");
    return;
  }

  detailsContainer.empty();

  if (mostrarProduccion.is(':checked')) {
    namesResumen = names;
  } else {
    namesResumen = namesWithMus;
  }

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
      return data[7] && data[7].includes(name);
    });

    var sinfRows = filteredRows.filter(function (data) {
      return data[0] && data[0].includes('Sinf ');
    });

    var cfRows = filteredRows.filter(function (data) {
      return data[0] && data[0].includes('CF ');
    });

    var ensambleRows = filteredRows.filter(function (data) {
      return data[0] && !data[0].includes('Sinf ') && !data[0].includes('CF ');
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


    var totalCountPresentaciones = countPresentacionesSinf + countPresentacionesCF + countPresentacionesEnsamble;
    var totalCountProgramas = countProgramasSinf + countProgramasCF + countProgramasEnsamble;
    var totalCountEnsayos = countEnsayosSinf + countEnsayosCF + countEnsayosEnsamble;
    var totalCountEnsayosSinGiras = countEnsayosGirasSinf + countEnsayosGirasCF + countEnsayosGirasEns;

    if (mostrarDetalleCheckbox.is(':checked')) {
      var detailsSummary = '<details id="' + name + '"><summary>' + name +
        ' - Cantidad de Programas: ' + totalCountProgramas +
        ' - Cantidad de Presentaciones: ' + totalCountPresentaciones +
        ' - Cantidad de Ensayos: ' + totalCountEnsayos +
        '</summary>';
      detailsSummary += '<table>';

      filteredRows.forEach(function (data) {
        var row = '<tr';
        var backgroundColors = { 'Sinf': '#dabcff', 'CF Val': '#E1C16E', 'CF Mon': '#A8A8A8', 'CF Mar': '#89CFF0', 'Jazz': '#ffccff' };
        var prefix = Object.keys(backgroundColors).find(key => data[0] && data[0].includes(key));
        if (prefix && backgroundColors[prefix]) { row += ' style="background-color: ' + backgroundColors[prefix] + ';"'; }
        row += '>';

        for (var columnIndex = 0; columnIndex < 7; columnIndex++) {
          var columnValue = data[columnIndex];
          if (columnIndex === 1) { 
              row += '<td class="center">' + formatDate(columnValue) + '</td>'; 
          } else if (columnIndex === 5) { 
              row += '<td class="center"><a href="' + (columnValue || '#') + '" target="_blank">Drive</a></td>'; 
          } else { 
              row += '<td class="center">' + (columnValue || '') + '</td>'; 
          }
        }

        row += '</tr>';
        detailsSummary += row;
      });

      detailsSummary += '</table>';
      detailsSummary += '</details>';
      tableHTML += detailsSummary;

    } else {
      tableHTML += '<tr><td>' + name +
        '</td><td class="center">' + countPresentacionesSinf + '</td><td class="center">' + countProgramasSinf + '</td><td class="center">' + countEnsayosSinf + '</td><td>' + countEnsayosGirasSinf +
        '</td><td class="center">' + countPresentacionesCF + '</td><td class="center">' + countProgramasCF + '</td><td class="center">' + countEnsayosCF + '</td><td>' + countEnsayosGirasCF +
        '</td><td class="center">' + countPresentacionesEnsamble + '</td><td class="center">' + countProgramasEnsamble + '</td><td class="center">' + countEnsayosEnsamble + '</td><td>' + countEnsayosGirasEns +
        '</td><td class="center">' + totalCountPresentaciones + '</td><td class="center">' + totalCountProgramas + '</td><td class="center">' + totalCountEnsayos + '</td><td>' + totalCountEnsayosSinGiras + '</td></tr>';
    }
  });

  if (!mostrarDetalleCheckbox.is(':checked')) {
    tableHTML += '</table>';
  }

  detailsContainer.append(tableHTML);
  if (!mostrarDetalleCheckbox.is(':checked')) {
    $('#people-details-table').DataTable({ pageLength: 100, dom: 'lrtip', resizable: true });
  }

  function countEnsayos(rows) {
    return rows ? rows.filter(function (data) { return data[6] && data[6].includes('Ensayo'); }).length : 0;
  }
  function countEnsayosSinGiras(rows) {
    return rows ? rows.filter(function (data) { return data[6] && data[6].includes('Ensayo') && !data[6].includes('de Gira'); }).length : 0;
  }
  function countUniquePrograms(rows) {
    return new Set(rows.map(function (data) { return data[0]; })).size;
  }
}

function toggleDetails(name) {
  var detailsElement = document.getElementById(name);
  if (detailsElement) { detailsElement.open = !detailsElement.open; }
}

function extractColumnData(doc, columnIndex) {
  return []; 
}
function extractAllColumnData(doc, columnIndex) {
  return []; 
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

function extractData(doc) {
  const tableRows = doc;
  const extractedData = [];
  if (tableRows.length < 1) {
    console.error('No data found in the table.');
    return extractedData;
  }
  headers = tableRows[0];
  return tableRows;
}
function showData(data, startColumn, endColumn) {
  if (!data || data.length === 0) { console.error('No data to display.'); return; }
  var thead = $('#table-data thead');
  var headerRowHTML = '<tr>';
  var order = [0, 1, 2, 3, 4, 6, 8, 9]
  if (window.esCoordEns) { order.push(7); }
  for (o = 0; o < order.length; o++) { headerRowHTML += '<th style="padding: 10px">' + headers[order[o]] + '</th>'; }
  headerRowHTML += '</tr>';
  thead.append(headerRowHTML);
  var inputRowHTML = '<tr id="filtros-texto">';
  for (o = 0; o < order.length; o++) {
    inputRowHTML += '<th class="tooltip"><input type="text" class="filter-input" data-column="' + headers[order[o]] + '" style="width: 80%"><div class="tooltiptext">Escribí los valores que quieras que aparezcan en esta columna, separados por guiones</div></th>';
  }
  inputRowHTML += '</tr>';
  thead.append(inputRowHTML);
  var debounceTimer;
  $('.filter-input').on('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { filterData(); }, 1500);
  });
}
async function filterData(completarDias = false) {
  if (!headers || !dataArray || !girasArray) { console.log("Data not fully loaded yet."); return; }
  var selectedValues = $('.filter-checkbox.active').map(function () { return $(this).val(); }).get();
  var fromDate = $('#fromDate').val();
  var untilDate = $('#untilDate').val();
  var currentMonth = null;
  var currentDay = 0;
  var dropdownContainer = $('#dropdown-container');
  var dropdownValue = null;
  if (!window.ensParam) {
    const nombreParam = window.urlParameters.get('nombre');
    if (!nombreParam) { dropdownValue = dropdownContainer.length > 0 ? dropdownContainer.find('select').val() : null; } 
    else { try { dropdownValue = await fetchSpreadsheetValue(nombreParam); } catch (error) { console.error('Error fetching spreadsheet value:', error); } }
  } else {
    try { dropdownValue = await fetchEnsamble(window.ensParam); } catch (error) { console.error('Error fetching ensamble value:', error); }
  }
  var filterValues = {};
  $('.filter-input').each(function () {
    var column = $(this).data('column');
    var value = $(this).val().trim();
    filterValues[column] = value.toLowerCase(); 
  });
  if (dropdownValue) { document.getElementById("encabezadoImprimir").textContent = `Fechas OFRN de ${dropdownValue}`; }
  var ocultarEnsayosChecked = !document.getElementById('ocultarEnsayosButton').classList.contains('active');
  var ocultarEnsGirChecked = !document.getElementById('ocultarEnsGirButton').classList.contains('active');

  var filteredData = dataArray.filter(function (data) {
    let dateObj = data[1] instanceof Date && !isNaN(data[1]) ? data[1] : new Date(data[1]);
    var dateInRange = isDateInRange(dateObj, fromDate, untilDate);
    var columnaEnsambles = data[6];
    var esCancelado = false;
    if (data.length > 10) { esCancelado = data[10] && data[10].toLowerCase().match('cancelado') };
    var ocultarEnsayosCondition = !ocultarEnsayosChecked || !columnaEnsambles.toLowerCase().includes('ensayo') || columnaEnsambles.toLowerCase().includes('gira');
    var ocultarEnsGirCondition = !ocultarEnsGirChecked || !columnaEnsambles.toLowerCase().includes('gira');
    return (
      (selectedValues.length === 0 || contieneValor(columnaEnsambles, selectedValues)) &&
      dateInRange &&
      (!dropdownValue || (data[7] && data[7].toLowerCase().match(dropdownValue.toLowerCase()))) &&
      !esCancelado && (passFilter(data, filterValues)) && ocultarEnsayosCondition && ocultarEnsGirCondition
    );
  });
  
  var filteredGiras = girasArray.filter(function (gira) {
    var isNombre = dropdownValue ? gira[1] && gira[1].toLowerCase().match(dropdownValue.toLowerCase()) : true;
    var isEnsamble = (selectedValues.length === 0 || gira[2] && contieneValor(gira[2], selectedValues))
    return (isNombre && isEnsamble);
  })

  var nombresGiras = filteredGiras.map(n => n[0]);
  var inicioGiras = filteredGiras.map(n => n[3] instanceof Date && !isNaN(n[3]) ? n[3] : new Date(n[3]));
  var finGiras = filteredGiras.map(n => n[4] instanceof Date && !isNaN(n[4]) ? n[4] : new Date(n[4]));
  var linkGiras = filteredGiras.map(n => n[5]);

  var cantidadPresentaciones = 0;
  var cantidadEnsayos = 0;
  var cantidadEnsGir = 0;

  var uniquePrograms = new Set(filteredData.filter(function (data) { return data[0] && !data[0].includes('♪'); })
    .filter(function (data) { return data[6] && !data[6].toLowerCase().includes('ensayo'); })
    .map(function (data) { return data[0]; }));

  var filteredPresentaciones = filteredData.filter(function (data) {
    var hasEnsayo = data[6] && data[6].toLowerCase().includes('ensayo') && !data[6].toLowerCase().includes('gira');
    var hasEnsGir = data[6] && data[6].toLowerCase().includes('ensayo') && data[6].toLowerCase().includes('gira');
    if (hasEnsGir) { cantidadEnsGir++; } else if (hasEnsayo) { cantidadEnsayos++; }
    return !hasEnsayo && !hasEnsGir;
  });

  cantidadPresentaciones = filteredPresentaciones.length;
  if (completarDias) { completarDiasRango(); }
  createView();

  function formatDate(dateString) { var options = { day: '2-digit', month: 'short', year: 'numeric' }; return new Date(dateString).toLocaleDateString('es-ES', options); }
  $('#cant-elem').text('Programas: ' + uniquePrograms.size);
  $('#cant-pres').text(' -- Presentaciones: ' + cantidadPresentaciones + ' -- Ensayos: ' + cantidadEnsayos + ' -- Ensayos de Gira/Progr.: ' + cantidadEnsGir);
  
  const destroyResizableTable = function (table) {
    const resizers = table.querySelectorAll('.resizer');
    resizers.forEach(function (resizer) { resizer.parentNode.removeChild(resizer); });
  };
  function createTableAsCards() {
    var table = document.getElementById('table-data');
    if (!table) { console.error("Table not found"); return; }
    let width1, width2, width3, width4;
    if (isMobileView()) { width1 = '18'; width2 = '30'; width3 = '40'; width4 = '10'; } 
    else { width1 = '18'; width2 = '30'; width3 = '15'; width4 = '30'; }

    var tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    var detailedRowsByDate = {};

    filteredData.forEach(function (data) {
      var rowDay = data[1] instanceof Date ? data[1] : new Date(data[1]);
      if (!detailedRowsByDate[rowDay]) { detailedRowsByDate[rowDay] = []; }

      var tipoPres = "";
      var tipoCelda = ""; 
      if (data[8] && data[8].toLowerCase().includes('presentación')) { tipoPres = " presentacion"; tipoCelda = "Concierto" }
      else if (data[6] && data[6].includes('Gira/Progr')) { tipoPres = ' ensayoGira'; tipoCelda = 'Ensayo Gira/CF' }
      else { tipoPres = ' ensayo'; tipoCelda = data[6] || 'N/A' }
      var detailedRow = `<tr class="detailed-row${tipoPres}" data-date="${rowDay}"style="width: 100%; text-align: center; padding: 1px; display: none;"><td style="width: ${width1}%">`;
      let estadoColor = '';
      let estado = '';

      if (data[10] !== undefined && window.esCoordEns) {
        switch (data[10]) {
          case 'REVISAR': estadoColor = 'red'; break; case 'Auto-gestionado': estadoColor = 'blue'; break;
          case 'Confirmado': estadoColor = 'green'; break; case 'CANCELADO': estadoColor = 'purple'; break;
          case 'Pedido': estadoColor = 'yellow'; break; case 'Estimado': estadoColor = 'orange'; break;
        }
        estado = estadoColor ? `<span style="background: ${estadoColor};">${data[10]}</span>` : `<span>${data[10]}</span>`;
      }
      
      detailedRow += `<p>${[data[2], estado].filter(Boolean).join("</p><p>")}</p></td><td style="width: ${width2}%">`;
      detailedRow += `<p>${[data[3], data[4]].filter(Boolean).join('</p><p>')}</p></td><td style="width: ${width3}%">`;
      
      var tipo;
      if (data[0] !== "Sin programa asign." && data[0]) {
        var progrs = data[0].split(' ♪ ');
        var drives = data[5] ? data[5].split(' ♪ ') : [];
        var programColored = "";
        var planillas = data[11] ? data[11].split(' ♪ ') : [];
        var planilla = '';
        
        for (var i = 0; i < progrs.length; i++) {
          var backgroundColor;
          if (progrs[i].includes('Sinf')) { backgroundColor = '#5f51db'; tipo = "Sinf";
          } else if (progrs[i].includes('CF Val')) { backgroundColor = '#E1C16E'; tipo = "CFVal";
          } else if (progrs[i].includes('CF Mon')) { backgroundColor = '#A8A8A8'; tipo = "CFMon";
          } else if (progrs[i].includes('CF Mar')) { backgroundColor = '#89CFF0'; tipo = "CFMar";
          } else if (progrs[i].includes('Jazz')) { backgroundColor = '#ffccff'; tipo = "Jazz";
          } else { backgroundColor = '#baee29'; tipo = (data[6] || '').replace('Ensayo de ', '').replace('Gira/Progr. ', '').split(' ')[0]; }
          
          if (window.esCoordEns) { planilla = ` <a href="${planillas[i] || '#'}" style="background: lightblue; text-decoration: none;" >☁︎</a> `; }
          programColored += `<a href="${drives[i] || '#'}" style="background: ${backgroundColor}"> ${progrs[i].substring(0, 12)} </a>${planilla}<br>`;
        }
        if (!tipo) { tipo = "Sin asignar" }
        detailedRow += `<p style="line-height: 1;"> <span style="font-size: 0.7em">${tipoCelda}</span><br>${programColored}</p></td>`;
      } else {
        detailedRow += `<p> <span style="font-size: 0.7em">${tipoCelda}</span><br>Sin asignar</p></td>`;
        tipo = (data[6] || '').replace('Ensayo de ', '').replace('Gira/Progr. ', '').split(' ')[0];
      }
      
      var obs = data[8] || '';
      if (obs.includes('Integrado')) { obs = obs.replace('Ensayo Integrado:', ''); }
      let obsDisplay = isMobileView() ? 'p' : 'td';
      
      if (obs !== "Presentación") { detailedRow += `<${obsDisplay}><i>Observ: </i>${obs}</p>` }
      else { detailedRow += `<${obsDisplay}><i>Observ: </i>${data[9] || ''}</p>` }
      
      if (window.esCoordEns) {
        const namesArray = (data[7] || '').split('|');
        let namesString = "";
        let cantidadNombres = (dropdownValue || '').split("|");
        let filteredNames = namesArray.filter(name => (dropdownValue || '').includes(name));
        
        if (cantidadNombres.length === filteredNames.length && filteredNames.length > 0) {
          namesString = `${window.ensParam} Completo`;
        } else {
          var nombresCompletosChecked = document.getElementById('mostrarNombresButton').classList.contains('active');
          if (!nombresCompletosChecked && !isMobileView()) {
            filteredNames = filteredNames.map(name => {
              const initials = name.split(' ').map(word => word.charAt(0) + (word.length > 1 ? word.charAt(1).toLowerCase() : '')).join('');
              return initials;
            });
          }
          namesString = filteredNames.join('-');
        }
        
        if (isMobileView()) {
          const title = namesString;
          detailedRow += `<td class= "partEns" style="width: ${width4}%; cursor: pointer;" title="${title}">${filteredNames.length}/${cantidadNombres.length}</td>`;
          
        } else {
          detailedRow += `<td style="width: 15%;">${namesString}</td>`;
        }
      }

      detailedRow += `</td> <!–-tipo: ${tipo}  -–><!–-hora: ${data[2] || ''}  /hora-–><!–-obs: ${obs}  /obs-–></tr>`;
      detailedRowsByDate[rowDay].push(detailedRow);
    });

    for (var date in detailedRowsByDate) {
      var dateObj = new Date(date);
      var rowMonth = dateObj.getMonth();
      var rowDay = dateObj;
      var isOcultarDias = !document.querySelector('#ocultarDiasVaciosButton').classList.contains('active');
      
      if (!isOcultarDias) {
          var diff = (rowDay - currentDay) / 1000 / 24 / 60 / 60
          if (diff > 1 && currentDay !== 0) {
            for (i = 1; i < diff; i++) {
              let nextDay = new Date(currentDay.getTime() + i * 24 * 60 * 60 * 1000); 
              rowMonth = nextDay.getMonth();
              if (currentMonth !== rowMonth) {
                var monthSeparatorRow = '<tr style="width: 100%; height: 30px; background-color: rgb(32, 99, 145); color: white;font-weight: bold; font-size: 15px; text-align: center !important;"><td colspan="' + window.totalCols + '">' + getMonthName(rowMonth) + '  ' + new Date(date).getFullYear() + '</td></tr>';
                tbody.insertAdjacentHTML('beforeend', monthSeparatorRow);
              }
              currentMonth = rowMonth;
              let fD = semiLongDate(nextDay);
              let dom = '';
              if (fD.startsWith('D')) { dom = ' style ="color:blue"'; }
              tbody.insertAdjacentHTML('beforeend', '<tr style="text-align: center;background: linear-gradient(rgb(196, 193, 193),rgb(196, 193, 193), white) content-box;font-size: 14px; height: 17px;"><td colspan="' + window.totalCols + '" ' + dom + '><p>' + fD + '</p></td></tr>');
              if (fD.startsWith('D')) { tbody.insertAdjacentHTML('beforeend', '<tr><td colspan="' + window.totalCols + ' style="height: 5px; background-color: gray;"></td></tr>'); };
            };
          }
      }
      currentDay = rowDay

      if (currentMonth !== rowMonth) {
        var monthSeparatorRow = '<tr style="width: 100%; height: 40px; background-color: rgb(32, 99, 145); color: white;font-weight: bold; font-size: 20px; text-align: center !important;"><td colspan="' + window.totalCols + '">' + getMonthName(rowMonth) + '  ' + new Date(date).getFullYear() + '</td></tr>';
        tbody.insertAdjacentHTML('beforeend', monthSeparatorRow);
        currentMonth = rowMonth;
      }
      
      function isSameDay(date1, date2) {
        if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) return false;
        return date1.getTime() === date2.getTime();
      }

      if (inicioGiras.some(date => isSameDay(date, currentDay))) {
        const giraIndex = inicioGiras.findIndex(date => isSameDay(date, currentDay));
        var estaGira = nombresGiras[giraIndex];
        var esteLink = linkGiras[giraIndex];
        tbody.insertAdjacentHTML('beforeend', '<tr class="sepGira"><td colspan="' + window.totalCols + '"><a href="' + esteLink + '">' + estaGira + '</a></td></tr>');
      }

      const events = detailedRowsByDate[date];
      const presentaciones = events.filter(event => event.includes("presentacion")).length;
      const ensGira = events.filter(event => event.includes("ensayoGira")).length;
      const ensayos = events.length - presentaciones - ensGira;
      let tipoResumen;

      if (presentaciones === events.length) { tipoResumen = " presentacion"; } 
      else if (ensGira === events.length) { tipoResumen = " ensayoGira"; } 
      else if (ensayos === events.length) { tipoResumen = " ensayo"; } 
      else { tipoResumen = " mixto"; }

      const esUnico = (events.length == 1)
      var summaryRow = `<tr class="summary-row${tipoResumen}" data-date="${date}" style="cursor: pointer; text-align: center; background: linear-gradient(light green, white); font-size: 18px;">`;
      summaryRow += `<td colspan="${window.totalCols}"><p>${semiLongDate(new Date(date))} - `;

      if (esUnico) {
        const eventType = presentaciones == 1 ? 'Concierto' : (ensGira == 1 ? 'EnsGira' : 'Ensayo');
        const horaMatch = events[0].match(/hora: (.*?) \/hora/);
        const obsMatch = events[0].match(/obs: (.*?) \/obs/);
        const hora = horaMatch ? horaMatch[1] : '';
        const obs = obsMatch ? obsMatch[1] : '';
        
        summaryRow += `<span class="tipoNegrita${eventType === 'Concierto' ? ' tipoSubr' : ''}">${eventType}</span>: ${hora}`;
        if (!isMobileView()) { summaryRow += ` || <span class="cursiva">${obs}</span>`; }
      } else {
        let ensStr = ensayos > 0 ? `${ensayos} <span class="tipoNegrita">Ensayos</span>` : '';
        let presStr = presentaciones > 0 ? `${presentaciones} <span class="tipoNegrita tipoSubr">Conciertos</span>` : '';
        let ensGirStr = ensGira > 0 ? `${ensGira} <span class="tipoNegrita">EnsGira</span>` : '';
        
        const parts = [ensStr, ensGirStr, presStr].filter(p => p !== '');
        summaryRow += parts.join(', ');
      }

      var tipos = new Set(events.map(str => {
        const startPos = str.indexOf("tipo: ") + 6;
        const endPos = str.indexOf("  -–>");
        return str.substring(startPos, endPos);
      }));

      var tipoPrograma = tipos.size === 1 ? Array.from(tipos)[0] : "Varios";
      summaryRow += ` (${tipoPrograma})`

      summaryRow += '</p></td></tr>';
      tbody.insertAdjacentHTML('beforeend', summaryRow);
      
      if (finGiras.some(date => isSameDay(date, currentDay))) {
        tbody.insertAdjacentHTML('beforeend', '<tr class="sepGira"><td colspan="' + window.totalCols + '"></td></tr>');
      }

      detailedRowsByDate[date].forEach(function (detailedRow) {
        tbody.insertAdjacentHTML('beforeend', detailedRow);
        if (esUnico) { tbody.lastChild.style.display = 'none'; }
        else { tbody.lastChild.classList.add('chico'); }
      });
    }

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
      const tableCell = document.querySelectorAll('.partEns');
      tableCell.forEach(function (thisCell) {
        thisCell.addEventListener('click', function () {
          const fullNames = this.getAttribute('title');
          floatingElement.textContent = fullNames;
          floatingElement.style.display = 'block';
        });
      });
    }
  }
  function isMobileView() { return window.innerWidth <= 768; }
  function createView() { createTableAsCards(); }
  function completarDiasRango() {
    var currentDate = fromDate ? new Date(fromDate + 'T00:00') : dataArray[0][1];
    var endDate = untilDate ? new Date(untilDate + 'T00:00') : dataArray[dataArray.length - 1][1];
    var daysInRange = Math.floor((endDate - currentDate) / (24 * 60 * 60 * 1000)) + 1;
    var errorMessageElement = document.getElementById('errorMessage');
    if (daysInRange > 600) { errorMessageElement.textContent = 'Reducí el rango a 60 días o menos'; } 
    else {
      errorMessageElement.textContent = '';
      while (currentDate <= endDate) {
        var formattedDate = formatDate(currentDate);
        var dayWithoutActivity = filteredData.every(function (data) { return formatDate(data[1]) !== formattedDate; });
        if (dayWithoutActivity) { filteredData.push(['Día sin actividad', new Date(currentDate), '', '', '', '', '', '', '', '']); }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      filteredData.sort(function (a, b) { return a[1] - b[1]; });
    }
  }
  const createResizableTable = function (table) {
    // ... (Código de createResizableTable, requiere definición externa de destroyResizableTable/createResizableColumn)
  };
  const createResizableColumn = function (col, resizer) {
    // ... (Código de createResizableColumn)
  };
  $('#table-data th .resizer').off('mousedown mousemove mouseup');
  // destroyResizableTable(document.getElementById('table-data'));
  setTimeout(function () {
    // createResizableTable(document.getElementById('table-data'));
  }, 100);
}
function getMonthName(month) {
  var months = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ]; return months[month];
}
function semiLongDate(date) {
  var options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  var formattedDate = date.toLocaleDateString('es-ES', options);
  var parts = formattedDate.split(' ');
  var dayOfWeek = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).replace('.', '');
  var day = parts[1].replace('.', '').padStart(2, '0');
  var monthAbbreviation = parts[2].replace('.', '');
  return `${dayOfWeek} ${day}/${monthAbbreviation}`;
}
function longDate(date) {
  var options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
  var formattedDate = date.toLocaleDateString('es-ES', options);
  var parts = formattedDate.split(' ');
  var dayOfWeek = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).replace('.', '');
  var day = parts[1].replace('.', '').padStart(2, '0');
  var monthAbbreviation = parts[3].replace('.', '');
  var year = parts[5];
  return `${dayOfWeek} ${day}/${monthAbbreviation}/${year}`;
}
function passFilter(data, filterValues) {
  for (var column in filterValues) {
    var columnIndex = headers.indexOf(column);
    if (columnIndex !== -1 && data[columnIndex] !== undefined && data[columnIndex] !== null) {
      var cellValue = data[columnIndex];
      var filterValue = filterValues[column].toLowerCase();
      if (columnIndex === 1) { cellValue = longDate(cellValue).toString().toLowerCase(); } 
      else { cellValue = cellValue.toString().toLowerCase(); }
      var filterList = filterValue.split('-').map(value => value.trim());
      filterList = filterList.filter(value => value !== '');
      if (filterList.length > 0) {
        const lastFilter = filterList[filterList.length - 1];
        if (cellValue == "" && filterValue.endsWith('-')) { return true }
        if (!(lastFilter.endsWith('-') && cellValue === '')) {
          if (!filterList.some(filter => cellValue.includes(filter))) { return false; }
        }
      }
    }
  }
  return true;
}
function formatDate(dateString) { var options = { day: '2-digit', month: 'short', year: 'numeric' }; return new Date(dateString).toLocaleDateString('es-ES', options); }
function contieneValor(str, selectedValues) { return selectedValues.some(function (value) { return str && str.includes(value); }); }
function isDateInRange(date, fromDate, untilDate) {
  if (!date || isNaN(date.getTime())) { return false; }
  var from = fromDate ? new Date(fromDate + 'T00:00') : null;
  var until = untilDate ? new Date(untilDate + 'T00:00') : null;
  if (from) from.setHours(0, 0, 0, 0);
  if (until) until.setHours(23, 59, 59, 999);
  return (!from || date.getTime() >= from.getTime()) && (!until || date.getTime() <= until.getTime());
}
function checkAll() {
  var checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach(function (checkbox) { checkbox.classList.add('active'); });
  filterData();
}
function uncheckAll() {
  var checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach(function (checkbox) { checkbox.classList.remove('active'); });
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