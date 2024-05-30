const spreadsheetId = '16UzPE4jiV7WOlBtFDXrhIe1LUI30FIIkadkX2A-IXqY';
const apiKey = '85894591672-c5es2gvfaekq0jq81ee5j2m689bdvseo.apps.googleusercontent.com'; // Dein API-Schlüssel

let totalFamilienGewinn = 0;

function showSection(sectionId) {
    document.querySelectorAll('.container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function fetchMitarbeiterData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Mitarbeiter?key=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const mitarbeiterData = data.values;
            const mitarbeiterSelect = document.getElementById('mitarbeiter');
            const mitarbeiterListe = document.getElementById('familie-mitarbeiterliste');
            mitarbeiterSelect.innerHTML = '';
            mitarbeiterListe.innerHTML = '';

            mitarbeiterData.forEach((row, index) => {
                if (index === 0) return; // Überspringe die Kopfzeile

                const [uuid, name, auszahlung] = row;
                const option = document.createElement('option');
                option.value = uuid;
                option.innerText = name;
                mitarbeiterSelect.appendChild(option);

                const mitarbeiterRow = mitarbeiterListe.insertRow();
                mitarbeiterRow.setAttribute('data-uuid', uuid);
                mitarbeiterRow.insertCell(0).innerText = uuid;
                mitarbeiterRow.insertCell(1).innerText = name;
                const auszahlungCell = mitarbeiterRow.insertCell(2);
                auszahlungCell.classList.add('auszahlung');
                auszahlungCell.innerText = `$${parseFloat(auszahlung).toFixed(2)}`;
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Mitarbeiterdaten:', error);
        });
}

function addAuftrag() {
    const auftrag = document.getElementById('auftrag').value;
    const gewinn = parseFloat(document.getElementById('gewinn').value);
    const kosten = parseFloat(document.getElementById('kosten').value);
    const mitarbeiterAnzahl = parseInt(document.getElementById('mitarbeiter-anzahl').value, 10);
    const mitarbeiterSelect = document.getElementById('mitarbeiter');
    const selectedMitarbeiter = Array.from(mitarbeiterSelect.selectedOptions).map(option => option.value);

    const auszahlungProMitarbeiter = (gewinn * 0.7) / mitarbeiterAnzahl;

    const auftragsliste = document.getElementById('auftragsliste');
    const row = auftragsliste.insertRow();
    row.insertCell(0).innerText = auftrag;
    row.insertCell(1).innerText = gewinn.toFixed(2);
    row.insertCell(2).innerText = kosten.toFixed(2);
    const mitarbeiterNames = selectedMitarbeiter.map(uuid => {
        const mitarbeiterOption = document.querySelector(`#mitarbeiter option[value='${uuid}']`);
        return mitarbeiterOption ? mitarbeiterOption.innerText : '';
    }).join(', ');
    row.insertCell(3).innerText = mitarbeiterNames;
    row.insertCell(4).innerText = auszahlungProMitarbeiter.toFixed(2);

    selectedMitarbeiter.forEach(mitarbeiterUUID => {
        const mitarbeiterRow = document.querySelector(`#familie-mitarbeiterliste tr[data-uuid='${mitarbeiterUUID}']`);
        if (mitarbeiterRow) {
            const auszahlungCell = mitarbeiterRow.querySelector('.auszahlung');
            const aktuelleAuszahlung = parseFloat(auszahlungCell.innerText.slice(1)); // Entferne das $-Zeichen vor dem Parsen
            auszahlungCell.innerText = `$${(aktuelleAuszahlung + auszahlungProMitarbeiter).toFixed(2)}`;
            updateMitarbeiterInGoogleSheet(mitarbeiterUUID, (aktuelleAuszahlung + auszahlungProMitarbeiter).toFixed(2));
        }
    });

    const familienGewinn = gewinn * 0.3;
    totalFamilienGewinn += familienGewinn;
    document.getElementById('familien-gewinn').innerText = `Gesamtgewinn der Familie: $${totalFamilienGewinn.toFixed(2)}`;

    document.getElementById('auftrag-form').reset();
    mitarbeiterSelect.selectedIndex = -1;
}

function addMitarbeiterFromFamilie() {
    const uuid = document.getElementById('familie-uuid').value;
    const name = document.getElementById('familie-name').value;

    const mitarbeiterliste = document.getElementById('familie-mitarbeiterliste');
    const mitarbeiterRow = mitarbeiterliste.insertRow();
    mitarbeiterRow.setAttribute('data-uuid', uuid);
    mitarbeiterRow.insertCell(0).innerText = uuid;
    mitarbeiterRow.insertCell(1).innerText = name;
    const auszahlungCell = mitarbeiterRow.insertCell(2);
    auszahlungCell.classList.add('auszahlung');
    auszahlungCell.innerText = '$0.00';

    const mitarbeiterSelect = document.getElementById('mitarbeiter');
    const option = document.createElement('option');
    option.value = uuid;
    option.innerText = name;
    mitarbeiterSelect.appendChild(option);

    addMitarbeiterToGoogleSheet(uuid, name, 0);

    document.getElementById('familie-form').reset();
}

function addMitarbeiterToGoogleSheet(uuid, name, auszahlung) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Mitarbeiter:append?valueInputOption=USER_ENTERED&key=${apiKey}`;
    const data = {
        "values": [
            [uuid, name, auszahlung]
        ]
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
        console.log('Mitarbeiter hinzugefügt:', data);
    }).catch(error => {
        console.error('Fehler beim Hinzufügen des Mitarbeiters:', error);
    });
}

function updateMitarbeiterInGoogleSheet(uuid, auszahlung) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Mitarbeiter?key=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const mitarbeiterData = data.values;
            let mitarbeiterIndex = -1;
            mitarbeiterData.forEach((row, index) => {
                if (row[0] === uuid) {
                    mitarbeiterIndex = index;
                }
            });
            if (mitarbeiterIndex !== -1) {
                const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Mitarbeiter!C${mitarbeiterIndex + 1}?valueInputOption=USER_ENTERED&key=${apiKey}`;
                const updateData = {
                    "values": [
                        [auszahlung]
                    ]
                };
                fetch(updateUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                }).then(response => response.json()).then(data => {
                    console.log('Mitarbeiter aktualisiert:', data);
                }).catch(error => {
                    console.error('Fehler beim Aktualisieren des Mitarbeiters:', error);
                });
            }
        });
}

// Initiales Laden der Mitarbeiterdaten beim Start
document.addEventListener('DOMContentLoaded', fetchMitarbeiterData);
