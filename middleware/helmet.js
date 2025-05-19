const helmet = require('helmet');

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'https://infragrid.v.network'],
            // Add other directives as needed
        },
    })
);
