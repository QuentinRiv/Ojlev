function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


// If the user is connected
$(window).on("load", function () {
  let isconnected = $("#name_connected").length > 0;
  if (!isconnected) {
    console.warn("User pas connecté !");
    $(".add_remove").css("display", "none");
    $(".update_image").css("display", "none");
    $(".small_diapo").css("display", "none");
    $(".photo_gallery").css("display", "none");
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


  // Ajout d'un nouvel élément pour Diapo, Témoin et Histoire
  function new_elem(element) {
    let newStep = $(element);

    let nouv = newStep.children().last().clone();
    let nbrChildren = newStep.closest("section").find(".item").length;  // Index de l'élément à créer
    const breakpoint = /[0-9]+/; // Pour séparer là où est l'index (le 4 dans image-4.png)
    const new_val = nouv.find("img").attr("src").split(breakpoint);
    console.log("-->", new_val);
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
  $(".addStoryItem.plus").on("click", async function () {
    
    new_elem(".story-content .row");
    
    $.ajax({
      url: "/story/new",
      type: "GET",
      success: function (response) {
        console.log("Histoire added successfully!");
        // location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to add story:", error);
      },
    });
  });

  // Retrait
  $(".addStoryItem.minus").on("click", function () {
    remove_img($(".story-content"));

    $.ajax({
      url: "/story/remove",
      type: "GET",
      success: function (response) {
        console.log("Histoire removed successfully!");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to remove story:", error);
      },
    });
  });
  // Ajout/Retrait d'une histoire END

  // Upload d'une image Témoin START
  // var id = "";
  // var folder_path = "";
  // var image_name = "";
  $('section').on('click', '.update_image', function() {
    // Déclenche le clic sur l'input file caché
    // let id = $(this).find("data-index").attr("data-index");
    let folder_path = $(this).closest("div[data-image-path]").attr("data-image-path");
    let image_name = $(this).parent().children("img").attr("src").split("/").pop();
    console.log("=> ", image_name);
    var image = $(this).parent().children("img");

    $("#hiddenLoveImageInput").click();

    $("#hiddenLoveImageInput").off('change').on('change', function () {
        var fileData = new FormData();
        var imageFile = this.files[0];

        if (imageFile) {
            fileData.append("image", imageFile);
            fileData.append("filename", image_name);
            fileData.append("path", folder_path);

            console.log("Folder :", folder_path);

            // Envoie le fichier en AJAX à l'URL '/upload'
            $.ajax({
                url: "/upload",
                type: "POST",
                data: fileData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log("Image uploaded successfully!");
                    console.log("Image :", image);
                    console.log("Chemin :", '../static/img/' + folder_path + '/' + image_name);
                    image.attr("src", '../static/img/' + folder_path + '/' + image_name); // Ajouter un timestamp pour éviter le cache
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
});

  // Upload d'une image Histoire FIN

  // Ajout/Retrait d'une histoire START
  // Ajout
  $(".addWitnessItem.plus").on("click", function () {
    var nouv = new_elem(".witness-section .row.active");

    const side = $(nouv).attr("data-target");
    console.log("Side : " + side);

    $.ajax({
      url: "/witness/new?side=" + side,
      type: "GET",
      success: function (response) {
        console.log("Témoin added successfully!");
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

    $.ajax({
      url: "/witness/remove?side=" + side,
      type: "GET",
      success: function (response) {
        console.log("Témoin removed successfully!");
        // location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Failed to remove witness:", error);
      },
    });

    remove_img($(".witnesses.active"));


  });
  // Ajout/Retrait d'une histoire END

  

  // Ajout/Retrait d'une diapo START
  // Ajout
  $(".addDiapoItem.plus").on("click", function () {
    var elem = new_elem(".home-section .small_diapo .diapos");

    $.ajax({
      url: "/slide/new",
      type: "GET",
      success: function (response) {
        console.log("Histoire added successfully!");
        var image_path = elem.find("img").attr("src"); // Ajouter un timestamp pour éviter le cache
        elem.find("img").attr("src", image_path);
      },
      error: function (xhr, status, error) {
        console.error("Failed to add story:", error);
      },
    });
  });

  // Retrait
  $(".addDiapoItem.minus").on("click", function () {
    remove_img($(".small_diapo"));
  });
  // Ajout/Retrait d'une diapo END
});

function remove_img(container) {
  const folder_path = container.attr("data-image-path");
  console.log("Folder path: " + folder_path);
  let newestStep = container.find(".item");
  newestStep.last().remove();

  $.ajax({
    url: "/remove_lastimage",
    type: "POST",
    data: { folder_path: folder_path },
    success: function (response) {
      console.log("Témoin removed successfully!");
      // location.reload();
    },
    error: function (xhr, status, error) {
      console.error("Failed to remove witness:", error);
    },
  });
}

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

 $(".filter-btn").click(function () {
   if ($(this).hasClass("active")) {
     return;
   }
   console.log("------------");
   console.log($(this));
   witnessFilter($(this).attr("data-image-path"));
 });
 function witnessFilter(target) {
   //target = groom ou bride
   console.log("=> Target = " + target);
   $(".witness-section .add_remove").attr("data-image-path", target);
 }