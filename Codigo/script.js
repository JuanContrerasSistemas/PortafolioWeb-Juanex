document.addEventListener("DOMContentLoaded", () => {
  const currentImage = document.getElementById("heroImageCurrent");
  const nextImage = document.getElementById("heroImageNext");

  const menuItems = document.querySelectorAll(".menu__item");

  const initialImage = "../imagenes/fotoInicial.png";

  let activeImage = initialImage;
  let transitionId = 0;
  let isTransitioning = false;

  /* =========================
       PRE-CARGAR IMÁGENES
    ========================= */

  menuItems.forEach((item) => {
    const imagePath = item.dataset.image;

    if (!imagePath) return;

    const preloadImage = new Image();

    preloadImage.src = imagePath;
  });

  /* =========================
       APLICAR POSICIÓN
    ========================= */

  function applyImageSettings(element, item) {
    const scale = item?.dataset.scale || "1";
    const x = item?.dataset.x || "0";
    const y = item?.dataset.y || "0";

    element.style.setProperty("--image-scale", scale);
    element.style.setProperty("--image-x", `${x}px`);
    element.style.setProperty("--image-y", `${y}px`);

    element.style.transform = `
            translate(var(--image-x), var(--image-y))
            scale(var(--image-scale))
        `;
  }

  /* =========================
       CAMBIAR IMAGEN
    ========================= */

  function changeImage(item) {
    const newImage = item.dataset.image;

    if (!newImage || newImage === activeImage) {
      return;
    }

    const thisTransition = ++transitionId;

    isTransitioning = true;

    /*
     * Primero esperamos a que la nueva imagen
     * esté realmente cargada.
     */
    const imageLoader = new Image();

    imageLoader.onload = () => {
      /*
       * Si mientras cargaba el usuario movió
       * el mouse a otro botón, cancelamos
       * esta transición.
       */
      if (thisTransition !== transitionId) {
        return;
      }

      /*
       * Colocamos la nueva imagen en la capa
       * secundaria.
       */
      nextImage.src = newImage;

      applyImageSettings(nextImage, item);

      /*
       * Forzamos que empiece invisible.
       */
      nextImage.classList.remove("is-fading-in");
      nextImage.style.opacity = "0";

      /*
       * Esperamos un frame para que el navegador
       * registre el estado inicial.
       */
      requestAnimationFrame(() => {
        if (thisTransition !== transitionId) {
          return;
        }

        /*
         * Desaparece la imagen actual.
         */
        currentImage.style.opacity = "0";

        /*
         * Aparece la nueva.
         */
        nextImage.style.opacity = "1";
      });

      /*
       * Cuando termina la transición,
       * intercambiamos las capas.
       */
      setTimeout(() => {
        if (thisTransition !== transitionId) {
          return;
        }

        currentImage.src = newImage;

        applyImageSettings(currentImage, item);

        currentImage.style.opacity = "1";
        nextImage.style.opacity = "0";

        activeImage = newImage;

        isTransitioning = false;
      }, 360);
    };

    imageLoader.onerror = () => {
      console.error("No se pudo cargar la imagen:", newImage);
    };

    imageLoader.src = newImage;
  }

  /* =========================
       VOLVER A FOTO INICIAL
    ========================= */

  function restoreInitialImage() {
    /*
     * Invalidamos cualquier transición
     * que todavía estuviera ejecutándose.
     */
    transitionId++;

    isTransitioning = false;

    if (activeImage === initialImage) {
      return;
    }

    const imageLoader = new Image();

    imageLoader.onload = () => {
      currentImage.src = initialImage;

      currentImage.style.opacity = "1";
      nextImage.style.opacity = "0";

      /*
       * La imagen inicial no necesita
       * desplazamiento especial.
       */
      currentImage.style.transform = "translate(0, 0) scale(1)";

      activeImage = initialImage;
    };

    imageLoader.src = initialImage;
  }

  /* =========================
   EVENTOS DEL MENÚ
========================= */

  let hoveredItem = null;

  menuItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      hoveredItem = item;

      changeImage(item);
    });

    item.addEventListener("mouseleave", () => {
      /*
       * No restauramos inmediatamente.
       *
       * Esto permite pasar de un botón a otro
       * sin que aparezca brevemente la foto inicial.
       */
      setTimeout(() => {
        if (!hoveredItem) {
          restoreInitialImage();
        }
      }, 30);
    });
  });

  /* =========================
   DETECTAR SI EL CURSOR
   YA NO ESTÁ SOBRE NINGÚN BOTÓN
========================= */

  document.addEventListener("mousemove", (event) => {
    const elementUnderMouse = document.elementFromPoint(
      event.clientX,
      event.clientY,
    );

    const currentItem = elementUnderMouse?.closest(".menu__item");

    /*
     * El cursor está sobre un botón.
     */
    if (currentItem) {
      hoveredItem = currentItem;

      return;
    }

    /*
     * El cursor NO está sobre ningún botón.
     *
     * Por lo tanto debemos volver a la
     * imagen inicial.
     */
    if (hoveredItem !== null) {
      hoveredItem = null;

      restoreInitialImage();
    }
  });

  /* =========================
   SEGURIDAD:
   SI EL CURSOR SALE DEL VIEWPORT
========================= */

  document.addEventListener("mouseleave", () => {
    hoveredItem = null;

    restoreInitialImage();
  });

  /* =========================
   CONFIGURACIÓN INICIAL
========================= */

  currentImage.style.opacity = "1";
  nextImage.style.opacity = "0";

  currentImage.style.transform = "translate(0, 0) scale(1)";

  nextImage.style.transform = "translate(0, 0) scale(1)";

  /* ==========================================
   NAVEGACIÓN SECUNDARIA
========================================== */

  const sideNav = document.querySelector(".side-nav");

  const sections = document.querySelectorAll(
    "#inicio, #sobre-mi, #proyectos, #habilidades, #contacto",
  );

  function updateSideNav() {
    let currentSection = "inicio";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= window.innerHeight * 0.5 &&
        rect.bottom >= window.innerHeight * 0.5
      ) {
        currentSection = section.id;
      }
    });

    if (currentSection === "inicio") {
      sideNav.classList.remove("side-nav--visible");
    } else {
      sideNav.classList.add("side-nav--visible");
    }
  }

  window.addEventListener("scroll", updateSideNav);

  window.addEventListener("load", updateSideNav);

  /* =========================================================
   FILTRO DE PROYECTOS
========================================================= */

  const projectFilters = document.querySelectorAll(".projects__filter");
  const projectCards = document.querySelectorAll(".project-card");

  projectFilters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      const selectedFilter = filterButton.dataset.filter;

      /* Cambiar botón activo */

      projectFilters.forEach((button) => {
        button.classList.remove("projects__filter--active");
      });

      filterButton.classList.add("projects__filter--active");

      /* Filtrar tarjetas */

      projectCards.forEach((card) => {
        const projectStatus = card.dataset.status;

        if (selectedFilter === "all" || projectStatus === selectedFilter) {
          card.style.display = "";

          requestAnimationFrame(() => {
            card.classList.remove("project-card--hidden");
          });
        } else {
          card.classList.add("project-card--hidden");

          setTimeout(() => {
            card.style.display = "none";
          }, 250);
        }
      });
    });
  });

  /* =========================================================
   SISTEMA DE HABILIDADES
========================================================= */

