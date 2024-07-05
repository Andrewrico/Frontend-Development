class MobileNav {
    constructor(navId) {
        this.nav = document.getElementById(navId);
        this.buttons = [];
        this.init();
    }

    init() {
        this.buttons = this.nav.querySelectorAll('button[aria-haspopup="true"]');
        this.addEventListeners();
        this.addLinkListeners();
    }

    addEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', this.toggleMenu.bind(this));
        });

        document.addEventListener('click', (event) => {
            if (!this.nav.contains(event.target)) {
                this.closeAllMenus();
            }
        });
    }

    addLinkListeners() {
        const links = this.nav.querySelectorAll('a[role="menuitem"]');
        links.forEach(link => {
            link.addEventListener('click', () => {
                this.closeAllMenus();
            });
        });
    }

    toggleMenu(event) {
        const button = event.currentTarget;
        const expanded = button.getAttribute('aria-expanded') === 'true';
        
        if (expanded) {
            this.closeMenu(button);
        } else {
            this.closeSiblingMenus(button);
            this.openMenu(button);
        }
    }

    openMenu(button) {
        button.setAttribute('aria-expanded', 'true');
        const menu = document.getElementById(button.getAttribute('aria-controls'));
        menu.hidden = false;
        // Force reflow to enable transition
        requestAnimationFrame(() => {
            menu.classList.add('visible');
        });
    }

    closeMenu(button) {
        button.setAttribute('aria-expanded', 'false');
        const menu = document.getElementById(button.getAttribute('aria-controls'));
        menu.classList.remove('visible');
        menu.addEventListener('transitionend', () => {
            menu.hidden = true;
        }, { once: true });
    }

    closeAllMenus() {
        this.buttons.forEach(button => {
            this.closeMenu(button);
        });
    }

    closeSiblingMenus(button) {
        const parentMenu = button.closest('ul[role="menu"], ul[role="menubar"]');
        parentMenu.querySelectorAll('button[aria-expanded="true"]').forEach(sibling => {
            if (sibling !== button) {
                this.closeMenu(sibling);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MobileNav('mobile-nav');
});