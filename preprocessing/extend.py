import pandas as pd

import re
import pandas as pd
import numpy as np
import json

CATEGORY_EXTRA = {
    'backend': ['backend', 'бэкенд'],
    'web': ['web', 'frontend', 'фронтенд'],
    'mobile': ['mobile', 'мобильная разработка', 'мобильный разработчик'],
    'devops': ['devops', 'девопс', 'sre'],
    'data': ['data science', 'анализ данных', 'аналитика', 'аналитик', 'аналитики'],
    'ml': ['machine learning', 'ml', 'машинное обучение', 'машинного обучения'],
    'security': ['security', 'cybersecurity', 'иб', 'кибербезопасность', 'кибербезопасности', 'безопасность', 'безопасности'],
    'qa': ['qa', 'тестирование', 'тестировщик', 'тестирования']
}

def extract_skills(text):
    text = text.lower()
    categories_res = set()
    skills_res = set()
    
    for category, skills in SKILLS.items():
        for skill, patterns in skills.items():
            for pattern in patterns:
                regex_pattern = r'(?<!\w)' + re.escape(pattern) + r'(?!\w)'
                if re.search(regex_pattern, text):
                    categories_res.add(category)
                    skills_res.add(skill)
                    break
    
    for category, patterns in CATEGORY_EXTRA.items():
        for pattern in patterns:
            regex_pattern = r'(?<!\w)' + re.escape(pattern) + r'(?!\w)'
            if re.search(regex_pattern, text):
                categories_res.add(category)
                break

    return pd.Series({ "category" : list(categories_res) if categories_res else None, "skills" : list(skills_res) if skills_res else None })

def extract_position(text):
    text = text.lower()
    patterns = [
        (r'senior|lead|principal|architect|старший|ведущий|архитектор', 'senior'),
        (r'junior|младший|джуниор', 'junior'),
        (r'middle|мид|мидл', 'middle'),
        (r'intern|trainee|стажер|интерн|стажировка', 'intern')
    ]

    result = set()
    for pattern, pattern_type in patterns:
        for match in re.finditer(pattern, text):
            result.add(pattern_type)
    return list(result) if result else None

def extract_experience(text):
    """Identify experience requirements with Russian support"""
    text = text.lower()
    patterns = [
        (r'(\d+)\+?\s*years?', 'years'),  # "5+ years", "3 years"
        (r'(\d+)\s*-\s*(\d+)\s*years?', 'range_years'),  # "3-5 years"
        
        (r'(\d+)[\s-]*(?:х\s*)?(?:лет|год[а-я]*)', 'years'),     # "3 года", "5 лет"
        (r'от\s*(\d+)\s*до\s*(\d+)\s*(?:лет|год[а-я]*)', 'range_years'),  # "от 2 до 5 лет"
        (r'(\d+)\s*-\s*(\d+)\s*(?:лет|год[а-я]*)', 'range_years'),       # "3-5 лет"
    ]
    
    for pattern, pattern_type in patterns:
        for match in re.finditer(pattern, text):
            return match.group(1)

def extract_degree(text):
    text = text.lower()
    education = set()
    education_map = {
        # English
        'bachelor': 'Bachelor',
        'bachelor\'s': 'Bachelor',
        'bs ': 'Bachelor',  # BS in Computer Science
        'bsc ': 'Bachelor',  # BSc in Engineering
        'master': 'Master',
        'master\'s': 'Master',
        'ms ': 'Master',  # MS in Data Science
        'msc ': 'Master',  # MSc in Physics
        'phd': 'PhD',
        'ph.d': 'PhD',
        
        # Russian
        'бакалавр': 'Bachelor',
        'бакалавриат': 'Bachelor',
        'высшее образование': 'Bachelor',
        'магистр': 'Master',
        'магистратура': 'Master',
        'кандидат наук': 'PhD',
        'аспирант': 'PhD',
        'доктор наук': 'PhD'  # Doctor of Sciences (higher than PhD)
    }
    
    for term, degree in education_map.items():
        if re.search(rf'\b{term}\b', text):
            return degree
        
def calculate_avg_salary(entity):
    if not(np.isnan(entity['salary_from'])) and not(np.isnan(entity['salary_to'])):
        return (entity['salary_from'] + entity['salary_to']) / 2
    elif not(np.isnan(entity['salary_from'])):
        return entity['salary_from']
    elif not(np.isnan(entity['salary_to'])):
        return entity['salary_to']
    else:
        return None

def preprocess_df (df):
    """Full analysis of job description with bilingual support"""
    full_description = df[['job_title','requirements']].agg(' '.join, axis=1)
    df[['category', 'skills']] = full_description.apply(extract_skills)
    df['position'] = full_description.apply(extract_position)
    df['experience'] = full_description.apply(extract_experience)
    df['education'] = df['requirements'].apply(extract_degree)
    df['salary'] = df[['salary_from', 'salary_to']].apply(calculate_avg_salary, axis=1)
    result = df['company'].str.extract(r'\((.*?)\)', expand=False)
    result = result.fillna(df['company'])
    df['company'] = result

with open("hh_jobs.csv", "r") as input:
    with open("../backend/skills.json", "r") as skills_file:
        SKILLS = json.load(skills_file)
        data = pd.read_csv(input)
        str_cols = ['responsibilities', 'requirements'] 
        data[str_cols] = data[str_cols].fillna('')
        preprocess_df(data)

    with open("../backend/extended_data.csv", "w") as output:
        data.to_csv(output, index=False)