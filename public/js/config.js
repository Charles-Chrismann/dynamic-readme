const textarea = document.querySelector('textarea');
const updateConfigBtn = document.querySelector('button');
const tokenP = document.querySelector('p#token');
const importConfigInput = document.querySelector('input#import');
const importConfigBtn = document.querySelector('button.import');

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
    body: JSON.stringify({ config: JSON.parse(textarea.value) })
  })
})

importConfigBtn.addEventListener('click', async () => {
  if(!importConfigInput) return
  const file = importConfigInput.files[0]
  
  const form = new FormData()
  form.set('file', file)
  
  const response = await fetch("/config/import", {
    method: "POST",
    body: form,
  });
})