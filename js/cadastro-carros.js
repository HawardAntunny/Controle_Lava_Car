const API_URL = 'https://script.google.com/macros/s/AKfycbzs3J_Wx1-AZZTrQIyYLkCvZIrq5RMKgDnbT9gjbdZ8APOpUOKbhhautqhW7MURu_sKgA/exec'

document.getElementById('formModelo').addEventListener('submit', function (e) {
  e.preventDefault();

  const modelo = document.getElementById('modelo').value.trim();
  const tamanho = document.getElementById('tamanho').value;
  const convencional = document.getElementById('convencional').value;
  const aparencia = document.getElementById('aparencia').value;
  const convencionalcera = document.getElementById('convencionalcera').value;

  if (!modelo || !tamanho || !convencional || !aparencia || !convencionalcera) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'add_modelo');
  formData.append('modelo', modelo);
  formData.append('tamanho', tamanho);
  formData.append('convencional', convencional);
  formData.append('aparencia', aparencia);
  formData.append('convencionalcera', convencionalcera);

  fetch(API_URL, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      alert('Modelo cadastrado com sucesso!');
      e.target.reset();
    })
    .catch(() => {
      alert('Erro ao cadastrar modelo. Tente novamente.');
    });
});
