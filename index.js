const express = require('express');

// Functions
function show_help() {
    console.log('Options:');
    console.log('   -h      Shows this message');
    console.log('   -u      The URL to redirect users too');
    console.log('   -p      Ports to listen on, separated by commas');
    process.exit(0);
}


// Process args
const args = {};
if( process.argv.slice(2).length == 0 ) {
    show_help();
}

let next_var = null;
for( let arg of process.argv.slice(2) ) {
    if( next_var != null ) {
        args[next_var] = arg;
        next_var = null;
        continue;
    }
    switch( arg.toLowerCase() ) {
        case '-h':
        case '-help':
            show_help();
            break;
        case '-u':
        case '-url':
            next_var = 'url';
            break;
        case '-port':
        case '-ports':
        case '-p':
            next_var = 'ports';
            break;
    }
}

if( args.url == undefined || args.url == null ) {
    console.error('No URL specified!');
    process.exit(0);
} else if( args.ports == undefined || args.ports == null ) {
    console.error('No port(s) specified!');
    process.exit(0);
}

function handle_redirect(req, res) {
    console.log('');
    console.log('Redirecting ' + req.url + ' to ' + args.url + ' (IP: ' + req.connection.remoteAddress + ')');
    res.redirect(301, args.url);
}

const app = express();
app.get('*', handle_redirect).post('*', handle_redirect);

const ports = args.ports.split(',');

for( let port of ports ) {
    app.listen(port, function() {
        console.log('Redirector is successfully listening on port ' + port);
    });
}