var request = require('request');
var cheerio = require('cheerio')
var axios = require('axios')
var _ = require('lodash')
var fs = require('fs');
let uids = fs.readFileSync('list_uid.txt').toString().split('\n')
let uids_scaned = fs.readFileSync('list_uid_scaned.txt').toString()
let headers = {
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'http://izfabo.com/infouid/?tk=100010247735890&add=checkinfo',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Cookie': '_ga=GA1.2.1443418653.1526108578; __cfduid=daee98af842e29193fc3924d08250d70b1526294849; PHPSESSID=5j1g9u10s8i7t0unbpgghskub2; _gid=GA1.2.905821312.1529775046; account_id=1847; special=EAAAAAYsX7TsBAKNO7eFRYjgLbaDIN6spMsez2BBd4dZC0504oXKsOd4ZA0nRzjX590pxrU0Tzc4bgPL8ZCryoL8wpIaGHjQYIP5kW2L77JHRqNk5IUT1LHMim8hZACZAAqktwsSTiBQ4MyDLZBmBL9HNnqmZCfPJoi2jnVPZBMFndgZDZD; profile_id=2913; email=nguyenthithutrang7621%40gmail.com'
};

let arrUIDs = _.chunk(uids, 15)
start()
async function start() {
    for (let i = 0; i < arrUIDs.length; i++) {
        let arrUID = arrUIDs[i]
        console.log(new Date(),'Getting ', arrUID)
        let arrResult = await getByArrUID(arrUID)
        fs.appendFileSync('result/phone_friend.txt', arrResult.join('\n') + '\n')
        console.log(i, arrUIDs.length, arrResult.length, 'Saved')
    }
}

function getByArrUID(arrUID) {
    let dem = 0
    let arrResult = []
    return new Promise((resolve, reject) => {
        arrUID.forEach(async (uid, index) => {
            if (uids_scaned.includes(uid)) {
                console.log(uid + ' is scaned')
                dem++
                if (dem === arrUID.length) {
                    resolve(arrResult)
                }
            } else {
                let data = await getByUID(uid)
                if (data.length) {
                    arrResult = arrResult.concat(data)
                    dem++
                    if (dem === arrUID.length) {
                        resolve(arrResult)
                    }
                } else {
                    dem++
                    if (dem === arrUID.length) {
                        resolve(arrResult)
                    }
                }
            }
        });
    })
}



function getByUID_(uid) {
    let options = {
        url: 'http://izfabo.com/infouid/?tk=' + uid + '&add=checkinfo',
        headers: headers,
        timeout: 30000
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                let arrResult = []
                let $ = cheerio.load(body)
                let items = $('#table1').first().find('tr')
                if (items.length) {
                    items.each(function (i, ele) {
                        let datas = $(ele).find('td')
                        let uid = $(datas[1]).text()
                        let phone = $(datas[6]).text()
                        if (phone != '__') {
                            arrResult.push(uid + '_' + phone)
                        }
                        if (i + 1 == items.length && arrResult.length) {
                            resolve(arrResult)
                        }
                    })
                } else {
                    console.log(uid, 'Fail', 'Status code: ' + response.statusCode)
                    resolve([])
                }
            } else {
                console.log(response ? response.statusCode : 'Not have Response', 'Loi cmnr' + error)
                resolve([])
            }
        });
    })
}
function getByUID(uid) {
    return new Promise((resolve, reject) => {
        axios({
            url: 'http://izfabo.com/infouid/?tk=' + uid + '&add=checkinfo',
            method: 'get',
            headers: headers,
            timeout: 300000
        }).then(res => {
            let body = res.data
            let arrResult = []
            let $ = cheerio.load(body)
            let items = $('#table1').first().find('tr')
            if (items.length) {
                items.each(function (i, ele) {
                    let datas = $(ele).find('td')
                    let uid = $(datas[1]).text()
                    let phone = $(datas[6]).text()
                    if (phone != '__') {
                        arrResult.push(uid + '_' + phone)
                    }
                    if (i + 1 == items.length && arrResult.length) {
                        resolve(arrResult)
                    }
                })
            } else {
                console.log(uid, 'Fail', 'Status code: ' + response.statusCode)
                resolve([])
            }
        }).catch(e => {
            console.log(uid, e + ' Loi cmnr')
            resolve([])
        })
    })
}



