import logging
import sys

from ..infrastructure.weather_api_client import WeatherAPIClient
from ..infrastructure.csv_repository import CSVWeatherRepository
from ..application.use_cases import ExtractAndSaveWeatherDataUseCase


def setup_logging():
    """Configura o sistema de logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('weather_api.log', encoding='utf-8')
        ]
    )


def main():
    """Função principal da aplicação"""
    # Configura logging
    setup_logging()
    logger = logging.getLogger(__name__)

    logger.info("=" * 50)
    logger.info("Iniciando Extração de Dados Climáticos via API")
    logger.info("=" * 50)

    # Configurações
    api_key = "41539b45ea834278a4f154652260601"
    city = "São Paulo"
    csv_file = "dados_climaticos.csv"

    # Injeção de dependências
    api_client = WeatherAPIClient(api_key=api_key)
    repository = CSVWeatherRepository(file_path=csv_file)
    use_case = ExtractAndSaveWeatherDataUseCase(api_client=api_client, repository=repository)

    # Executa o caso de uso
    success = use_case.execute(city)

    if success:
        logger.info(f"Dados salvos com sucesso em: {csv_file}")
        print(f"\nDados extraídos e salvos em: {csv_file}")
        return 0
    else:
        logger.error("Falha ao extrair e salvar dados")
        print("\nErro ao extrair dados. Verifique o arquivo de log.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
