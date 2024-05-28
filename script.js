/* JavaScript für die Interaktivität der Webseite */

let totalFamilienGewinn = 0;

function showSection(sectionId) {
    document.querySelectorAll('.container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function addAuftrag() {
    // Funktion zum Hinzufügen eines Auftrags
    // Implementiere hier die Logik zum Hinzufügen eines Auftrags
}

function addMitarbeiterFromFamilie() {
    // Funktion zum Hinzufügen eines Mitarbeiters aus der Familie
    // Implementiere hier die Logik zum Hinzufügen eines Mitarbeiters aus der Familie
}

function deleteMitarbeiter(uuid) {
    // Funktion zum Löschen eines Mitarbeiters
    // Implementiere hier die Logik zum Löschen eines Mitarbeiters
}
