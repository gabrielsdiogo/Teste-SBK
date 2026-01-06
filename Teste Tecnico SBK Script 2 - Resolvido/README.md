# Extração de Dados Climáticos via API - WeatherAPI

Sistema para extrair dados climáticos em tempo real via API WeatherAPI, desenvolvido seguindo os princípios de Clean Architecture.

## Arquitetura

O projeto segue os princípios de **Clean Architecture**, dividido em 4 camadas:

### 1. Domain (Domínio)
- **models.py**: Define a entidade `WeatherData` que representa os dados climáticos
- **repositories.py**: Define as interfaces `IWeatherAPIClient` e `IWeatherRepository`

### 2. Application (Aplicação)
- **use_cases.py**: Implementa `ExtractAndSaveWeatherDataUseCase` - orquestra a extração e salvamento dos dados

### 3. Infrastructure (Infraestrutura)
- **weather_api_client.py**: Implementação concreta do cliente da API WeatherAPI
- **csv_repository.py**: Implementação concreta para salvar dados em CSV

### 4. Interface
- **main.py**: Ponto de entrada da aplicação com injeção de dependências

## Dados Extraídos

O sistema extrai os seguintes dados climáticos de São Paulo:

- Data e hora da coleta
- Temperatura atual (°C)
- Umidade do ar (%)
- Velocidade do vento (km/h)
- Precipitação (mm)

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Uso

Execute o sistema com:

```bash
python run.py
```

Os dados serão salvos no arquivo `dados_climaticos.csv` e os logs em `weather_api.log`.

## Dependências

- **requests**: Para fazer requisições HTTP para a API

## Saída

O arquivo CSV gerado contém as seguintes colunas:

- data_coleta
- temperatura (°C)
- umidade (%)
- vento (km/h)
- chuva (mm)

## Logs

O sistema gera logs em dois locais:
- Console
- Arquivo `weather_api.log`
