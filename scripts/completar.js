function crearCheckboxes() {

  var checkboxData = [
    { key: "CFVal", color: "#E1C16E" },
    { key: "CFMon", color: "#A8A8A8" },
    { key: "CFMar", color: "#89CFF0" },
    { key: "CFCuer", color: "#ffccff" },
    { key: "Sinf", color: "#dabcff" },
    { key: "ECAS", color: "" }, // Replace with the actual background color
    { key: "CAV", color: "" }, // Replace with the actual background color
    { key: "PILTRI", color: "" }, // Replace with the actual background color
    { key: "TREPUN", color: "" }, // Replace with the actual background color
    { key: "ES", color: "" }, // Replace with the actual background color
    { key: "VN", color: "" }, // Replace with the actual background color
    { key: "PV", color: "" }, // Replace with the actual background color
    { key: "CPAT", color: "" }, // Replace with the actual background color
    { key: "VS", color: "" }, // Replace with the actual background color
    { key: "BRAT", color: "" }, // Replace with the actual background color
    { key: "ABRON", color: "" }, // Replace with the actual background color
    { key: "Cuerdas", color: "" }, // Replace with the actual background color
    { key: "Maderas", color: "" }, // Replace with the actual background color
    { key: "Bronces", color: "" }, // Replace with the actual background color
    { key: "Percusión", color: "" } // Replace with the actual background color
  ];

  // Reference the ensembleCheckboxes container
  var ensembleCheckboxes = document.getElementById("ensembleCheckboxes");

  // Loop through the checkbox data and create checkboxes dynamically
  checkboxData.forEach(function (checkbox) {
    var checkboxElement = document.createElement("label");
    checkboxElement.style.backgroundColor = checkbox.color;

    // Create a checkbox input
    var checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.className = "filter-checkbox";
    checkboxInput.value = checkbox.key;

    // Check the checkbox if the corresponding parameter is present in the URL
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get(checkbox.key) === "true") {
      checkboxInput.checked = true;
    }

    // Add the checkbox input to the label
    checkboxElement.appendChild(checkboxInput);

    // Add the checkbox text after the input
    var checkboxText = document.createTextNode(` ${checkbox.key}`);
    checkboxElement.appendChild(checkboxText);

    // Append the checkbox label to the container
    ensembleCheckboxes.appendChild(checkboxElement);
  });

}
function agregarOcultar() {
  const mainElement = document.querySelector('main');
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggleFiltros';
  toggleButton.textContent = '⇑';
  toggleButton.onclick = toggleFiltros;

  // Style the button for centering
  toggleButton.style.display = 'block';
  toggleButton.style.margin = 'auto';

  // Insert the button as the first child of main
  mainElement.insertBefore(toggleButton, mainElement.firstChild);
}


function fechaDeHoy() {
  document.getElementById('fromDate').valueAsDate = new Date();
}
// Function to create and append a button
function createButton(text, onclickFunction) {
  var button = document.createElement('button');
  button.textContent = text;
  button.onclick = onclickFunction;
  document.getElementById('fechas').appendChild(button);
}

// Function to set the date range for "Esta semana"
function setThisWeek() {
  var today = new Date();
  var currentDay = today.getDay();
  var diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust for Sunday
  var monday = new Date(today.setDate(diff));

  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  document.getElementById('fromDate').valueAsDate = monday;
  document.getElementById('untilDate').valueAsDate = sunday;
  filterData();
}

// Function to set the date range for "Próxima semana"
function setNextWeek() {
  var today = new Date();
  var currentDay = today.getDay();
  var diff = today.getDate() - currentDay + (currentDay === 0 ? 1 : 8); // Adjust for Sunday
  var nextMonday = new Date(today.setDate(diff));

  var nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);

  document.getElementById('fromDate').valueAsDate = nextMonday;
  document.getElementById('untilDate').valueAsDate = nextSunday;
  filterData();
}

