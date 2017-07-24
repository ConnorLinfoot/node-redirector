const express = require('express');

// Functions
function show_help() {
    console.log('Options:');
    console.log('   -h      Shows this message');
    console.log('   -u      The URL to redirect users too');
    console.log('   -ur     The URL to redirect users too using regex to support multiple URL\'s'); // Example of this is "node index -ur CratesPlus=https://github.com/ConnorLinfoot/CratesPlus,https://github.com/ConnorLinfoot -p 80,8080"
    console.log('   -p      Ports to listen on, separated by commas, defaults to 80');
    console.log('   -c      Code to redirect with, defaults to 301');
    process.exit(0);
}

// Process args
const args = {
    ports: 80,
    code: 301
};

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
        case '-ur':
        case '-urls':
        case '-urlregex':
        case '-urlsregex':
            next_var = 'urls';
            break;
        case '-port':
        case '-ports':
        case '-p':
            next_var = 'ports';
            break;
        case '-code':
        case '-c':
            next_var = 'code';
            break;
    }
}

if( (args.url == undefined || args.url == null) && args.urls == undefined || args.urls == null ) {
    console.error('No URL(s) specified!');
    process.exit(0);
} else if( args.ports == undefined || args.ports == null ) {
    console.error('No port(s) specified!');
    process.exit(0);
}

if( args.urls != undefined && args.urls != null ) {
    args.urls = args.urls.split(',');
}

args.code = parseInt(args.code);

function handle_redirect(req, res) {
    let url = args.url;
    if( args.urls != undefined && args.urls != null ) {
        for( let regex_url of args.urls ) {
            if( regex_url.split('=').length == 1 ) {
                url = regex_url;
                break;
            }

            const regex = new RegExp(regex_url.split('=')[0], 'i');
            if( regex.test(req.url) ) {
                url = regex_url.split('=')[1];
                break;
            }

        }
    }

    console.log('');
    console.log('Redirecting ' + req.url + ' to ' + url + ' (IP: ' + req.connection.remoteAddress + ')');
    res.redirect(args.code, url);
}

const app = express();
app.get('*', handle_redirect).post('*', handle_redirect);

const ports = args.ports.split(',');

for( let port of ports ) {
    app.listen(port, function() {
        console.log('Redirector is successfully listening on port ' + port);
    });
}