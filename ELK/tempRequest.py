import json
import requests

url = 'http://192.168.0.2:8010'

params= dict(
		celcius='35',
		fahrenheit='90'
)

res = requests.get(url=url, params=params)