class MobileNav {
    constructor(navId) {
        this.nav = document.getElementById(navId);
        this.buttons = [];
        this.indexedDBHelper = new IndexedDBHelper('VisitDB', 'visits');
        this.deviceID = getDeviceID();
        this.init();
    }

    async init() {
        await this.indexedDBHelper.init();
        this.buttons = this.nav.querySelectorAll('button[aria-haspopup="true"]');
        this.addEventListeners();
        this.addLinkListeners();
        this.addBackButtonListeners(); // Adding back button listeners
    }

    addEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', this.handleButtonClick.bind(this));
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

    async handleButtonClick(event) {
        const button = event.currentTarget;
        await this.indexedDBHelper.addClickRecord(this.deviceID, button.id);
        this.toggleMenu(event);
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