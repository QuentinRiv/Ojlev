$(document).ready(function () {

  // Sélection d'un icone tout à gauche
  $(document).on("click", ".icon_container", function () {
    $(".icon_container.active").removeClass("active");
    $(this).addClass("active");

    $(".menu_title h3").html($(this).attr("id"));
  });

  // Sélection d'une box Drive
  $(document).on("click", ".drive_box", function () {
    $(".drive_box.active").removeClass("active");
    $(this).addClass("active");
  });


  // Pour afficher les fichiers dans le dossier sélectionné
  $(document).on("click", ".folders_elem", function () {
    $(".folders_elem.active").removeClass("active");
    $(this).addClass("active");
    show_files($(this).attr("name"));
  });

  // Pour éviter que cliquer sur "..." actionne le clique sur toute la ligne
  $(document).on("click", ".setting", function (event) {
    event.stopPropagation();
  });

    // Toggle active mode for the file rows in the grid
    $(document).on("click", ".file", function () {
      const isActive = $(this).hasClass("active");
      $(".file").removeClass("active");

      // Si l'élément cliqué n'était pas déjà actif, ajouter la classe 'active'
      if (!isActive) {
        $(this).addClass("active");
        $(".waiting_container").addClass("hidden")
        const activeFolder = $(".folders_elem.active").attr("name");
        const filename = $(this).find(".file_name").html();
        $(".overview img").attr("src", "../static/img/gallery/" + activeFolder + "/" + filename)
      } else {
        $(".waiting_container").removeClass("hidden");

      }
    });

})



function adjustGridContainer() {
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

    // Calcul de la hauteur disponible dans .files_part
    var availableHeight = filesPart.height() - (filesText.height() + fileHeader.height());

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
        console.log(data);

        // Use .map() to create an array of HTML strings
        let folderItems = data.map(function (file) {
          return `
                  <div class="file" data-index="${file.id}">
                    <input type="checkbox" class="childCheckbox">
                    <span class="file_type"><i class="fas fa-file-image"></i></span>
                    <span class="file_name">${file.name}</span>
                    <span class="file_size">${file.size}</span>
                    <span class="file_date">${file.date}</span>
                    <span style="display:none" class="file_dim">${file.weight}</span>
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
        showInfo();
      }
    });
}


// To show the file menu (three dots)
$(document).ready(function() {
  const menuTemplate = `
                <div class="file_menu" id="context-menu">
                    <div class="menu-item rename">Rename</div>
                    <div class="menu-item move">Move</div>
                    <div class="menu-item delete">Delete</div>
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
        menu.attr("data-index", $(this).closest(".file").attr("data-index"));
    });

    // Hide the menu when clicking outside
    $(document).on("click", function(event) {
        if (!$(event.target).closest(".setting, #context-menu").length) {
            $("#context-menu").removeClass("show");
        }
    });
});

// Extend section when clicking on View all
$(document).ready(function() {
  $(".view_all").on("click", function () {
    $(".folders_container").toggleClass("reduce");
    $(".folders_container.reduce").one("transitionend", function () {
      adjustGridContainer();
    });
  });

});



// Partie Create New folder
$(document).ready(function () {
  $(".new_folder, .folder_popup .btn.cancel").click(function () {
    $("#folder_form").toggle();
  });

  $(".create_folder").click(function () {
    let new_folder_name = $("#folder_name").val();
    const folder = `
                <div class="folders_elem">
                    <i class="fas fa-folder folder_logo"></i>
                    <div class="folder_line"></div>
                    <p>${new_folder_name}</p>
                    <div class="last_modif">
                        <i class="fas fa-info-circle"></i>
                        <span>Last modif : 4th May</span>
                    </div>
                </div>
            `;
    $(".folders_container").append(folder);

    $.ajax({
      url: "/gallery/new_folder?name=" + form[0].value,
      type: "POST",
      success: function (data) {
        console.log("Succès pour avoir les infos :", data);
      },
      error: function (xhr, status, error) {
        console.error(`Failed to update :`, error);
      },
    });
    $("#folder_form").toggle(); // Une fois fini, on referme le popup
  });

  // Add image
  $(".new_file, .fileform_container .btn.cancel").click(function () {
    $("#file_form").toggle();
  });

  function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imagePreview').css('background-image', 'url('+e.target.result +')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);

        imageFile = input.files[0];

        $("#file_name").val(imageFile.name);
    }
  }
  $("#imageUpload").change(function() {
      readURL(this);
  });

  var fileData = new FormData();
  var imageFile = NaN;

  $(".upload_file").click(function() {

    if (imageFile) {
        var folder = $("#dropdownMenuButton span").html();
        var image_name = $("#file_name").val();

        fileData.append("image", imageFile);
        fileData.append("filename", image_name);
        fileData.append("path", folder);

        // Envoie le fichier en AJAX à l'URL '/upload'
        $.ajax({
          url: "/gallery/upload",
          type: "POST",
          data: fileData,
          processData: false,
          contentType: false,
          success: function (response) {
            console.log("Image uploaded successfully!");
          },
          error: function (xhr, status, error) {
            console.log(error);
            alert("Error: " + xhr.responseJSON.error);
          },
        });
    } else {
        console.log("No file selected.");
    }

  });

});

