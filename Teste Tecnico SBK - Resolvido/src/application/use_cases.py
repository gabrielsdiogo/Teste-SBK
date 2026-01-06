import logging

from ..domain.repositories import IWeatherScraper, IWeatherRepository


class ExtractAndSaveWeatherDataUseCase:
    def __init__(
        self,
        scraper: IWeatherScraper,
        repository: IWeatherRepository
    ):
        self.scraper = scraper
        self.repository = repository
        self.logger = logging.getLogger(__name__)

    def execute(self, url: str) -> bool:
        try:
            self.logger.info("Iniciando extração de dados climáticos")

            # Extrai os dados
            weather_data = self.scraper.extract_weather_data(url)

            if weather_data is None:
                self.logger.error("Falha ao extrair dados climáticos")
                return False

            # Salva os dados
            self.repository.save(weather_data)

            self.logger.info("Processo concluído com sucesso")
            return True

        except Exception as e:
            self.logger.error(f"Erro ao executar caso de uso: {e}")
            return False
