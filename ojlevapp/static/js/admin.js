function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

$(document).ready(function () {
  function setDefaultImage(img) {
    // Appliquer l'attribut onerror si ce n'est pas déjà fait
    if (!$(img).attr("onerror")) {
      $(img).attr(
        "onerror",
        "this.onerror=null; this.src='../static/img/upcloud.png';"
      );
    }
  }

  // Appliquer le fallback sur toutes les images initiales
  $("img").each(function () {
    setDefaultImage(this);
  });

  // Créer une instance de MutationObserver
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1 && node.tagName === "IMG") {
          // vérifie si le nœud est un élément et une image
          setDefaultImage(node);
        }
      });
    });
  });

  // Configuration de l'observateur:
  const config = {
    childList: true,
    subtree: true,
  };

  // Démarrer l'observation du document
  observer.observe(document.body, config);
});

// If the user is connected
$(window).on("load", function () {
  let isconnected = $("#name_connected").length > 0;
  if (!isconnected) {
    console.warn("User pas connecté !");
    $(".add_remove").css("display", "none");
    return;
  }
  

  // Champs modifiables START
  let elements = $(".editable");
  elements.attr("contenteditable", "true");
  elements.css("border", "1px dashed black");
  // elements.on("blur", function () {
  $('section').on('blur', '.editable', function() {

    var id = $(this).closest(".item").attr("data-index"); // On trouve le 1er parent avec la classe .item, pour on récupère son id
    var text_value = $(this).text();  // Le contenu
    var attribute_name = $(this).attr("name");  // La clef
    var table = $(this).closest("section").attr("data-db"); // Le nom de la table dans la DB

    let data = {
      table: table,
      id: id,
      attribute_name: attribute_name,
      new_value: text_value,
    };

    // Requete pour la modif de la DB côté Flask
    $.ajax({
      url: "/update",
      type: "POST",
      data: data,
      success: function (response) {
        console.log(
          `-${table}- table updated successfully! => New Value : -${text_value}- for the attribute -${attribute_name}-`
        );
      },
      error: function (xhr, status, error) {
        console.error(`Failed to update -${table}-:`, error);
      },
    });
  });
  // Champs modifiables END


  // Ajout d'un nouvel élément pour Diapo, Witness et Story
  function new_elem(element) {
    let newStep = $(element);

    let nouv = newStep.children().last().clone();
    let nbrChildren = newStep.closest("section").find(".item").length;  // Index de l'élément à créer
    const breakpoint = /[0-9]+/; // Pour séparer là où est l'index
    const new_val = nouv.find("img").attr("src").split(breakpoint);
    nouv.attr("data-index", nbrChildren);
    nouv.find("img").attr("src", new_val[0] + nbrChildren + new_val[1]);
    nouv.find("h3, span, p").each(function () {
      $(this).html($(this).attr("name"));
    }); // Texte affiché
    newStep.append(nouv);

    return nouv
  }

  // Ajout/Retrait d'une histoire START
  // Ajout
  $(".addStoryItem.plus").on("click", function () {
    
    new_elem(".story-content .row");
    
    $.ajax({
      url: "/story/new",
      type: "GET",
      success: function (response) {
        console.log("Story added successfully!");
        // location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to add story:", error);
      },
    });
  });

  // Retrait
  $(".addStoryItem.minus").on("click", function () {
    let newStep = $(".story-content .row").children();
    newStep.last().remove();

    $.ajax({
      url: "/story/remove",
      type: "GET",
      success: function (response) {
        console.log("Story removed successfully!");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to remove story:", error);
      },
    });
  });
  // Ajout/Retrait d'une histoire END

  // Upload d'une image Witness START
  var id = "";
  var folder_path = "";
  var image_name = "";
  $('section').on('click', '.update_image', function() {
    // Déclenche le clic sur l'input file caché
    id = $(this).find("data-index").attr("data-index");
    folder_path = $(this).closest("div[data-image-path]").attr("data-image-path");
    image_name = $(this).parent().children("img").attr("src").split("/").pop();
    $("#hiddenLoveImageInput").click();
  });

  $("#hiddenLoveImageInput").change(function () {
    var fileData = new FormData();
    var imageFile = $(this)[0].files[0];


    if (imageFile) {
      fileData.append("image", imageFile);
      fileData.append("filename", image_name);
      fileData.append("path", folder_path);

      console.log("=> ", fileData);

      // Envoie le fichier en AJAX à l'URL '/upload'
      $.ajax({
        url: "/upload",
        type: "POST",
        data: fileData,
        processData: false,
        contentType: false,
        success: function (response) {
          console.log("Image uploaded successfully!");
          location.reload();
        },
        error: function (xhr, status, error) {
          console.error("Failed to upload image:", error);
        },
      });
    } else {
      console.log("No file selected.");
    }
  });
  // Upload d'une image LoveStory FIN

  // Ajout/Retrait d'une histoire START
  // Ajout
  $(".addWitnessItem.plus").on("click", function () {
    var nouv = new_elem(".witness-section .row.active");

    const side = capitalizeFirstLetter($(nouv).attr("data-target"));
    console.log("Side : " + side);

    $.ajax({
      url: "/witness/new?side=" + side,
      type: "GET",
      success: function (response) {
        console.log("Witness added successfully!");
      },
      error: function (xhr, status, error) {
        console.error("Failed to add witness:", error);
      },
    });
  });

  // Retrait
  $(".addWitnessItem.minus").on("click", function () {
    let newStep = $(".witness-section .row.active").children();
    const side = capitalizeFirstLetter($(newStep).attr("data-target"));
    newStep.last().remove();

    $.ajax({
      url: "/witness/remove?side=" + side,
      type: "GET",
      success: function (response) {
        console.log("Witness removed successfully!");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to remove witness:", error);
      },
    });
  });
  // Ajout/Retrait d'une histoire END

  

  // Ajout/Retrait d'une diapo START
  // Ajout
  $(".addDiapoItem.plus").on("click", function () {
    new_elem(".home-section .small_diapo .diapos");

    $.ajax({
      url: "/slide/new",
      type: "GET",
      success: function (response) {
        console.log("Story added successfully!");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to add story:", error);
      },
    });
  });

  // Retrait
  $(".addDiapoItem.minus").on("click", function () {
    const folder_path = $(this).closest("div[data-image-path]").attr("data-image-path");
    let newStep = $(".home-section .small_diapo").children(".small_diapo_item");
    newStep.last().remove();

    $.ajax({
      url: "/remove",
      type: "POST",
      data: { folder_path: folder_path },
      success: function (response) {
        console.log("Witness removed successfully!");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to remove witness:", error);
      },
    });
  });
  // Ajout/Retrait d'une diapo END
});



// Menu burger
let menu = document.querySelector("#menu-btn");
let navbar = document.querySelector(".navbar");

menu.onclick = () => {
  menu.classList.toggle("fa-times");
  navbar.classList.toggle("active");
};

window.onscroll = () => {
  menu.classList.remove("fa-times");
  navbar.classList.remove("active");
};


// TODO : avec .plus et .minus, des div sont ajoutés/supprimés dynamiquement ; mais si on fait location.reload, c'est pas nécessaire... C'est l'un ou l'autre


// Get the element to animate
const elements = document.querySelectorAll('.story-img, .story-text, .event-item, .witness-item, .couple.item, .gallery-item');

// Define the options for the Intersection Observer
const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5
};

// Create a new Intersection Observer
const observer = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    // If element is in viewport, add the 'show' class to trigger the animation
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
}, options);

// Start observing the element
elements.forEach((el) => observer.observe(el));



document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".witness-item, .gallery-item");
  items.forEach((item, index) => {
    // Applique un délai de transition qui commence à 600ms pour le troisième élément et augmente de 600ms pour chaque suivant
    if (index >= 1) {
      // Commence à 0, donc index 2 est le troisième élément
      item.style.transitionDelay = `${100 * (index - 1)}ms`;
    }
  });
});