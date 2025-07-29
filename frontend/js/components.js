// Component Loader
class ComponentLoader {
    constructor() {
        this.components = {};
        this.loadCallbacks = [];
    }

    // Load component from file
    async loadComponent(name, path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.statusText}`);
            }
            const html = await response.text();
            this.components[name] = html;
            return html;
        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
            return '';
        }
    }

    // Insert component into DOM
    insertComponent(name, targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.error(`Target element not found: ${targetSelector}`);
            return;
        }

        const component = this.components[name];
        if (component) {
            target.innerHTML = component;
        } else {
            console.error(`Component not loaded: ${name}`);
        }
    }

    // Load and insert component
    async loadAndInsert(name, path, targetSelector) {
        await this.loadComponent(name, path);
        this.insertComponent(name, targetSelector);
    }

    // Add callback to execute after components are loaded
    onComponentsLoaded(callback) {
        this.loadCallbacks.push(callback);
    }

    // Execute all callbacks after components are loaded
    executeCallbacks() {
        this.loadCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error executing component callback:', error);
            }
        });
    }
}

// Global component loader instance
window.componentLoader = new ComponentLoader();

// Load common components
async function loadCommonComponents() {
    await Promise.all([
        window.componentLoader.loadAndInsert('header', '../components/header.html', '#header-placeholder'),
        window.componentLoader.loadAndInsert('footer', '../components/footer.html', '#footer-placeholder')
    ]);

    // Execute callbacks after components are loaded
    window.componentLoader.executeCallbacks();
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadCommonComponents();
}); 