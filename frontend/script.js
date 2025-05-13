const container = document.querySelector('.chart-flex');
const leftBtn = document.querySelector('.scroll-btn.left');
const rightBtn = document.querySelector('.scroll-btn.right');
const general_card = document.querySelector('.chart-flex > .chart-card');
const scrollAmount = general_card.clientWidth + parseFloat(window.getComputedStyle(general_card).marginLeft) + parseFloat(window.getComputedStyle(general_card).marginRight); // Card width + margin

leftBtn.addEventListener('click', () => {
  container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

rightBtn.addEventListener('click', () => {
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

container.addEventListener('scroll', () => {
  leftBtn.classList.toggle('disabled', container.scrollLeft === 0);
  rightBtn.classList.toggle('disabled', 
    container.scrollLeft + container.clientWidth >= container.scrollWidth
  );
});

// async function fetchGeneralStats() {
//     try {
//     const response = await fetch('http://localhost:8000/stats');
//     if (!response.ok) throw new Error('Failed to fetch general statistics');
//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return ['backend', 'web', 'devops']; // Fallback data
//   }
// }

// Chart configurations
const chartConfigs = {
  // Pie chart for vacancies by city
  cityPie: {
    type: 'pie',
    container: 'city-pie-chart',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  },
  // Bar chart for top companies
  companyBar: {
    type: 'bar',
    container: 'company-bar-chart',
    options: {
      responsive: true,
      indexAxis: 'y', // Horizontal bars
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      barPercentage: 0.4,
    }
  },
  // Bar chart for positions
  positionBar: {
    type: 'bar',
    container: 'position-bar-chart',
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  },
  // Bar chart for salaries by city
  salaryCity: {
    type: 'bar',
    container: 'salary-by-city-chart',
    options: {
      responsive: true,
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Salary (k RUB)'
          },
          grace: '5%'
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      barPercentage: 0.4,
    }
  },
   // Bar chart for positions
  skillDemandBar: {
    type: 'bar',
    container: 'skills-by-category-chart',
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "% of vacancies in category"
          },
          grace: '5%'
        }
      }
    }
  },
  salaryCityCategory: {
    type: 'bar',
    container: 'salary-city-category-chart',
    options: {
      responsive: true,
      indexAxis: 'y',
      // maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Salary (k RUB)'
          },
          grace: '5%'
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      barPercentage: 0.4,
    }
  },
  salarySkillBar: {
    type: 'bar',
    container: 'salary-by-skill-chart',
    options: {
      responsive: true,
      indexAxis: 'x',
      // maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Salary (k RUB)'
          },
          grace: '5%'
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      barPercentage: 0.4,
    }
  },
};

const charts = {};

function initCharts() {
  Object.keys(chartConfigs).forEach(chartKey => {
    const config = chartConfigs[chartKey];
    const ctx = document.getElementById(config.container).getContext('2d');
    
    charts[chartKey] = new Chart(ctx, {
      type: config.type,
      data: { labels: [], datasets: [] },
      options: config.options
    });
  });
}

// Individual chart update functions
function updateCityPie(cityData) {
  charts.cityPie.data.labels = Object.keys(cityData);
  charts.cityPie.data.datasets = [{
    data: Object.values(cityData).map(item => item.count),
    backgroundColor: getChartColors(Object.keys(cityData).length)
  }];
  charts.cityPie.update();
}

function updateCompanyBar(companyData) {
  // Sort and get top 10
  const top10 = Object.entries(companyData)
    .sort(([, a], [, b]) => b - a) // Sort descending by value
    .slice(0, 10) // Take top 10
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  charts.companyBar.data.labels = Object.keys(top10);
  charts.companyBar.data.datasets = [{
    data: Object.values(top10),
    backgroundColor: '#43aa8b'
  }];
  charts.companyBar.update();
}

function updatePositionBar(positionData) {
  charts.positionBar.data.labels = Object.keys(positionData);
  charts.positionBar.data.datasets = [{
    data: Object.values(positionData),
    backgroundColor: '#ff006e'
  }];
  charts.positionBar.update();
}

