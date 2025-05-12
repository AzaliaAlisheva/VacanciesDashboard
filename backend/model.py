import pandas as pd
import re
from collections import defaultdict
import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt

def salary_by_city(df):
    with_rub_salary = df[df['salary_currency'] == 'RUR']
    return with_rub_salary.groupby(['location'])['salary'].mean().apply(round).sort_values(ascending=False)

def position_stats():
    position_num = {}
    for position in ['intern', 'junior', 'middle', 'senior']:
        position_data = data[data['position'].apply(lambda x: position in x if pd.notnull(x) else False)]
        position_num[position] = position_data.shape[0]
    return position_num

def create_general_stats():
    counts = data['location'].value_counts()
    salaries = salary_by_city(data)
    cities_info = pd.DataFrame({'count': counts, 'salary': salaries}).replace({np.nan:None})
    company_info = data['company'].value_counts().head(20)
    position_info = position_stats()
    res = {
        'cities_stats': cities_info.to_dict(orient="index"),
        'companies_stats': company_info.to_dict(),
        'position_stats': position_info
    }

    with open("general_stats.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, default=lambda x: x if pd.notnull(x) else None, indent=4)

with open("../preprocessing/extended_data.csv", "r") as input:
    with open('../preprocessing/skills.json') as skills_file:
        SKILLS = json.load(skills_file)
        data = pd.read_csv(input)
create_general_stats()