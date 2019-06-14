var request = require("request");
var fs = require('fs');

function getVideoName(bodyStr){
    let nameReg = /<span id="eow-title" class="watch-title" dir="ltr" title=".*">/
    if(nameReg.test(bodyStr))
        return nameReg.exec(bodyStr).toString().slice(58, -2);
    return null;
}

function getVideoAuthor(bodyStr){
    let userInfoReg = /<div class="yt-user-info">.*<\/div>/s
    let aReg = /<a href=".*>.*<\/a>/
    let aRepReg = /<a.*"\s*>/s;
    if(userInfoReg.test(bodyStr)){
        let bodystring = userInfoReg.exec(bodyStr).toString();
        bodystring = aReg.exec(bodystring).toString();
        bodystring = bodystring.replace(aRepReg, '').replace('</a>', '');
        return bodystring;
    }
    return null;
}

function getVideoId(bodyStr){
    let idReg = /<meta itemprop="videoId" content=".*">/
    if(idReg.test(bodyStr)){
        let bstr = idReg.exec(bodyStr).toString();
        bstr = bstr.slice(34, -2);
        return bstr;
    }
    return null;
}

function getVideoThumbnail(bodyStr){
    let vidId = getVideoId(bodyStr);
    if(vidId){
        return `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`
    }
    return null;
}

var ytRequest = {
    getVideoInfo:(uri) => {
        let promise1 = new Promise(
            (resolve, reject) => {
                request({uri: uri}, (error, respponse, body) => {
                    if(respponse.statusCode === 200 && body){
                        resolve({
                            title:getVideoName(body),
                            author:getVideoAuthor(body),
                            id:getVideoId(body),
                            thumb:getVideoThumbnail(body)
                        })
                    }
                    else{
                        reject('request failed')
                    }
                });
            }
        );
        return promise1;
    }
}

module.exports = ytRequest;
