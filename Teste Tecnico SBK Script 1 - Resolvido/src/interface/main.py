import logging
import sys

from ..infrastructure.scraper import ClimatempoScraper
from ..infrastructure.csv_repository import CSVWeatherRepository
from ..application.use_cases import ExtractAndSaveWeatherDataUseCase


def setup_logging():
    # Setup do logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('weather_scraper.log', encoding='utf-8')
        ]
    )


def main():
    # Configura logging
    setup_logging()
    logger = logging.getLogger(__name__)

    logger.info("=" * 50)
    logger.info("Iniciando Web Scraper de Dados Climáticos")
    logger.info("=" * 50)

    url = "https://www.climatempo.com.br/previsao-do-tempo/cidade/558/saopaulo-sp"

    # Nome do arquivo CSV de saída
    csv_file = "dados_climaticos.csv"

    # Injeção de dependências
    scraper = ClimatempoScraper()
    repository = CSVWeatherRepository(file_path=csv_file)
    use_case = ExtractAndSaveWeatherDataUseCase(scraper=scraper, repository=repository)

    # Executa o caso de uso
    success = use_case.execute(url)

    if success:
        logger.info(f"Dados salvos com sucesso em: {csv_file}")
        print(f"\n✓ Dados extraídos e salvos em: {csv_file}")
        return 0
    else:
        logger.error("Falha ao extrair e salvar dados")
        print("\n✗ Erro ao extrair dados. Verifique o arquivo de log.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
