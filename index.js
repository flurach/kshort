const express = require('express')
const bodyParser = require('body-parser')


// setup express
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))


// database
const {AsyncNedb} = require('nedb-async')

const aliases = new AsyncNedb({
	filename: '.data/aliases.db',
	autoload: true
})


// index page
app.get('/', (_, res) => {
	res.sendFile(__dirname + '/public/index.html')
})


// create alias route
app.post('/', async (req, res) => {
	let {url, alias} = req.body

	// check fields
	if (!url || !alias)
		return res.send({error: 'Fields are invalid'})

	// validate url
	const url_regex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
	if (url.match(url_regex) === false)
		return res.send({error: 'URL is invalid'})

	// validate alias
	const alias_regex = /^[a-zA-Z0-9]+$/
	if (alias.match(alias_regex) === false)
		return res.send({error: 'Alias is invalid'})

	// check if alias exists
	const alias_exists = await aliases.asyncFindOne({alias})
	if (alias_exists)
		return res.send({error: `Alias '${alias}' already exists, choose another one!`})

	// create alias
	aliases.asyncInsert({url, alias})
	res.send({})
})


// redirect aliases
app.get('/:alias', async (req, res) => {
	// check if alias exists
	const {alias} = req.params
	const db_alias = await aliases.asyncFindOne({alias})
	if (!db_alias)
		return res.send('Url not found :(')

	res.redirect(db_alias.url)
})


// app listen
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
