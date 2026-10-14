const URL_PROJETS = "https://webcraft-api.vercel.app/data/projects.json";
const URL_FORMATIONS = "https://webcraft-api.vercel.app/data/courses.json";

let donneesProjets = null;
let donneesFormations = null;

const modal = document.getElementById("modal");

function showLoading(show) {
    document.getElementById("loader").classList.toggle("d-none", !show);
}

function showError(message) {
    const erreur = document.getElementById("message-erreur");
    erreur.textContent = message;
    erreur.classList.remove("d-none");
}

// Charger les données d'une API
async function chargerDonnees(url) {
    try {
        showLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        showError(`Impossible de charger les données (${error.message})`);
        return null;
    } finally {
        showLoading(false);
    }
}

function creerBadges(technologies) {
    let html = "";
    technologies.forEach(tech => {
        html += `<span class="badge-techno">${tech}</span>`;
    });
    return html;
}

function creerListe(elements) {
    let html = "";
    elements.forEach(element => {
        html += `<li>${element}</li>`;
    });
    return html;
}

function creerBadgeDispo(formation) {
    if (formation.available) {
        return '<span class="badge-dispo">Disponible</span>';
    }
    return '<span class="badge-complet">Complet</span>';
}

function creerBoutonInscription(formation, texte) {
    if (formation.available) {
        return `<a class="btn-principal" href="inscription.html">${texte}</a>`;
    }
    return `<button class="btn-principal" disabled>${texte}</button>`;
}

// Afficher les projets
function afficherProjets(liste) {
    const conteneur = document.getElementById("liste-projets");
    conteneur.innerHTML = "";

    if (liste.length === 0) {
        conteneur.innerHTML = "<p>Aucun projet trouvé.</p>";
        return;
    }

    liste.forEach(projet => {
        conteneur.innerHTML += `
            <article class="carte">
                <img src="${projet.image}" alt="${projet.title}">
                <div class="carte-corps">
                    <h3>${projet.title}</h3>
                    <p>Client : ${projet.client}</p>
                    <p>Catégorie : ${projet.category}</p>
                    <div>${creerBadges(projet.technologies)}</div>
                    <div class="carte-boutons">
                        <button class="btn-principal" onclick="ouvrirModalProjet(${projet.id})">Voir détails</button>
                    </div>
                </div>
            </article>
        `;
    });
}

// Afficher les formations
function afficherFormations(liste) {
    const conteneur = document.getElementById("liste-formations");
    conteneur.innerHTML = "";

    if (liste.length === 0) {
        conteneur.innerHTML = "<p>Aucune formation trouvée.</p>";
        return;
    }

    liste.forEach(formation => {
        conteneur.innerHTML += `
            <article class="carte">
                <img src="${formation.image}" alt="${formation.title}">
                <div class="carte-corps">
                    <h3>${formation.title}</h3>
                    <p>${formation.category}</p>
                    <div>
                        <span class="badge-niveau">${formation.level}</span>
                        ${creerBadgeDispo(formation)}
                    </div>
                    <p>${formation.duration} - ${formation.price} €</p>
                    <p>${formation.rating} ★ (${formation.students} étudiants)</p>
                    <div>${creerBadges(formation.technologies)}</div>
                    <div class="carte-boutons">
                        <button class="btn-principal" onclick="ouvrirModalFormation(${formation.id})">Voir détails</button>
                        ${creerBoutonInscription(formation, "S'inscrire")}
                    </div>
                </div>
            </article>
        `;
    });
}

// Modal : un seul modal pour les projets et les formations
function ouvrirModal(html) {
    document.getElementById("corps-modal").innerHTML = html;
    modal.style.display = "block";
}

function fermerModal() {
    if (modal) {
        modal.style.display = "none";
    }
}

function ouvrirModalProjet(id) {
    const projet = donneesProjets.projects.find(p => p.id === id);

    ouvrirModal(`
        <img src="${projet.image}" alt="${projet.title}">
        <h2>${projet.title}</h2>
        <p>Client : ${projet.client} - ${projet.category}</p>
        <p>Année : ${projet.year} - Durée : ${projet.duration}</p>
        <p>${projet.description}</p>
        <ul>${creerListe(projet.features)}</ul>
        <div>${creerBadges(projet.technologies)}</div>
        <p><a href="${projet.url}" target="_blank">Voir le projet</a></p>
    `);
}

function ouvrirModalFormation(id) {
    const formation = donneesFormations.courses.find(f => f.id === id);

    ouvrirModal(`
        <img src="${formation.image}" alt="${formation.title}">
        <h2>${formation.title}</h2>
        <p>
            <span class="badge-niveau">${formation.level}</span>
            ${creerBadgeDispo(formation)}
        </p>
        <p>Formateur : ${formation.instructor}</p>
        <p>${formation.duration} - ${formation.price} € - ${formation.rating} ★ (${formation.students} étudiants)</p>
        <p>${formation.description}</p>
        <ul>${creerListe(formation.modules)}</ul>
        ${creerBoutonInscription(formation, "S'inscrire maintenant")}
    `);
}

// Clic en dehors du modal : on le ferme
window.onclick = function (event) {
    if (event.target == modal) {
        fermerModal();
    }
};

// Touche Échap : on ferme
document.onkeydown = function (event) {
    if (event.key == "Escape") {
        fermerModal();
    }
};

