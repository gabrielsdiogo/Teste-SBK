# Desafio Técnico - Senior Full Stack (React + NestJS)

Aplicação full-stack para consulta e visualização de processos judiciais do Itaú, construída com React (frontend) e NestJS (backend).

## Como Rodar o Projeto Localmente

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Backend (NestJS)

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`.

### Frontend (React)

1. Em outro terminal, entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### Acessando a Aplicação

Após iniciar backend e frontend, acesse `http://localhost:5173` no navegador para visualizar a aplicação.

## Guia de Uso da Aplicação

### Tela de Listagem de Processos

Ao acessar a aplicação, você verá a tela principal com a lista de processos judiciais:

![Tela Principal](docs/tela-principal.png)

#### Funcionalidades Disponíveis

**1. Busca Textual**
- Localize o campo de busca no topo da página
- Digite qualquer termo relacionado ao processo:
  - Número do processo (ex: "5000918-41.2021.8.13.0487")
  - Nome de partes envolvidas (ex: "ITAU", "SEBASTIAO")
  - Classe do processo (ex: "Apelação")
  - Assunto (ex: "Empréstimo consignado")
- A busca é executada automaticamente enquanto você digita
- A pesquisa não diferencia maiúsculas de minúsculas

**2. Filtros**
- **Tribunal**: Selecione um tribunal específico no dropdown
  - Opções: TJMG, TJSP, TJRJ, TJRS, e outros
  - Selecione "Todos os tribunais" para remover o filtro

- **Grau**: Filtre por instância do processo
  - G1 (Primeiro Grau)
  - G2 (Segundo Grau)
  - Selecione "Todos os graus" para remover o filtro

- **Combinação de Filtros**: Você pode usar busca textual e filtros simultaneamente para refinar os resultados

**3. Visualização da Lista**

A tabela exibe as seguintes informações para cada processo:

| Coluna | Descrição |
|--------|-----------|
| **Número do Processo** | Identificador único do processo (clique para ver detalhes) |
| **Tribunal** | Sigla do tribunal (ex: TJMG, TJSP) |
| **Grau** | Instância atual (G1 ou G2) |
| **Classe** | Tipo do processo (ex: Apelação Cível, Procedimento Comum) |
| **Assunto** | Tema principal (ex: Empréstimo consignado, Contratos Bancários) |
| **Último Movimento** | Data e descrição da última movimentação processual |

**4. Paginação**
- Por padrão, são exibidos 20 processos por página
- Role até o final da lista e clique em "Carregar mais" para visualizar processos adicionais
- Os novos processos serão adicionados ao final da lista atual
- O botão desaparece quando não houver mais processos para carregar

**5. Estados da Interface**
- **Carregando**: Exibe "Carregando processos..." durante a busca
- **Vazio**: Mostra "Nenhum processo encontrado" quando nenhum resultado corresponde aos filtros
- **Erro**: Exibe mensagem de erro em caso de falha na comunicação com o servidor

### Tela de Detalhes do Processo

Clique em qualquer linha da tabela para visualizar os detalhes completos de um processo.

#### Informações Exibidas

**1. Cabeçalho**
- Número completo do processo
- Status da tramitação (Ativo/Inativo)

**2. Informações Gerais**
- Tribunal responsável
- Grau e nome completo da instância
- Nível de sigilo
- Órgão julgador

**3. Datas Relevantes**
- Data de ajuizamento
- Data da última distribuição

**4. Classes Processuais**
- Lista completa de todas as classes associadas ao processo
- Código e descrição de cada classe

**5. Assuntos**
- Assuntos relacionados ao processo
- Hierarquia completa de cada assunto
- Códigos de classificação

**6. Último Movimento (Destacado)**
- Data e hora do movimento
- Código do movimento
- Descrição completa (com links clicáveis, se houver)
- Órgãos julgadores responsáveis

**7. Partes do Processo**

Divididas por polo:

