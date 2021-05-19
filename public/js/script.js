const toggleBtn = document.getElementsByClassName('btn')[0]
const navUl = document.getElementsByClassName('navul')[0]

toggleBtn.addEventListener('click', () => {
	navUl.classList.toggle('active')
})