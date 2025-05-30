/*
This file is part of Indkøbs App - Denne app er kun på dansk her lige nu.
Copyright (C) 2025 Rikard Svenningsen

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

let catLang = {};

// Returner oversat tekst eller nøglen selv
function translate(key) {
  return catLang[key] || key;
}

// Brug oversættelser på siden
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (catLang[key]) el.textContent = catLang[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (catLang[key]) el.setAttribute("placeholder", catLang[key]);
  });

  // Oversæt første <option> i dropdown
  const storeSelect = document.getElementById("storeSelect");
  if (storeSelect && storeSelect.options.length > 0) {
    storeSelect.options[0].textContent = translate("Select store");
  }

  // Oversæt kategori-knappen hvis den findes
  if (typeof updateCategoryButtonText === "function") {
    updateCategoryButtonText();
  }

  // Opdater modalens oversættelser også
  if (typeof applyTranslations_ === "function") {
    applyTranslations_();
  }
}

// Indlæs sprog og anvend oversættelser
document.addEventListener("DOMContentLoaded", () => {
	// forkert sted til sprogvalg
  const lang = localStorage.getItem("selectedLang") || "da";

  fetch("lang.json")
    .then((res) => res.json())
    .then((translations) => {
		const cat = translations[lang]?.cat || {};
		const warning = translations[lang]?.warning || {};
		catLang = { ...cat, ...warning };
		applyTranslations();

      // Først når sproget er sat, kaldes loadStores
      if (typeof loadStores === "function") {
        loadStores();

        const savedStore = localStorage.getItem("selectedStoreCategory");
        if (savedStore) {
          const storeSelect = document.getElementById("storeSelect");
          storeSelect.value = savedStore;
          changeStore();
        }
      }
    });
});
// midlertidig løsning
function domain_label() {
  const { protocol, hostname, port } = window.location;
  let host = hostname;
  if (protocol !== "https:" && port && port !== "80") {
    host += ":" + port;
  }
  return host + "\n" + translate("browser_msg") + "\n\n";
}
window.domain_label = domain_label;
function upcase(text) {
  return text.toUpperCase();
}
