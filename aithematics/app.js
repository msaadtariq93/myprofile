const toggle = document.querySelector('.toggle');
const nav = document.querySelector('#navlinks');
function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });
document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();
const form = document.querySelector('#contact-form');
if (form) form.addEventListener('submit', event => { event.preventDefault(); const name = document.querySelector('#name').value, company = document.querySelector('#company').value, message = document.querySelector('#message').value; const body = 'Name: ' + name + '\nCompany: ' + company + '\n\n' + message; location.href = 'mailto:ammar@aithematics.com?subject=' + encodeURIComponent('Business inquiry: ' + company) + '&body=' + encodeURIComponent(body); });
