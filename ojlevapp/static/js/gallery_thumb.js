
  // === Afficher la photo en grand ===
  const wHeight = $(window).height();
  $(".gallery-popup .gp-img").css("max-height", wHeight + "px");

  let imageSrc = "";

  $(".overview img").click(function () {
    imageSrc = $(this).attr("src");
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

  let showgallery = false;
  function gpSlideShow() {
    $(".gallery-popup .gp-img").fadeIn().attr("src", imageSrc);
    showgallery = true;

    const imageSrc_split = imageSrc.split("/");
    image_name = imageSrc_split.pop();
    image_parent = imageSrc_split.pop();

    // Pour obtenir les infos du mask
    $.ajax({
      url:
        "/gallery/image_info?image_name=" +
        image_name +
        "&image_parent=" +
        image_parent,
      type: "GET",
      success: function (data) {
        console.log("Succès pour avoir les infos :", data);
        var exactImgWidth = $(".gp-img").prop("naturalWidth");
        var exactImgHeight = $(".gp-img").prop("naturalHeight");

        $("#thumbselect").css(
          "top",
          Math.round(
            (data.thumb_top / exactImgHeight) * $(".gp-img").height() * 100
          ) / 100
        );
        $("#thumbselect").css(
          "left",
          Math.round(
            (data.thumb_left / exactImgWidth) * $(".gp-img").width() * 100
          ) / 100
        );
        $("#thumbselect").css(
          "width",
          Math.round(
            ((data.thumb_right - data.thumb_left) / exactImgWidth) *
              $(".gp-img").width() *
              100
          ) / 100
        );
        $("#thumbselect").css(
          "height",
          Math.round(
            ((data.thumb_bottom - data.thumb_top) / exactImgHeight) *
              $(".gp-img").height() *
              100
          ) / 100
        );

        console.log("Hauteur", data.thumb_bottom - data.thumb_top);
        console.log(" / ", exactImgHeight);
        console.log(" * ", $(".gp-img").height());
        console.log(
          " = ",
          Math.round(
            ((data.thumb_bottom - data.thumb_top) / exactImgHeight) *
              $(".gp-img").height() *
              100
          ) / 100
        );
        console.log("----------------------------------");
      },
      error: function (xhr, status, error) {
        let errorMessage = JSON.parse(xhr.responseText).error;
        alert(`Error: ${errorMessage}`);
      },
    });
  }

  $(".gp-close").click(function () {
    

    var exactImgWidth = $(".gp-img").prop("naturalWidth");
    var exactImgHeight = $(".gp-img").prop("naturalHeight");

    console.log($("#thumbselect").position());
    console.log("Height of mask:", $("#thumbselect").position().top + $("#thumbselect").height() + 6);
    console.log("Image height", $(".gp-img").height());
    console.log("exactImgHeight", exactImgHeight);

    //Grosse opération car la dimension affichée n'est pas la véritable
    let data = {
      img_path: imageSrc,
      top: Math.round($("#thumbselect").position().top / $(".gp-img").height() * exactImgHeight * 100) / 100,
      left: Math.round($("#thumbselect").position().left / $(".gp-img").width() * exactImgWidth * 100) / 100,
      right: Math.round(($("#thumbselect").position().left + $("#thumbselect").width() + 6) / $(".gp-img").width() * exactImgWidth * 100) / 100,
      bottom: Math.round(($("#thumbselect").position().top + $("#thumbselect").height() + 6)  / $(".gp-img").height() * exactImgHeight * 100) / 100,
    };

    console.log("Hauteur calculée : ", data.bottom);

    // Requete pour la modif de la DB côté Flask
    $.ajax({
      url: "/gallery/image_thumb",
      type: "POST",
      data: data,
      success: function (response) {
        console.log("Succès de l'update");
      },
      error: function (xhr, status, error) {
        console.error(`Failed to update :`, error);
      },
    });

    $(".gallery-popup").removeClass("open");
    showgallery = false;
    isDown = false;
  });


    var isDown = false;
    const resizer = $(".resizer");
    var offset = [0, 0];
    var mousePosition;
    var inmask = $("#thumbselect"); // Assurez-vous de remplacer #yourDivId par l'ID de votre div
    let aspectRatio = inmask.width() / inmask.height();

    $(resizer).on("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();

      isResizing = true;
      startWidth = inmask.width();
      startHeight = inmask.height();
      startX = e.clientX;
      startY = e.clientY;
      $(document).on("mousemove", onMouseMove);
      $(document).on("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
      if (isResizing) {
        let dx = e.clientX - startX;
        let newWidth = startWidth + dx;
        let newHeight = newWidth / aspectRatio;
        inmask.css({
          width: newWidth + "px",
          height: newHeight + "px",
        });
      }
    }

    function onMouseUp() {
      if (isResizing) {
        isResizing = false;
        $(document).off("mousemove", onMouseMove);
        $(document).off("mouseup", onMouseUp);
      }
    }

    $(inmask).on("mousedown", function (e) {
      if (!showgallery) {
        return;
      }
      isDown = true;
      offset = [
        $(inmask).position().left - e.clientX,
        $(inmask).position().top - e.clientY,
      ];
    });

    $(inmask).on("mouseup", function () {
      if (!showgallery) {
        return;
      }
      isDown = false;
    }); 

    $(document).on("mousemove", function (e) {
      if (!showgallery) {
        return;
      }
      if (isDown) {
        e.preventDefault();
        mousePosition = {
          x: e.clientX,
          y: e.clientY,
        };

        $(inmask).css({
          left: mousePosition.x + offset[0] + "px",
          top: mousePosition.y + offset[1] + "px",
        });
      }
    });




  // === FIN Afficher la photo en grand ===