# Relatório de Execução — Sistema de Climatização

## 1. Identificação

- **Projeto:** sistema-climatizacao
- **Objetivo:** validar as regras de acionamento de alarmes do sistema de
  climatização a partir de leituras de temperatura (T) e umidade (U) de uma sala
  (S), conforme o horário (H).
- **Documento de cenários:** `CENARIOS.md`
- **Data da execução:** 12/11/2026
- **Ambiente:** Linux · Node.js 26 · npm 11 · Jest 29 · jsdom

## 2. Escopo das regras validadas

| Regra | Condição | Horário |
|-------|----------|---------|
| R1 | `T < 5` ou `T > 25` | Dia (`8 <= H < 18`) |
| R2 | `T > 20` | Noite (`H >= 18` ou `H < 8`) |
| R3 | `U < 50` ou `U > 80` | Qualquer horário |
| R4 | `U < 60` **e** `T > 20` | Qualquer horário |

Técnicas aplicadas: **particionamento de equivalência** e **análise de
valor-limite (BVA)** nos limites de T, U e H.

## 3. Resultado geral

| Métrica | Resultado |
|---------|-----------|
| Suítes de teste | 2 aprovadas de 2 |
| Casos de teste | **31 aprovados / 31** |
| Falhas | 0 |
| Tempo de execução | ~0,9 s |

### 3.1 Cobertura de código

| Arquivo | Statements | Branches | Functions | Lines |
|---------|-----------:|---------:|----------:|------:|
| `src/climatizacao.js` | 100% | 100% | 100% | 100% |
| `app.js` | 84,84% | 100% | 88,88% | 83,87% |
| **Total** | **90,74%** | **100%** | **90,9%** | **90,38%** |

As linhas não cobertas em `app.js` (109–113) correspondem ao handler dos botões
de cenários rápidos, exercitado apenas em interação manual na interface.

## 4. Resultado por cenário

### 4.1 Classificação do período (H)

| ID | Entrada | Esperado | Resultado |
|----|---------|----------|-----------|
| CT-01 | H = 7 | Noite | ✅ Aprovado |
| CT-02 | H = 8 | Dia | ✅ Aprovado |
| CT-03 | H = 17 | Dia | ✅ Aprovado |
| CT-04 | H = 18 | Noite | ✅ Aprovado |
| CT-05 | H = 0 | Noite | ✅ Aprovado |
| CT-06 | H = 23 | Noite | ✅ Aprovado |

### 4.2 R1 — Temperatura fora da faixa no dia

| ID | H | T | U | Esperado | Resultado |
|----|---|---|---|----------|-----------|
| CT-07 | 10 | 4 | 65 | Aciona R1 | ✅ Aprovado |
| CT-08 | 10 | 5 | 65 | Não aciona | ✅ Aprovado |
| CT-09 | 10 | 25 | 65 | Não aciona | ✅ Aprovado |
| CT-10 | 10 | 26 | 65 | Aciona R1 | ✅ Aprovado |
| CT-11 | 22 | 4 | 65 | Não aciona R1 | ✅ Aprovado |

### 4.3 R2 — Temperatura acima de 20 à noite

| ID | H | T | U | Esperado | Resultado |
|----|---|---|---|----------|-----------|
| CT-12 | 22 | 21 | 65 | Aciona R2 | ✅ Aprovado |
| CT-13 | 22 | 20 | 65 | Não aciona | ✅ Aprovado |
| CT-14 | 10 | 21 | 65 | Não aciona R2 | ✅ Aprovado |

### 4.4 R3 — Umidade fora da faixa

| ID | H | T | U | Esperado | Resultado |
|----|---|---|---|----------|-----------|
| CT-15 | 10 | 15 | 49 | Aciona R3 | ✅ Aprovado |
| CT-16 | 10 | 15 | 50 | Não aciona | ✅ Aprovado |
| CT-17 | 10 | 15 | 80 | Não aciona | ✅ Aprovado |
| CT-18 | 10 | 15 | 81 | Aciona R3 | ✅ Aprovado |
| CT-19 | 22 | 15 | 49 | Aciona R3 | ✅ Aprovado |

### 4.5 R4 — Umidade < 60 com temperatura > 20

| ID | H | T | U | Esperado | Resultado |
|----|---|---|---|----------|-----------|
| CT-20 | 10 | 21 | 59 | Aciona R4 | ✅ Aprovado |
| CT-21 | 10 | 21 | 60 | Não aciona | ✅ Aprovado |
| CT-22 | 10 | 20 | 59 | Não aciona | ✅ Aprovado |

### 4.6 Sem alarme

| ID | H | T | U | Esperado | Resultado |
|----|---|---|---|----------|-----------|
| CT-23 | 10 | 20 | 65 | Sem alarme | ✅ Aprovado |
| CT-24 | 22 | 15 | 70 | Sem alarme | ✅ Aprovado |

### 4.7 Combinados (múltiplos alarmes)

| ID | H | T | U | Esperado | Resultado |
|----|---|---|---|----------|-----------|
| CT-25 | 10 | 30 | 85 | R1 + R3 | ✅ Aprovado |
| CT-26 | 22 | 30 | 40 | R2 + R3 + R4 | ✅ Aprovado |
| CT-27 | 22 | 21 | 59 | R2 + R4 | ✅ Aprovado |

### 4.8 Interface (UI)

| ID | Cenário | Resultado |
|----|---------|-----------|
| UI-01 | Estado inicial sem alarmes | ✅ Aprovado |
| UI-02 | Alarme de temperatura do dia (preset "Dia frio") | ✅ Aprovado |
| UI-03 | Período Noite com R2 + R4 | ✅ Aprovado |

## 5. Como executar

```bash
cd sistema-climatizacao
npm install
npm test              # executa os 31 testes
npm run test:coverage # executa + gera cobertura
npm start             # sobe a interface em http://localhost:8080
```

## 6. Artefatos gerados

| Artefato | Caminho |
|----------|---------|
| Relatório visual de testes | `reports/test-report.html` |
| Resultado JUnit (XML) | `reports/junit.xml` |
| Cobertura — resumo HTML | `coverage/index.html` |
| Cobertura — navegável por arquivo | `coverage/lcov-report/index.html` |
| Cobertura — LCOV | `coverage/lcov.info` |
| Documento de cenários | `CENARIOS.md` |

## 7. Conclusão

Todos os 27 cenários de teste derivados das regras de negócio e os 3 cenários de
interface foram **aprovados (31/31)**. A lógica de negócio (`src/climatizacao.js`)
apresenta **100% de cobertura de statements, branches, functions e lines**, com
**100% de cobertura de branches** no projeto como um todo. O sistema está em
conformidade com o oráculo de teste definido em `CENARIOS.md`.
