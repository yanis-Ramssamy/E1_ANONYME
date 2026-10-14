// ===== Adresses des API =====
const URL_PROJETS = "https://webcraft-api.vercel.app/data/projects.json";
const URL_FORMATIONS = "https://webcraft-api.vercel.app/data/courses.json";

// ===== Données chargées (on ne les charge qu'une seule fois) =====
let donneesProjets = null;
let donneesFormations = null;

// ===== Éléments de la page =====
const loader = document.getElementById("loader");
const messageErreur = document.getElementById("message-erreur");

// ===== Charger une API =====
async function chargerDonnees(url) {
  const reponse = await fetch(url);
  if (!reponse.ok) {
    throw new Error("Erreur " + reponse.status);
  }
  return await reponse.json();
}

// ===== Démarrage =====
async function demarrer() {
  loader.classList.remove("d-none");
  messageErreur.classList.add("d-none");

  try {
    // Les projets ne sont utilisés que sur la page d'accueil
    if (document.getElementById("liste-projets")) {
      donneesProjets = await chargerDonnees(URL_PROJETS);
    }
    donneesFormations = await chargerDonnees(URL_FORMATIONS);

    console.log("Projets :", donneesProjets);
    console.log("Formations :", donneesFormations);
  } catch (erreur) {
    console.error(erreur);
    messageErreur.textContent = "Impossible de charger les données. Réessayez plus tard.";
    messageErreur.classList.remove("d-none");
  } finally {
    loader.classList.add("d-none");
  }
}

demarrer();