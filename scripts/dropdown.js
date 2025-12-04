// rantuchom/ofrn/OFRN-9598defe3bd7b48a95976c21f8d31ab539880106/scripts/dropdown.js

// ELIMINADAS LAS DECLARACIONES CONST/LET QUE CAUSABAN CONFLICTO DE ÁMBITO.

var integrantesData; 


function getIntegrantesDataForDropdown() {
  return new Promise((resolve, reject) => {
    
    // Usamos las variables globales definidas en script.js o valores por defecto
    const SHEET_ID = window.INTEGRANTES_SHEET_ID || '1Wwd9Z0ZYwsKSI60KVHwsazR8bnvOWQdGVhSlhmjl-Y0';
    const RANGE = window.INTEGRANTES_RANGE || 'General!A:W';

    if (!gapi.client || !gapi.client.sheets) {
        console.warn("GAPI client not fully initialized when loading dropdown data.");
        // Si gapi no está listo, intentamos una vez más cargarlo.
        return gapi.load('client', () => getIntegrantesDataForDropdown().then(resolve).catch(reject));
    }
    
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    }).then(response => {
      integrantesData = response.result.values;
      if (!integrantesData) { return reject(new Error("No data returned from Integrantes Sheet.")); }
      resolve(integrantesData); 
    }).catch(error => {
      console.error('Error fetching Integrantes data for dropdown:', error);
      reject(error);
    });
  });
}


function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function createDropdown(data) {
  const columnData = data.map(n => n[3] || ''); // Columna NOMBRE Y APELLIDO (índice 3)
  columnData.shift(); 

  var dropdownContainer = document.getElementById("dropdown-container");
  var selectElement = document.createElement('select');
  selectElement.id = 'name-dropdown';
  selectElement.style.width = '100%'; 

  var defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'Todas las personas';
  selectElement.appendChild(defaultOption);

  columnData.forEach(function (name) {
    if (!name) return;
    var option = document.createElement('option');
    option.value = name;
    option.textContent = toTitleCase(name);
    selectElement.appendChild(option);
  });

  dropdownContainer.appendChild(selectElement);
  dropdownContainer.style.display = 'block';

  $(selectElement).select2();

  $(selectElement).on('change', function () {
    if (typeof filterData === 'function') {
        filterData(); 
    } else {
        console.warn("filterData() is not defined globally. Data filtering will not work.");
    }
  });

  if (typeof filterData === 'function') {
      filterData();
  }
}

function loadDropdown() {
    // Esta función solo espera a que gapi esté listo para cargar los datos
    if (typeof gapi !== 'undefined') {
      gapi.load('client', () => {
          getIntegrantesDataForDropdown()
          .then(data => {
              createDropdown(data);
          })
          .catch(error => {
              console.error('Failed to load dropdown data:', error);
          });
      });
    } else {
        console.error("GAPI not defined. Ensure Google API script is loaded.");
    }
}

// ====================================================================
// FUNCIONES AUXILIARES (MANTENIDAS)
// ====================================================================

function crearCheckboxes() {
  // Usamos window.urlParameters para evitar la redeclaración de const/let
  const urlParams = window.urlParameters || new URLSearchParams(window.location.search);

  var checkboxData = [
    { key: "CFVal", color: "#E1C16E" },
    { key: "CFMon", color: "#A8A8A8" },
    { key: "CFMar", color: "#89CFF0" },
    { key: "Jazz", color: "#ffccff" },
    { key: "Sinf", color: "#dabcff" },
    { key: "ECAS", color: "" }, 
    { key: "CAV", color: "" }, 
    { key: "PILTRI", color: "" }, 
    { key: "TREPUN", color: "" }, 
    { key: "ES", color: "" }, 
    { key: "VN", color: "" }, 
    { key: "PV", color: "" }, 
    { key: "CPAT", color: "" }, 
    { key: "VS", color: "" }, 
    { key: "BRAT", color: "" }, 
    { key: "ABRON", color: "" }, 
    { key: "Cuerdas", color: "" }, 
    { key: "Maderas", color: "" }, 
    { key: "Bronces", color: "" }, 
    { key: "Percusión", color: "" } 
  ];

  var hayParam = false; 

  for (const item of checkboxData) {
    if (urlParams.has(item.key)) {
      hayParam = true;
      break; 
    }
  }

  var ensembleCheckboxes = document.getElementById("ensembleCheckboxes");

  checkboxData.forEach(function (checkbox) {
    var checkboxElement = document.createElement("button");
    checkboxElement.style.backgroundColor = checkbox.color;
    checkboxElement.classList.add("filter-checkbox");
    checkboxElement.classList.add("pulsableStr");
    checkboxElement.textContent = checkbox.key;
    checkboxElement.value = checkbox.key;

    if (urlParams.get(checkbox.key) === "true" || !hayParam) {
      checkboxElement.classList.add("active");
    }

    checkboxElement.addEventListener('click', function () {
      if (typeof filterData === 'function') { filterData(); }
      this.classList.toggle('active');
    });

    ensembleCheckboxes.appendChild(checkboxElement);
  });

}
function agregarOcultar() {
  const mainElement = document.querySelector('main');
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggleFiltros';
  toggleButton.textContent = '⇓ Mostrar filtros';
  toggleButton.onclick = toggleFiltros;

  toggleButton.style.display = 'block';
  toggleButton.style.margin = 'auto';

  mainElement.insertBefore(toggleButton, mainElement.firstChild);
}


