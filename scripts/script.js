const apiKey = "AIzaSyAxQ63EFfI-ackr9PrPOxJepog7DDh5_dE";

function getGoogleSheetData() {
  const sheetId = "1XInPoaqzkKnIMn2vB7cZ1cE22NyzcupDNW7RHSE9jmk";
  const range = "Listado!L1:P100";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => data.values);
}

function displayTable(data) {
  const table = document.createElement("table");
  const tableHeader = document.createElement("thead");
  const tableBody = document.createElement("tbody");

  // Create table header
  for (const column of data[0]) {
    const tableHeaderCell = document.createElement("th");
    tableHeaderCell.textContent = column;
    tableHeader.appendChild(tableHeaderCell);
  }

  // Create table body
  for (const row of data.slice(1)) {
    const tableBodyRow = document.createElement("tr");
    for (const cell of row) {
      const tableBodyCell = document.createElement("td");
      tableBodyCell.textContent = cell;
      tableBodyRow.appendChild(tableBodyCell);
    }
    tableBody.appendChild(tableBodyRow);
  }

  table.appendChild(tableHeader);
  table.appendChild(tableBody);

  document.getElementById("table-container").appendChild(table);
}

window.onload = function() {
  getGoogleSheetData()
    .then(data => displayTable(data));
};