// Function to set the date range for "Próximos 30 días"
function setNext30Days() {
  var today = new Date();
  var next30Days = new Date(today); // Create a copy of the 'today' date
  next30Days.setDate(today.getDate() + 30);

  document.getElementById('fromDate').valueAsDate = today;
  document.getElementById('untilDate').valueAsDate = next30Days;
  filterData();
}
// Create and append buttons
createButton("Esta semana", setThisWeek);
createButton("Próxima semana", setNextWeek);
createButton("Próximos 30 días", setNext30Days);

// Function to create the "Completar Días" checkbox
function createOcultarDiasVaciosCheckbox() {
  var ocultarDiasVaciosCheckbox = document.createElement('input');
  ocultarDiasVaciosCheckbox.type = 'checkbox';
  ocultarDiasVaciosCheckbox.id = 'ocultarDiasVaciosCheckbox';

  var label = document.createElement('label');
  label.appendChild(ocultarDiasVaciosCheckbox);
  label.appendChild(document.createTextNode('Ocultar Días Vacíos'));

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(label);
}

function createDownloadPDFButton() {
  var downloadPDFButton = document.createElement('button');
  downloadPDFButton.type = 'button';
  downloadPDFButton.id = 'downloadPDFButton';
  downloadPDFButton.textContent = 'Descargar/Imprimir';
  downloadPDFButton.addEventListener('click', downloadPDF);

  var buttonContainer = document.getElementById('filtros');
  buttonContainer.appendChild(downloadPDFButton);
}

createDownloadPDFButton();
function createOcultarEnsayosCheckbox() {
  var ocultarEnsayosCheckbox = document.createElement('input');
  ocultarEnsayosCheckbox.type = 'checkbox';
  ocultarEnsayosCheckbox.id = 'ocultarEnsayosCheckbox';

  var label = document.createElement('label');
  label.appendChild(ocultarEnsayosCheckbox);
  label.appendChild(document.createTextNode('Ocultar Ensayos'));

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(label);
}
function createOcultarEnsGirCheckbox() {
  var ocultarEnsayosCheckbox = document.createElement('input');
  ocultarEnsayosCheckbox.type = 'checkbox';
  ocultarEnsayosCheckbox.id = 'ocultarEnsGirCheckbox';

  var label = document.createElement('label');
  label.appendChild(ocultarEnsayosCheckbox);
  label.appendChild(document.createTextNode('Ocultar Ensayos de Gira/Progr.'));

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(label);
}


function downloadPDF() {
  window.print();
}
function createMostrarNombresCheckbox() {
  var ocultarEnsayosCheckbox = document.createElement('input');
  ocultarEnsayosCheckbox.type = 'checkbox';
  ocultarEnsayosCheckbox.id = 'mostrarNombresCheckbox';

  var label = document.createElement('label');
  label.appendChild(ocultarEnsayosCheckbox);
  label.appendChild(document.createTextNode('Mostrar Nombres Completos'));

  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(label);
  document.querySelector('#mostrarNombresCheckbox').addEventListener('change', function () { filterData(false); });
}



function crearMenu() {
  // Define the menu items as an array of objects with 'text' and 'href' properties
  var menuItems = [
    { text: 'Por Ensamble', href: 'index.html' },
    { text: 'Por Persona', href: 'porPersona.html' },
    { text: 'Resumen Personas', href: 'resumenPersonas.html' }


    // Add more items as needed
  ];

  // Get the <nav> element
  var navElement = document.querySelector('nav');

  // Iterate over the menu items and create <a> elements
  menuItems.forEach(function (menuItem) {
    var aElement = document.createElement('a');

    // Set the 'href' and 'text' properties based on the current menu item
    aElement.href = menuItem.href;
    aElement.textContent = menuItem.text;

    // Append the <a> element to the <nav> element
    navElement.appendChild(aElement);

    // Add a line break between the <a> elements if needed
    navElement.appendChild(document.createElement('br'));
  });
}

// Call the crearMenu() function to add the menu items to the <nav>
crearMenu();
crearCheckboxes();
fechaDeHoy();


// Call the function to create the "Completar Días" checkbox
createOcultarDiasVaciosCheckbox();
createOcultarEnsayosCheckbox();
createOcultarEnsGirCheckbox();
const urlParams = new URLSearchParams(window.location.search)
const ensParameter = urlParams.get('ens');
if(ensParameter){createMostrarNombresCheckbox();}

