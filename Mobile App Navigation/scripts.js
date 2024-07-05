class MobileNav {
    constructor(navId) {
        this.nav = document.getElementById(navId);
        this.buttons = [];
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;
        this.init();
    }

    init() {
        this.buttons = this.nav.querySelectorAll('button[aria-haspopup="true"]');
        this.addEventListeners();
        this.addLinkListeners();
        this.addBackButtonListeners(); // Adding back button listeners
    }

    addEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', this.toggleMenu.bind(this));
            button.addEventListener('touchstart', this.handleTouchStart.bind(this));
            button.addEventListener('touchmove', this.handleTouchMove.bind(this));
            button.addEventListener('touchend', this.handleTouchEnd.bind(this));
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

    addBackButtonListeners() {
        const backButtons = this.nav.querySelectorAll('.back-button');
        backButtons.forEach(button => {
            button.addEventListener('click', this.closeParentMenu.bind(this));
        });
    }

    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
        this.touchStartTime = new Date().getTime();
    }

    handleTouchMove(event) {
        this.touchEndY = event.touches[0].clientY;
    }

    handleTouchEnd(event) {
        const touchDuration = new Date().getTime() - this.touchStartTime;
        const touchDistance = this.touchEndY - this.touchStartY;

        if (touchDuration > 1000 && touchDistance > 50) {
            const button = event.currentTarget;
            const expanded = button.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                this.closeMenu(button);
            }
        }
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
            menu.classList.add('menu-visible');
            menu.classList.remove('menu-hidden');
        });
    }

    closeMenu(button) {
        button.setAttribute('aria-expanded', 'false');
        const menu = document.getElementById(button.getAttribute('aria-controls'));
        menu.classList.remove('menu-visible');
        menu.classList.add('menu-hidden');
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

    closeParentMenu(event) {
        const button = event.currentTarget;
        const parentMenu = button.closest('ul[role="menu"]');
        const parentButton = this.nav.querySelector(`button[aria-controls="${parentMenu.id}"]`);
        if (parentButton) {
            this.closeMenu(parentButton);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new MobileNav('mobile-nav'));
