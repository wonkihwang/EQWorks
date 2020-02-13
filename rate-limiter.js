const redis = require('redis');
const redisClient = redis.createClient();
const moment = require('moment');

module.exports = function (req, res, next) {
    redisClient.exists(req.headers.user, function (err, reply) {
        if (err) {
            console.log("There is a problem with Redis. Error: " + err);
            system.exit(0);
        }

        if (reply === 1) {
            redisClient.get(req.headers.user, function (err, redisRes) {
                let data = JSON.parse(redisRes);

                let currentTime = moment().unix()
                let lessThanMinuteAgo = moment().subtract(1, 'minute').unix();

                let RequestCountPerMinutes = data.filter(function (item) {
                    if (item.requestTime > lessThanMinuteAgo) {
                        return item.requestTime;
                    }
                })

                let thresHold = 0;

                RequestCountPerMinutes.forEach(function (item) {
                    thresHold = thresHold + item.counter;
                })

                if (thresHold >= 5) {
                    return res.json({
                        "error": 1,
                        "message": "throttle limit exceeded"
                    })
                } else {
                    let found = false;

                    data.forEach(function (elem) {
                        if (elem.requestTime) {
                            found = true;
                            elem.counter++;
                        }
                    });

                    if (!found) {
                        data.push({ requestTime: currentTime, counter: 1 })
                    }

                    redisClient.set(req.headers.user, JSON.stringify(data));
                    next();
                }
            })
        } else {
            let data = [];
            let requestData = {
                'requestTime': moment().unix(),
                'counter': 1
            }

            data.push(requestData);
            redisClient.set(req.headers.user, JSON.stringify(data));
            next();
        }
    })
}