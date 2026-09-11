const textarea = document.querySelector('textarea');
const updateConfigBtn = document.querySelector('button');
const tokenP = document.querySelector('p#token');

textarea.style.height = 'auto';
textarea.style.height = textarea.scrollHeight + 10 + 'px';

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 10 + 'px';
});

const url = new URL(window.location.href);
url.searchParams.delete('t');
window.history.replaceState({}, '', url);

updateConfigBtn.addEventListener('click', async () => {
  const res = await fetch('/config', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'token': tokenP.textContent
    },
    body: JSON.stringify({ config: textarea.value })
  })
})