$(document).ready(function() {
  $.ajax({
    url: "/directory",
    type: "GET",
    success: function (data) {
      // Use .map() to create an array of HTML strings
      let dropdown_items = data.map(function (folder) {
        return `
            <a href="#" class="dropdown-item">${folder}</a>
                    `;
      });

      // Join the array into a single string and set it as the HTML content
      let dropdown_html = dropdown_items.join("");

      // Append the new HTML to the existing content
      $(".dropdown-menu").html(dropdown_html);
    },
  });

  const dropdownToggle = $(".dropdown-toggle");
  const dropdownMenu = $(".dropdown-menu");

  dropdownToggle.on("click", function () {
    dropdownMenu.toggle();
  });

  $(document).on("click", ".dropdown-item", function (event) {
    event.preventDefault();
    console.log($(this));
    const selectedItemText = $(this).text();
    $(".dropdown-toggle span").text(selectedItemText);
    dropdownMenu.hide();
  });

  $(document).on("click", function (event) {
    if (!$(event.target).closest(".file_dropdown").length) {
      dropdownMenu.hide();
    }
  });

  // Rename image START
  $(document).on("click", ".menu-item.rename", function (event) {
    $("#rename_form").toggle();
    $("#rename_form").attr(
      "data-index",
      $(this).closest(".file_menu").attr("data-index")
    );
  });

  $("#rename_form .btn.cancel").click(function () {
    $("#rename_form").toggle();
  });

  $(".rename_image").click(function () {
    let new_name = $("#new_name").val();
    let image_id = $("#rename_form").attr("data-index");

    let data = {
      new_name: new_name,
      image_id: image_id,
    };

    $.ajax({
      url: "/gallery/rename",
      type: "UPDATE",
      data: data,
      success: function (response) {
        console.log("Succès de l'update");
      },
      error: function (xhr, status, error) {
        console.log(error);
        alert("Error: " + xhr.responseJSON.error);      },
    });
  });
  // Rename image END

  // Delete image START
  $(document).on("click", ".menu-item.delete", function (event) {
    $("#delete_form").toggle();
    $("#delete_form").attr(
      "data-index",
      $(this).closest(".file_menu").attr("data-index")
    );
  });

  $("#delete_form .btn.cancel").click(function () {
    $("#delete_form").toggle();
  });

  $(".delete_image").click(function () {
    let image_id = $("#delete_form").attr("data-index");

    let data = {
      image_id: image_id,
    };

    $.ajax({
      url: "/gallery/delete",
      type: "UPDATE",
      data: data,
      success: function (response) {
        console.log("Succès de la suppression");
      },
      error: function (xhr, status, error) {
        alert(`Failed to update :`, error);
      },
    });
  });
  // Delete image END

  // Move image START
  $(document).on("click", ".menu-item.move", function (event) {
    $("#move_form").toggle();
    $("#move_form").attr(
      "data-index",
      $(this).closest(".file_menu").attr("data-index")
    );
  });

  $("#move_form .btn.cancel").click(function () {
    $("#move_form").toggle();
  });

  $(".move_image").click(function () {
    let image_id = $("#move_form").attr("data-index");
    let folder = $("#dropdownMenuButton span").html();

    let data = {
      image_id: image_id,
      new_folder: folder,
    };

    $.ajax({
      url: "/gallery/move",
      type: "UPDATE",
      data: data,
      success: function (response) {
        console.log("Succès de la suppression");
      },
      error: function (xhr, status, error) {
        alert(`Failed to update :`, error);
      },
    });
  });
  // Move image END
});


