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

let translations = {};

let currentLang = localStorage.getItem('selectedLang') || 'en';
let isEditing = false; 


async function loadTranslations() {
    try {
        const response = await fetch('lang.json');
        translations = await response.json();
        console.log("Oversættelser indlæst:", translations); // Debugging
        applyTranslations(); 
    } catch (error) {
        console.error('Kunne ikke indlæse oversættelser:', error);
    }
}

function loadStores() {
  storeSelect.innerHTML = ''; // Clear options first

  
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = translations[currentLang]?.shop["Select store"] || "Select store";
  storeSelect.appendChild(defaultOption);

  const sorted = [...stores].sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach(s => {
    const option = document.createElement("option");
    option.value = s.name;
    option.textContent = s.name;
    storeSelect.appendChild(option);
  });

  storeSelect.value = selectedStore;
}

function DOMAIN_LABEL() {
  const { protocol, hostname, port } = window.location;
  let host = hostname;
  if (protocol !== "https:" && port && port !== "80") {
    host += ":" + port;
  }

  const browserMsg = translations[currentLang].warning["browser_msg"] || "";

  return host + "\n" + browserMsg + "\n\n";
}
window.DOMAIN_LABEL = DOMAIN_LABEL;


function upcase(text) {
  return text.toUpperCase();
}
window.upcase = upcase;


function renderCategoryOptions() {
  categorySelect.innerHTML = '';
  filterSelect.innerHTML = '';

  
  const defaultCategoryOption = document.createElement("option");
  defaultCategoryOption.value = "";
  defaultCategoryOption.textContent = translations[currentLang]?.shop["Select category"] || "Select category";
  categorySelect.appendChild(defaultCategoryOption);

  const defaultFilterOption = document.createElement("option");
  defaultFilterOption.value = "";
  defaultFilterOption.textContent = translations[currentLang]?.shop["All Categories"] || "All Categories";
  filterSelect.appendChild(defaultFilterOption);

  const store = getCurrentStore();
  if (store) {
    const sorted = [...store.categories].sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(cat => {
      const opt1 = document.createElement("option");
      opt1.value = cat.name;
      opt1.textContent = cat.name;
      categorySelect.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = cat.name;
      opt2.textContent = cat.name;
      filterSelect.appendChild(opt2);
    });
  }
}

// 🔄 **Anvend oversættelser til hele siden**
function applyTranslations() {
    if (!translations[currentLang] || !translations[currentLang].shop) {
        console.error("Oversættelser mangler:", translations);
        return;
    }

    const texts = translations[currentLang].shop;

    
    document.getElementById('htmlTag').setAttribute('lang', currentLang);

    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) {
            el.textContent = texts[key];
        }
    });

    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (texts[key]) {
            el.placeholder = texts[key];
        }
    });

    updateButtonText(); 
}

function updateButtonText() {
    const addBtn = document.getElementById("addBtn");
    if (!addBtn) {
        console.error("Kunne ikke finde addBtn!");
        return;
    }

    const key = isEditing ? "Update item" : "Add item";
    const translation = translations[currentLang]?.shop?.[key];

    if (!translation) {
        console.error(`Mangler oversættelse for '${key}' i sprogfilen!`);
        return;
    }

    addBtn.textContent = translation;
    console.log(`Knaptekst opdateret til: '${translation}' på sprog '${currentLang}'`);
}

// 🔄 **Toggle-knap (Show all, Hide 0, Only 0)**
function toggleAndTranslate() {
    window.zeroMode = (window.zeroMode + 1) % 3;

    const labels = [
        translations[currentLang].shop["Hide 0"],
        translations[currentLang].shop["Only 0"],
        translations[currentLang].shop["Show all"]
    ];

    // Opdater knaptekst med oversættelse
    document.getElementById("toggleZeroBtn").textContent = labels[window.zeroMode];

    renderList();
}


function startEditWithTranslation(item, cat) {
    numberInput.value = item.number;
    nameInput.value = item.name;
    categorySelect.value = cat.name;
    editingItem = { item, cat };

    isEditing = true; 
    updateButtonText(); 

    lastFocusedId = item.id;
    numberInput.focus();
}

function processItemAction() {
    if (!selectedStore) return alert(translations[currentLang].warning["select_store"]);

    const qty = numberInput.value.trim();
    const name = nameInput.value.trim();
    const catName = categorySelect.value;

    if (qty === "" || isNaN(qty) || qty < 0 || qty > 999) return alert(translations[currentLang].warning["qty_alert"]);
    if (name === "" || catName === "") return alert(translations[currentLang].warning["cat_name_alert"]);

    const store = getCurrentStore();
    const cat = store.categories.find(c => c.name === catName);

    if (editingItem) {
        const oldCat = editingItem.cat;
        const item = editingItem.item;

        if (oldCat.name !== catName) {
            oldCat.items = oldCat.items.filter(i => i.id !== item.id);
            const newItem = { ...item, number: qty, name, category: catName };
            cat.items.push(newItem);
        } else {
            Object.assign(item, { number: qty, name });
        }

        editingItem = null;
        isEditing = false; 
        updateButtonText(); 

    } else {
        cat.items.push({ id: crypto.randomUUID(), number: qty, name, price: "", checked: false });
    }

    renderList();
}
function editItem(item, cat) {
  numberInput.value = item.number;
  nameInput.value = item.name;
  categorySelect.value = cat.name;
  editingItem = { item, cat };
  isEditing = true;
  updateButtonText();
  lastFocusedId = item.id;
  numberInput.focus();
}

window.editItem = editItem;

function handleItemAction() {
    if (!selectedStore) {
        alert(DOMAIN_LABEL() + upcase(translations[currentLang].warning["select_store"]));
        return;
    }

    const qty = numberInput.value.trim();
    const name = nameInput.value.trim();
    const catName = categorySelect.value;

    if (qty === "" || isNaN(qty) || qty < 0 || qty > 999) {
        alert(DOMAIN_LABEL() + upcase(translations[currentLang].warning["qty_alert"]));
        return;
    }

    if (name === "" || catName === "") {
        alert(DOMAIN_LABEL() + upcase(translations[currentLang].warning["cat_name_alert"]));
        return;
    }

    const store = getCurrentStore();
    const cat = store.categories.find(c => c.name === catName);

    if (editingItem) {
        const oldCat = editingItem.cat;
        const item = editingItem.item;

        if (oldCat.name !== catName) {
            oldCat.items = oldCat.items.filter(i => i.id !== item.id);
            const newItem = { ...item, number: qty, name, category: catName };
            cat.items.push(newItem);
        } else {
            Object.assign(item, { number: qty, name });
        }
		lastFocusedId = item.id; //The item changed
        editingItem = null;
        isEditing = false;
    } else {
        cat.items.push({ id: crypto.randomUUID(), number: qty, name, price: "", checked: false });
    }

    numberInput.value = "";
    nameInput.value = "";
    categorySelect.value = "";

    saveStores();
    renderList();
    updateButtonText(); 
}

window.onload = loadTranslations;
