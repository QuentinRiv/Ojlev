$(document).ready(function () {
  function onDomChange() {
    $(".icon_container").on("click", function () {
      $(".icon_container").removeClass("active");
      $(this).addClass("active");

      $(".menu_title h3").html($(this).attr("id"));
    });

    $(".drive_box").on("click", function () {
      $(".drive_box").removeClass("active");
      $(this).addClass("active");
    });

    $(".drive_box").on("click", function () {
      $(".drive_box").removeClass("active");
      $(this).addClass("active");
    });

    // adjustGridContainer();
  }

    // Pour afficher les fichiers dans le dossier sélectionné
    $(document).on("click", ".folders_elem", function () {
      $(".folders_elem").removeClass("active");
      $(this).addClass("active");
      show_files($(this).attr("name"));
    });

    $(document).on("click", ".setting", function (event) {
      event.stopPropagation();
      console.log("Settings clicked");
      // Autres actions pour le clic sur "setting"
    });

    // Toggle active mode for the file rows in the grid
    $(document).on("click", ".file", function () {
      const isActive = $(this).hasClass("active");
      $(".file").removeClass("active");

      // Si l'élément cliqué n'était pas déjà actif, ajouter la classe 'active'
      if (!isActive) {
        $(this).addClass("active");
        $(".waiting_container").css("opacity", 0);
        $(".waiting_container").css("visibility", "hidden");
        const activeFolder = $(".folders_elem.active").attr("name");
        const filename = $(this).find(".file_name").html();
        $(".overview img").attr("src", "../static/img/gallery/" + activeFolder + "/" + filename)
      } else {
        $(".waiting_container").css("opacity", 1);
      }
    });


  // Configuration de l'observateur pour observer les modifications dans l'élément body
  const targetNode = document.body;

  // Options de l'observateur (les types de mutations à observer)
  const config = {
    childList: true, // Observer les ajouts/suppressions d'éléments enfants
    subtree: true, // Observer les changements dans les descendants de l'élément ciblé
  };

  // Fonction de rappel à exécuter quand des mutations sont observées
  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        onDomChange();
      }
    }
  };

  // Création d'une instance de MutationObserver avec la fonction de rappel
  const observer = new MutationObserver(callback);

  // Commencer à observer le DOM
  observer.observe(targetNode, config);
})



function adjustGridContainer() {
    console.log("--------------------");
    const fileRows = $('.file');    // Tous les fichiers
    $(fileRows).removeClass("show");
    // const fileRowHeight = fileRows.first().height(); // Ne fonctionne pas...
    const fileRowHeight = 36;
    const rowGap = 10; // Espace entre les lignes
    const necessaryHeight = fileRowHeight + rowGap;
    
    // Les div à ne pas prendre en compte dans le calcul des tailles
    const fileHeader = $('.file_header');    // Le header (type, name, size, ...)
    const filesText = $('.files_text'); // Le conteneur avec le texte View all

    const filesPart = $('.files_part'); // Le conteneur qui contient tout ça
    const filesContainer = $('.files_container'); // Le conteneur de grille

    // Calcul de la hauteur disponible dans .files_part
    var availableHeight = filesPart.height() - (filesText.height() + fileHeader.height());
    console.log("availableHeight: " + availableHeight);

    fileRows.each(function(index, fileRow) {
        if (availableHeight > necessaryHeight) {
            availableHeight -= necessaryHeight;
            $(fileRow).addClass("show");
        }
        else {
            $(fileRow).removeClass("show");
        }
    })

}

// Ajuste la hauteur au chargement et au redimensionnement de la fenêtre
window.addEventListener('load', adjustGridContainer);
window.addEventListener('resize', adjustGridContainer);

$(document).ready(function() {
    $('#mainCheckbox').change(function() {
        // Lorsque le checkbox principal est changé, mettre à jour tous les autres
        var isChecked = $(this).is(':checked'); // Vérifie si le checkbox principal est coché
        $('.childCheckbox').prop('checked', isChecked); // Coche ou décoche tous les checkboxes enfants
    });

    $('.childCheckbox').change(function() {
        // Vérifie si tous les checkboxes enfants sont cochés
        var allChecked = $('.childCheckbox').length === $('.childCheckbox:checked').length;
        $('#mainCheckbox').prop('checked', allChecked); // Met à jour le checkbox principal selon que tous les enfants sont cochés
    });
});


// Update the folders name that are in the gallery folder
$(document).ready(function () {
    $.ajax({
      url: "/directory",
      type: "GET",
      success: function (data) {

        // Use .map() to create an array of HTML strings
        let folderItems = data.map(function (folder) {
          return `
                        <div class="folders_elem" name=${folder}>
                            <i class="fas fa-folder folder_logo"></i>
                            <div class="folder_line"></div>
                            <p>${folder}</p>
                            <div class="last_modif">
                                <i class="fas fa-info-circle"></i>
                                <span>Last modif : 4th May</span>
                            </div>
                        </div>
                    `;
        });

        // Join the array into a single string and set it as the HTML content
        let folderHtml = folderItems.join("");

        // Append the new HTML to the existing content
        $(".folders_container").html(folderHtml);

        // Add .active for the first elem
        $(".folders_elem").first().addClass("active");

        // Initialize, by showing the files of the first folder
        show_files(data[0]);
      }
    });
});

