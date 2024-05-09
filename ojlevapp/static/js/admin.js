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
            fileData.append('path', 'ojlevapp/static/img');

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
    elements.css("border", "1px dashed black");
    elements.on('blur', function() {
        console.log($(this).data('gender') === 'groom')
        var id = ($(this).data('gender') === 'groom') ? 1 : 2;
        let data = {info: 'names',
                    id: id, 
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
    // Modif des noms END

    // Modif des descrptions START
    let descriptions = $(".couple p");
    descriptions.attr('contenteditable','true');
    descriptions.css("border", "1px dashed black");
    descriptions.on('blur', function() {
        console.log($(this).data('gender') === 'groom')
        var id = ($(this).data('gender') === 'groom') ? 1 : 2;
        let data = {info: 'description',
                    id: id, 
                    text: $(this).text(),
                }

        console.log('Modification à faire :', data);
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
    // Modif des descrptions END

    // Ajout/Retrait d'une histoire START
    // Ajout
    $(".addStoryItem.plus").on("click", function() {
        let newStep = $(".story-content .row");
    
        let lastChild = newStep.children().last().clone(); 
        let nbrChildren = newStep.children().length;
        console.log("Enfant num :", nbrChildren);
        let nouv = lastChild.clone()
        nouv.find('.story-item').attr("data-index", nbrChildren);
        nouv.find('img').attr("src", "../static/img/upcloud.png");
        nouv.find('h3').html("New text");
        nouv.find('span').html("01/01/2050");
        newStep.append(nouv); 

        $.ajax({
            url: '/story/new',
            type: 'GET',
            success: function(response) {
                console.log('Story added successfully!');
                // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
            },
            error: function(xhr, status, error) {
                console.error('Failed to add story:', error);
            }
        });
    })

    // Retrait
    $(".addStoryItem.minus").on("click", function() {
        let newStep = $(".story-content .row").children();
        newStep.last().remove(); 
    
        $.ajax({
            url: '/story/remove',
            type: 'GET',
            success: function(response) {
                console.log('Story removed successfully!');
                // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
            },
            error: function(xhr, status, error) {
                console.error('Failed to remove story:', error);
            }
        });
    });
    // Ajout/Retrait d'une histoire END

    // Modif d'une histoire START
    let histoires = $(".story-content .row h3, .story-content .row span, .story-content .row p");
    histoires.attr('contenteditable','true');
    histoires.css("border", "1px dashed black");

    histoires.on("blur", function() {
        let type = $(this).attr("class");
        let id = $(this).parent().parent().attr("data-index");
        let text = $(this).text();
        let data = {id, type, text}

        console.log('Modification à faire :', data);
        $.ajax({
            url: '/story',
            type: 'POST',
            data: data,
            success: function(response) {
                console.log('Story updated successfully!');
                // Vous pouvez ici ajouter des actions à exécuter après un upload réussi
            },
            error: function(xhr, status, error) {
                console.error('Failed to update story:', error);
            }
        });
    })
    // Modif d'une histoire END

    // Upload d'une image LoveStory START
    var id = ""
    $('.new-image-story').click(function() {
        // Déclenche le clic sur l'input file caché
        id = $(this).parent().parent().attr("data-index");
        $('#hiddenLoveImageInput').click();
    });

    $('#hiddenLoveImageInput').change(function() {
        var fileData = new FormData();
        var imageFile = $(this)[0].files[0];
        console.log(this);

        if (imageFile) {
            fileData.append('image', imageFile);
            fileData.append('filename', 'story-' + id + '.jpg');
            fileData.append('path', 'ojlevapp/static/img/story')

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
    // Upload d'une image LoveStory FIN

    // Modif du programme START
    let cards = $(".event-item-inner h3, .event-item-inner span, .event-item-inner p");
    cards.attr('contenteditable','true');
    cards.css("border", "1px dashed black");

    // Modif du programme END


});
