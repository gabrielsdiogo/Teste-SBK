# Desafio Técnico – Senior Full Stack (React + NestJS)

## Objetivo

Construir uma aplicação **full stack (React + NestJS)** que consuma e apresente dados de um arquivo JSON fornecido, tratando-o como uma **base de dados local e imutável (read-only)**.

O foco do desafio é avaliar:

* Integração **frontend ↔ backend**
* Modelagem de API e definição de DTOs
* Arquitetura e organização do projeto
* Qualidade da documentação e clareza das decisões técnicas

> Não é esperado refinamento visual ou funcionalidades além do escopo descrito.

---

## Contexto dos Dados

Será fornecido um arquivo JSON contendo **100 processos da empresa Itaú**.

Este arquivo:

* Será a **única fonte de dados** da aplicação
* Deve ser tratado como **read-only**
* **Não deve ser persistido** em banco de dados

O JSON possui dados aninhados, incluindo:

* Lista de processos (`content[]`)
* Informações de tribunal, grau, classes e assuntos
* Tramitações do processo
* Último movimento
* Partes, documentos e representantes

---

## Requisitos do Backend (NestJS)

### 1. Fonte de Dados

* Carregar o arquivo JSON na aplicação (ex.: na inicialização)
* Implementar uma camada de acesso aos dados (ex.: `ProcessosRepository`) para isolar a origem

---

### 2. API REST

O backend deve expor uma API pensada para consumo pelo frontend, **não retornando o JSON bruto**, mas sim **DTOs apropriados para UI**.

---

### 3. Endpoints Mínimos

#### `GET /processos`

Retorna uma listagem paginada de processos (formato resumo).

**Query params suportados:**

* `q`: busca textual simples (ex.: número do processo, nome das partes, classe ou assunto)
* `tribunal`: filtro por sigla do tribunal (ex.: TJSP, TJMG)
* `grau`: filtro por grau (ex.: G1, G2)
* `limit`: quantidade de registros (default: 20, máximo: 100)
* `cursor`: paginação baseada em cursor

**Resposta esperada:**

```json
{
  "items": [],
  "nextCursor": "string | null"
}
```

#### Estrutura mínima do `ProcessoSummary`

```ts
numeroProcesso
siglaTribunal
grauAtual
classePrincipal
assuntoPrincipal
ultimoMovimento {
  dataHora
  descricao
  orgaoJulgador
}
partesResumo {
  ativo: string[]
  passivo: string[]
}
```

---

#### `GET /processos/:numeroProcesso`

Retorna os dados detalhados de um processo específico.

#### Estrutura mínima do `ProcessoDetail`

##### Cabeçalho

```ts
numeroProcesso
siglaTribunal
nivelSigilo
tramitacaoAtual
grau
orgaoJulgador
classes
assuntos
datasRelevantes
```

##### Partes

```ts
nome
tipoParte
polo
representantes (quantidade limitada)
```

##### Último Movimento

```ts
data
descricao
orgaoJulgador
codigo (se disponível)
```

---

## Regra Obrigatória – Tramitação Atual

Como um processo pode conter múltiplas `tramitacoes[]`, o backend deve definir e documentar claramente uma regra para escolher a **tramitação atual**.

### Exemplo de regra aceitável:

1. Priorizar tramitações com `ativo = true`
2. Entre elas, escolher a com maior `dataHoraUltimaDistribuicao`
3. Em caso de empate, escolher a de maior `grau.numero`

A regra pode ser diferente, desde que:

* Seja consistente
* Seja aplicada em toda a API
* Esteja documentada no README

---

## Validação e Tratamento de Erros

Validar parâmetros de entrada (`limit`, `grau`, `cursor`, etc.).

Formato sugerido:

```json
{
  "code": "INVALID_PARAMETER",
  "message": "Descrição do erro"
}
```

---

## Requisitos do Frontend (React)

### Tela de Listagem de Processos

* Campo de busca textual
* Filtros:

  * Tribunal
  * Grau
* Lista ou tabela exibindo:

  * Número do processo
  * Tribunal
  * Grau
  * Classe principal
  * Assunto principal
  * Último movimento
* Paginação via cursor (“Carregar mais”)

---

### Tela de Detalhe do Processo

* Cabeçalho do processo
* Partes (separadas por polo)
* Destaque do último movimento
* Informações da tramitação atual

---

### UX Mínimo

* Estados de loading
* Estado vazio
* Tratamento de erro da API
* Feedback visual simples

---

## Entregáveis

Repositório contendo:

```
/backend  → aplicação NestJS
/frontend → aplicação React
```

### README.md contendo:

* Como rodar o projeto localmente
* Decisões técnicas tomadas
* Trade-offs e simplificações
* Regra adotada para definir a tramitação atual
* Descrição breve do contrato da API
