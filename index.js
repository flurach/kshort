const bodyParser = require('body-parser')
const express = require('express')
const app = express()


// plugins
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))


// database
const { AsyncNedb } = require('nedb-async')
const aliases = new AsyncNedb({
	filename: '.data/aliases.db',
	autoload: true
})


// index page
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'))


// create alias route
app.post('/', async (req, res) => {
	let { url, alias } = req.body
	
	// check fields
	if (!url || !alias)
		return res.send({ error: 'Fields are invalid' })
	
	// verify url
	const invalid_character_found_in_url =
		url.indexOf('<') != -1 || url.indexOf('>') != -1
	if (invalid_character_found_in_url)
		return res.send({ error: 'Invalid character in url' })
	
	// verify alias
	const invalid_character_found_in_alias =
		alias.indexOf('<') != -1 || alias.indexOf('>') != -1
	if (invalid_character_found_in_alias)
		return res.send({ error: 'Invalid character in alias' })

	// check if alias exists
	const alias_exists = await aliases.asyncFindOne({ alias })
	if (alias_exists)
		return res.send({ error: `Alias '${alias}' exists` })

	// create alias
	aliases.asyncInsert({ url, alias })
	res.send({})
})


// redirect aliases
app.get('/:alias', async (req, res) => {

	// check if alias exists
	const { alias } = req.params
	const db_alias = await aliases.asyncFindOne({ alias })
	if (!db_alias)
		return res.send('Url not found :(')

	res.redirect(db_alias.url)
})


// app listen
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))