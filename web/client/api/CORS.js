import url from 'url';
let corsDisabled = [];


export const setCORSDisabledUrl = (uri)=>{
    const urlParts = url.parse(uri); // func make
    const baseUrl = urlParts.protocol + "//" + urlParts.host + urlParts.pathname;

    if (!corsDisabled.includes(baseUrl)) {
        corsDisabled.push(baseUrl);
    }
};

export const shouldUseProxy = (uri)=>{
    const urlParts = url.parse(uri);
    const baseUrl = urlParts.protocol + "//" + urlParts.host + urlParts.pathname;
    return corsDisabled.includes(baseUrl);
};

export const testCors = (uri) => {
    if (shouldUseProxy(uri)) {
        return Promise.resolve(true);
    }
    return fetch(uri, {
        method: 'GET',
        mode: 'cors'
    })
        .then(() => {
            return false;
        })
        .catch(() => {
            setCORSDisabledUrl(uri);
            return true; // Assume CORS error or other issue

        });
};

