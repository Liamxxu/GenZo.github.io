const scriptURL = 'https://script.google.com/macros/s/AKfycbwvFi8VjXWkJNXWDfOYqUebrareZCt86PQxSRFHv6VbK4_aMIaQkqaqBJ2PcnkfkEP3/exec';

document.addEventListener('DOMContentLoaded', function() {
    fetchEmployees();
});

async function fetchEmployees() {
    try {
        const response = await fetch(scriptURL + '?action=getEmployees');
        const data = await response.json();
        populateEmployeeTable(data);
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
}

function populateEmployeeTable(employees) {
    const tableBody = document.getElementById('familie-mitarbeiterliste');
    tableBody.innerHTML = '';
    employees.forEach(employee => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = employee.uuid;
        row.insertCell(1).innerText = employee.name;
        row.insertCell(2).innerText = `$${employee.totalPayout.toFixed(2)}`;
        const actionsCell = row.insertCell(3);
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Löschen';
        deleteButton.onclick = function() {
            deleteMitarbeiter(employee.uuid);
        };
        actionsCell.appendChild(deleteButton);
    });
}

async function addMitarbeiterFromFamilie() {
    const uuid = document.getElementById('familie-uuid').value;
    const name = document.getElementById('familie-name').value;
    if (uuid && name) {
        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                body: JSON.stringify({ action: 'addEmployee', uuid, name })
            });
            if (response.ok) {
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    }
}

function showSection(section) {
    document.getElementById('auftraege').style.display = section === 'auftraege' ? 'block' : 'none';
    document.getElementById('familie').style.display = section === 'familie' ? 'block' : 'none';
}

// Füge die anderen Funktionen hier ein (addAuftrag, deleteMitarbeiter, etc.)

async function addAuftrag() {
    // Deine Logik hier
}

async function deleteMitarbeiter(uuid) {
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteEmployee', uuid })
        });
        if (response.ok) {
            fetchEmployees();
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
    }
}