const skills = document.querySelectorAll(".skill");

const skillModal = document.getElementById("skillModal");
const skillModalClose = document.getElementById("skillModalClose");
const skillModalTitle = document.getElementById("skillModalTitle");
const skillModalBody = document.getElementById("skillModalBody");


const skillsData = {

    python: {

        title: "PYTHON",

        description:
            "He trabajado con Python en el desarrollo de algoritmos, automatización de procesos, procesamiento de información y construcción de soluciones orientadas a resolver problemas específicos.",

        downloads: [

            {
                title: "Algoritmo de procesamiento",
                description:
                    "Código fuente del algoritmo junto con los archivos necesarios para comprender y ejecutar el proyecto.",
                file: "../descargas/python/algoritmo.zip"
            },

            {
                title: "Proyecto Python",
                description:
                    "Proyecto completo desarrollado en Python, incluyendo estructura del código y recursos utilizados.",
                file: "../descargas/python/proyecto.zip"
            }

        ]

    },


    html: {

        title: "HTML",

        description:
            "He utilizado HTML para estructurar interfaces web, organizando el contenido mediante una arquitectura semántica y preparada para integrarse con CSS y JavaScript.",

        downloads: [

            {
                title: "Proyecto web",
                description:
                    "Estructura HTML completa de uno de los proyectos desarrollados.",
                file: "../descargas/html/proyecto.zip"
            }

        ]

    },


    css: {

        title: "CSS",

        description:
            "He trabajado con CSS para desarrollar interfaces responsivas, animaciones, layouts y sistemas visuales personalizados.",

        downloads: [

            {
                title: "Interfaz urbana",
                description:
                    "Código CSS utilizado para construir una interfaz con diseño personalizado.",
                file: "../descargas/css/interfaz.zip"
            }

        ]

    },


    javascript: {

        title: "JAVASCRIPT",

        description:
            "He utilizado JavaScript para incorporar interacción, manipulación del DOM, animaciones y comportamiento dinámico en aplicaciones web.",

        downloads: [

            {
                title: "Sistema interactivo",
                description:
                    "Código JavaScript correspondiente a una aplicación web interactiva.",
                file: "../descargas/javascript/proyecto.zip"
            }

        ]

    },


    sql: {

        title: "SQL",

        description:
            "He trabajado con bases de datos relacionales mediante consultas SQL para almacenar, consultar y administrar información.",

        downloads: [

            {
                title: "Base de datos",
                description:
                    "Scripts SQL para creación de tablas, relaciones y consultas.",
                file: "../descargas/sql/base-datos.zip"
            }

        ]

    },


    git: {

        title: "GIT",

        description:
            "Utilizo Git para control de versiones, seguimiento de cambios y organización del desarrollo de proyectos.",

        downloads: [

            {
                title: "Repositorio de ejemplo",
                description:
                    "Ejemplo de estructura y flujo de trabajo utilizado durante el desarrollo.",
                file: "../descargas/git/proyecto.zip"
            }

        ]

    }

};


