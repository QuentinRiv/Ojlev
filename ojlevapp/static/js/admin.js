function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

$(window).on("load", function () {
  let isconnected = $("#name_connected").length > 0;
  if (!isconnected) {
    console.warn("User pas connecté !");
    $(".add_remove").css("display", "none");
    return;
  }
  

  // Modif des champ modifiables START
  let elements = $(
    ".couple h3, .couple p, .story-content .row h3, .story-content .row span, .story-content .row p, .event-item-inner h3, .event-item-inner span, .event-item-inner p, .witness-item-inner h4, .witness-item-inner p"
  );
  elements.attr("contenteditable", "true");
  elements.css("border", "1px dashed black");
  elements.on("blur", function () {
    var id = $(this).closest(".item").attr("data-index"); // On trouve le 1er parent avec la classe .item, pour on récupère son id
    var text_value = $(this).text();
    var attribute_name = $(this).attr("name");
    var table = $(this).closest("section").attr("data-db");
    let data = {
      table: table,
      id: id,
      attribute_name: attribute_name,
      new_value: text_value,
    };

    $.ajax({
      url: "/update",
      type: "POST",
      data: data,
      success: function (response) {
        console.log(
          `-${table}- table updated successfully! => New Value : -${text_value}- for the attribute -${attribute_name}-`
        );
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error(`Failed to update -${table}-:`, error);
      },
    });
  });
  // Modif des champ modifiables END

  // Ajout/Retrait d'une histoire START
  // Ajout
  $(".addStoryItem.plus").on("click", function () {
    let newStep = $(".story-content .row");

    let lastChild = newStep.children().last().clone();
    let nbrChildren = newStep.children().length;
    console.log("Enfant num :", nbrChildren);
    let nouv = lastChild.clone();
    nouv.find(".story-item").attr("data-index", nbrChildren);
    nouv.find("img").attr("src", "../static/img/upcloud.png");
    nouv.find("h3").html("New text");
    nouv.find("span").html("01/01/2050");
    newStep.append(nouv);

    $.ajax({
      url: "/story/new",
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
  $(".update_image").click(function () {
    // Déclenche le clic sur l'input file caché
    id = $(this).parent().parent().attr("data-index");
    console.log("-------------------");
    folder_path = $(this).closest("div[data-image-path]").attr("data-image-path");
    console.log($(this).closest("div[data-image-path]"));
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
    let newStep = $(".witness-section .row.active");

    let lastChild = newStep.children().last().clone();
    let nbrChildren = newStep.children().length;
    let nouv = lastChild.clone();
    nouv.find("img").attr("src", "../static/img/upcloud.png");
    nouv.find("h4").html("Witness' name");
    nouv.find("p").html("Role");
    newStep.append(nouv);

    const side = capitalizeFirstLetter($(nouv).attr("data-target"));

    $.ajax({
      url: "/witness/new?side=" + side,
      type: "GET",
      success: function (response) {
        console.log("Witness added successfully!");
        location.reload();
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
    let newStep = $(".home-section .small_diapo");

    let lastChild = newStep.children(".small_diapo_item").last().clone();
    let nbrChildren = newStep.children().length;
    console.log("Enfant num :", nbrChildren);
    let nouv = lastChild.clone();
    nouv.find(".new-image-diapo").attr("data-index", nbrChildren);
    nouv.find("img").attr("src", "../static/img/upcloud.png");
    newStep.children(".small_diapo_item").last().after(nouv);

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
    console.log("==>", folder_path);
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