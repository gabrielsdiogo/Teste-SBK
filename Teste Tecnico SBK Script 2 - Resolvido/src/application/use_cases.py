import logging

from ..domain.repositories import IWeatherAPIClient, IWeatherRepository


class ExtractAndSaveWeatherDataUseCase:
    """Caso de uso para extrair dados climáticos da API e salvar em CSV"""

    def __init__(
        self,
        api_client: IWeatherAPIClient,
        repository: IWeatherRepository
    ):
        self.api_client = api_client
        self.repository = repository
        self.logger = logging.getLogger(__name__)

    def execute(self, city: str) -> bool:
        """
        Executa o caso de uso de extração e salvamento de dados climáticos

        Args:
            city: Nome da cidade para consulta

        Returns:
            bool: True se bem-sucedido, False caso contrário
        """
        try:
            self.logger.info(f"Iniciando extração de dados climáticos para {city}")

            # Extrai os dados via API
            weather_data = self.api_client.get_weather_data(city)

            if weather_data is None:
                self.logger.error("Falha ao obter dados climáticos da API")
                return False

            # Salva os dados
            self.repository.save(weather_data)

            self.logger.info("Processo concluído com sucesso")
            return True

        except Exception as e:
            self.logger.error(f"Erro ao executar caso de uso: {e}")
            return False
