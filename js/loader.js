/* Drawing SVG Loader Logic */
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader-wrapper');
    const body = document.body;
    
    // Lock scroll immediately
    body.classList.add('loading');

    function hideLoader() {
        if (loader && !loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                body.classList.remove('loading');
                loader.style.display = 'none';
                loader.remove();
            }, 800);
        }
    }

    // Fallback timer
    const fallback = setTimeout(hideLoader, 4000);

    if (typeof anime !== 'undefined') {
        clearTimeout(fallback);

        const timeline = anime.timeline({
            easing: 'easeInOutQuart',
            complete: () => {
                // Final hold
                setTimeout(hideLoader, 500);
            }
        });

        // 1. Draw the path
        timeline.add({
            targets: '.loader-logo-path',
            strokeDashoffset: [anime.setDashoffset, 0],
            duration: 1800,
            delay: 200
        })
        // 2. Fill the logo
        .add({
            targets: '.loader-logo-path',
            fill: '#DAFD3D',
            duration: 800,
            offset: '-=400' // Smooth overlap
        })
        // 3. Small scale pop
        .add({
            targets: '.loader-logo-svg',
            scale: [0.96, 1],
            duration: 600,
            offset: '-=200'
        });
    } else {
        // Immediate fallback if anime fails
        setTimeout(hideLoader, 2000);
    }

    // Navbar scroll effect
    const nav = document.getElementById('main-nav');
    if (nav) {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
    }
});
