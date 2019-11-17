// dependencies
const bodyParser = require('body-parser')
const express    = require('express')
const mongodb    = require('mongodb')


// library intances
const MongoClient = mongodb.MongoClient
const app         = express()


// config
const APP_PORT = 3000

const DB_HOST  = 'localhost'
const DB_PORT  = '27017'
const DB_NAME  = 'kshort'


// connect to database
function connect_database(callback) {
    const url     = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`
    const options = { useUnifiedTopology: true }

    MongoClient.connect(url, options, (error, db) => {
        if (error)
            throw error

        callback(db.db(DB_NAME))
        db.close()
    })
}


// app config (pls don't touch)
app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(express.static('static'))


// index page
app.get('/', (req, res) => res.sendFile(__dirname + '/static/index.html'))


// create alias route
app.post('/', (req, res) => {
    let { url, alias } = req.body

    // check fields
    if (url == undefined || alias == undefined)
        return res.send({ status: 'error', message: 'Fields are invalid' })

    // verify url & alias
    const invalid_character_found_in_url = url.indexOf('<') != -1 || url.indexOf('>') != -1
    if (invalid_character_found_in_url)
        return res.send({ status: 'error', message: 'Invalid character in url' })

    const invalid_character_found_in_alias = alias.indexOf('<') != -1 || alias.indexOf('>') != -1
    if (invalid_character_found_in_alias)
        return res.send({ status: 'error', message: 'Invalid character in alias' })

    // check if alias exists in db
    connect_database(db => {
        db.collection('urls').findOne({ alias }, (err, data) => {
            if (err) throw err

            if (data != undefined)
                return res.send({ status: 'error', message: `Alias '${alias}' exists` })

            // else, create alias
            connect_database(db => db.collection('urls').insertOne({ url, alias }))
            res.send({ status: 'success', alias })
        })
    })
})


// redirect aliases
app.get('/:alias', (req, res) => {
    connect_database(db => {

        // check if alias exists
        db.collection('urls').findOne({ alias: req.params.alias }, (err, data) => {
            if (err) throw err

            // if alias does not exist
            if (data == undefined)
                return res.send('Url does not exist')

            res.redirect(data.url)
        })

    })
})


// app listen
app.listen(APP_PORT, () =>
    console.log(`App listening on port ${APP_PORT}`)
)