/* =========================================================
   ABRIR MODAL
========================================================= */

function openSkillModal(skillName) {

    const data = skillsData[skillName];

    if (!data) {
        return;
    }


    skillModalTitle.textContent = data.title;


    let html = `
        <p class="skill-modal__description">
            ${data.description}
        </p>

        <div class="skill-modal__downloads">
    `;


    data.downloads.forEach((download) => {

        html += `
            <article class="skill-download">

                <div class="skill-download__info">

                    <h4>
                        ${download.title}
                    </h4>

                    <p>
                        ${download.description}
                    </p>

                </div>

                <a
                    href="${download.file}"
                    class="skill-download__button"
                    download
                >
                    DESCARGAR
                </a>

            </article>
        `;

    });


    html += `</div>`;


    skillModalBody.innerHTML = html;


    skillModal.classList.add("skill-modal--open");

    skillModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}


/* =========================================================
   CERRAR MODAL
========================================================= */

function closeSkillModal() {

    skillModal.classList.remove("skill-modal--open");

    skillModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


/* =========================================================
   CLIC EN HABILIDADES
========================================================= */

skills.forEach((skill) => {

    skill.addEventListener("click", () => {

        const skillName = skill.dataset.skill;

        openSkillModal(skillName);

    });

});


/* =========================================================
   BOTÓN CERRAR
========================================================= */

skillModalClose.addEventListener(
    "click",
    closeSkillModal
);


/* =========================================================
   CERRAR HACIENDO CLIC FUERA
========================================================= */

skillModal
    .querySelector(".skill-modal__overlay")
    .addEventListener(
        "click",
        closeSkillModal
    );


/* =========================================================
   CERRAR CON ESC
========================================================= */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        skillModal.classList.contains("skill-modal--open")
    ) {

        closeSkillModal();

    }

});
  
});
