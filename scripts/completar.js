function crearCheckboxes(){

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
function fechaDeHoy()
{
    document.getElementById('fromDate').valueAsDate = new Date();
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

