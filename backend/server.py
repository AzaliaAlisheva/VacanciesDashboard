from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import random
from datetime import datetime
import json
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend development

# database
with open("extended_data.csv", "r") as input:
    with open("skills.json", 'r') as skills_file:
        SKILLS = json.load(skills_file)
        data = pd.read_csv(input)

def skill_demand(category):
    skill_persentage = {}
    category_data = data[data['category'].apply(lambda x: category in x if pd.notnull(x) else False)]
    for skill in SKILLS[category].keys():
        skill_data = category_data[category_data['skills'].apply(lambda x: skill in x if pd.notnull(x) else False)]
        if skill_data.shape[0] != 0:
            skill_persentage[skill] = skill_data.shape[0] / category_data.shape[0]
    return dict(sorted(skill_persentage.items(), key=lambda item: item[1], reverse=True))

def salary_by_city(df):
    with_rub_salary = df[df['salary_currency'] == 'RUR']
    return with_rub_salary.groupby(['location'])['salary'].mean().apply(round).sort_values(ascending=False)

def salary_by_city_in_category(category):
    category_data = data[data['category'].apply(lambda x: category in x if pd.notnull(x) else False)]
    return salary_by_city(category_data)

def get_salary(skill):
    category_with_rub = data[(data['skills'].apply(lambda x: skill in x if pd.notnull(x) else False)) & (data['salary_currency'] == 'RUR')]
    return category_with_rub['salary'].mean()

def salary_by_skill(category):
    skill_salary = {}
    for skill in SKILLS[category].keys():
        res = get_salary(skill)
        if pd.notnull(res):
            skill_salary[skill] = round(res)
    return dict(sorted(skill_salary.items(), key=lambda item: item[1], reverse=True))

def position_stats():
    position_num = {}
    for position in ['intern', 'junior', 'middle', 'senior']:
        position_data = data[data['position'].apply(lambda x: position in x if pd.notnull(x) else False)]
        position_num[position] = position_data.shape[0]
    return position_num
    
@app.route('/skills', methods=['GET'])
def get_categories():
    return jsonify(SKILLS)


@app.route('/general/stats', methods=['GET'])
def get_general_stats():
    counts = data['location'].value_counts()
    salaries = salary_by_city(data)
    cities_info = pd.DataFrame({'count': counts, 'salary': salaries}).replace({np.nan:None})
    company_info = data['company'].value_counts().head(20)
    company_info = company_info.rename(index={
        'Уральский центр систем безопасности': 'УЦСБ'
    })
    position_info = position_stats()
    res = {
        'cities_stats': cities_info.to_dict(orient="index"),
        'companies_stats': company_info.to_dict(),
        'position_stats': position_info
    }

    return jsonify(res)

@app.route('/<category>/stats', methods=['GET'])
def get_category_stats(category):
    return jsonify({
        "skill_demand": skill_demand(category),
        "city_salary": salary_by_city_in_category(category).to_dict(),
        "skill_salary": salary_by_skill(category),
    })

# @app.route('/jobs', methods=['GET'])
# def get_jobs():
#    return jsonify(jobs)

if __name__ == '__main__':
    app.run('0.0.0.0', port=8000)