# Sistema de Climatização

![CI](https://github.com/RafaelWolkning/sistema-climatizacao/actions/workflows/ci.yml/badge.svg)

Sistema que monitora a **temperatura (T)** e a **umidade (U)** de uma sala **(S)**
e aciona alarmes conforme o horário **(H)**. O projeto cobre tanto a **lógica de
negócio** (com testes automatizados) quanto um **painel de interface** para
simulação manual dos cenários.

Este repositório foi construído como exercício de **qualidade de software e testes
automatizados**: as regras de negócio foram modeladas como um oráculo de teste
(`CENARIOS.md`), implementadas em código testável (`src/climatizacao.js`) e
validadas por uma suíte Jest com relatórios de execução e cobertura.

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Regras de negócio](#regras-de-negócio)
- [Como executar](#como-executar)
- [Comandos](#comandos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Estratégia de testes](#estratégia-de-testes)
- [Relatórios e artefatos](#relatórios-e-artefatos)
- [Integração contínua (CI)](#integração-contínua-ci)
- [Interface](#interface)
- [Tecnologias](#tecnologias)
- [Documentação](#documentação)

---

## Sobre o projeto

O sistema recebe leituras de sensores de uma sala e, a cada leitura, devolve:

- a **sala** e a **hora** avaliadas;
- a **classificação do período** (`dia` ou `noite`);
- a **lista de alarmes** acionados (pode ser vazia ou conter múltiplos alarmes).

As regras são **independentes**: um mesmo instante pode acionar mais de um alarme
(ex.: temperatura fora da faixa **e** umidade fora da faixa).

### Períodos

| Período | Condição |
|---------|----------|
| **Dia**   | `H >= 8` e `H < 18` |
| **Noite** | `H >= 18` ou `H < 8` |

### Alarmes

| Regra | Condição | Descrição |
|-------|----------|-----------|
| **R1** | Dia **e** (`T < 5` ou `T > 25`) | Temperatura fora da faixa durante o dia |
| **R2** | Noite **e** `T > 20` | Temperatura acima de 20 °C à noite |
| **R3** | `U < 50` ou `U > 80` | Umidade fora da faixa (qualquer horário) |
| **R4** | `U < 60` **e** `T > 20` | Umidade abaixo de 60 % com temperatura acima de 20 °C |

> **Observação:** R3 e R4 **não** têm restrição de horário — valem de dia e de noite.

---

## Regras de negócio

A implementação fica em [`src/climatizacao.js`](src/climatizacao.js) e expõe:

| Export | Descrição |
|--------|-----------|
| `isDia(hora)` | Retorna `true` se `8 <= hora < 18`; caso contrário, `false` |
| `avaliarClimatizacao({ sala, temperatura, umidade, hora })` | Avalia a leitura e devolve `{ sala, hora, dia, temperatura, umidade, alarme, alarmes }` |
| `ALARME` | Constantes com os códigos de cada alarme |

Contrato de saída de `avaliarClimatizacao`:

```js
{
  sala: 'S1',
  hora: 10,
  dia: true,
  temperatura: 30,
  umidade: 85,
  alarme: true,
  alarmes: ['TEMPERATURA_DIA_FORA_FAIXA', 'UMIDADE_FORA_FAIXA']
}
```

---

## Como executar

Pré-requisitos: **Node.js 20+**, **npm 10+** e **python3** (para servir a interface).

```bash
# 1. Clonar o repositório
git clone https://github.com/RafaelWolkning/sistema-climatizacao.git
cd sistema-climatizacao

# 2. Instalar dependências
npm install

# 3. Rodar os testes
npm test

# 4. (Opcional) Testes com cobertura e relatórios
npm run test:coverage

# 5. (Opcional) Subir a interface em http://localhost:8080
npm start
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm test` | Executa a suíte de testes (31 casos) |
| `npm run test:watch` | Executa os testes em modo watch |
| `npm run test:coverage` | Executa os testes, gera cobertura e relatórios |
| `npm start` | Sobe a interface estática em `http://localhost:8080` |

> O projeto usa ES Modules (`"type": "module"`), por isso os testes rodam com
> `node --experimental-vm-modules`.

---

## Estrutura do projeto

```
sistema-climatizacao/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline de CI (testes + cobertura)
├── __tests__/
│   ├── climatizacao.test.js    # 28 testes de regras e limites
│   └── ui.test.js              # 3 testes de interface (jsdom)
├── src/
│   └── climatizacao.js         # Lógica de negócio (regras de alarme)
├── app.js                      # Controller da interface (manipula o DOM)
├── index.html                  # Estrutura do painel
├── styles.css                  # Estilos do painel
├── CENARIOS.md                 # Cenários de teste (oráculo) e técnicas aplicadas
├── RELATORIO.md                # Relatório de execução dos testes
├── jest.config.js              # Configuração do Jest (cobertura + reporters)
├── package.json                # Scripts e dependências
└── README.md                   # Este documento
```

Artefatos gerados (não versionados): `coverage/` e `reports/`.

---

## Estratégia de testes

Os cenários seguem duas técnicas clássicas de teste de caixa-preta:

- **Particionamento de equivalência:** valores dentro e fora de cada faixa.
- **Análise de valor-limite (BVA):** para cada limite, testa-se o valor
  imediatamente antes, o valor exato e o valor imediatamente depois.

Limites cobertos:

| Variável | Limites testados |
|----------|------------------|
| Temperatura | `4, 5, 25, 26` (dia) e `20, 21` (noite) |
| Umidade | `49, 50, 80, 81` e `59, 60` |
| Hora | `7, 8, 17, 18, 0, 23` |

Os cenários estão documentados em [`CENARIOS.md`](CENARIOS.md) (CT-01 a CT-27 +
UI-01 a UI-03) e implementados em [`__tests__/climatizacao.test.js`](__tests__/climatizacao.test.js)
e [`__tests__/ui.test.js`](__tests__/ui.test.js).

### Cobertura atual

| Arquivo | Statements | Branches | Functions | Lines |
|---------|-----------:|---------:|----------:|------:|
| `src/climatizacao.js` | 100% | 100% | 100% | 100% |
| `app.js` | 84,84% | 100% | 88,88% | 83,87% |
| **Total** | **90,74%** | **100%** | **90,9%** | **90,38%** |

---

## Relatórios e artefatos

Após `npm run test:coverage`, são gerados:

| Artefato | Caminho |
|----------|---------|
| Relatório visual de testes | `reports/test-report.html` |
| Resultado JUnit (XML) | `reports/junit.xml` |
| Cobertura — resumo HTML | `coverage/index.html` |
| Cobertura — navegável por arquivo | `coverage/lcov-report/index.html` |
| Cobertura — LCOV | `coverage/lcov.info` |
| Resumo de cobertura (JSON) | `coverage/coverage-summary.json` |

O resultado consolidado da última execução está em [`RELATORIO.md`](RELATORIO.md).

---

## Integração contínua (CI)

O pipeline do GitHub Actions está em
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) e roda automaticamente em:

- **push** para a branch `main`;
- **pull requests** direcionados à `main`.

Etapas do pipeline:

1. Checkout do código.
2. Configuração do Node.js 20 com cache de dependências.
3. `npm ci` (instalação reprodutível).
4. `npm run test:coverage` (31 testes + cobertura).
5. Upload dos artefatos `reports/` e `coverage/` para consulta na aba *Actions*.

Qualquer falha nos testes **bloqueia** o pipeline e sinaliza o problema no PR.

---

## Interface

O painel (`index.html` + `app.js` + `styles.css`) permite simular leituras em
tempo real com sliders de **hora**, **temperatura** e **umidade**, além de
**cenários rápidos** pré-configurados:

| Preset | H | T | U | Efeito esperado |
|--------|---|---|---|-----------------|
| Dia frio | 10 | 4 | 65 | R1 |
| Dia quente e úmido | 10 | 30 | 85 | R1 + R3 |
| Noite morna | 22 | 21 | 59 | R2 + R4 |
| Noite estável | 22 | 15 | 70 | Sem alarme |

A interface consome diretamente `src/climatizacao.js`, garantindo que a mesma
regra testada seja a exibida ao usuário. Os testes de UI (`__tests__/ui.test.js`)
exercitam o DOM via **jsdom**.

---

## Tecnologias

- **JavaScript (ES Modules)** — lógica e interface.
- **Jest 29** — testes unitários e de integração de UI.
- **jsdom** — ambiente de DOM para os testes de interface.
- **jest-html-reporters** — relatório visual de testes.
- **jest-junit** — relatório JUnit (XML).
- **GitHub Actions** — integração contínua.
- **python3 http.server** — servidor estático para a interface.

---

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`CENARIOS.md`](CENARIOS.md) | Regras de negócio, técnicas e cenários de teste (oráculo) |
| [`RELATORIO.md`](RELATORIO.md) | Resultado da execução: testes aprovados e cobertura |
| [`README.md`](README.md) | Visão geral, execução e arquitetura |
