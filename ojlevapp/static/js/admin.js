function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

$(window).on("load", function () {
  let isconnected = $("#name_connected").length > 0;
  if (!isconnected) {
    console.warn("User pas connecté !");
    return;
  }

  let cover = $(".cover");
  cover.css("visibility", "visible");
  console.log("is connected : ", isconnected);
  var side = "";
  console.log(cover);

  $(".cover").click(function () {
    // Déclenche le clic sur l'input file caché
    side = this.id;
    $("#hiddenImageInput").click();
  });

  // Upload d'une image START
  $("#hiddenImageInput").change(function () {
    var fileData = new FormData();
    var imageFile = $(this)[0].files[0];

    if (imageFile) {
      fileData.append("image", imageFile);
      fileData.append("filename", side + ".png");
      fileData.append("path", "ojlevapp/static/img");

      // Envoie le fichier en AJAX à l'URL '/upload'
      $.ajax({
        url: "/upload",
        type: "POST",
        data: fileData,
        processData: false,
        contentType: false,
        success: function (response) {
          console.log("Image uploaded successfully!");
          // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
        },
        error: function (xhr, status, error) {
          console.error("Failed to upload image:", error);
        },
      });
    } else {
      console.log("No file selected.");
    }
  });
  // Upload d'une image FIN

  // Modif des partenaires START
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

    console.log("Data : ", data);

    $.ajax({
      url: "/update",
      type: "POST",
      data: data,
      success: function (response) {
        console.log(
          `-${table}- table updated successfully! => New Value : -${text_value}- for the attribute -${attribute_name}-`
        );
        // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
      },
      error: function (xhr, status, error) {
        console.error(`Failed to update -${table}-:`, error);
      },
    });
  });
  // Modif des partenaires END

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
        // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
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
        // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
      },
      error: function (xhr, status, error) {
        console.error("Failed to remove story:", error);
      },
    });
  });
  // Ajout/Retrait d'une histoire END

  // Upload d'une image LoveStory START
  var id = "";
  $(".new-image-story").click(function () {
    // Déclenche le clic sur l'input file caché
    id = $(this).parent().parent().attr("data-index");
    $("#hiddenLoveImageInput").click();
  });

  $("#hiddenLoveImageInput").change(function () {
    var fileData = new FormData();
    var imageFile = $(this)[0].files[0];
    console.log(this);

    if (imageFile) {
      fileData.append("image", imageFile);
      fileData.append("filename", "story-" + id + ".jpg");
      fileData.append("path", "ojlevapp/static/img/story");

      // Envoie le fichier en AJAX à l'URL '/upload'
      $.ajax({
        url: "/upload",
        type: "POST",
        data: fileData,
        processData: false,
        contentType: false,
        success: function (response) {
          console.log("Image uploaded successfully!");
          // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
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
    console.log("Enfant num :", nbrChildren);
    let nouv = lastChild.clone();
    nouv.find("img").attr("src", "../static/img/upcloud.png");
    nouv.find("h4").html("Witness' name");
    nouv.find("p").html("Role");
    newStep.append(nouv);

    const side = capitalizeFirstLetter($(nouv).attr("data-target"));

    $.ajax({
      url: "/witness/new?side="+side,
      type: "GET",
      success: function (response) {
        console.log("Witness added successfully!");
        // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
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
          // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
        },
        error: function (xhr, status, error) {
          console.error("Failed to remove witness:", error);
        },
      });
  });
  // Ajout/Retrait d'une histoire END

});



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