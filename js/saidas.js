const API_URL = 'https://script.google.com/macros/s/AKfycbzs3J_Wx1-AZZTrQIyYLkCvZIrq5RMKgDnbT9gjbdZ8APOpUOKbhhautqhW7MURu_sKgA/exec';

const formSaida = document.getElementById('formSaida');

formSaida.addEventListener('submit', (e) => {
  e.preventDefault();

  // Define a data no campo oculto antes de enviar
  document.getElementById('data_saida').value = new Date().toLocaleString();

  const formData = new FormData(formSaida);
  formData.append("action", "add_saida");

  fetch(API_URL, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      alert('Saída registrada com sucesso!');
      formSaida.reset();
    })
    .catch(() => {
      alert('Erro ao registrar saída.');
    });
});