function fechaDeHoy() {
  document.getElementById('fromDate').valueAsDate = new Date();
}

function createButton(text, onclickFunction) {
  var button = document.createElement('button');
  button.textContent = text;
  button.onclick = onclickFunction;
  button.style = "background-color: gray;font-size: 0.5em;"
  document.getElementById('fechas').appendChild(button);
}

function setThisWeek() {
  var today = new Date();
  var currentDay = today.getDay();
  var diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
  var monday = new Date(today.setDate(diff));

  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  document.getElementById('fromDate').valueAsDate = monday;
  document.getElementById('untilDate').valueAsDate = sunday;
  if (typeof filterData === 'function') { filterData(); }
}

function setNextWeek() {
  var today = new Date();
  var currentDay = today.getDay();
  var diff = today.getDate() - currentDay + (currentDay === 0 ? 1 : 8); 
  var nextMonday = new Date(today.setDate(diff));

  var nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);

  document.getElementById('fromDate').valueAsDate = nextMonday;
  document.getElementById('untilDate').valueAsDate = nextSunday;
  if (typeof filterData === 'function') { filterData(); }
}

function setNext30Days() {
  var today = new Date();
  var next30Days = new Date(today); 
  next30Days.setDate(today.getDate() + 30);

  document.getElementById('fromDate').valueAsDate = today;
  document.getElementById('untilDate').valueAsDate = next30Days;
  if (typeof filterData === 'function') { filterData(); }
}

createButton("Esta sem.", setThisWeek);
createButton("Próx. sem.", setNextWeek);
createButton("30 días", setNext30Days);

function createOcultarDiasVaciosButton() {
  var ocultarDiasVaciosButton = document.createElement('button');
  ocultarDiasVaciosButton.textContent = 'Días vacíos';
  ocultarDiasVaciosButton.id = 'ocultarDiasVaciosButton';
  ocultarDiasVaciosButton.classList.add('pulsable');
  const urlParameters = window.urlParameters || new URLSearchParams(window.location.search);
  if (!urlParameters.get('dv')) {
    ocultarDiasVaciosButton.classList.add('active');
  }

  ocultarDiasVaciosButton.addEventListener('click', function () {
    if (typeof filterData === 'function') { filterData(); }
    this.classList.toggle('active');
  });

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(ocultarDiasVaciosButton);

}

function createDownloadPDFButton() {
  var downloadPDFButton = document.createElement('button');
  downloadPDFButton.type = 'button';
  downloadPDFButton.id = 'downloadPDFButton';
  downloadPDFButton.textContent = 'Descargar/Imprimir';
  downloadPDFButton.addEventListener('click', downloadPDF);
  downloadPDFButton.style = "display: none";

  var buttonContainer = document.getElementById('filtros');
  buttonContainer.appendChild(downloadPDFButton);
}

createDownloadPDFButton();
function createOcultarEnsayos() {
  var ocultarEnsayosButton = document.createElement('button');
  ocultarEnsayosButton.textContent = 'Ensayos';
  ocultarEnsayosButton.id = 'ocultarEnsayosButton';
  ocultarEnsayosButton.classList.add('pulsable');
  ocultarEnsayosButton.classList.add('active');

  ocultarEnsayosButton.addEventListener('click', function () {
    if (typeof filterData === 'function') { filterData(); }
    this.classList.toggle('active');
  });

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(ocultarEnsayosButton);

}

function createOcultarEnsGirButton() {

  var ocultarEnsayosButton = document.createElement('button');
  ocultarEnsayosButton.textContent = 'Ensayos Gira';
  ocultarEnsayosButton.id = 'ocultarEnsGirButton';
  ocultarEnsayosButton.classList.add('pulsable');
  ocultarEnsayosButton.classList.add('active');

  ocultarEnsayosButton.addEventListener('click', function () {
    if (typeof filterData === 'function') { filterData(); }
    this.classList.toggle('active');
  });

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(ocultarEnsayosButton);

}


function downloadPDF() {
  window.print();
}
function createMostrarNombresButton() {
  var mostrarNombresButton = document.createElement('button');
  mostrarNombresButton.textContent = 'Nombres';
  mostrarNombresButton.id = 'mostrarNombresButton';
  mostrarNombresButton.classList.add('pulsable');

  mostrarNombresButton.addEventListener('click', function () {
    if (typeof filterData === 'function') { filterData(!this.classList.contains('active')); }
    this.classList.toggle('active');
  });

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(mostrarNombresButton);
}



function crearMenu() {
  var menuItems = [
    { text: 'Por Ensamble', href: 'index.html' },
    { text: 'Por Persona', href: 'porPersona.html' },
    { text: 'Resumen Personas', href: 'resumenPersonas.html' }
  ];

  var navElement = document.querySelector('nav');

  menuItems.forEach(function (menuItem) {
    var aElement = document.createElement('a');

    aElement.href = menuItem.href;
    aElement.textContent = menuItem.text;

    navElement.appendChild(aElement);
    navElement.appendChild(document.createElement('br'));
  });
}

crearMenu();
crearCheckboxes();
fechaDeHoy();


createOcultarDiasVaciosButton();
createOcultarEnsayos();
createOcultarEnsGirButton();
loadDropdown();


const ensParameter2 = window.urlParameters ? window.urlParameters.get('ens') : null;
if (ensParameter2) { createMostrarNombresButton(); }