- **Polo Ativo**: Autores/Apelantes
  - Nome da parte
  - Tipo de participação
  - Lista de representantes legais (até 5):
    - Nome do advogado
    - Tipo de representação
    - Status (Ativo/Inativo)

- **Polo Passivo**: Réus/Apelados
  - Mesmas informações do polo ativo

**8. Navegação**
- Clique no botão "← Voltar" no topo para retornar à lista de processos
- A lista manterá os filtros e a posição de rolagem anteriores

## Contrato da API

### Base URL
```
http://localhost:3000
```

### Endpoints

#### `GET /processos`

Retorna uma listagem paginada de processos.

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Valores |
|-----------|------|-------------|-----------|---------|
| `q` | string | Não | Busca textual (número, partes, classe, assunto) | Qualquer string |
| `tribunal` | string | Não | Filtro por sigla do tribunal | TJMG, TJSP, TJRJ, etc. |
| `grau` | string | Não | Filtro por grau | G1, G2 |
| `limit` | number | Não | Quantidade de registros (default: 20) | 1-100 |
| `cursor` | string | Não | Cursor para paginação | Número do processo |

**Exemplo de Requisição:**
```
GET /processos?q=empréstimo&tribunal=TJMG&grau=G2&limit=20
```

**Resposta de Sucesso (200):**
```json
{
  "items": [
    {
      "numeroProcesso": "5000918-41.2021.8.13.0487",
      "siglaTribunal": "TJMG",
      "grauAtual": "G2",
      "classePrincipal": "Apelação Cível",
      "assuntoPrincipal": "Empréstimo consignado",
      "ultimoMovimento": {
        "dataHora": "2023-08-04T00:00:00",
        "descricao": "Comunicação eletrônica enviada:",
        "orgaoJulgador": "GABINETE DO DESEMBARGADOR...",
        "codigo": 92
      },
      "partesResumo": {
        "ativo": ["SEBASTIAO SILVA"],
        "passivo": ["BANCO ITAU CONSIGNADO SA"]
      }
    }
  ],
  "nextCursor": "5000918-41.2021.8.13.0487"
}
```

**Resposta de Erro (400):**
```json
{
  "code": "INVALID_PARAMETER",
  "message": "O limite deve ser entre 1 e 100"
}
```

#### `GET /processos/:numeroProcesso`

Retorna os detalhes completos de um processo específico.

**Path Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `numeroProcesso` | string | Sim | Número do processo (URL encoded) |

**Exemplo de Requisição:**
```
GET /processos/5000918-41.2021.8.13.0487
```

**Resposta de Sucesso (200):**
```json
{
  "numeroProcesso": "5000918-41.2021.8.13.0487",
  "siglaTribunal": "TJMG",
  "nivelSigilo": 0,
  "tramitacaoAtual": "Ativo",
  "grau": {
    "sigla": "G2",
    "nome": "2° Grau",
    "numero": 2
  },
  "orgaoJulgador": "GABINETE DO DESEMBARGADOR...",
  "classes": [
    {
      "codigo": 198,
      "descricao": "Apelação Cível"
    }
  ],
  "assuntos": [
    {
      "codigo": 11806,
      "descricao": "Empréstimo consignado",
      "hierarquia": "(11806) Empréstimo consignado | ..."
    }
  ],
  "datasRelevantes": {
    "ajuizamento": "2023-02-28T00:00:00",
    "ultimaDistribuicao": "2023-02-28T00:00:00"
  },
  "partes": [
    {
      "nome": "SEBASTIAO SILVA",
      "tipoParte": "APELANTE",
      "polo": "ATIVO",
      "representantes": []
    },
    {
      "nome": "BANCO ITAU CONSIGNADO SA",
      "tipoParte": "APELADO",
      "polo": "PASSIVO",
      "representantes": [
        {
          "tipoRepresentacao": "ADVOGADO",
          "nome": "MARIANA BARROS MENDONCA",
          "situacao": "ATIVO"
        }
      ]
    }
  ],
  "ultimoMovimento": {
    "data": "2023-08-04T00:00:00",
    "descricao": "Comunicação eletrônica enviada:",
    "orgaoJulgador": ["GABINETE DO DESEMBARGADOR..."],
    "codigo": 92
  }
}
```

