"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const reviewsSwiper = document.querySelector(".reviews-swiper");

  if (reviewsSwiper && typeof Swiper !== "undefined") {
    document.querySelectorAll(".reviews-swiper").forEach((container) => {
      if (container.classList.contains("swiper-initialized")) {
        return;
      }

      new Swiper(container, {
        spaceBetween: 16,
        loop: true,
        speed: 650,
        grabCursor: true,
        autoplay: {
          delay: 3800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          dynamicBullets: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        },
      });
    });
  }

  if (window.Fancybox) {
    window.Fancybox.bind('[data-fancybox="corrosia-archive"]', {
      Images: {
        zoom: true,
        wheel: "zoom",
      },
      Thumbs: {
        autoStart: true,
      },
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: [
            "zoomIn",
            "zoomOut",
            "rotateCCW",
            "rotateCW",
            "slideshow",
            "fullscreen",
            "thumbs",
          ],
          right: ["close"],
        },
      },
      l10n: {
        CLOSE: "Закрити (Esc)",
        NEXT: "Наступне зображення",
        PREV: "Попереднє зображення",
        MODAL: "Ви можете закрити це модальне вікно натисканням клавіші ESC",
        CONTENT_ERROR: "Вміст не вдалося завантажити",
        IMAGE_ERROR: "Зображення не вдалося завантажити",
        ELEMENT_NOT_FOUND: "HTML-елемент не знайдено",
        AJAX_NOT_FOUND: "Помилка завантаження AJAX: елемент не знайдено",
        AJAX_FORBIDDEN: "Помилка завантаження AJAX: доступ заборонено",
        IFRAME_ERROR: "Сторінку не вдалося завантажити",
        TOGGLE_ZOOM: "Масштаб 100%",
        TOGGLE_THUMBS: "Показати або сховати мініатюри",
        TOGGLE_SLIDESHOW: "Увімкнути або вимкнути слайдшоу",
        TOGGLE_FULLSCREEN: "Увімкнути або вимкнути повноекранний режим",
        ZOOM_IN: "Збільшити",
        ZOOM_OUT: "Зменшити",
        TOGGLE_1TO1: "Перемкнути масштаб 100%",
        RESET: "Скинути масштаб",
        PANUP: "Перемістити вгору",
        PANDOWN: "Перемістити вниз",
        PANLEFT: "Перемістити вліво",
        PANRIGHT: "Перемістити вправо",
        ROTATE_CW: "Обертати за годинниковою стрілкою",
        ROTATE_CCW: "Обертати проти годинникової стрілки",
        SLIDESHOW: "Слайдшоу",
        FULLSCREEN: "Повноекранний режим",
        THUMBS: "Мініатюри",
        DOWNLOAD: "Завантажити",
        SHARE: "Поділитися",
      },
    });
  }

  if (window.Typed) {
    const atelierRunner = document.querySelector("#typed-atelier-runner");

    if (atelierRunner) {
      new window.Typed(atelierRunner, {
        strings: [
          "01 // АВТОРСЬКИЙ ЕСКІЗ ЗА ТВОЇМ РЕФЕРЕНСОМ",
          "02 // РУЧНИЙ КАСТОМ ТА КРІЙ БЕЗ КОМПРОМІСІВ",
          "03 // ЛІМІТОВАНІ ДРОПИ • ВИГОТОВЛЕНО В УКРАЇНІ",
          "04 // ОДЯГАЙ ВЛАСНУ ІДЕНТИЧНІСТЬ",
        ],
        typeSpeed: 40,
        backSpeed: 25,
        backDelay: 1600,
        loop: true,
        cursorChar: "_",
      });
    }

    document.querySelectorAll("[data-typed], .typed-text").forEach((element) => {
      let strings = [];

      try {
        strings = JSON.parse(element.dataset.typed || "[]");
      } catch (_) {
        strings = [];
      }

      if (strings.length === 0) {
        strings = element.dataset.typedStrings
          ? element.dataset.typedStrings.split("|")
          : [element.textContent.trim()];
      }

      new window.Typed(element, {
        strings,
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 1500,
        loop: true,
      });
    });
  }
});
