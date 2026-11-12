import { avaliarClimatizacao, isDia, ALARME } from '../src/climatizacao.js';

const SALA = 'S1';

function avaliar(hora, temperatura, umidade) {
  return avaliarClimatizacao({ sala: SALA, hora, temperatura, umidade });
}

function alarmes(hora, temperatura, umidade) {
  return avaliar(hora, temperatura, umidade).alarmes;
}

describe('Classificação do período (dia/noite)', () => {
  test.each([
    [7, false],
    [8, true],
    [17, true],
    [18, false],
    [0, false],
    [23, false],
  ])('hora %i -> dia = %s', (hora, esperado) => {
    expect(isDia(hora)).toBe(esperado);
  });
});

describe('Regra 1 - Temperatura fora da faixa durante o DIA (T < 5 ou T > 25)', () => {
  test('T = 4 (limite inferior) aciona alarme', () => {
    expect(alarmes(10, 4, 65)).toContain(ALARME.TEMPERATURA_DIA_FORA_FAIXA);
  });

  test('T = 5 (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(10, 5, 65)).not.toContain(ALARME.TEMPERATURA_DIA_FORA_FAIXA);
  });

  test('T = 25 (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(10, 25, 65)).not.toContain(ALARME.TEMPERATURA_DIA_FORA_FAIXA);
  });

  test('T = 26 (limite superior) aciona alarme', () => {
    expect(alarmes(10, 26, 65)).toContain(ALARME.TEMPERATURA_DIA_FORA_FAIXA);
  });

  test('T = 4 à NOITE NÃO aciona alarme de temperatura do dia', () => {
    expect(alarmes(22, 4, 65)).not.toContain(ALARME.TEMPERATURA_DIA_FORA_FAIXA);
  });
});

describe('Regra 2 - Temperatura acima de 20 durante a NOITE (T > 20)', () => {
  test('T = 21 à noite aciona alarme', () => {
    expect(alarmes(22, 21, 65)).toContain(ALARME.TEMPERATURA_NOITE_ACIMA_20);
  });

  test('T = 20 à noite (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(22, 20, 65)).not.toContain(ALARME.TEMPERATURA_NOITE_ACIMA_20);
  });

  test('T = 21 durante o dia NÃO aciona alarme noturno', () => {
    expect(alarmes(10, 21, 65)).not.toContain(ALARME.TEMPERATURA_NOITE_ACIMA_20);
  });
});

describe('Regra 3 - Umidade fora da faixa (U < 50 ou U > 80)', () => {
  test('U = 49 (limite inferior) aciona alarme', () => {
    expect(alarmes(10, 15, 49)).toContain(ALARME.UMIDADE_FORA_FAIXA);
  });

  test('U = 50 (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(10, 15, 50)).not.toContain(ALARME.UMIDADE_FORA_FAIXA);
  });

  test('U = 80 (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(10, 15, 80)).not.toContain(ALARME.UMIDADE_FORA_FAIXA);
  });

  test('U = 81 (limite superior) aciona alarme', () => {
    expect(alarmes(10, 15, 81)).toContain(ALARME.UMIDADE_FORA_FAIXA);
  });

  test('regra de umidade vale também à noite', () => {
    expect(alarmes(22, 15, 49)).toContain(ALARME.UMIDADE_FORA_FAIXA);
  });
});

describe('Regra 4 - Umidade abaixo de 60 com temperatura acima de 20 (U < 60 e T > 20)', () => {
  test('U = 59 e T = 21 aciona alarme', () => {
    expect(alarmes(10, 21, 59)).toContain(ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA);
  });

  test('U = 60 (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(10, 21, 60)).not.toContain(ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA);
  });

  test('T = 20 (limite exato) NÃO aciona alarme', () => {
    expect(alarmes(10, 20, 59)).not.toContain(ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA);
  });
});

describe('Cenários sem alarme', () => {
  test('dia com T e U dentro da faixa não gera alarme', () => {
    const r = avaliar(10, 20, 65);
    expect(r.alarme).toBe(false);
    expect(r.alarmes).toHaveLength(0);
  });

  test('noite fria e umidade normal não gera alarme', () => {
    const r = avaliar(22, 15, 70);
    expect(r.alarme).toBe(false);
    expect(r.alarmes).toHaveLength(0);
  });
});

describe('Cenários combinados (múltiplos alarmes)', () => {
  test('dia: T = 30 e U = 85 -> temperatura do dia + umidade fora da faixa', () => {
    expect(alarmes(10, 30, 85)).toEqual([
      ALARME.TEMPERATURA_DIA_FORA_FAIXA,
      ALARME.UMIDADE_FORA_FAIXA,
    ]);
  });

  test('noite: T = 30 e U = 40 -> temperatura noturna + umidade fora + umidade baixa com temp. alta', () => {
    expect(alarmes(22, 30, 40)).toEqual([
      ALARME.TEMPERATURA_NOITE_ACIMA_20,
      ALARME.UMIDADE_FORA_FAIXA,
      ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA,
    ]);
  });

  test('noite: T = 21 e U = 59 -> temperatura noturna + umidade baixa com temp. alta', () => {
    expect(alarmes(22, 21, 59)).toEqual([
      ALARME.TEMPERATURA_NOITE_ACIMA_20,
      ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA,
    ]);
  });
});

describe('Contrato de saída', () => {
  test('retorna a sala, a hora, o período e os alarmes avaliados', () => {
    const r = avaliar(10, 4, 65);
    expect(r).toMatchObject({
      sala: SALA,
      hora: 10,
      dia: true,
      temperatura: 4,
      umidade: 65,
      alarme: true,
    });
  });
});
