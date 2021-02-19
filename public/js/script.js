const alias = document.getElementById('alias')
const back = document.getElementById('back')
const form = document.getElementById('form')
const result = document.getElementById('result')
const submit = document.getElementById('submit')
const url = document.getElementById('url')

form.onsubmit = async e => {
	// prevent refresh lol
	e.preventDefault()

	// validate input
	if (url.value.trim() === '') {
		alert('URL can\'t be empty!')
		return
	}
	if (alias.value.trim() === '') {
		alert('Alias can\'t be empty!')
		return
	}

	// construct request payload
	const payload = {
		url: url.value.trim(),
		alias: alias.value.trim()
	}

	// send it away!
	const res = await fetch('/', {
		method: 'post',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	})
	const data = await res.json()

	// if an error occured
	if (data.error) {
		alert(data.error)
		return
	}

	// else,
	// hide everything
	url.style.display = 'none'
	alias.style.display = 'none'
	submit.style.display = 'none'

	// show back button
	back.style.display = 'inline'

	// display result
	result.innerHTML = document.location.href + alias.value
	result.style.display = 'block'
}

// copy to clipboard if supported
result.onclick = () => {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(result.innerText)
		alert('Copied to clipboard!')
	}
}

// that was my first Jquery code! Selcuk Tatar
// hi Selcuk! who said you can squeeze in a dependency??? lmaooo
back.onclick = () => window.location = '/'