function updateSalaryCity(cityData) {
  const filteredCities = Object.fromEntries(
      Object.entries(cityData).filter(([city, data]) => data.salary !== null)
  );

  // const sortedCities = Object.fromEntries(
  //     Object.entries(filteredCities)
  //         .sort((a, b) => b[1].salary - a[1].salary)
  // );

  charts.salaryCity.data.labels = Object.keys(filteredCities);
  charts.salaryCity.data.datasets = [{
    data: Object.values(filteredCities).map(item => item.salary / 1000),
    backgroundColor: '#3a86ff'
  }];
  charts.salaryCity.update();
}

// Helper function for chart colors
function getChartColors(count) {
  const palette = ['#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b', '#43aa8b'];
  const colors = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  
  return colors;
}

async function fetchGeneralStats() {
  fetch('/general/stats')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response for general stats fetching was not ok');
    }
    return response.json();
  })
  .then(data => {
    updateCityPie(data.cities_stats);
    updateCompanyBar(data.companies_stats);
    updatePositionBar(data.position_stats);
    updateSalaryCity(data.cities_stats);
  })
  .catch(error => {
    console.error('Error fetching JSON:', error);
  });
}

async function fetchCategories() {
  fetch('/skills')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response for skill fetching was not ok');
    }
    return response.json();
  })
  .then(data => {
    const categoryFilter = document.getElementById('category-filter');

    const categories = Object.keys(data);
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error fetching JSON:', error);
  });
}

async function updateSkillDemand(skillData){
  charts.skillDemandBar.data.labels = Object.keys(skillData);
  charts.skillDemandBar.data.datasets = [{
    data: Object.values(skillData).map(item => item * 100),
    backgroundColor: '#8338ec'
  }];
  charts.skillDemandBar.update();
}

function updateSalaryCityCategory(cityData) {
  const filteredCities = Object.fromEntries(
      Object.entries(cityData).filter(([city, data]) => data.salary !== null)
  );

  const sortedCities = Object.fromEntries(
      Object.entries(filteredCities)
          .sort((a, b) => b[1].salary - a[1].salary)
  );

  charts.salaryCityCategory.data.labels = Object.keys(sortedCities);
  charts.salaryCityCategory.data.datasets = [{
    data: Object.values(sortedCities).map(item => item / 1000),
    backgroundColor: '#3a86ff'
  }];
  charts.salaryCityCategory.update();
}

function updateSalarySkillBar(skillData) {
  const filteredCities = Object.fromEntries(
      Object.entries(skillData).filter(([skill, data]) => data.salary !== null)
  );

  const sortedCities = Object.fromEntries(
      Object.entries(filteredCities)
          .sort((a, b) => b[1].salary - a[1].salary)
  );

  charts.salarySkillBar.data.labels = Object.keys(sortedCities);
  charts.salarySkillBar.data.datasets = [{
    data: Object.values(sortedCities).map(item => item / 1000),
    backgroundColor: '#ff006e'
  }];
  charts.salarySkillBar.update();
}

async function fetchCategoryData(category) {
  fetch(`/${category}/stats`)
   .then(response => {
    if (!response.ok) {
      throw new Error('Network response for category fetching was not ok');
    }
    return response.json();
  })
  .then(data => {
    updateSkillDemand(data.skill_demand);
    updateSalaryCityCategory(data.city_salary);
    updateSalarySkillBar(data.skill_salary);
  })
  .catch(error => {
    console.error('Error fetching JSON:', error);
  });
}

function updateCategoryName(selectedCategory) {
  const categoryNameElements = document.querySelectorAll('.category-name');
  
  categoryNameElements.forEach(element => {
    element.textContent = selectedCategory;
  });
}

document.getElementById('category-filter').addEventListener('change', function() {
  const selectedCategory = this.options[this.selectedIndex].text;
  
  updateCategoryName(selectedCategory);
  
  fetchCategoryData(selectedCategory);
  // Here you would also call your chart update functions
  // updateSkillsChart(selectedCategory);
  // updateSalaryByCityChart(selectedCategory);
  // updateSalaryBySkillChart(selectedCategory);
});


fetchGeneralStats();
fetchCategories();
initCharts();
updateCategoryName("All Categories");

