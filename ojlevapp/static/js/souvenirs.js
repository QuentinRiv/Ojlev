$(document).ready(function () {
    $(".icon_container").on("click", function () {
        $(".icon_container").removeClass("active");
        $(this).addClass("active");

        $(".menu_title h3").html($(this).attr("id"));
        console.log($(this).attr("id"));
    });

    $(".drive_box").on("click", function () {
      $(".drive_box").removeClass("active");
      $(this).addClass("active");
    });
})


function adjustGridContainer() {
    const fileRows = $('.file');    // Tous les fichiers
    const fileRowHeight = fileRows[0].clientHeight; // Hauteur totale d'une ligne avec padding (ttes les lignes ont la m^ taille)
    const rowGap = 10; // Espace entre les lignes
    const necessaryHeight = fileRowHeight + rowGap;
    
    // Les div à ne pas prendre en compte dans le calcul des tailles
    const fileHeader = $('.file_header');    // Le header (type, name, size, ...)
    const filesText = $('.files_text'); // Le conteneur avec le texte View all

    const filesPart = $('.files_part'); // Le conteneur qui contient tout ça
    const filesContainer = $('.files_container'); // Le conteneur de grille

    // Calcul de la hauteur disponible dans .files_part
    var availableHeight = filesPart.height() - (filesText.height() + fileHeader.height());

    console.log("==>", availableHeight);

    fileRows.each(function(index, fileRow) {
        console.log("->", fileRow);     
        console.log("Espace restant :", availableHeight);
        if (availableHeight > necessaryHeight) {
            // $(fileRow).css("display", "block");
            availableHeight -= necessaryHeight;
        }
        else {
            $(fileRow).css("display", "none");
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
        var allChecked = $('.childShare').length === $('.childCheckbox:checked').length;
        $('#mainCheckbox').prop('checked', allChecked); // Met à jour le checkbox principal selon que tous les enfants sont cochés
    });
});
