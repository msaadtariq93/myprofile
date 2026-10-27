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

const wa=document.createElement('a');wa.href='https://wa.me/16025822801';wa.target='_blank';wa.rel='noopener noreferrer';wa.className='whatsapp-float';wa.setAttribute('aria-label','Chat with AI Thematics on WhatsApp (opens in a new tab)');wa.innerHTML='<span aria-hidden="true">&#9990;</span> <span>WhatsApp</span>';document.body.appendChild(wa);
const details=document.querySelector('.contact-details');if(details){const label=document.createElement('small');label.textContent='WHATSAPP';const link=document.createElement('a');link.href='https://wa.me/16025822801';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Chat on WhatsApp';details.append(label,link)}
