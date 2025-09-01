// Dashboard JavaScript
let dashboardData = {};
let issuancesChart = null;
let retirementsChart = null;

// Load data and initialize dashboard
async function loadDashboard() {
    try {
        const response = await fetch('dashboard_data_fixed.json');
        dashboardData = await response.json();
        
        // Hide loading and show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        
        // Initialize dashboard components
        updateStats();
        initializeFilters();
        createCharts();
        populateTransactionsTable();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        document.getElementById('loading').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error loading data';
    }
}

// Update statistics cards
function updateStats() {
    const overview = dashboardData['Overview'] || [];
    const credits = dashboardData['Credits Summary'] || [];
    
    // Update overview stats
    overview.forEach(item => {
        if (item.Metric === 'Country') {
            document.getElementById('country').textContent = item.Value;
        } else if (item.Metric === 'Category') {
            document.getElementById('category').textContent = item.Value;
        }
    });
    
    // Update credits stats
    credits.forEach(item => {
        if (item.Metric === 'Credits Issued') {
            document.getElementById('credits-issued').textContent = item.Value;
        } else if (item.Metric === 'Credits Retired') {
            document.getElementById('credits-retired').textContent = item.Value;
        }
    });
}

// Initialize filter controls
function initializeFilters() {
    const yearFilter = document.getElementById('year-filter');
    const chartTypeFilter = document.getElementById('chart-type');
    
    // Populate year filter
    const issuances = dashboardData['Issuances Over Time'] || [];
    const retirements = dashboardData['Retirements Over Time'] || [];
    const allYears = new Set();
    
    issuances.forEach(item => allYears.add(item.Year));
    retirements.forEach(item => allYears.add(item.Year));
    
    Array.from(allYears).sort().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Add event listeners
    yearFilter.addEventListener('change', updateCharts);
    chartTypeFilter.addEventListener('change', updateCharts);
}

// Create initial charts
function createCharts() {
    createIssuancesChart();
    createRetirementsChart();
}

// Create issuances chart
function createIssuancesChart() {
    const ctx = document.getElementById('issuancesChart').getContext('2d');
    const data = dashboardData['Issuances Over Time'] || [];
    
    const chartData = {
        labels: data.map(item => item.Year),
        datasets: [{
            label: 'Credits Issued',
            data: data.map(item => item['Issued Credits']),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        }]
    };
    
    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };
    
    if (issuancesChart) {
        issuancesChart.destroy();
    }
    issuancesChart = new Chart(ctx, config);
}

// Create retirements chart
function createRetirementsChart() {
    const ctx = document.getElementById('retirementsChart').getContext('2d');
    const data = dashboardData['Retirements Over Time'] || [];
    
    const chartData = {
        labels: data.map(item => item.Year),
        datasets: [{
            label: 'Credits Retired',
            data: data.map(item => item['Retired Credits']),
            backgroundColor: 'rgba(118, 75, 162, 0.8)',
            borderColor: 'rgba(118, 75, 162, 1)',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        }]
    };
    
    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };
    
    if (retirementsChart) {
        retirementsChart.destroy();
    }
    retirementsChart = new Chart(ctx, config);
}

// Update charts based on filters
function updateCharts() {
    const yearFilter = document.getElementById('year-filter').value;
    const chartType = document.getElementById('chart-type').value;
    
    // Update chart types
    updateChartType(issuancesChart, chartType);
    updateChartType(retirementsChart, chartType);
    
    // Filter data if year is selected
    if (yearFilter !== 'all') {
        filterChartsByYear(parseInt(yearFilter));
    } else {
        // Reset to show all data
        createCharts();
    }
}

// Update chart type
function updateChartType(chart, newType) {
    if (chart) {
        chart.config.type = newType;
        
        if (newType === 'doughnut') {
            chart.options.scales = {};
            chart.options.plugins.legend.display = true;
        } else {
            chart.options.scales = {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            };
            chart.options.plugins.legend.display = false;
        }
        
        chart.update();
    }
}

// Filter charts by year
function filterChartsByYear(year) {
    // This is a simplified implementation
    // In a real dashboard, you would filter the data and update charts accordingly
    console.log('Filtering by year:', year);
}

// Populate transactions table
function populateTransactionsTable() {
    const transactions = dashboardData['Transactions'] || [];
    const tbody = document.getElementById('transactions-tbody');
    
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.Date || '-'}</td>
            <td>${transaction.Event || '-'}</td>
            <td>${formatNumber(transaction.Quantity) || '-'}</td>
            <td>${transaction.Vintage || '-'}</td>
            <td>${transaction.User || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Format numbers for display
function formatNumber(num) {
    if (typeof num === 'number') {
        return num.toLocaleString();
    }
    return num;
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', loadDashboard);

