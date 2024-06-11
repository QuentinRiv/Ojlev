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

  $(document).ready(function () {
    // Utilisation de la délégation d'événements pour gérer les clics sur .folders_elem
    $(".folders_elem").on("click", function () {
      console.log("*************");
      $(".folders_elem").removeClass("active");
      $(this).addClass("active");
      show_files($(this).attr("name"));
    });

    // Toggle active mode for the file rows in the grid
    $(".file").on("click", function () {
      const isActive = $(this).hasClass("active");
      $(".file").removeClass("active");

      // Si l'élément cliqué n'était pas déjà actif, ajouter la classe 'active'
      if (!isActive) {
        $(this).addClass("active");
        $(".waiting_container").css("opacity", 0);
        console.log($(".waiting_container"));
      } else {
        $(".waiting_container").css("opacity", 1);
      }
    });
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
    const fileRows = $('.file');    // Tous les fichiers
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

    fileRows.each(function(index, fileRow) {
        if (availableHeight > necessaryHeight) {
            availableHeight -= necessaryHeight;
            $(fileRow).addClass("show");
        }
        else {
            // $(fileRow).addClass("hidden");
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



// Update the file info part (right side)
$(document).ready(function () {
    showInfo();
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
        $(".folders_elems").html(folderHtml);

        // Add .active for the first elem
        $(".folders_elem").first().addClass("active");

        // Initialize, by showing the files of the first folder
        show_files(data[0]);
      }
    });
});


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
                    <span><i class="fas fa-ellipsis-h option"></i></span>
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
        showInfo();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Code to execute in case of an error
        console.error("Error:", textStatus, errorThrown);
      },
    });
}