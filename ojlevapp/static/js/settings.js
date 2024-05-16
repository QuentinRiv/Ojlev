

const color = [
    {
        name: 'pink',
        code: '#fb839e',
        url: 'css/pink.css'
    },

    {
        name: 'blue',
        code: '#3e99f4',
        url: 'css/blue.css'
    },

    {
        name: 'green',
        code: '#0dcebd',
        url: 'css/green.css'
    },

    {
        name: 'red',
        code: '#cc3a3b',
        url: 'css/red.css'
    },

    {
        name: 'yellow',
        code: '#ff9801',
        url: 'css/yellow.css'
    }
]

$(document).ready(function () {
    setColors();
    function setColors() {
        for (let i = 0; i < color.length; i++) {
            const span = document.createElement('span');
            span.style.backgroundColor = color[i].code;
            $(".colors").append(span);
        }
    }

    $(".colors span").click(function () {
        const index = $(this).index();
        $(".alternate-style").attr("href", "../static/"+ color[index].url);
    })

    //theme light & dark mode
    $(".theme-mode").change(function() {
        if ($(this).val() == "light") {
            $('body').removeClass("dark");
        }
        else {
            $('body').addClass("dark");
        }
    })

    // toggle setting box
    $(".s-toggle-btn").click(function () {
        $(".setting").toggleClass("open");
    })
})