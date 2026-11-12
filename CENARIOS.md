# Cenários de Teste — Sistema de Climatização

Sistema que recebe leituras de sensores de **temperatura (T)** e **umidade (U)** de
uma sala **(S)** e aciona alarmes conforme o horário **(H)**.

## 1. Regras de negócio (oráculo de teste)

Períodos:

- **Dia:** `H >= 8` e `H < 18`
- **Noite:** `H >= 18` ou `H < 8`

Alarmes:

| Regra | Condição | Descrição |
|-------|----------|-----------|
| R1 | Dia **e** (`T < 5` ou `T > 25`) | Temperatura fora da faixa durante o dia |
| R2 | Noite **e** `T > 20` | Temperatura acima de 20 à noite |
| R3 | `U < 50` ou `U > 80` | Umidade fora da faixa (qualquer horário) |
| R4 | `U < 60` **e** `T > 20` | Umidade abaixo de 60 com temperatura acima de 20 |

> Observação: R3 e R4 não têm restrição de horário, valendo de dia e de noite.
> As regras são independentes; um mesmo instante pode acionar mais de um alarme.

## 2. Técnicas aplicadas

- **Particionamento de equivalência:** valores dentro e fora de cada faixa.
- **Análise de valor-limite (BVA):** para cada limite testa-se o valor imediatamente
  antes, o valor exato e o valor imediatamente depois. Limites relevantes:
  `T ∈ {4,5,25,26}`, `T ∈ {20,21}` (noite), `U ∈ {49,50,80,81}`, `U ∈ {59,60}`,
  `H ∈ {7,8,17,18}`.

## 3. Cenários de teste

### 3.1 Classificação do período (H)

| ID | Entrada (H) | Resultado esperado |
|----|-------------|--------------------|
| CT-01 | 7 | Noite |
| CT-02 | 8 | Dia (limite inferior) |
| CT-03 | 17 | Dia |
| CT-04 | 18 | Noite (limite superior) |
| CT-05 | 0 | Noite |
| CT-06 | 23 | Noite |

### 3.2 R1 — Temperatura fora da faixa no dia

| ID | H | T | U | Resultado esperado |
|----|---|---|---|--------------------|
| CT-07 | 10 | 4 | 65 | Aciona R1 (T abaixo de 5) |
| CT-08 | 10 | 5 | 65 | Não aciona (limite exato) |
| CT-09 | 10 | 25 | 65 | Não aciona (limite exato) |
| CT-10 | 10 | 26 | 65 | Aciona R1 (T acima de 25) |
| CT-11 | 22 | 4 | 65 | Não aciona R1 (é noite) |

### 3.3 R2 — Temperatura acima de 20 à noite

| ID | H | T | U | Resultado esperado |
|----|---|---|---|--------------------|
| CT-12 | 22 | 21 | 65 | Aciona R2 |
| CT-13 | 22 | 20 | 65 | Não aciona (limite exato) |
| CT-14 | 10 | 21 | 65 | Não aciona R2 (é dia) |

### 3.4 R3 — Umidade fora da faixa

| ID | H | T | U | Resultado esperado |
|----|---|---|---|--------------------|
| CT-15 | 10 | 15 | 49 | Aciona R3 (U abaixo de 50) |
| CT-16 | 10 | 15 | 50 | Não aciona (limite exato) |
| CT-17 | 10 | 15 | 80 | Não aciona (limite exato) |
| CT-18 | 10 | 15 | 81 | Aciona R3 (U acima de 80) |
| CT-19 | 22 | 15 | 49 | Aciona R3 (vale à noite) |

### 3.5 R4 — Umidade < 60 com temperatura > 20

| ID | H | T | U | Resultado esperado |
|----|---|---|---|--------------------|
| CT-20 | 10 | 21 | 59 | Aciona R4 |
| CT-21 | 10 | 21 | 60 | Não aciona (limite exato U) |
| CT-22 | 10 | 20 | 59 | Não aciona (limite exato T) |

### 3.6 Cenários sem alarme

| ID | H | T | U | Resultado esperado |
|----|---|---|---|--------------------|
| CT-23 | 10 | 20 | 65 | Sem alarme |
| CT-24 | 22 | 15 | 70 | Sem alarme |

### 3.7 Cenários combinados (múltiplos alarmes)

| ID | H | T | U | Resultado esperado |
|----|---|---|---|--------------------|
| CT-25 | 10 | 30 | 85 | R1 + R3 |
| CT-26 | 22 | 30 | 40 | R2 + R3 + R4 |
| CT-27 | 22 | 21 | 59 | R2 + R4 |

## 4. Execução dos testes automatizados

Os cenários acima estão implementados em `__tests__/climatizacao.test.js`.

```bash
npm install
npm test
```

Resultado esperado: **31 testes aprovados** (28 de regras/limites + 3 de interface).