// Débounce : attend que l'utilisateur arrête de taper avant de lancer la recherche
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Remplir une liste déroulante avec un tableau de valeurs
function remplirSelect(idSelect, valeurs) {
    const select = document.getElementById(idSelect);
    valeurs.forEach(valeur => {
        select.innerHTML += `<option value="${valeur}">${valeur}</option>`;
    });
}

// Filtrer les projets (recherche + techno + catégorie en même temps)
function filtrerProjets() {
    const recherche = document.getElementById("recherche-projets").value.toLowerCase();
    const techno = document.getElementById("filtre-techno-projets").value;
    const categorie = document.getElementById("filtre-categorie-projets").value;

    const resultat = donneesProjets.projects.filter(projet => {
        const okRecherche = projet.title.toLowerCase().includes(recherche)
            || projet.client.toLowerCase().includes(recherche);
        const okTechno = techno == "" || projet.technologies.includes(techno);
        const okCategorie = categorie == "" || projet.category == categorie;
        return okRecherche && okTechno && okCategorie;
    });

    afficherProjets(resultat);
}

// Filtrer les formations (recherche + catégorie + niveau + techno en même temps)
function filtrerFormations() {
    const recherche = document.getElementById("recherche-formations").value.toLowerCase();
    const categorie = document.getElementById("filtre-categorie-formations").value;
    const niveau = document.getElementById("filtre-niveau-formations").value;
    const techno = document.getElementById("filtre-techno-formations").value;

    const resultat = donneesFormations.courses.filter(formation => {
        const okRecherche = formation.title.toLowerCase().includes(recherche)
            || formation.instructor.toLowerCase().includes(recherche);
        const okCategorie = categorie == "" || formation.category == categorie;
        const okNiveau = niveau == "" || formation.level == niveau;
        const okTechno = techno == "" || formation.technologies.includes(techno);
        return okRecherche && okCategorie && okNiveau && okTechno;
    });

    afficherFormations(resultat);
}

// Remplir les listes et brancher les événements des projets
function activerFiltresProjets() {
    remplirSelect("filtre-techno-projets", donneesProjets.technologies);
    remplirSelect("filtre-categorie-projets", donneesProjets.categories);

    document.getElementById("recherche-projets").oninput = debounce(filtrerProjets, 300);
    document.getElementById("filtre-techno-projets").onchange = filtrerProjets;
    document.getElementById("filtre-categorie-projets").onchange = filtrerProjets;
}

// Remplir les listes et brancher les événements des formations
function activerFiltresFormations() {
    remplirSelect("filtre-categorie-formations", donneesFormations.categories);
    remplirSelect("filtre-niveau-formations", donneesFormations.levels);
    remplirSelect("filtre-techno-formations", donneesFormations.technologies);

    document.getElementById("recherche-formations").oninput = debounce(filtrerFormations, 300);
    document.getElementById("filtre-categorie-formations").onchange = filtrerFormations;
    document.getElementById("filtre-niveau-formations").onchange = filtrerFormations;
    document.getElementById("filtre-techno-formations").onchange = filtrerFormations;
}

// Message d'erreur selon le problème détecté par le navigateur
function texteErreur(champ) {
    if (champ.validity.valueMissing) {
        return "Ce champ est obligatoire.";
    }
    if (champ.validity.tooShort) {
        return `Minimum ${champ.minLength} caractères.`;
    }
    if (champ.validity.patternMismatch || champ.validity.typeMismatch) {
        return champ.title;
    }
    return "";
}

function activerFormulaire() {
    const formulaire = document.getElementById("formulaire-inscription");
    const messageSucces = document.getElementById("message-succes");

    const titres = [];
    donneesFormations.courses.forEach(formation => {
        titres.push(formation.title);
    });
    remplirSelect("formation", titres);

    const champs = [
        document.getElementById("prenom"),
        document.getElementById("nom"),
        document.getElementById("email"),
        document.getElementById("telephone"),
        document.getElementById("formation"),
        document.getElementById("niveau"),
        document.getElementById("motivation")
    ];

    champs.forEach(champ => {
        // Le navigateur signale un champ invalide : on affiche notre message sous le champ
        champ.oninvalid = function () {
            const message = texteErreur(champ);
            champ.setCustomValidity(message);
            champ.nextElementSibling.textContent = message;
        };

        // À chaque saisie : on efface l'erreur puis on revérifie le champ (temps réel)
        champ.oninput = function () {
            messageSucces.classList.add("d-none");
            champ.setCustomValidity("");
            champ.nextElementSibling.textContent = "";
            champ.checkValidity();
        };
    });

    // Ce code ne s'exécute que si tous les champs sont valides
    formulaire.onsubmit = function (event) {
        event.preventDefault();
        messageSucces.textContent = `Merci ${champs[0].value}, votre inscription est bien enregistrée !`;
        messageSucces.classList.remove("d-none");
        formulaire.reset();
    };
}

async function demarrer() {
    if (document.getElementById("liste-projets")) {
        donneesProjets = await chargerDonnees(URL_PROJETS);
        if (donneesProjets) {
            afficherProjets(donneesProjets.projects);
            activerFiltresProjets();
        }
    }

    donneesFormations = await chargerDonnees(URL_FORMATIONS);
    if (donneesFormations && document.getElementById("liste-formations")) {
        afficherFormations(donneesFormations.courses);
        activerFiltresFormations();
    }
    if (donneesFormations && document.getElementById("formulaire-inscription")) {
        activerFormulaire();
    }
}

demarrer();