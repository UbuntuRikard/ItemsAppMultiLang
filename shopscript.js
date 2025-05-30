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

let stores = JSON.parse(localStorage.getItem("stores")) || [];
let selectedStore = localStorage.getItem("selectedStore") || "";
let editingItem = null;
let lastFocusedId = null;
window.zeroMode = 0;

const storeSelect = document.getElementById("storeSelect");
const numberInput = document.getElementById("itemNumber");
const nameInput = document.getElementById("itemName");
const categorySelect = document.getElementById("itemCategory");
const filterSelect = document.getElementById("filterCategory");
const list = document.getElementById("list");
const totalDiv = document.getElementById("total");
const addBtn = document.getElementById("addBtn");
const toggleZeroBtn = document.getElementById("toggleZeroBtn");


function saveStores() {
  localStorage.setItem("stores", JSON.stringify(stores));
}

function getCurrentStore() {
  return stores.find(s => s.name === selectedStore);
}

function changeStore() {
  selectedStore = storeSelect.value;
  localStorage.setItem("selectedStore", selectedStore);
  renderCategoryOptions();
  renderList();
}
function toggleCheck(item) {
  item.checked = !item.checked;
  saveStores();
  renderList();
}

function deleteItem(cat, itemId) {
  cat.items = cat.items.filter(i => i.id !== itemId);
  saveStores();
  renderList();
}

function toggleZeroVisibility() {
  zeroMode = (zeroMode + 1) % 3;
  const labels = ["Hide 0", "Only 0", "Show all"];
  toggleZeroBtn.textContent = labels[zeroMode];
  renderList();
}

function renderList() {
	if (!selectedStore) {
	  list.innerHTML = `<li>${translations[currentLang].shop["Select store"] || "Select a store"}</li>`;
	  totalDiv.textContent = `${translations[currentLang].shop["Total"] || "Total"}: 0.00 ${translations[currentLang].shop["£"] || "kr"}`;
	  return;
	}

  list.innerHTML = "";
  const store = getCurrentStore();
  const selectedCategory = filterSelect.value;
  let total = 0;

  const categories = store.categories.slice().sort((a, b) => a.name.localeCompare(b.name));

  [false, true].forEach(checkedState => {
    categories.forEach(cat => {
      if (!selectedCategory || cat.name === selectedCategory) {
        cat.items
          .filter(item => item.checked === checkedState)
          .filter(item => {
            const qty = parseInt(item.number);
            return zeroMode === 0 ||
              (zeroMode === 1 && qty !== 0) ||
              (zeroMode === 2 && qty === 0);
          })
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(item => {
            const li = document.createElement("li");
            if (item.checked) li.classList.add("checked");

            const top = document.createElement("div");
            top.className = "top-line";

            const itemLine = document.createElement("div");
            itemLine.className = "item-line";

            const numberSpan = document.createElement("span");
            numberSpan.className = "item-number";
            numberSpan.textContent = item.number;
            numberSpan.dataset.id = item.id;
            numberSpan.tabIndex = 0;
            numberSpan.onclick = () => editItem(item, cat);

            const nameSpan = document.createElement("span");
            nameSpan.className = "item-name";
            nameSpan.textContent = item.name;
            nameSpan.onclick = () => toggleCheck(item);

            itemLine.append(numberSpan, nameSpan);

            const delBtn = document.createElement("button");
            delBtn.className = "del-btn";
            // skal sprog justeres
            delBtn.textContent = translations[currentLang].shop["Delete"] || "Delete";
            delBtn.onclick = (e) => {
              e.stopPropagation();
              deleteItem(cat, item.id);
            };

            top.append(itemLine, delBtn);

            const bottom = document.createElement("div");
            bottom.className = "bottom-line";

            const catSpan = document.createElement("span");
            // skal sprog justeres, det er lidt uheldigt at der er kolon i variabel navn
            catSpan.textContent = `${translations[currentLang].shop["Category:"] || "Category"} ${cat.name}`;

            const priceInput = document.createElement("input");
            priceInput.type = "text";
			// denne her linje skal også sprog justeres
            priceInput.placeholder = translations[currentLang].shop["Price"] || "Price";
            priceInput.value = item.price || "";
            priceInput.onchange = (e) => {
              let price = parseFloat(e.target.value.replace(",", "."));
              item.price = isNaN(price) ? "" : price.toFixed(2).replace(".", ",");
              saveStores();
              renderList();
            };

            bottom.append(catSpan, priceInput);
            li.append(top, bottom);
            li.querySelector(".item-number").dataset.id = item.id;
            list.appendChild(li);

            if (item.id === lastFocusedId) {
              requestAnimationFrame(() => {
                li.classList.add("flash");
                setTimeout(() => li.classList.remove("flash"), 2000);
              });
            }

            if (item.checked && item.price) {
              total += parseFloat(item.price.replace(",", ".")) * parseInt(item.number);
            }
          });
      }
    });
  });
// denne her linje skal sprog justeres
	totalDiv.textContent = (translations[currentLang].shop["Total"] || "Total") + ": " + total.toFixed(2).replace(".", ",") + " " + (translations[currentLang].shop["£"] || "kr");
}

