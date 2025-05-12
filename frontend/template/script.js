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
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      barPercentage: 0.4,
    }
  }
};

// Individual chart update functions
function drawCityPie(cityData) {
    const config = chartConfigs['cityPie'];
    const ctx = document.getElementById(config.container).getContext('2d');
    cityPie = new Chart(ctx, {
      type: config.type,
      data: { labels:  Object.keys(cityData), 
        datasets: [{
            data: Object.values(cityData).map(item => item.count),
            backgroundColor: getChartColors(Object.keys(cityData).length)
        }] 
      }, 
      options: config.options
    });
}

function drawCompanyBar(companyData) {
  const config = chartConfigs['companyBar'];
  const ctx = document.getElementById(config.container).getContext('2d');
  // Sort and get top 10
  const top10 = Object.entries(companyData)
    .sort(([, a], [, b]) => b - a) // Sort descending by value
    .slice(0, 10) // Take top 10
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
    companyBar = new Chart(ctx, {
      type: config.type,
      data: { labels:  Object.keys(top10), 
        datasets: [{
            data: Object.values(top10),
            backgroundColor: '#3a86ff'
        }] 
      }, 
      options: config.options
    });
}

function drawPositionBar(positionData) {
  const config = chartConfigs['positionBar'];
  const ctx = document.getElementById(config.container).getContext('2d');

  positionBar = new Chart(ctx, {
      type: config.type,
      data: { labels:  Object.keys(positionData), 
        datasets: [{
            data: Object.values(positionData),
            backgroundColor: '#8338ec'
        }] 
      }, 
      options: config.options
    });
}

function drawSalaryCity(cityData) {
  const config = chartConfigs['salaryCity'];
    const ctx = document.getElementById(config.container).getContext('2d');

    const filteredCities = Object.fromEntries(
        Object.entries(cityData).filter(([city, data]) => data.salary !== null)
    );

    const sortedCities = Object.fromEntries(
        Object.entries(filteredCities)
            .sort((a, b) => b[1].salary - a[1].salary)
    );
    cityPie = new Chart(ctx, {
      type: config.type,
      data: { labels:  Object.keys(sortedCities), 
        datasets: [{
            data: Object.values(sortedCities).map(item => item.salary / 1000),
            backgroundColor: '#ff006e'
        }] 
      }, 
      options: config.options
    });
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
  fetch('http://localhost:8000/general/stats')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response for general stats fetching was not ok');
    }
    return response.json();
  })
  .then(data => {
    drawCityPie(data.cities_stats);
    drawCompanyBar(data.companies_stats);
    drawPositionBar(data.position_stats);
    drawSalaryCity(data.cities_stats);
  })
  .catch(error => {
    console.error('Error fetching JSON:', error);
  });
}

async function fetchCategories() {
  fetch('http://localhost:8000/skills')
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

async function fetchCategoryData(category) {
  fetch("http://localhost:8000/${category}/stats")
   .then(response => {
    if (!response.ok) {
      throw new Error('Network response for category fetching was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data)
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
  
  // Here you would also call your chart update functions
  // updateSkillsChart(selectedCategory);
  // updateSalaryByCityChart(selectedCategory);
  // updateSalaryBySkillChart(selectedCategory);
});

fetchGeneralStats();
fetchCategories();
updateCategoryName("All Categories");

