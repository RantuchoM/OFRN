function crearCheckboxes() {
  const urlParams = new URLSearchParams(window.location.search);

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

  var hayParam = false; // Initialize to false

// Loop through checkbox data
for (const item of checkboxData) {
  if (urlParams.has(item.key)) {
    hayParam = true;
    break; // Exit loop once a match is found
  }
}


  // Reference the ensembleCheckboxes container
  var ensembleCheckboxes = document.getElementById("ensembleCheckboxes");

  // Loop through the checkbox data and create checkboxes dynamically
  checkboxData.forEach(function (checkbox) {
    var checkboxElement = document.createElement("button");
    checkboxElement.style.backgroundColor = checkbox.color;
    checkboxElement.classList.add("filter-checkbox");
    checkboxElement.classList.add("pulsableStr");
    checkboxElement.textContent = checkbox.key;
    checkboxElement.value = checkbox.key;


    // Check the checkbox if the corresponding parameter is present in the URL
    
    if (urlParams.get(checkbox.key) === "true" || !hayParam) {
      checkboxElement.classList.add("active");
    }

    checkboxElement.addEventListener('click', function () {
      // Toggle the state (assuming a function called filterData exists)
      filterData(); // Inverted logic for initial state
  
      // Toggle button class for visual feedback (optional)
      this.classList.toggle('active');
    });

    // Add the checkbox input to the label
    //checkboxElement.appendChild(checkboxInput);

    // Add the checkbox text after the input
    //var checkboxText = document.createTextNode(` ${checkbox.key}`);
    //heckboxElement.appendChild(checkboxText);

    // Append the checkbox label to the container
    ensembleCheckboxes.appendChild(checkboxElement);
  });

}
function agregarOcultar() {
  const mainElement = document.querySelector('main');
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggleFiltros';
  toggleButton.textContent = '⇓ Mostrar filtros';
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
function createOcultarDiasVaciosButton() {
  var ocultarDiasVaciosButton = document.createElement('button');
  ocultarDiasVaciosButton.textContent = 'Días vacíos';
  ocultarDiasVaciosButton.id = 'ocultarDiasVaciosButton';
  ocultarDiasVaciosButton.classList.add('pulsable');
  const urlParameters = new URLSearchParams(window.location.search);
  if (!urlParameters.get('dv')) {
    ocultarDiasVaciosButton.classList.add('active');
  }
  // Add click event listener to the button
  ocultarDiasVaciosButton.addEventListener('click', function () {
    // Toggle the state (assuming a function called filterData exists)
    filterData();
    this.classList.toggle('active');
  });

  // Add the button to the container
  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(ocultarDiasVaciosButton);

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
function createOcultarEnsayos() {
  var ocultarEnsayosButton = document.createElement('button');
  ocultarEnsayosButton.textContent = 'Ensayos';
  ocultarEnsayosButton.id = 'ocultarEnsayosButton';
  ocultarEnsayosButton.classList.add('pulsable');
  ocultarEnsayosButton.classList.add('active');

  // Add click event listener to the button
  ocultarEnsayosButton.addEventListener('click', function () {
    // Toggle the state (assuming a function called filterData exists)
    filterData(); // Inverted logic for initial state

    // Toggle button class for visual feedback (optional)
    this.classList.toggle('active');
  });

  // Add the button to the container
  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(ocultarEnsayosButton);

}

function createOcultarEnsGirButton() {

  var ocultarEnsayosButton = document.createElement('button');
  ocultarEnsayosButton.textContent = 'Ensayos Gira';
  ocultarEnsayosButton.id = 'ocultarEnsGirButton';
  ocultarEnsayosButton.classList.add('pulsable');
  ocultarEnsayosButton.classList.add('active');

  // Add click event listener to the button
  ocultarEnsayosButton.addEventListener('click', function () {
    // Toggle the state (assuming a function called filterData exists)
    filterData(); // Inverted logic for initial state

    // Toggle button class for visual feedback (optional)
    this.classList.toggle('active');
  });

  // Add the button to the container
  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(ocultarEnsayosButton);

}


function downloadPDF() {
  window.print();
}
function createMostrarNombresButton() {
  // Create the button element
  var mostrarNombresButton = document.createElement('button');
  mostrarNombresButton.textContent = 'Nombres';
  mostrarNombresButton.id = 'mostrarNombresButton';
  mostrarNombresButton.classList.add('pulsable');

  // Add click event listener to the button
  mostrarNombresButton.addEventListener('click', function () {
    // Toggle the state (assuming a function called filterData exists)
    filterData(!this.classList.contains('active')); // Inverted logic for initial state

    // Toggle button class for visual feedback (optional)
    this.classList.toggle('active');
  });

  // Add the button to the container
  var buttonContainer = document.getElementById('checks');
  buttonContainer.appendChild(mostrarNombresButton);
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
createOcultarDiasVaciosButton();
createOcultarEnsayos();
createOcultarEnsGirButton();
const urlParams = new URLSearchParams(window.location.search)
const ensParameter = urlParams.get('ens');
if (ensParameter) { createMostrarNombresButton(); }

