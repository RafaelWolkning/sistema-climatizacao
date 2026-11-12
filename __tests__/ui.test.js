/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');

function carregarPagina() {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/gi, '');
}

async function renderizar() {
  carregarPagina();
  await import(`../app.js?t=${Date.now()}-${Math.random()}`);
}

function definir(id, valor) {
  const el = document.getElementById(id);
  el.value = String(valor);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('UI do painel de climatização', () => {
  test('renderiza o estado inicial sem alarmes', async () => {
    await renderizar();
    expect(document.getElementById('periodo-valor').textContent).toBe('Dia');
    expect(document.getElementById('resultado').textContent).toContain('Nenhum alarme acionado');
  });

  test('aciona alarme de temperatura do dia ao usar o preset "Dia frio"', async () => {
    await renderizar();
    definir('hora', 10);
    definir('temperatura', 4);
    definir('umidade', 65);

    const texto = document.getElementById('resultado').textContent;
    expect(texto).toContain('Temperatura fora da faixa (dia)');
    expect(document.querySelector('.estado--danger')).not.toBeNull();
  });

  test('atualiza o período para Noite e aciona R2 + R4', async () => {
    await renderizar();
    definir('hora', 22);
    definir('temperatura', 21);
    definir('umidade', 59);

    expect(document.getElementById('periodo-valor').textContent).toBe('Noite');
    const texto = document.getElementById('resultado').textContent;
    expect(texto).toContain('Temperatura acima de 20 °C (noite)');
    expect(texto).toContain('Umidade baixa com temperatura alta');
  });
});
