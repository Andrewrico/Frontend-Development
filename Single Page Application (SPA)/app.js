const Home = {
    template: `
        <div>
            <h1>Home Page</h1>
            <p>Welcome to the Home Page!</p>
        </div>
    `
};

const About = {
    template: `
        <div>
            <h1>About Page</h1>
            <p>This is the About Page.</p>
        </div>
    `
};

const app = Vue.createApp({
    data() {
        return {
            currentView: 'home'
        };
    },
    components: {
        home: Home,
        about: About
    }
});

app.mount('#app');
