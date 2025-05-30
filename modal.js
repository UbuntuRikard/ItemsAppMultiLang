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

let resolveCallback;
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
function applyTranslations_() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const parts = key.split('.');
    let text = window.langData?.[window.currentLang];
    for (const part of parts) {
      text = text?.[part];
    }
    if (text) el.textContent = text;
  });
}

function showModal(message, isConfirm = false) {
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("customModal").style.display = "flex";
  document.getElementById("cancelButton").style.display = isConfirm ? "inline-block" : "none";

  return new Promise((resolve) => {
    resolveCallback = resolve;
  });
}

function initModal() {
  document.getElementById("okButton").onclick = () => {
    document.getElementById("customModal").style.display = "none";
    resolveCallback(true);
  };

  document.getElementById("cancelButton").onclick = () => {
    document.getElementById("customModal").style.display = "none";
    resolveCallback(false);
  };

  applyTranslations_();
}

function alert_(message) {
  return showModal(message, false);
}

function confirm_(message) {
  return showModal(message, true);
}

window.alert_ = alert_;
window.confirm_ = confirm_;
window.initModal = initModal;
window.applyTranslations_ = applyTranslations_;
