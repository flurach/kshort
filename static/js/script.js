const form = document.getElementById('form')
const url = document.getElementById('url')
const alias = document.getElementById('alias')
const result = document.getElementById('result')
const submit = document.getElementById('submit')

form.onsubmit = async e => {
    e.preventDefault()

    const data = {
        url: url.value,
        alias: alias.value
    }

    $.post('/', data, function(response) {
        if (response.status == 'success') {
            result.classList.remove('error')
            result.innerHTML = document.location.href + response.alias
            result.style.display = 'block'

            url.style.display = 'none'
            alias.style.display = 'none'
            submit.style.display = 'none'
        }
        else {
            result.classList.add('error')
            result.innerHTML = response.message
            result.style.display = 'block'
        }
    })
}
