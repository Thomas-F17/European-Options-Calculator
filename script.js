document.addEventListener("DOMContentLoaded", function () {
    const calculateButton = document.getElementById("calculate-button");
    calculateButton.addEventListener("click", calculateOptionPrice);
});

function calculateOptionPrice() {
    // Retrieve input values
    const optionType = document.getElementById("option-type").value;
    const stockPrice = parseFloat(document.getElementById("stock-price").value);
    const strikePrice = parseFloat(document.getElementById("strike-price").value);
    const timeToMaturity = parseFloat(document.getElementById("time-to-maturity").value);
    const volatility = parseFloat(document.getElementById("volatility").value);
    const riskFreeRate = parseFloat(document.getElementById("risk-free-rate").value);
    const dividend = parseFloat(document.getElementById("dividend").value);
    const pricingMethod = document.getElementById("pricing-method").value;
    
    // Calculate option price and Greeks based on the selected pricing method
    let optionPrice = 0;
    let delta = 0;
    let gamma = 0;
    let theta = 0;
    let vega = 0;
    let rho = 0;
    
    if (pricingMethod === "Black-Scholes Continuous") {
        const d1 = (Math.log(stockPrice / strikePrice) + ((riskFreeRate - dividend + (Math.pow(volatility, 2) / 2)) * timeToMaturity)) / (volatility * Math.sqrt(timeToMaturity));
        const d2 = d1 - volatility * Math.sqrt(timeToMaturity);
        
        if (optionType === "call") {
            optionPrice = stockPrice * Math.exp(-dividend * timeToMaturity) * normCDF(d1) - strikePrice * Math.exp(-riskFreeRate * timeToMaturity) * normCDF(d2);
            delta = Math.exp(-dividend * timeToMaturity) * normCDF(d1);
            gamma = Math.exp(-dividend * timeToMaturity) * normPDF(d1) / (stockPrice * volatility * Math.sqrt(timeToMaturity));
            theta = (-stockPrice * volatility * Math.exp(-dividend * timeToMaturity) * normPDF(d1)) / (2 * Math.sqrt(timeToMaturity)) - riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToMaturity) * normCDF(d2) + dividend * stockPrice * Math.exp(-dividend * timeToMaturity) * normCDF(d1);
            vega = stockPrice * Math.exp(-dividend * timeToMaturity) * Math.sqrt(timeToMaturity) * normPDF(d1);
            rho = strikePrice * timeToMaturity * Math.exp(-riskFreeRate * timeToMaturity) * normCDF(d2);
        } else if (optionType === "put") {
            // Implement put option calculations here
        }
    } else if (pricingMethod === "Black-Scholes Discrete") {
        // Implement discrete method calculations here
    }
    
    // Update the UI with calculated option price
    const optionPricePercent = document.getElementById("option-price-percent");
    optionPricePercent.textContent = optionPrice.toFixed(2) + " %";
    
    const optionPriceNotional = document.getElementById("option-price-notional");
    optionPriceNotional.textContent = "$" + (optionPrice * stockPrice / 100).toFixed(2);
    
    // Plot Delta, Gamma, Theta, Vega, and Rho using Chart.js
    plotGreeks(optionType, delta, gamma, theta, vega, rho);
}

function normCDF(x) {
    // Implement cumulative distribution function for the standard normal distribution
    // You can use a library like math.js for more accurate calculations
    return 0.5 * (1 + Math.erf(x / Math.sqrt(2)));
}

function normPDF(x) {
    // Implement probability density function for the standard normal distribution
    return Math.exp(-0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI);
}

function plotGreeks(optionType, delta, gamma, theta, vega, rho) {
    // Define labels and data for the Greeks chart
    const labels = ["Delta", "Gamma", "Theta", "Vega", "Rho"];
    const data = [delta, gamma, theta, vega, rho];
    
    // Create a chart using Chart.js
    const ctx = document.getElementById("greeks-chart").getContext("2d");
    const greeksChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: `Greeks for ${optionType.toUpperCase()} Option`,
                data: data,
                backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)", "rgba(255, 206, 86, 0.5)", "rgba(75, 192, 192, 0.5)", "rgba(153, 102, 255, 0.5)"],
                borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
