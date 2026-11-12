import { avaliarClimatizacao, ALARME } from './src/climatizacao.js';

const ICONE = {
  temp: '<svg class="estado__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0ZM12 19a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>',
  umidade: '<svg class="estado__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg>',
  ok: '<svg class="estado__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
};

const INFO_ALARME = {
  [ALARME.TEMPERATURA_DIA_FORA_FAIXA]: {
    titulo: 'Temperatura fora da faixa (dia)',
    desc: 'Durante o dia a temperatura deve ficar entre 5 °C e 25 °C.',
    severidade: 'danger',
    icone: ICONE.temp,
  },
  [ALARME.TEMPERATURA_NOITE_ACIMA_20]: {
    titulo: 'Temperatura acima de 20 °C (noite)',
    desc: 'À noite a temperatura deve ficar em 20 °C ou menos.',
    severidade: 'warn',
    icone: ICONE.temp,
  },
  [ALARME.UMIDADE_FORA_FAIXA]: {
    titulo: 'Umidade fora da faixa',
    desc: 'A umidade deve ficar entre 50 % e 80 %.',
    severidade: 'danger',
    icone: ICONE.umidade,
  },
  [ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA]: {
    titulo: 'Umidade baixa com temperatura alta',
    desc: 'Umidade abaixo de 60 % combinada com temperatura acima de 20 °C.',
    severidade: 'warn',
    icone: ICONE.umidade,
  },
};

const SALA = 'S1';
const SLIDERS = ['hora', 'temperatura', 'umidade'];

const els = {
  hora: document.getElementById('hora'),
  temperatura: document.getElementById('temperatura'),
  umidade: document.getElementById('umidade'),
  horaOut: document.getElementById('hora-out'),
  temperaturaOut: document.getElementById('temperatura-out'),
  umidadeOut: document.getElementById('umidade-out'),
  periodo: document.getElementById('periodo'),
  periodoValor: document.getElementById('periodo-valor'),
  resultado: document.getElementById('resultado'),
};

function lerEntradas() {
  return {
    sala: SALA,
    hora: Number(els.hora.value),
    temperatura: Number(els.temperatura.value),
    umidade: Number(els.umidade.value),
  };
}

function atualizarSaidas({ hora, temperatura, umidade }) {
  els.horaOut.textContent = `${hora} h`;
  els.temperaturaOut.textContent = `${temperatura} °C`;
  els.umidadeOut.textContent = `${umidade} %`;
}

function renderEstado({ severidade, icone, titulo, desc }) {
  return `
    <article class="estado estado--${severidade}">
      ${icone}
      <div>
        <h3 class="estado__title">${titulo}</h3>
        <p class="estado__desc">${desc}</p>
      </div>
    </article>`;
}

function render(resultado) {
  const { hora, temperatura, umidade, dia, alarmes } = resultado;

  els.periodo.dataset.periodo = dia ? 'dia' : 'noite';
  els.periodoValor.textContent = dia ? 'Dia' : 'Noite';

  if (alarmes.length === 0) {
    els.resultado.innerHTML =
      renderEstado({
        severidade: 'ok',
        icone: ICONE.ok,
        titulo: 'Nenhum alarme acionado',
        desc: `Leitura de ${hora} h com ${temperatura} °C e ${umidade} % dentro dos limites.`,
      });
    return;
  }

  const cards = alarmes.map((codigo) => renderEstado(INFO_ALARME[codigo])).join('');
  const resumo = `<p class="resumo">${alarmes.length} alarme(s) acionado(s) às ${hora} h · ${temperatura} °C · ${umidade} %</p>`;
  els.resultado.innerHTML = cards + resumo;
}

function atualizar() {
  const entradas = lerEntradas();
  atualizarSaidas(entradas);
  render(avaliarClimatizacao(entradas));
}

SLIDERS.forEach((id) => els[id].addEventListener('input', atualizar));

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const [hora, temperatura, umidade] = chip.dataset.preset.split(',').map(Number);
    els.hora.value = hora;
    els.temperatura.value = temperatura;
    els.umidade.value = umidade;
    atualizar();
  });
});

atualizar();
