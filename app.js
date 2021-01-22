const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * initial and temprory acess and refresh tokens. they will be changed once getRefreshedTokens called.
 **/

let accessToken = '6006a6f1006b0433da56bebc|8f451d0759f8f184e959315fc6f14402';
let refreshToken = '6006a6f1006b0433da56bebc|ca235746e341174c11fa55bf56f4319b';

/** client id and client secret for my user account **/

const clientId = '60094516b5a6421b083186d3';
const clientSecret = 'v2vsXKA6QtUoFyjh5l3GVxdlxx4B9zsbJXjTb4oh3Y';

/** maximum number of trying getting new tokens and temperature informations **/
const MAX_RETRY = 10;

let tries = 0;

/**
 *
 *   calculate the min,max,average values from input array.
 *   key of each element is the timestamp, value is an array,
 *   first element represent temprature.
 *   if the tokens are invalid or expired, it calls getRefreshedTokens to update the tokens.
 *
 **/
function calculateMinMaxAverage(input) {
    console.log('#####################################')
    console.log('Calculating Min, Max, Average')

    let minValue = Infinity;
    let maxValue = -Infinity;
    let average = 0;

    for (let [key, value] of Object.entries(input)) {
        value = value[0]
        if (value < minValue) {
            minValue = value;
            minKey = key;
        }
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
        average += value;
    }

    average = average / Object.keys(input).length;

    return {
        'min': [minKey, minValue],
        'max': [maxKey, maxValue],
        'average': average
    }

}

/**
 *
 *   perform post request to 'getmeasure' to get temprature data.
 **/

function getTemprature() {
    console.log('#####################################')
    console.log('Getting temprature information')

    const deviceId = '70:ee:50:3f:13:36';
    const moduleId = '02:00:00:3f:0a:54';

    /** get time stamp in seconds **/

    const now = Math.round(new Date() / 1000);
    const sevenDaysAgo = Math.round((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

    let headers = new fetch.Headers();
    headers.append('accept', 'application/json');
    headers.append('Authorization', 'Bearer ' + accessToken);


    const url = 'https://api.netatmo.com/api/getmeasure?';
    const params = new URLSearchParams({
        device_id: deviceId,
        module_id: moduleId,
        scale: 'max',
        type: 'temperature',
        date_begin: sevenDaysAgo,
        date_end: now,
        optimize: 'false',
        real_time: 'false',
    });

    let options = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    fetch(url + params, options)
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                console.log('Temprature Information retrived successfully')
                console.log(calculateMinMaxAverage(result.body), '\n');
                tries = 0;
            } else {
                console.log('bad result', result)
                /** 3 : Access Token expired, 2 : invalid Access Token **/
                if ((result.error.code === 3 || result.error.code === 2) && tries < MAX_RETRY) {
                    tries++;
                    getRefreshedTokens();
                }
            }
        })
        .catch(error => {
            console.log('error', error)
            /** try updating access and refresh tokens if it is not beyond MAX_RETRY **/
            if (tries < MAX_RETRY) {
                tries++;
                getRefreshedTokens();
            }
        });

}

/**
 *
 *   update access and refresh tokens if they are invalid or expired.
 **/
function getRefreshedTokens() {

    console.log('#####################################')
    console.log('Getting new refresh and access token.')

    let form = new FormData();
    form.append('grant_type', 'refresh_token');
    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);
    form.append('refresh_token', refreshToken);

    let options = {
        method: 'POST',
        body: form,
    };

    const url = 'https://api.netatmo.com/oauth2/token?';

    const params = new URLSearchParams({
        Host: 'api.netatmo.com',
        Content_type: 'application/x-www-form-urlencoded;charset=UTF-8'
    });

    fetch(url + params, options)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            if (!result.error) {
                accessToken = result.access_token;
                refreshToken = result.refresh_token;
                getTemprature();
            }else{
                console.log('getRefreshedTokens error: ', result)
                getNewTokens();
            }
        })
        .catch(error => {
            console.log('getRefreshedTokens error: ', error)
            getNewTokens();
        });
}


/**
 *
 *   get new access and refresh token by email and password
 */
function getNewTokens() {
    console.log('#####################################')
    console.log('Getting new tokens by email and password.')

    const email = 'saeeedmirzaee@gmail.com';
    const base64Password = 'JFNhbGFtMTIzNDU=';

        let form = new FormData();
    form.append('grant_type', 'password');
    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);
    form.append('username', email);
    form.append('password', Buffer.from(base64Password, 'base64').toString('ascii'));

    let options = {
        method: 'POST',
        body: form,
    };

    const params = new URLSearchParams({
        Host: 'api.netatmo.com',
        Content_type: 'application/x-www-form-urlencoded;charset=UTF-8'
    });

    const url = 'https://api.netatmo.com/oauth2/token?';

    fetch(url + params, options)
        .then(response => response.json())
        .then(result => {
            console.log('result:', result)
            if (!result.error) {
                accessToken = result.access_token;
                refreshToken = result.refresh_token;
                getTemprature();
            }
        })
        .catch(error => console.log('error', error));
}


getTemprature();