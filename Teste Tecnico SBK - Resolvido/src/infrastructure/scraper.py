import requests
from bs4 import BeautifulSoup
from lxml import html
from typing import Optional
import logging

from ..domain.models import WeatherData
from ..domain.repositories import IWeatherScraper


class ClimatempoScraper(IWeatherScraper):

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def extract_weather_data(self, url: str) -> Optional[WeatherData]:
        try:
            self.logger.info(f"Extraindo dados de: {url}")

            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')
            tree = html.fromstring(response.content)

            # Extrair temperatura mínima
            temp_min_elem = soup.find(id='min-temp-1')
            temperatura_minima = temp_min_elem.text.strip() if temp_min_elem else 'N/A'

            # Extrair temperatura máxima
            temp_max_elem = soup.find(id='max-temp-1')
            temperatura_maxima = temp_max_elem.text.strip() if temp_max_elem else 'N/A'

            # Extrair chuva
            chuva_xpath = '//*[@id="mainContent"]/div[7]/div[3]/div[1]/div[2]/div[2]/div[3]/div[1]/ul/li[2]/div/span'
            chuva_elem = tree.xpath(chuva_xpath)
            chuva = chuva_elem[0].text.strip() if chuva_elem and chuva_elem[0].text else 'N/A'

            # Extrair vento
            vento_xpath = '//*[@id="mainContent"]/div[7]/div[3]/div[1]/div[2]/div[2]/div[3]/div[1]/ul/li[3]/div'
            vento_elem = tree.xpath(vento_xpath)
            vento = vento_elem[0].text_content().strip() if vento_elem else 'N/A'

            # Extrair umidade mínima
            umidade_min_xpath = '//*[@id="mainContent"]/div[7]/div[3]/div[1]/div[2]/div[2]/div[3]/div[1]/ul/li[4]/div/p/span[1]'
            umidade_min_elem = tree.xpath(umidade_min_xpath)
            umidade_minima = umidade_min_elem[0].text.strip() if umidade_min_elem and umidade_min_elem[0].text else 'N/A'

            # Extrair umidade máxima
            umidade_max_xpath = '//*[@id="mainContent"]/div[7]/div[3]/div[1]/div[2]/div[2]/div[3]/div[1]/ul/li[4]/div/p/span[2]'
            umidade_max_elem = tree.xpath(umidade_max_xpath)
            umidade_maxima = umidade_max_elem[0].text.strip() if umidade_max_elem and umidade_max_elem[0].text else 'N/A'

            weather_data = WeatherData(
                temperatura_minima=temperatura_minima,
                temperatura_maxima=temperatura_maxima,
                chuva=chuva,
                vento=vento,
                umidade_minima=umidade_minima,
                umidade_maxima=umidade_maxima
            )

            self.logger.info("Dados extraídos com sucesso")
            return weather_data

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Erro ao fazer requisição: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Erro ao extrair dados: {e}")
            return None
