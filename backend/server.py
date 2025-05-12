from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from datetime import datetime
import json
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend development

# database
with open("../preprocessing/extended_data.csv", "r") as input:
    with open("../preprocessing/skills.json", 'r') as skills_file:
        SKILLS = json.load(skills_file)
        data = pd.read_csv(input)

def category_stats(category):
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

@app.route('/skills', methods=['GET'])
def get_categories():
    return jsonify(SKILLS)


@app.route('/general/stats', methods=['GET'])
def general_stats():
    with open('general_stats.json') as gen_file:
        return jsonify(json.load(gen_file))

@app.route('/<category>/stats', methods=['GET'])
def category_stats(category):
    return jsonify({
        "skill_persentage": category_stats(category),
        "city_salary": salary_by_city_in_category(category).to_dict(),
        "skill_salary": salary_by_skill(category),
    })

# @app.route('/jobs', methods=['GET'])
# def get_jobs():
#     category = request.args.get('category', 'all')
#     count = int(request.args.get('count', 100))
    
#     # Generate mock jobs
#     jobs = []
#     for _ in range(count):
#         job_category = category if category != 'all' else random.choice(categories)
#         jobs.append({
#             "id": random.randint(1000, 9999),
#             "title": f"{job_category.capitalize()} Developer",
#             "company": random.choice(companies),
#             "city": random.choice(cities),
#             "salary": random.randint(30000, 120000),
#             "skills": random.sample(skills_db.get(job_category, []), min(3, len(skills_db.get(job_category, [])))),
#             "date_posted": datetime.now().strftime("%Y-%m-%d")
#         })
    
#     return jsonify(jobs)

if __name__ == '__main__':
    app.run(debug=True, port=8000)