**Resposta de Erro (404):**
```json
{
  "code": "PROCESSO_NOT_FOUND",
  "message": "Processo 0000000-00.0000.0.00.0000 não encontrado"
}
```

### Backend (NestJS)

#### Arquitetura em Camadas

A aplicação backend foi organizada seguindo uma arquitetura em camadas:

- **Controller**: Responsável por receber as requisições HTTP, validar os parâmetros de entrada e retornar as respostas
- **Service**: Contém a lógica de negócio, incluindo transformações de dados, filtros e regras de seleção da tramitação atual
- **Repository**: Camada de acesso aos dados, isolando a fonte de dados (arquivo JSON) do restante da aplicação
- **DTOs**: Definem contratos claros para as respostas da API, separados da estrutura interna dos dados

#### Carregamento de Dados

O arquivo JSON é carregado na memória durante a inicialização da aplicação através do hook `onModuleInit` do NestJS. Esta abordagem foi escolhida por:

- Performance: Acesso direto à memória sem I/O de disco a cada requisição
- Simplicidade: Não há necessidade de banco de dados para dados read-only
- Requisito do desafio: O JSON deve ser tratado como read-only

#### Validação e Tratamento de Erros

- Utiliza `class-validator` e `class-transformer` para validação declarativa dos DTOs
- ValidationPipe global configurado para transformar e validar automaticamente todos os parâmetros
- Respostas de erro seguem um formato consistente (`code` + `message`)
- Códigos de erro descritivos (ex: `INVALID_PARAMETER`, `PROCESSO_NOT_FOUND`)

#### Paginação com Cursor

Implementada paginação baseada em cursor (numero do processo) ao invés de offset/limit porque:

- Mais eficiente para datasets que podem mudar
- Evita problemas de duplicação quando novos itens são adicionados
- Melhor para carregamento progressivo ("infinite scroll")

### Frontend (React + TypeScript)

#### Estrutura de Componentes

Componentes organizados de forma modular:

- `ProcessosList`: Lista paginada com filtros
- `ProcessoDetail`: Visualização detalhada de um processo
- Separação de concerns: lógica de API no serviço `api.ts`

#### Gerenciamento de Estado

Utilizou useState do React para simplicidade, já que:

- Estado é local aos componentes
- Não há necessidade de compartilhar estado global complexo
- Facilita o entendimento do código

#### Experiência do Usuário

- Estados de loading visíveis durante requisições
- Mensagens de erro claras para o usuário
- Estado vazio quando não há resultados
- Feedback visual nas interações (hover, cliques)
- Cores no tema do Itaú (laranja: #ec7000)

#### Tratamento de Erros

- Try/catch em todas as chamadas de API
- Tipagem forte dos erros com classe `ApiError`
- Exibição de mensagens de erro amigáveis ao usuário

## Regra para Tramitação Atual

Como um processo pode conter múltiplas tramitações, foi necessário definir uma regra clara para determinar qual é a **tramitação atual**.

### Regra Implementada

A tramitação atual é determinada pela seguinte ordem de prioridade:

1. **Priorizar tramitações ativas**: Tramitações com `ativo = true` são consideradas primeiro
2. **Data mais recente**: Entre as tramitações ativas, escolher a que possui maior `dataHoraUltimaDistribuicao`
3. **Maior grau**: Em caso de empate nas datas, escolher a tramitação com maior `grau.numero`

### Localização no Código

A implementação está em `backend/src/processos/processos.service.ts:13` no método `getTramitacaoAtual()`.

## Tecnologias Utilizadas

### Backend
- **NestJS 10**: Framework Node.js com TypeScript
- **class-validator**: Validação declarativa de DTOs
- **class-transformer**: Transformação de objetos

### Frontend
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **CSS puro**: Estilização