// Update the right side, with the file info
function showInfo() {
  $(".file").on("click", function () {
    const file_size = $(this).find(".file_size").html();
    const file_date = $(this).find(".file_date").html();
    const file_dim = $(this).find(".file_dim").html();

    $(".info.size p").text(file_size);
    $(".info.date p").text(file_date);
    $(".info.dimension p").text(file_dim);

  });
}

// Show the files inside a selected folder
function show_files(folder) {
    url = "files?folder=" + folder;
    $.ajax({
      url: url,
      type: "GET",
      success: function (data) {

        // Use .map() to create an array of HTML strings
        let folderItems = data.map(function (file) {
          return `
                  <div class="file">
                    <input type="checkbox" class="childCheckbox">
                    <span class="file_type"><i class="fas fa-file-image"></i></span>
                    <span class="file_name">${file.name}</span>
                    <span class="file_size">${file.size}</span>
                    <span class="file_date">${file.last_modified}</span>
                    <span style="display:none" class="file_dim">${file.dimensions}</span>
                    <span class="setting"><i class="fas fa-ellipsis-h option"></i></span>
                  </div>
                    `;
        });

        // Join the array into a single string and set it as the HTML content
        let folderHtml = folderItems.join("");

        // Take back the header :
        const fileHeader = $(".file_header");
        $(".files_container").html(fileHeader);

        // Append the new HTML to the existing content
        $(".files_container").append(folderHtml);

        adjustGridContainer();
        // showInfo();
      }
    });
}


// To show the file menu (three)
$(document).ready(function() {
  const menuTemplate = `
                <div class="file_menu" id="context-menu">
                    <div class="menu-item">Rename</div>
                    <div class="menu-item">Move</div>
                    <div class="menu-item">Delete</div>
                </div>
            `;

    $(document).on("click", ".setting", function(event) {
        $("#context-menu").remove();
        $("body").append(menuTemplate);
        const menu = $("#context-menu");
        
        
        // Calculate the position of the button
        const buttonOffset = $(this).offset();
        const buttonWidth = $(this).outerWidth();
        
        // Set the position of the menu
        menu.css({
            top: buttonOffset.top - menu.height(),
            left: buttonOffset.left + buttonWidth - menu.outerWidth()
        });

        // Toggle the menu visibility
        menu.toggleClass("show");
    });

    // Hide the menu when clicking outside
    $(document).on("click", function(event) {
        if (!$(event.target).closest(".setting, #context-menu").length) {
            $("#context-menu").removeClass("show");
        }
    });
});


$(document).ready(function() {
  $(".view_all").on("click", function () {
    const foldersCont = $(".folders_container");
    foldersCont.toggleClass("reduce");
    $(".folders_container.reduce").one("transitionend", function () {
      console.log("*-*-**-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
      adjustGridContainer();
    });
  });

  // === Afficher la photo en grand ===
  const wHeight = $(window).height();
  $(".gallery-popup .gp-img").css("max-height", wHeight + "px");

  let imageSrc = "";
  const totalGalleryItems = $(".gallery-item").length;

  $(".overview img").click(function () {
    imageSrc = $(this).attr("src");
    console.log(imageSrc);
    $(".gallery-popup").addClass("open");
    $(".gallery-popup .gp-img").hide();
    // Désactiver la sélection de texte
    $("body").css({
      "user-select": "none",
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
    });
    gpSlideShow();
  });

  function gpSlideShow() {
    $(".gallery-popup .gp-img").fadeIn().attr("src", imageSrc);
  }

  $(".gp-close").click(function () {
    $(".gallery-popup").removeClass("open");
  });


    var isDown = false;
    var offset = [0, 0];
    var mousePosition;
    var $div = $("#thumbselect"); // Assurez-vous de remplacer #yourDivId par l'ID de votre div

    $div.on("mousedown", function (e) {
      isDown = true;
      offset = [$div.offset().left - e.clientX, $div.offset().top - e.clientY];
    });

    $(document).on("mouseup", function () {
      isDown = false;
    });

    $(document).on("mousemove", function (e) {
      if (isDown) {
        e.preventDefault();
        mousePosition = {
          x: e.clientX,
          y: e.clientY,
        };
        $div.css({
          left: mousePosition.x + offset[0] + "px",
          top: mousePosition.y + offset[1] + "px",
        });
      }
    });


  // === FIN Afficher la photo en grand ===
});



