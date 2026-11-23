"use strict";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var configurator = document.getElementById("custom-configurator");

    if (!configurator) {
      return;
    }

    var quantityInput = configurator.querySelector("#custom-quantity");
    var baseSelect = configurator.querySelector("#custom-base");
    var rushCheckbox = configurator.querySelector("#rush-order");
    var promoInput = configurator.querySelector("#custom-promo");
    var promoApplyButton = configurator.querySelector("#promo-apply");
    var promoStatus = configurator.querySelector("#calc-promo-msg")
      || configurator.querySelector("#promo-status");
    var quantityError = configurator.querySelector("#calc-qty-error");
    var transferButton = configurator.querySelector("#transfer-config");

    var referenceInput = document.getElementById("reference-files");
    var referenceList = document.getElementById("reference-list");
    var referenceEmpty = document.getElementById("reference-empty");

    var baseCostElement = configurator.querySelector("#base-cost");
    var customCostElement = configurator.querySelector("#custom-cost");
    var discountSummaryElement = configurator.querySelector("#discount-summary");
    var totalCostElement = configurator.querySelector("#total-cost");

    var basePrices = {
      hoodie: 2490,
      zip: 2290,
      tee: 1290,
      cargo: 2690
    };

    var techniquePrices = {
      print: 300,
      embroidery: 600,
      painting: 900
    };

    var techniqueNames = {
      print: "Друк",
      embroidery: "Вишивка",
      painting: "Роспис"
    };

    var modificationPrices = {
      hardware: 450,
      distress: 350,
      pattern: 1200
    };

    var modificationNames = {
      hardware: "Металева фурнітура",
      distress: "Дистрес",
      pattern: "Індивідуальні лекала"
    };

    var promoRates = {
      CORROSIA10: 10,
      LP2026: 15
    };

    var activePromo = "";
    var moneyFormatter = new Intl.NumberFormat("uk-UA", {
      maximumFractionDigits: 0
    });

    function formatMoney(value) {
      return moneyFormatter.format(Math.round(value)) + " ₴";
    }

    function normalizeQuantity() {
      var rawStr = quantityInput ? quantityInput.value : "";
      var num = NaN;
      var valid = false;
      var message = "";
      var strictNumberPattern = /^-?\d+(\.\d+)?$/;

      if (rawStr === "") {
        message = "Введіть кількість";
      } else if (!strictNumberPattern.test(rawStr)) {
        message = "Введіть цілочисельне число";
      } else {
        num = Number(rawStr);
        if (!Number.isFinite(num)) {
          message = "Введіть коректне число";
        } else if (!Number.isInteger(num)) {
          message = "Кількість має бути цілим числом";
        } else if (num <= 0) {
          message = "Кількість має бути від 1 до 50";
        } else if (num > 50) {
          message = "Кількість не може перевищувати 50";
        } else {
          valid = true;
        }
      }

      var diagnostic = {
        raw: rawStr,
        normalized: valid ? num : null,
        valid: valid,
        reason: valid ? "OK" : message
      };
      console.table([diagnostic]);

      if (!valid) {
        quantityInput.setAttribute("aria-invalid", "true");
        quantityInput.classList.remove("border-transparent");
        quantityInput.classList.add("border-red-600");
        if (quantityError) {
          quantityError.textContent = "Помилка введення: " + message;
        }
        console.warn("[CORROSIA][Quantity] Помилка валідації", diagnostic);
        return null;
      }

      quantityInput.setAttribute("aria-invalid", "false");
      quantityInput.classList.remove("border-red-600");
      quantityInput.classList.add("border-transparent");
      if (quantityError) {
        quantityError.textContent = "";
      }
      return num;
    }

    function getSelectedTechnique() {
      var selected = configurator.querySelector('input[name="technique"]:checked');
      return selected ? selected.value : "print";
    }

    function getSelectedModifications() {
      var selected = configurator.querySelectorAll('input[name="modifications"]:checked');
      return Array.from(selected).map(function (checkbox) {
        return checkbox.value;
      });
    }

    function getWholesaleRate(quantity) {
      if (quantity >= 10) {
        return 10;
      }

      if (quantity >= 5) {
        return 5;
      }

      return 0;
    }

    function calculate() {
      var quantity = normalizeQuantity();
      if (quantity === null) {
        baseCostElement.textContent = "-- грн";
        customCostElement.textContent = "-- грн";
        discountSummaryElement.hidden = true;
        discountSummaryElement.textContent = "";
        totalCostElement.textContent = "-- грн";
        return null;
      }

      var baseKey = baseSelect.value;
      var basePrice = basePrices[baseKey] || basePrices.hoodie;
      var techniqueKey = getSelectedTechnique();
      var modifications = getSelectedModifications();

      var techniquePrice = techniquePrices[techniqueKey] || 0;
      var modificationsPrice = modifications.reduce(function (total, key) {
        return total + (modificationPrices[key] || 0);
      }, 0);

      var rushMultiplier = rushCheckbox.checked ? 1.25 : 1;
      var unitCost = (basePrice + techniquePrice + modificationsPrice) * rushMultiplier;
      var subtotal = unitCost * quantity;

      var wholesaleRate = getWholesaleRate(quantity);
      var promoRate = activePromo ? promoRates[activePromo] : 0;
      var totalRate = Math.min(25, wholesaleRate + promoRate);
      var discountAmount = subtotal * totalRate / 100;
      var total = subtotal - discountAmount;

      baseCostElement.textContent = formatMoney(basePrice * quantity);
      customCostElement.textContent = formatMoney((techniquePrice + modificationsPrice) * quantity * rushMultiplier);

      if (totalRate > 0) {
        discountSummaryElement.hidden = false;
        discountSummaryElement.textContent = "-" + totalRate + "% · " + formatMoney(discountAmount);
      } else {
        discountSummaryElement.hidden = true;
        discountSummaryElement.textContent = "";
      }

      totalCostElement.textContent = formatMoney(total);

      return {
        quantity: quantity,
        baseKey: baseKey,
        baseName: baseSelect.options[baseSelect.selectedIndex].text,
        techniqueKey: techniqueKey,
        modifications: modifications,
        rush: rushCheckbox.checked,
        subtotal: subtotal,
        wholesaleRate: wholesaleRate,
        promoRate: promoRate,
        totalRate: totalRate,
        discountAmount: discountAmount,
        total: total
      };
    }

    function applyPromo() {
      var code = promoInput.value.trim().toUpperCase();

      if (!code) {
        activePromo = "";
        promoInput.setAttribute("aria-invalid", "true");
        promoStatus.textContent = "Введіть промокод";
        calculate();
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(promoRates, code)) {
        activePromo = "";
        promoInput.setAttribute("aria-invalid", "true");
        promoStatus.textContent = "Промокод не знайдено";
        calculate();
        return;
      }

      activePromo = code;
      promoInput.value = code;
      promoInput.setAttribute("aria-invalid", "false");
      promoStatus.textContent = "Застосовано " + promoRates[code] + "% знижки";
      calculate();
    }

    function transferConfiguration() {
      var result = calculate();
      var message = document.getElementById("message");

      if (!result || !message) {
        return;
      }

      var modificationNamesList = result.modifications.length
        ? result.modifications.map(function (key) {
            return modificationNames[key];
          }).join(", ")
        : "без модифікацій";

      var discountText = result.totalRate > 0
        ? "Знижка: " + result.totalRate + "% (" + formatMoney(result.discountAmount) + ")"
        : "Знижка: не застосована";

      var description = [
        "КОНФІГУРАЦІЯ КАСТОМУ CORROSIA",
        "Кількість: " + result.quantity,
        "Базова річ: " + result.baseName,
        "Техніка: " + techniqueNames[result.techniqueKey],
        "Модифікації: " + modificationNamesList,
        "Терміновість: " + (result.rush ? "термінове виробництво (до 7 робочих днів)" : "стандартна"),
        "Промокод: " + (activePromo || "не застосовано"),
        discountText,
        "Сума: " + formatMoney(result.total)
      ].join("\n");

      message.value = description;
      message.setAttribute("aria-invalid", "false");
      message.dispatchEvent(new Event("input", { bubbles: true }));
      message.focus();
      message.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    quantityInput.addEventListener("input", calculate);

    configurator.querySelectorAll('[data-quantity-action]').forEach(function (button) {
      button.addEventListener("click", function () {
        var current = normalizeQuantity();
        if (current === null) {
          return;
        }
        var next = button.getAttribute("data-quantity-action") === "increase"
          ? current + 1
          : current - 1;

        quantityInput.value = String(Math.max(1, Math.min(50, next)));
        calculate();
      });
    });

    configurator.querySelectorAll("select").forEach(function (select) {
      select.addEventListener("change", calculate);
    });

    configurator.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (input) {
      input.addEventListener("change", calculate);
    });

    configurator.addEventListener("submit", function (event) {
      event.preventDefault();
      transferConfiguration();
    });

    promoApplyButton.addEventListener("click", applyPromo);
    transferButton.addEventListener("click", transferConfiguration);

    promoInput.addEventListener("input", function () {
      if (activePromo) {
        activePromo = "";
        promoStatus.textContent = "Промокод не застосовано";
        promoInput.setAttribute("aria-invalid", "false");
        calculate();
      }
    });

    if (referenceInput && referenceList) {
      referenceInput.addEventListener("change", function () {
        Array.from(referenceList.querySelectorAll("[data-reference-file]")).forEach(function (item) {
          item.remove();
        });

        if (referenceEmpty) {
          referenceEmpty.hidden = referenceInput.files.length > 0;
        }

        Array.from(referenceInput.files).forEach(function (file, index) {
          var item = document.createElement("div");
          item.setAttribute("data-reference-file", "");
          item.className = "flex min-h-11 items-center justify-between gap-3 border border-white/10 px-3 py-2";

          var name = document.createElement("span");
          name.className = "min-w-0 truncate text-sm";
          name.textContent = file.name;

          var removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "min-h-11 shrink-0 px-3 text-lg leading-none text-[#a3a3a3] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A0303]";
          removeButton.setAttribute("aria-label", "Видалити референс " + file.name);
          removeButton.textContent = "×";

          removeButton.addEventListener("click", function () {
            var transfer = new DataTransfer();
            Array.from(referenceInput.files).forEach(function (remainingFile, remainingIndex) {
              if (remainingIndex !== index) {
                transfer.items.add(remainingFile);
              }
            });
            referenceInput.files = transfer.files;
            referenceInput.dispatchEvent(new Event("change", { bubbles: true }));
          });

          item.appendChild(name);
          item.appendChild(removeButton);
          referenceList.appendChild(item);
        });
      });
    }

    calculate();
  });
})();
