$(document).ready(function () {

  // Pour éviter que cliquer sur "..." actionne le clique sur toute le dossier
  $(document).on("click", ".folder_option", function (event) {
    event.stopPropagation();
  });

  showFolders();
});



$(document).ready(function () {
  $("#mainCheckbox").change(function () {
    // Lorsque le checkbox principal est changé, mettre à jour tous les autres
    var isChecked = $(this).is(":checked"); // Vérifie si le checkbox principal est coché
    $(".childCheckbox").prop("checked", isChecked); // Coche ou décoche tous les checkboxes enfants
  });

  $(".childCheckbox").change(function () {
    // Vérifie si tous les checkboxes enfants sont cochés
    var allChecked =
      $(".childCheckbox").length === $(".childCheckbox:checked").length;
    $("#mainCheckbox").prop("checked", allChecked); // Met à jour le checkbox principal selon que tous les enfants sont cochés
  });
});

// Update the folders name that are in the gallery folder
function showFolders() {
  get_directories().then(function (data) {
    // Use .map() to create an array of HTML strings
    let folderItems = data.map(function (folder) {
      return `
                  <div class="folder_elem" name=${folder} data-index="${folder}">
                      <i class="fas fa-folder folder_logo"></i>
                      <i class="fas fa-ellipsis-h folder_option"></i>
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
    $("#productList").html(folderHtml);

    // Add .active for the first elem
    $(".folder_elem").first().addClass("active");

    // Initialize, by showing the files of the first folder
    show_files(data[0]);

  });

  //  Second column displays
  get_directories().then(function (data) {
    let folderItems = data.map(function (folder) {
      return `
            <li class="folder_li" name="${folder}"><i class="fas fa-folder"></i>${folder}</li>
              `;
    });
    let folderHtml = folderItems.join("");
    $(".file_nav ul").html(folderHtml);
    $(".folder_li").first().addClass("active");
  });

  
}


  function splitFilename(filename) {
    // Trouve la position du dernier point dans le nom de fichier
    var lastDotPosition = filename.lastIndexOf(".");

    // Si aucun point n'est trouvé, retourne le nom de fichier original et une chaîne vide pour l'extension
    if (lastDotPosition === -1) return [filename, ""];

    // Retourne un tableau avec la partie du nom de fichier avant le dernier point et l'extension
    return [
      filename.substring(0, lastDotPosition),
      filename.substring(lastDotPosition + 1),
    ];
  }

  function readURL(input) {
    if (input.files && input.files[0]) {
      $.each(input.files, function (index, file) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $("#imagePreview").css(
            "background-image",
            "url(" + e.target.result + ")"
          );
          $("#imagePreview").hide();
          $("#imagePreview").fadeIn(index * 500);
          const img = $("<img>").attr("src", e.target.result);
        };
        reader.readAsDataURL(file);
        let [name, extension] = splitFilename(file.name);
        imageFiles.push({ file: file, name: name, extension: extension });
      });


    }
  }

  var imageFiles = [];

$(document).on("click", ".upload_file", function () {
    var fileData = new FormData();
    var empty = checkEmpty([$("#file_form .dropdown-toggle span")]);

    if (empty)
      return

    if (imageFiles.length > 0) {
      var folder = $("#file_form .dropdown-toggle span").html();
      imageFiles.forEach((imageFile, index) => {
        fileData.append("files[]", imageFile.file);
        fileData.append(`names[${index}]`, imageFile.name); // Ajoute le nom
        fileData.append(`extensions[${index}]`, imageFile.extension);
      });

      fileData.append("path", folder);

      // Envoie le fichier en AJAX à l'URL '/upload'
      $.ajax({
        url: "/gallery/upload",
        type: "POST",
        data: fileData,
        processData: false,
        contentType: false,
        success: function (response) {
          actionPopup("success", response.message);
          closeAndUpdateFiles();
        },
        error: function (xhr, status, error) {
          console.log(error);
          alert("Error: " + xhr.responseJSON.error);
        },
      });
    } else {
      alert("No file selected.");
    }
  });

async function fetchData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Unknown error");
  }

  return await response.json();
}

// Utilisation de la fonction avec async/await
async function get_directories() {
  try {
    let data = await fetchData("/directory");
    return data;
  } catch (error) {
    alert("Error fetching data: " + error.message);
  }
}



function closeAndUpdateFiles() {
  closePopup();
  show_files($(".folder_elem.active").attr("name"));
}

function closeAndUpdateFolders() {
  closePopup();
  showFolders();
}

function closePopup() {
  var menus = $(".black_bg_form");
  $.each(menus, function (index, menu) {
    if ($(menu).css("display") === "block") {
      $(menu).css("display", "none");
    }
  });
}

function checkEmpty(fields) {
  var hasEmptyField = false;
  $.each(fields, function (indexInArray, field) {
    var $element = $(field);
    var content;

    if ($element.is("input")) {
      content = $element.val();
    } else if ($element.is("span")) {
      content = $element.html();
    }

    if (content == "") {
      var $toHighlight = $($element).closest(".mandatory");
      var originalColor = $toHighlight.css("background-color");

      // Change la couleur en rouge
      $toHighlight.css("background-color", "red");

      // Attends 1 seconde (1000 ms), puis remet la couleur d'origine
      setTimeout(function () {
        $toHighlight.css("background-color", originalColor);
      }, 700);
      hasEmptyField = true;

      return false; // Arrête l'itération
    }
  });

  return hasEmptyField;
}





// ============= FILES ====================== 

// Pour afficher les fichiers dans le dossier sélectionné et changer le background de ce dernier (ainsi que dans la 2nde colonne)
$(document).on("click", ".folder_elem, .folder_li", function () {
  let folder_name = $(this).attr("name");

  function setActiveClass(selector, folderName) {
    $(selector + ".active").removeClass("active");
    $(selector + "[name='" + folderName + "']").addClass("active");
  }

  setActiveClass(".folder_elem", folder_name);
  setActiveClass(".folder_li", folder_name);

  show_files(folder_name);
});


// -------------- Image Info --------------

// Affiche les infos d'une image et change le background de la ligne
$(document).on("click", ".file", function () {
  const $this = $(this);
  const isActive = $this.hasClass("active");

  // Supprimer la classe 'active' de tous les éléments .file
  $(".file").removeClass("active");

  // Si l'élément cliqué n'était pas déjà actif, ajouter la classe 'active'
  if (!isActive) {
    $this.addClass("active");
    $(".waiting_container").addClass("hidden");

    const activeFolder = $(".folder_elem.active").attr("name");
    const filename = $this.find(".file_name").html();

    // Mettre à jour l'image dans l'aperçu
    $(".overview img").attr(
      "src",
      `../static/img/gallery/${activeFolder}/${filename}`
    );
  } else {
    $(".waiting_container").removeClass("hidden");
  }
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
// -------------- Image Info --------------

// Show the files inside a selected folder
function show_files(folder) {
  url = encodeURI("/files?folder=" + folder);
  $.ajax({
    url: url,
    type: "GET",
    success: function (data) {
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
    },
    error: function (xhr, status, error) {
      alert("Error: " + xhr.responseJSON.error);
    },
  });
}

// Add image START
$(document).on("click", ".new_file", function () {
  $("#file_form").toggle();
});

$("#imageUpload").change(function () {
  readURL(this);
});
// Add image END

// Move image START
$(document).on("click", ".menu-item.move", function (event) {
  $("#move_form").toggle();
  $("#move_form").attr(
    "data-index",
    $(this).closest(".file_menu").attr("data-index")
  );
});


$(document).on("click", ".move_image", function () {
  let image_id = $("#move_form").attr("data-index");
  let folder = $(".dropdownMenuButton span").html();

  let data = {
    image_id: image_id,
    new_folder: folder,
  };

  $.ajax({
    url: "/gallery/move",
    type: "UPDATE",
    data: data,
    success: function (response) {
      actionPopup("success", response.message);
      console.log(response.message);
      closeAndUpdateFiles();
    },
    error: function (xhr, status, error) {
      alert(`Failed to update :`, error);
    },
  });
});
// Move image END

// Rename image START
$(document).on("click", ".menu-item.rename", function (event) {
  $("#rename_file").toggle();
  $("#rename_file").attr(
    "data-index",
    $(this).closest(".file_menu").attr("data-index")
  );
});

$(document).on("click", ".btn.cancel", function () {
  closePopup();
});

$(document).on("click", ".rename_image", function () {
  let new_name = $("#new_name").val();
  let image_id = $("#rename_file").attr("data-index");

  let data = {
    new_name: new_name,
    image_id: image_id,
  };

  $.ajax({
    url: "/gallery/rename",
    type: "UPDATE",
    data: data,
    success: function (response) {
      actionPopup("success", response.message);
      closeAndUpdateFiles();
    },
    error: function (xhr, status, error) {
      actionPopup("fail", xhr.responseJSON.error);
    },
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

$(document).on("click", ".delete_image", function () {
  let image_id = $("#delete_form").attr("data-index");

  let data = {
    image_id: image_id,
  };

  $.ajax({
    url: "/gallery/delete",
    type: "UPDATE",
    data: data,
    success: function (response) {
      actionPopup("success", response.message);
      closeAndUpdateFiles();
    },
    error: function (xhr, status, error) {
      alert(`Failed to delete :`, error);
    },
  });
});
// Delete image END

// ----------------- Grid files -------------------
// Extend section when clicking on View all
$(document).ready(function () {
  $(".view_all").on("click", function () {
    $(".folders_container").toggleClass("reduce");
    $(".folders_container.reduce").one("transitionend", function () {
      // adjustGridContainer();
      $(".file").addClass("show");
      console.log($(".file"));
    });
    $(".files_container").toggleClass("expanded");
    if (!$(".files_container.expanded")[0]) {
      adjustGridContainer();
    }
  });
});

// Fonction pour afficher correctement les lignes du tableau d'images
function adjustGridContainer() {
  const fileRows = $(".file"); // Tous les fichiers
  $(fileRows).removeClass("show");
  // const fileRowHeight = fileRows.first().height(); // Ne fonctionne pas...
  const fileRowHeight = 36;
  const rowGap = 10; // Espace entre les lignes
  const necessaryHeight = fileRowHeight + rowGap;

  // Les div à ne pas prendre en compte dans le calcul des tailles
  const fileHeader = $(".file_header"); // Le header (type, name, size, ...)
  const filesText = $(".files_text"); // Le conteneur avec le texte View all

  const filesPart = $(".files_part"); // Le conteneur qui contient tout ça

  // Calcul de la hauteur disponible dans .files_part
  var availableHeight =
    filesPart.height() - (filesText.height() + fileHeader.height());

  fileRows.each(function (index, fileRow) {
    if (availableHeight > necessaryHeight) {
      availableHeight -= necessaryHeight;
      $(fileRow).addClass("show");
    } else {
      $(fileRow).removeClass("show");
    }
  });
}
// ----------------- Grid files END -------------------



// Ajuste la hauteur au chargement et au redimensionnement de la fenêtre
window.addEventListener("load", adjustGridContainer);
window.addEventListener("resize", adjustGridContainer);


// -------------- Setting File --------------

// Pour éviter que cliquer sur "..." actionne le clique sur toute la ligne
$(document).on("click", ".setting", function (event) {
  event.stopPropagation();
});

// To show the file menu (three dots)
$(document).ready(function () {
  const menuTemplate = `
                <div class="file_menu" id="context-menu">
                    <div class="menu-item rename">Rename</div>
                    <div class="menu-item move">Move</div>
                    <div class="menu-item delete">Delete</div>
                </div>
            `;

  $(document).on("click", ".setting", function (event) {
    $("#context-menu").remove();
    $("body").append(menuTemplate);
    const menu = $("#context-menu");

    // Calculate the position of the button
    const buttonOffset = $(this).offset();
    const buttonWidth = $(this).outerWidth();

    // Set the position of the menu
    menu.css({
      top: buttonOffset.top - menu.height(),
      left: buttonOffset.left + buttonWidth - menu.outerWidth(),
    });

    // Toggle the menu visibility
    menu.toggleClass("show");
    menu.attr("data-index", $(this).closest(".file").attr("data-index"));
  });

  // Hide the menu when clicking outside
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".setting, #context-menu").length) {
      $("#context-menu").removeClass("show");
    }
  });
});

// -------------- Setting File END --------------


// ============= FILES END ====================== 


// ===============================================================================


// ============= FOLDER === ====================== 

// Dynamically create the folder dropdown
async function folderDropdown() {
  get_directories().then(function (data) {
    // Use .map() to create an array of HTML strings
    let dropdown_items = data.map(function (folder) {
      return `
        <span class="dropdown-item">${folder}</span>
                `;
    });

    // Join the array into a single string and set it as the HTML content
    let dropdown_html = dropdown_items.join("");

    // Append the new HTML to the existing content
    $(".dropdown-menu").html(dropdown_html);
  });
}

// -------------- Setting Folder --------------

// To show the folder menu (three dots)
$(document).ready(function () {
  const menuTemplate = `
                <div class="folder_menu" id="folder_menu">
                    <div class="menu-item folder_rename">Rename</div>
                    <div class="menu-item folder_delete">Delete</div>
                </div>
            `;

  $(document).on("click", ".folder_option", function (event) {
    $("#folder_menu").remove();
    $("body").append(menuTemplate);
    const menu = $("#folder_menu");

    // Calculate the position of the button
    const buttonOffset = $(this).offset();
    const buttonWidth = $(this).outerWidth();

    // Set the position of the menu
    menu.css({
      top: buttonOffset.top - menu.height(),
      left: buttonOffset.left + buttonWidth - menu.outerWidth(),
    });

    // Toggle the menu visibility
    menu.toggleClass("show");
    menu.attr("data-index", $(this).closest(".folder_elem").attr("data-index"));
  });

  // Hide the menu when clicking outside
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".folder_option, #folder_menu").length) {
      $("#folder_menu").removeClass("show");
    }
  });
});

// Close menu (file & folder)
$(document).on("keydown", function (event) {
  // Vérifier si la touche appuyée est la flèche droite (code 39)
  if (event.keyCode === 27) {
    var menus = $(".black_bg_form");
    $.each(menus, function (index, menu) {
      if ($(menu).css("display") === "block") {
        $(menu).css("display", "none");
      }
    });
  }
});

// -------------- Setting Folder END --------------

// Create New folder END
$(document).on("click", ".new_folder", function (event) {
  $("#folder_form").toggle();
});

$(document).on("click", ".create_folder", function () {
  let new_folder_name = $("#folder_name").val();
  
  $.ajax({
    url: "/gallery/new_folder?name=" + new_folder_name,
    type: "POST",
    success: function (response) {
      actionPopup("success", response.message);
      closeAndUpdateFolders();
    },
    error: function (xhr, status, error) {
      alert("Error: " + xhr.responseJSON.error);
    },
  });
  $("#folder_form").toggle(); // Une fois fini, on referme le popup
});
// Create New folder END

// Rename folder START
$(document).on("click", ".folder_rename", function (event) {
  $("#rename_folder").toggle();
  $("#rename_folder").attr(
    "data-index",
    $(this).closest(".folder_menu").attr("data-index")
  );
});

$(document).on("click", ".btn.rename_folder", function () {
  let new_name = $("#rename_folder #new_name").val();
  let folder = $("#rename_folder").attr("data-index");

  let data = {
    new_name: new_name,
    folder: folder,
  };

  $.ajax({
    url: "/folder/rename",
    type: "UPDATE",
    data: data,
    success: function (response) {
      // showSuccess("#rename_folder .form-popup", "Opération réussie!");
      actionPopup("success", response.message);
      closeAndUpdateFolders();
    },
    error: function (xhr, status, error) {
      console.log(error);
      alert("Error: " + xhr.responseJSON.error);
    },
  });
});
// Rename folder END

// Delete folder START
$(document).on("click", ".folder_delete", function (event) {
  $("#delete_folder").toggle();
  $("#delete_folder").attr(
    "data-index",
    $(this).closest(".folder_menu").attr("data-index")
  );
});

$(document).on("click", ".btn.delete_folder", function () {
  let folder = $("#delete_folder").attr("data-index");

  let data = {
    folder: folder,
  };

  $.ajax({
    url: "/folder/delete",
    type: "UPDATE",
    data: data,
    success: function (response) {
      actionPopup("success", response.message);
      closeAndUpdateFolders();
    },
    error: function (xhr, status, error) {
      alert(`Failed to update :`, error);
    },
  });
});
// Delete folder END



// ============= FOLDER END ====================== 



// =====================================================================


// ================== OTHER ======================

// Show the 'Create new' menu
$(document).on("click", ".new_elem_btn", function (e) {
  $(".new_elem_popup").toggle();
});

// Show and deal with the Folder dropdown menu
$(document).ready(function () {
  const dropdownToggle = $(".dropdown-toggle");
  const dropdownMenu = $(".dropdown-menu");

  dropdownToggle.on("click", async function () {
    await folderDropdown();
    dropdownMenu.toggleClass("active");
  });

  $(document).on("click", ".dropdown-item", function (event) {
    event.preventDefault();
    const selectedItemText = $(this).text();
    $(".dropdown-toggle span").text(selectedItemText);
    dropdownMenu.removeClass("active");
  });

  $(document).on("click", function (event) {
    if (!$(event.target).closest(".folder_dropdown").length) {
      dropdownMenu.removeClass("active");
    }
  });
});

// Sélection d'une box Drive
$(document).on("click", ".drive_box", function () {
  $(".drive_box.active").removeClass("active");
  $(this).addClass("active");
});

// Sélection d'un icone tout à gauche
$(document).on("click", ".icon_container", function () {
  $(".icon_container.active").removeClass("active");
  $(this).addClass("active");

  $(".menu_title h3").html($(this).attr("id"));
});

// Affiche un popup en cas de réussite d'une action
function actionPopup(status, text) {
  // Créer l'élément popup
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.right = "20px";
  popup.style.padding = "10px 20px";
  popup.style.color = "black";
  popup.style.fontWeight = 550;
  popup.style.borderRadius = "10px";
  popup.style.opacity = "0";
  popup.style.transition = "opacity 0.5s";
  popup.innerText = text;
  popup.style.zIndex = "999999999";

  if (status == "success") {
    popup.style.backgroundColor = "rgba(29, 195, 52, 0.8)";
  }
  if (status == "fail") {
    popup.style.backgroundColor = "rgba(183, 5, 5, 0.8)";
  }
  

  // Ajouter l'élément popup au corps du document
  document.body.appendChild(popup);

  // Faire apparaître le popup en fondu
  setTimeout(() => {
    popup.style.opacity = "1";
  }, 0);

  // Faire disparaître le popup après 3 secondes
  setTimeout(() => {
    popup.style.opacity = "0";
    // Supprimer l'élément du DOM après la transition
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 500);
  }, 4000);

  console.log(text);

}

function showSuccess(selector, text) {
  // Sélectionner l'élément avec jQuery
  const $element = $(selector);

  // Effacer tout le contenu de l'élément
  $element.empty();

  // Appliquer les styles nécessaires
  $element.css({
    width: "200px",
    height: "200px",
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center",
    "background-color": "#f0f0f0",
    "border-radius": "10px",
    position: "relative",
    transition: "opacity 0.5s",
    opacity: "1",
  });

  // Ajouter le cercle vert avec le "V" de succès
  const successCircle = $("<div></div>")
    .css({
      width: "100px",
      height: "100px",
      "background-color": "#4CAF50",
      "border-radius": "50%",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
    })
    .html('<span style="color: white; font-size: 48px;">✔</span>');

  // Ajouter le texte en dessous
  const successText = $("<div></div>")
    .css({
      "margin-top": "10px",
      color: "#333",
      "font-size": "16px",
      "text-align": "center",
    })
    .text(text);

  // Ajouter les éléments créés à l'élément sélectionné
  $element.append(successCircle, successText);

  // Faire disparaître l'élément après 3 secondes
  setTimeout(() => {
    $element.css("opacity", "0");
    // Supprimer l'élément du DOM après la transition
    setTimeout(() => {
      closePopup();
    }, 500);
  }, 2000);


  
}


// ================== OTHER end ======================
 