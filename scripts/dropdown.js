function getDropdownData() {
  //console.log("getDropdownData")
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5m75Pzx8cztbCWoHzjtcXb3CCrP-YfvDnjE__97fYtZjJnNPqEqyytCXGCcPHKRXDsyCDmyzXO5Wj/pubhtml?gid=0&single=true'; // Replace with the actual URL of the external page
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const data = extractColumnData(doc, 3); // Extract data from the 4th column
      createDropdown(data);
    })
    .catch(error => console.error('Error fetching data:', error));
  return data;
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



// Function to create a dropdown menu with the extracted data
function createDropdown(data) {
  const dropdownContainer = document.getElementById('dropdown-container');
  const dropdown = document.createElement('select');

  // Add a placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.text = "Nombre y Apellido"; // Set your desired placeholder text
  placeholderOption.value = ""; // Set an empty value for the placeholder
  placeholderOption.disabled = true; // Disable the placeholder option
  placeholderOption.selected = true; // Select the placeholder option by default
  dropdown.add(placeholderOption);

  // Sort the data alphabetically
  data.sort();

  // Add an option for each value in the sorted data array
  data.forEach(value => {
    const option = document.createElement('option');
    option.text = toTitleCase(value);
    dropdown.add(option);
  });
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
  // Add a class to the dropdown for Select2 to recognize
  //dropdown.classList.add('js-select2');

  // Add the dropdown to the container
  dropdownContainer.appendChild(dropdown);

  // Wait for the document to be ready
  $(document).ready(function () {
    // Initialize Select2 on the dropdown using its class
    //$('.js-select2')

    // Add an event listener to handle changes in the dropdown
    $('#dropdown-container').on('change', function (e) {
      filterData();
    });
  });

}

getDropdownData()