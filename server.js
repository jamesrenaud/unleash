var logger = require('./lib/logger');
var defaultDatabaseUri = require('./lib/databaseConfig').getDatabaseUrl();

function start(options) {
    options = options || {};

    var db = require('./lib/db/dbPool')(options.databaseUri || defaultDatabaseUri);
    // Database dependecies (statefull)
    var eventDb = require('./lib/db/event')(db);
    var EventStore = require('./lib/eventStore');
    var eventStore = new EventStore(eventDb);
    var featureDb = require('./lib/db/feature')(db, eventStore);
    var strategyDb = require('./lib/db/strategy')(db, eventStore);

    var config = {
        baseUriPath: process.env.BASE_URI_PATH || '',
        port: process.env.HTTP_PORT || process.env.PORT || 4242,
        db: db,
        eventDb: eventDb,
        eventStore: eventStore,
        featureDb: featureDb,
        strategyDb: strategyDb
    };


    var app = require('./app')(config);

    var server = app.listen(app.get('port'), function() {
        logger.info('unleash started on ' + app.get('port'));
    });

    if (app.get('env') === 'development') {
        app.use(require('errorhandler')());

        var webpack = require('webpack');
        var webpackDevMiddleware = require('webpack-dev-middleware');
        var webpackConfig = require('./webpack.config');
        var compiler = webpack(webpackConfig);

        app.use(config.baseUriPath, webpackDevMiddleware(compiler, {
            publicPath: '/js',
            noInfo: true
        }));
    }

    return {
        app: app,
        server: server
    };
}

process.on('uncaughtException', function(err) {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
});

module.exports = {
    start: start
};
