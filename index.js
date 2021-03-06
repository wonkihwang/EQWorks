const express = require('express')
const pg = require('pg')

// Tried to run rate-limiter.js using Redis, but couldn't run Redis on heroku
// const rateLimiter = require('./rate-limiter');

const app = express()
// configs come from standard PostgreSQL env vars
// https://www.postgresql.org/docs/9.6/static/libpq-envars.html
// const pool = new pg.Pool()

// Added Postgres environment variables for connectivity into index.js to run the app on heroku
const pool = new pg.Pool({
  user: 'readonly',
  host: 'work-samples-db.cx4wctygygyq.us-east-1.rds.amazonaws.com',
  database: 'work_samples',
  password: 'w2UIO@#bg532!',
  port: 5432,
})

// Used EJS to populate data on the pages
const expressLayouts = require('express-ejs-layouts');

const queryHandler = (req, res, next) => {
  pool.query(req.sqlQuery).then((r) => {
    return res.json(r.rows || [])
  }).catch(next)
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('layout', 'layout');

app.use(express.static('views'));
app.use(expressLayouts);

app.get('/', (req, res) => {
  // res.send('Welcome to EQ Works 😎')
  res.render('index')
})

app.get('/events/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, events
    FROM public.hourly_events
    ORDER BY date, hour
    LIMIT 168;
  `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var hourlyEventsList = result.rows;

      res.render('datatable', {
        'title': 'HOURLY EVENTS',
        'numofcol': Object.keys(hourlyEventsList[0]).length,
        'headerlist': Object.keys(hourlyEventsList[0]),
        'datalist': hourlyEventsList
      });
    })

  })
  //   return next()
  // }, queryHandler)
})

app.get('/events/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, SUM(events) AS events
    FROM public.hourly_events
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var dailyEventsList = result.rows;

      res.render('datatable', {
        'title': 'DAILY EVENTS',
        'numofcol': Object.keys(dailyEventsList[0]).length,
        'headerlist': Object.keys(dailyEventsList[0]),
        'datalist': dailyEventsList
      });
    })

  })
  //   return next()
  // }, queryHandler)
})

app.get('/stats/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, impressions, clicks, revenue
    FROM public.hourly_stats
    ORDER BY date, hour
    LIMIT 168;
  `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var hourlyStatsList = result.rows;

      res.render('datatable', {
        'title': 'HOURLY STATUS',
        'numofcol': Object.keys(hourlyStatsList[0]).length,
        'headerlist': Object.keys(hourlyStatsList[0]),
        'datalist': hourlyStatsList
      });
    })

  })
  //   return next()
  // }, queryHandler)
})

app.get('/stats/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date,
        SUM(impressions) AS impressions,
        SUM(clicks) AS clicks,
        SUM(revenue) AS revenue
    FROM public.hourly_stats
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var dailyStatsList = result.rows;

      res.render('datatable', {
        'title': 'DAILY STATUS',
        'numofcol': Object.keys(dailyStatsList[0]).length,
        'headerlist': Object.keys(dailyStatsList[0]),
        'datalist': dailyStatsList
      });
    })

  })
  //   return next()
  // }, queryHandler)
})

app.get('/poi', (req, res, next) => {
  req.sqlQuery = `
    SELECT *
    FROM public.poi;
  `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var poiList = result.rows;

      res.render('datatable', {
        'title': 'POI',
        'numofcol': Object.keys(poiList[0]).length,
        'headerlist': Object.keys(poiList[0]),
        'datalist': poiList
      });
    })

  })
  // return next()
  // }, queryHandler)
})

app.get('/chart/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, events
    FROM public.hourly_events
    ORDER BY date, hour
    LIMIT 168;
  `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var eventList = result.rows;

      res.render('events', {
        'datatype': "hourly",
        'datalist': eventList
      });
    })
  })
})

app.get('/chart/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, SUM(events) AS events
    FROM public.hourly_events
    GROUP BY date
    ORDER BY date
    LIMIT 7;
    `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var eventList = result.rows;

      res.render('events', {
        'datatype': "daily",
        'datalist': eventList
      });
    })
  })
})

app.get('/geo', (req, res, next) => {
  req.sqlQuery = `
    SELECT poi.poi_id, poi.name, poi.lat, poi.lon, hourly_events.date, hourly_events.hour, hourly_events.events
    FROM poi
    INNER JOIN hourly_events
    ON poi.poi_id = hourly_events.poi_id
    ORDER BY poi.poi_id;
    `

  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Fail to connect: " + err);
    }

    client.query(req.sqlQuery, function (err, result) {
      if (err) throw err;

      var dataList = result.rows;

      res.render('geo', { 'datalist': dataList });
    })
  })
})

// app.use(rateLimiter);

app.listen(process.env.PORT || 5555, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(`Running on ${process.env.PORT || 5555}`)
  }
})

// last resorts
process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`)
  process.exit(1)
})
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  process.exit(1)
})
