"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");

  // Скрипт безпечно пропускає сторінки, на яких немає форми feedbackForm.
  if (!form) {
    return;
  }

  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  const agreement = document.getElementById("agreement");
  const fields = [username, email, message, agreement].filter(Boolean);
  const interactedFields = new Set();
  const modal = document.getElementById("successModal");
  const modalContent = modal && modal.querySelector("[data-modal-content]");
  const closeModalButton = modal && modal.querySelector("[data-modal-close]");
  let previouslyFocusedElement = null;
  const submitButton = form.querySelector('button[type="submit"]');
  const pageRegions = document.querySelectorAll("body > header, body > main, body > footer");

  function getFocusableElements() {
    if (!modalContent) {
      return [];
    }

    return Array.from(
      modalContent.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function closeSuccessModal() {
    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    pageRegions.forEach((region) => region.removeAttribute("inert"));

    if (submitButton && document.contains(submitButton)) {
      submitButton.focus();
    } else if (previouslyFocusedElement && document.contains(previouslyFocusedElement)) {
      previouslyFocusedElement.focus();
    }
    previouslyFocusedElement = null;
  }

  function openSuccessModal() {
    if (!modal || !closeModalButton) {
      return;
    }

    previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    pageRegions.forEach((region) => region.setAttribute("inert", ""));
    closeModalButton.focus();
  }

  if (modal && modalContent && closeModalButton) {
    closeModalButton.addEventListener("click", closeSuccessModal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSuccessModal();
      }
    });

    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuccessModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    });
  }

  // Перевірка імені або нікнейму після очищення пробілів.
  function validateName() {
    return Boolean(username && username.value.trim().length >= 2);
  }

  // Перевірка формату адреси електронної пошти через регулярний вираз.
  function validateEmail() {
    if (!email) {
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.value.trim());
  }

  // Перевірка тексту ідеї або повідомлення після очищення пробілів.
  function validateMessage() {
    return Boolean(message && message.value.trim().length >= 10);
  }

  // Обов'язкова згода вимагає активного чекбокса.
  function validateAgreement() {
    return Boolean(agreement && agreement.checked === true);
  }

  // Знаходить або створює контейнер помилки під конкретним полем.
  function getErrorElement(input) {
    if (!input) {
      return null;
    }

    let errorElement = form.querySelector(`[data-error-for="${input.id}"]`);

    if (!errorElement) {
      errorElement = document.createElement("p");
      errorElement.id = `${input.id}-error`;
      errorElement.setAttribute("data-error-for", input.id);
      errorElement.setAttribute("role", "alert");
      errorElement.className =
        "validation-error mt-2 text-sm text-red-600 border-l-2 border-red-600 pl-3";
      input.parentElement.appendChild(errorElement);
    }

    input.setAttribute("aria-describedby", errorElement.id);
    return errorElement;
  }

  // Відображає помилку червоною рамкою і українським текстом.
  function showError(input, errorMessage) {
    if (!input) {
      return;
    }

    input.classList.remove("border-white/60");
    input.classList.add("border-red-600");
    input.setAttribute("aria-invalid", "true");
    input.style.borderColor = "#8A0303";

    const errorElement = getErrorElement(input);
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.hidden = false;
    }
  }

  // Відображає успішний стан біло-сталевою рамкою та очищує помилку.
  function showSuccess(input) {
    if (!input) {
      return;
    }

    input.classList.remove("border-red-600");
    input.classList.add("border-white/60");
    input.setAttribute("aria-invalid", "false");
    input.style.borderColor = "rgba(255, 255, 255, 0.60)";

    const errorElement = getErrorElement(input);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.hidden = true;
    }
  }

  // Скидає стан поля до базової темної рамки.
  function clearError(input) {
    if (!input) {
      return;
    }

    input.classList.remove("border-red-600", "border-white/60");
    input.classList.add("border-white/10");
    input.setAttribute("aria-invalid", "false");
    input.style.borderColor = "";

    const errorElement = getErrorElement(input);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.hidden = true;
    }
  }

  // Перевіряє конкретне поле і синхронізує його стан у UI.
  function validateField(input) {
    if (!input) {
      return true;
    }

    // До взаємодії поле не перевіряється й не змінює вигляд.
    if (!interactedFields.has(input)) {
      return true;
    }

    let isValid = true;
    let errorMessage = "";

    switch (input.id) {
      case "username":
        isValid = validateName();
        errorMessage = "Вкажіть імʼя — щонайменше 2 символи.";
        break;

      case "email":
        isValid = validateEmail();
        errorMessage = "Введіть коректний email.";
        break;

      case "message":
        isValid = validateMessage();
        errorMessage = "Опишіть ідею щонайменше в 10 символів.";
        break;

      case "agreement":
        isValid = validateAgreement();
        errorMessage = "Потрібна ваша згода.";
        break;
    }

    if (isValid) {
      showSuccess(input);
    } else {
      showError(input, errorMessage);
    }

    return isValid;
  }

  // Перехоплюємо submit, перевіряємо всі поля і фокусуємо перше помилкове.
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const existingStatus = form.querySelector("[data-form-status]");
    if (existingStatus) {
      existingStatus.hidden = true;
    }

    let firstInvalidField = null;

    fields.forEach((input) => {
      interactedFields.add(input);
      if (!validateField(input) && !firstInvalidField) {
        firstInvalidField = input;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    let statusElement = form.querySelector("[data-form-status]");

    if (!statusElement) {
      statusElement = document.createElement("p");
      statusElement.setAttribute("data-form-status", "");
      statusElement.setAttribute("role", "status");
      statusElement.setAttribute("aria-live", "polite");
      statusElement.className =
        "form-status mt-6 border border-white/60 bg-black px-4 py-3 text-center text-white";
      form.appendChild(statusElement);
    }

    statusElement.textContent =
      "Заявку успішно надіслано до ательє CORROSIA.";
    statusElement.hidden = false;

    form.reset();

    fields.forEach((input) => {
      clearError(input);
      interactedFields.delete(input);
    });

    openSuccessModal();
  });

  // Скидає взаємодії та стан усіх полів, якщо форму скинуто іншим способом.
  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      fields.forEach((input) => {
        interactedFields.delete(input);
        clearError(input);
      });
    });
  });

  // Створюємо окремий прапорець touched для кожного поля.
  fields.forEach((input) => {
    if (!input) {
      return;
    }

    // Початок введення одразу активує живу перевірку поля.
    input.addEventListener("input", () => {
      interactedFields.add(input);
      validateField(input);
    });

    // Втрата фокуса завершує перевірку поля незалежно від попереднього стану.
    input.addEventListener("blur", () => {
      interactedFields.add(input);
      validateField(input);
    });

    // Для чекбокса взаємодія надійно відстежується через change.
    if (input === agreement) {
      input.addEventListener("change", () => {
        interactedFields.add(input);
        validateField(input);
      });
    }
  });

  // Початковий стан: жодне поле не взаємодіяло й помилки не показані.
  fields.forEach((input) => clearError(input));
});
