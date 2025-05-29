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
/*
// denne bruges shopscript.js
function DOMAIN_LABEL() {
  const { protocol, hostname, port } = window.location;
  let host = hostname;
  if (protocol !== "https:" && port && port !== "80") {
    host += ":" + port;
  }

  // Henter browser_msg direkte fra translations, uden fallback
  const browserMsg = translations[currentLang].warning["browser_msg"] || "";

  return host + "\n" + browserMsg + "\n\n";
}
window.DOMAIN_LABEL = DOMAIN_LABEL;

function upcase(text) {
  return text.toUpperCase();
}
*/
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
