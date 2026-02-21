var profileBtn = document.getElementById('profileBtn');
var profileMenu = document.getElementById('profileMenu');

if (profileBtn && profileMenu) {
    function showMenu() {
        profileMenu.style.display = 'block';
    }

    function hideMenu() {
        profileMenu.style.display = 'none';
    }

    profileBtn.onclick = function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (profileMenu.style.display === 'block') {
            hideMenu();
        } else {
            showMenu();
        }
    };

    document.onclick = function() {
        hideMenu();
    };

    document.onkeydown = function(event) {
        if (event.key === 'Escape') {
            hideMenu();
        }
    };
}
