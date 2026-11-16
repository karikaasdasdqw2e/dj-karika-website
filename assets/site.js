const menu = document.querySelector('#menu');
const nav = document.querySelector('#nav');

function setMenuOpen(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
}

menu.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});
document.querySelector('#year').textContent = new Date().getFullYear();
