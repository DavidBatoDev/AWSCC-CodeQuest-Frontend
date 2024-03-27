function handleAnimation(pageId) {
    var page = document.getElementById(pageId);
    var scrollPosition = window.scrollY;
    var pageTop = page.offsetTop;
    var pageBottom = pageTop + page.offsetHeight;
    var threshold = window.innerHeight * 0.8;

    if (scrollPosition + threshold >= pageTop && scrollPosition <= pageBottom) {
        if (!page.classList.contains('animated')) {
            page.querySelectorAll('*').forEach(function(element) {
                element.classList.add('animate-slide-up');
            });
            page.classList.add('animated');
        }
    } else {
        page.querySelectorAll('*').forEach(function(element) {
            element.classList.remove('animate-slide-up');
            element.classList.add('hidden');
        });
        page.classList.remove('animated');
    }
}

document.querySelectorAll('.page').forEach(function(page) {
    window.addEventListener('scroll', function() {
        handleAnimation(page.id);
    });
});

document.querySelectorAll('.page').forEach(function(page) {
    window.addEventListener('scroll', function() {
        handleAnimation(page.id);
    });
});

// Scroll effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        window.scrollTo({
            top: target.offsetTop,
            behavior: 'smooth'
        });
        asideMobileElement.classList.remove('open');
        hamburgerElement.style.display = 'block';
    });
});

// elements
const hamburgerElement = document.querySelector('.hamburger-menu');
const closeElement = document.querySelector('.close-aside');
const asideMobileElement = document.querySelector('.aside--mobile');

// functions
function toggleMenu() {
    asideMobileElement.classList.add('open');
    hamburgerElement.style.display = 'none'; 
}

function closeMenu() {
    asideMobileElement.classList.remove('open');
    hamburgerElement.style.display = 'block';
}

// events
hamburgerElement.addEventListener('click', toggleMenu);
closeElement.addEventListener('click', closeMenu);