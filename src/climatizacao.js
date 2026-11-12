const DIA_INICIO = 8;
const DIA_FIM = 18;

const TEMP_MIN_DIA = 5;
const TEMP_MAX_DIA = 25;
const TEMP_MAX_NOITE = 20;

const UMIDADE_MIN = 50;
const UMIDADE_MAX = 80;
const UMIDADE_BAIXA = 60;

export const ALARME = {
  TEMPERATURA_DIA_FORA_FAIXA: 'TEMPERATURA_DIA_FORA_FAIXA',
  TEMPERATURA_NOITE_ACIMA_20: 'TEMPERATURA_NOITE_ACIMA_20',
  UMIDADE_FORA_FAIXA: 'UMIDADE_FORA_FAIXA',
  UMIDADE_BAIXA_TEMPERATURA_ALTA: 'UMIDADE_BAIXA_TEMPERATURA_ALTA',
};

export function isDia(hora) {
  return hora >= DIA_INICIO && hora < DIA_FIM;
}

export function avaliarClimatizacao({ sala, temperatura, umidade, hora }) {
  const dia = isDia(hora);
  const alarmes = [];

  if (dia && (temperatura < TEMP_MIN_DIA || temperatura > TEMP_MAX_DIA)) {
    alarmes.push(ALARME.TEMPERATURA_DIA_FORA_FAIXA);
  }

  if (!dia && temperatura > TEMP_MAX_NOITE) {
    alarmes.push(ALARME.TEMPERATURA_NOITE_ACIMA_20);
  }

  if (umidade < UMIDADE_MIN || umidade > UMIDADE_MAX) {
    alarmes.push(ALARME.UMIDADE_FORA_FAIXA);
  }

  if (umidade < UMIDADE_BAIXA && temperatura > TEMP_MAX_NOITE) {
    alarmes.push(ALARME.UMIDADE_BAIXA_TEMPERATURA_ALTA);
  }

  return {
    sala,
    hora,
    dia,
    temperatura,
    umidade,
    alarme: alarmes.length > 0,
    alarmes,
  };
}
