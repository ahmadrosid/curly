import words from 'shellwords'

export default function parseCurl(source = "") {
    if (0 != source.indexOf("curl ")) return;

    const args = rewrite(words.split(source));
    let out = { method: 'GET', header: {} };
    let state = ''

    args.forEach(function (arg) {
        switch (true) {
            case isURL(arg):
                out.url = arg
                break;

            case arg == '-A' || arg == '--user-agent':
                state = 'user-agent'
                break;

            case arg == '-H' || arg == '--header':
                state = 'header'
                break;

            case arg == '-d' || arg == '--data' || arg == '--data-ascii' || arg == '--data-raw':
                state = 'data'
                break;

            case arg == '-u' || arg == '--user':
                state = 'user'
                break;

            case arg == '-I' || arg == '--head':
                out.method = 'HEAD'
                break;

            case arg == '-X' || arg == '--request':
                state = 'method'
                break;

            case arg == '-b' || arg == '--cookie':
                state = 'cookie'
                break;

            case arg == '--compressed':
                out.header['Accept-Encoding'] = out.header['Accept-Encoding'] || 'deflate, gzip'
                break;

            case !!arg:
                switch (state) {
                    case 'header':
                        var field = parseField(arg)
                        out.header[field[0]] = field[1]
                        state = ''
                        break;
                    case 'user-agent':
                        out.header['User-Agent'] = arg
                        state = ''
                        break;
                    case 'data':
                        if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST'
                        out.header['Content-Type'] = out.header['Content-Type'] || 'application/x-www-form-urlencoded'
                        // out.body = out.body
                        //     ? out.body + '&' + arg
                        //     : arg
                        out.body = arg
                        state = ''
                        break;
                    case 'user':
                        out.header['Authorization'] = 'Basic ' + btoa(arg)
                        state = ''
                        break;
                    case 'method':
                        out.method = arg
                        state = ''
                        break;
                    case 'cookie':
                        out.header['Set-Cookie'] = arg
                        state = ''
                        break;
                }
                break;
        }
    })

    {
        // remove 'header' replace it to 'headers'
        out.headers = out.header
        delete out.header;
        try {
            const parsedBody = JSON.parse(out.body)
            out.data = parsedBody
        } catch (e) {
            console.log(e)
            out.data = out.body
        } finally {
            delete out.body;
        }
    }

    return out
}

function rewrite(args = []) {
    return args.reduce((arg, a) => {
        if (0 == a.indexOf('-X')) {
            args.push('-X')
            args.push(a.slice(2))
        } else {
            args.push(a)
        }

        return args
    }, [])
}

function parseField(s) {
    return s.split(/: (.+)/)
}

function isURL(s) {
    // TODO: others at some point
    return /^https?:\/\//.test(s)
}
