const API_URL = 'https://script.google.com/macros/s/AKfycbzs3J_Wx1-AZZTrQIyYLkCvZIrq5RMKgDnbT9gjbdZ8APOpUOKbhhautqhW7MURu_sKgA/exec';

const clienteSelect = document.getElementById('cliente');
const modeloInput = document.getElementById('modelo');
const valorTotalInput = document.getElementById('valor_total');
const valorFinalInput = document.getElementById('valor_final');
const valorAdicionalInput = document.getElementById('valor_adicional');
const descontoValor = document.getElementById('desconto_valor');
const descontoPorcentagem = document.getElementById('desconto_porcentagem');
const servicosCampo = document.getElementById('servicos_escolhidos');
const checkboxes = document.querySelectorAll('.servico-checkbox');

const valorConvencional = document.getElementById('valor_convencional');
const valorAparencia = document.getElementById('valor_aparencia');
const valorConvencionalCera = document.getElementById('valor_convencionalcera');

const servicoExtraSelect = document.getElementById('servicoExtra');
const valorExtraInput = document.getElementById('valorExtra');
const adicionarServicoBtn = document.getElementById('adicionarServico');

let precos = {
  convencional: 0,
  aparencia: 0,
  convencionalcera: 0
};

let extrasSelecionados = [];

// ✅ FUNÇÃO AUXILIAR PARA CONVERTER "R$ 80,00" PARA 80.00
function parseValor(valor) {
  if (!valor) return 0;
  return parseFloat(valor.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
}

// 🔄 Carrega lista de clientes
fetch(`${API_URL}?action=clientes`)
  .then(res => res.json())
  .then(clientes => {
    // Ordenar em ordem alfabética (ignorando acentos e maiúsculas)
    clientes.sort((a, b) =>
      a.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").localeCompare(
        b.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        'pt',
        { sensitivity: 'base' }
      )
    );

    clientes.forEach(cli => {
      const opt = document.createElement('option');
      opt.value = cli.nome;
      opt.textContent = cli.nome;
      clienteSelect.appendChild(opt);
    });
  });


// 📌 Ao selecionar cliente, busca modelo e valores dos serviços
clienteSelect.addEventListener('change', async () => {
  const cliente = clienteSelect.value;
  if (!cliente) return;

  // 📌 Buscar modelo
  const modeloRes = await fetch(`${API_URL}?action=modelo&cliente=${encodeURIComponent(cliente)}`);
  const modeloData = await modeloRes.json();
  const modelo = modeloData.modelo;
  modeloInput.value = modelo;

  // 📌 Buscar valores de serviços padrão do modelo
  const servicoRes = await fetch(`${API_URL}?action=servicos&modelo=${encodeURIComponent(modelo)}`);
  const servicoData = await servicoRes.json();

  // ✅ Corrige valores (R$ -> número)
  precos.convencional = Number(servicoData.convencional) || 0;
  precos.aparencia = Number(servicoData.aparencia) || 0;
  precos.convencionalcera = Number(servicoData.convencionalcera) || 0;


  // ✅ Atualiza no HTML
  valorConvencional.textContent = `R$ ${precos.convencional.toFixed(2)}`;
  valorAparencia.textContent = `R$ ${precos.aparencia.toFixed(2)}`;
  valorConvencionalCera.textContent = `R$ ${precos.convencionalcera.toFixed(2)}`;

  calcularTotalServicos();
});

// 💰 Calcular Total
function calcularTotalServicos() {
  let total = 0;
  const servicosSelecionados = [];

  checkboxes.forEach(cb => {
    if (cb.checked) {
      total += precos[cb.value] || 0;
      servicosSelecionados.push(cb.labels[0].innerText.trim());
    }
  });

  extrasSelecionados.forEach(extra => {
    total += extra.valor;
    servicosSelecionados.push(`${extra.nome} - R$ ${extra.valor.toFixed(2)}`);
  });


  valorTotalInput.value = total.toFixed(2);
  servicosCampo.value = servicosSelecionados.join(', ');

  const adicional = parseFloat(valorAdicionalInput.value) || 0;
  const desc = parseFloat(descontoValor.value) || 0;
  valorFinalInput.value = (total + adicional - desc).toFixed(2);

}

// 🧮 Desconto em R$
descontoValor.addEventListener('input', () => {
  const valor = parseFloat(valorTotalInput.value) || 0;
  const descV = parseFloat(descontoValor.value) || 0;
  descontoPorcentagem.value = ((descV / valor) * 100).toFixed(2);
  const adicional = parseFloat(valorAdicionalInput.value) || 0;
  valorFinalInput.value = (valor + adicional - descV).toFixed(2);

});

// 🧮 Desconto em %
descontoPorcentagem.addEventListener('input', () => {
  const valor = parseFloat(valorTotalInput.value) || 0;
  const descP = parseFloat(descontoPorcentagem.value) || 0;
  const descV = valor * (descP / 100);
  const adicional = parseFloat(valorAdicionalInput.value) || 0;
  descontoValor.value = descV.toFixed(2);
  valorFinalInput.value = (valor + adicional - descV).toFixed(2);
});

valorAdicionalInput.addEventListener('input', calcularTotalServicos);


// 🔁 Serviços Adicionais
fetch(`${API_URL}?action=servicos_adicionais`)
.then(res => res.json())
.then(servicos => {
  servicos.forEach(s => {
    const valorNumerico = parseFloat(String(s.valor).replace(',', '.')) || 0;
    const opt = document.createElement('option');
    opt.value = s.servico;
    opt.dataset.valor = valorNumerico;
    opt.textContent = `${s.servico} - R$ ${valorNumerico.toFixed(2)}`;
    servicoExtraSelect.appendChild(opt);
  });
});


servicoExtraSelect.addEventListener('change', () => {
  const selected = servicoExtraSelect.options[servicoExtraSelect.selectedIndex];
  valorExtraInput.value = selected.dataset.valor || '';
});

adicionarServicoBtn.addEventListener('click', () => {
  const selected = servicoExtraSelect.options[servicoExtraSelect.selectedIndex];
  const nome = selected.value;
  const valor = parseFloat(selected.dataset.valor);

  if (nome && valor && !extrasSelecionados.find(s => s.nome === nome)) {
    extrasSelecionados.push({ nome, valor });
    calcularTotalServicos();
  }
});

// Enviar formulário
document.getElementById('formLancamento').addEventListener('submit', (e) => {
  e.preventDefault();

  const cliente = clienteSelect.value;
  const formaPagamento = document.getElementById('forma_pagamento').value;
  if (!cliente || !formaPagamento) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  document.getElementById('dataHora').value = new Date().toLocaleString();

  fetch(`${API_URL}?action=add_lancamento`, {
    method: 'POST',
    body: new FormData(e.target)
  }).then(() => {
    alert('Lançamento enviado!');
    e.target.reset();
    modeloInput.value = '';
    valorTotalInput.value = '';
    valorFinalInput.value = '';
    servicosCampo.value = '';
    extrasSelecionados = [];
    checkboxes.forEach(cb => cb.checked = false);
    servicoExtraSelect.selectedIndex = 0;
    valorExtraInput.value = '';
  }).catch(() => {
    alert('Erro ao enviar.');
  });
});
