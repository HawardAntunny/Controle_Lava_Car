const API_URL = 'https://script.google.com/macros/s/AKfycbzs3J_Wx1-AZZTrQIyYLkCvZIrq5RMKgDnbT9gjbdZ8APOpUOKbhhautqhW7MURu_sKgA/exec';

const modeloSelect = document.getElementById('modelo_carro');
const form = document.getElementById('formCliente');

// Carrega modelos da planilha
fetch(`${API_URL}?action=lista_modelos`)
  .then(res => res.json())
  .then(modelos => {
    modelos.forEach(modelo => {
      const opt = document.createElement('option');
      opt.value = modelo;
      opt.textContent = modelo;
      modeloSelect.appendChild(opt);
    });
  })
  .catch(err => {
    alert("Erro ao carregar modelos");
    console.error(err);
  });

// Envia novo cliente para a planilha
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  formData.append("action", "add_cliente");

  fetch(API_URL, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      alert('Cliente cadastrado com sucesso!');
      form.reset();
      modeloSelect.selectedIndex = 0;
    })
    .catch(() => {
      alert('Erro ao cadastrar cliente.');
    });
});
