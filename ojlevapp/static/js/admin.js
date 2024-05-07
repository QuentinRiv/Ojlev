$(window).on("load", function () {
  let isconnected = $("#name_connected").length > 0;
  if (!isconnected) {
    console.warn("User pas connecté !");
    return
  }

  let cover = $(".cover");
  cover.css("visibility", "visible");
  console.log("is connected : ", isconnected);
  var side = ""
  console.log(cover);

  $('.cover').click(function() {
        // Déclenche le clic sur l'input file caché
        side = this.id
        $('#hiddenImageInput').click();
    });

// Upload d'une image START
    $('#hiddenImageInput').change(function() {
        var fileData = new FormData();
        var imageFile = $(this)[0].files[0];

        if (imageFile) {
            fileData.append('image', imageFile);
            fileData.append('filename', side + '.png');
            // fileData.append('path', ''

            // Envoie le fichier en AJAX à l'URL '/upload'
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: fileData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log('Image uploaded successfully!');
                    // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
                },
                error: function(xhr, status, error) {
                    console.error('Failed to upload image:', error);
                }
            });
        } else {
            console.log('No file selected.');
        }
    });
// Upload d'une image FIN

// Modif des noms START
    let elements = $(".couple h3");
    elements.attr('contenteditable','true');
    elements.css("border", "1px dashed black")
    elements.on('blur', function() {
        console.log($(this).data('gender') === 'groom')
        var id = ($(this).data('gender') === 'groom') ? 1 : 2;
        let data = {id: id, 
                    names: $(this).text(),

                }

        console.log('Modification terminée :', data.names);
        $.ajax({
            url: '/partners',
            type: 'POST',
            data: data,
            success: function(response) {
                console.log('Names updated successfully!');
                // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
            },
            error: function(xhr, status, error) {
                console.error('Failed to update name:', error);
            }
        });
    });

});
