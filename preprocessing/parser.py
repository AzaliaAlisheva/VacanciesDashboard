import requests
from datetime import datetime
import pandas as pd

def clean_html(text):
    import re
    return re.sub(r'<[^>]+>', '', text).strip()

def format_date(date_str):
    return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S%z").strftime("%Y-%m-%d")

def parse_hh(city_id, limit=1000):
    url = "https://api.hh.ru/vacancies"
    search_params = ["ML", "разработчик мобильных приложений", "Фронтенд", "Информационная безопасность", "QA"]
    params = {
        "text": " OR ".join(search_params), # More precise
        "area": city_id,
        "per_page": 100,
        "page": 0
    }
    
    all_vacancies = []
    cnt = 0
    while True:
        data = requests.get(url, params=params).json()
        vacancies = data["items"]
        cnt += len(vacancies)

        for vacancy in vacancies:
            salary = vacancy.get('salary')
            if vacancy["area"] and int(vacancy["area"]["id"]) in city_ids:
                # Store structured data
                all_vacancies.append({
                    "job_title": vacancy["name"],
                    "company": vacancy["employer"]["name"] if vacancy["employer"] else None,
                    "location": vacancy["area"]["name"],
                    "responsibilities": clean_html(vacancy["snippet"]["responsibility"]) if vacancy["snippet"] and vacancy["snippet"]["responsibility"] else None,
                    "requirements": clean_html(vacancy["snippet"]["requirement"]) if vacancy["snippet"] and vacancy["snippet"]["requirement"] else None,
                    "salary_from": salary["from"] if salary else None,
                    "salary_to": salary["to"] if salary else None,
                    "salary_currency": salary["currency"] if salary else None,
                    "posted_date": format_date(vacancy["published_at"]) if vacancy["published_at"] else None,
                    "url": vacancy["alternate_url"]
                })
        
        if params["page"] >= data["pages"] - 1 or cnt >= limit:
            break
        params["page"] += 1
    
    return all_vacancies

# ID крупных городов (Москва, СПб, Новосибирск, Екатеринбург, Нижний Новгород, Казань)
city_ids = [1, 2, 4, 3, 66, 88] 
result = []
for id in city_ids:
    result.extend(parse_hh(id, 200))
df = pd.DataFrame(result)
with open("hh_jobs.csv", "w", encoding='utf-8') as file:
    df.to_csv(file, index=False)

