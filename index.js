const express = require('express')
const pg = require('pg')

const app = express()
// configs come from standard PostgreSQL env vars
// https://www.postgresql.org/docs/9.6/static/libpq-envars.html
const pool = new pg.Pool()

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

      // res.send(poiList);
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

      // res.send(poiList);
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

      // res.send(poiList);
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

      // res.send(poiList);
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

      // res.send(poiList);
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
