# Web Scraper de Dados Climáticos - Climatempo

Sistema de web scraping para extrair dados climáticos do site Climatempo, desenvolvido seguindo os princípios de Clean Architecture.

## Arquitetura

O projeto segue os princípios de **Clean Architecture**, dividido em 4 camadas:

### 1. Domain (Domínio)
- **models.py**: Define a entidade `WeatherData` que representa os dados climáticos
- **repositories.py**: Define as interfaces `IWeatherScraper` e `IWeatherRepository`

### 2. Application (Aplicação)
- **use_cases.py**: Implementa `ExtractAndSaveWeatherDataUseCase` - orquestra a extração e salvamento dos dados

### 3. Infrastructure (Infraestrutura)
- **scraper.py**: Implementação concreta do scraper usando BeautifulSoup e lxml
- **csv_repository.py**: Implementação concreta para salvar dados em CSV

### 4. Interface
- **main.py**: Ponto de entrada da aplicação com injeção de dependências

## Dados Extraídos

O scraper extrai os seguintes dados climáticos de São Paulo:

- Data e hora da coleta
- Temperatura mínima
- Temperatura máxima
- Probabilidade de chuva
- Velocidade do vento
- Umidade mínima
- Umidade máxima

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Uso

Execute o scraper com:

```bash
python run.py
```

Os dados serão salvos no arquivo `dados_climaticos.csv` e os logs em `weather_scraper.log`.

## Dependências

- **requests**: Para fazer requisições HTTP
- **beautifulsoup4**: Para parsing HTML
- **lxml**: Para XPath

## Saída

O arquivo CSV gerado contém as seguintes colunas:

- data_coleta
- temperatura_minima
- temperatura_maxima
- chuva
- vento
- umidade_minima
- umidade_maxima

## Logs

O sistema gera logs em dois locais:
- Console
- Arquivo `weather_scraper.log`
