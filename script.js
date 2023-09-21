document.getElementById("calculate").addEventListener("click", function () {
    const optionType = document.getElementById("option-type").value;
    const stockPrice = parseFloat(document.getElementById("stock-price").value);
    const strikePrice = parseFloat(document.getElementById("strike-price").value);
    const timeToExpiration = parseFloat(document.getElementById("time-to-expiration").value);
    const volatility = parseFloat(document.getElementById("volatility").value);
    const interestRate = parseFloat(document.getElementById("interest-rate").value);
    const dividend = parseFloat(document.getElementById("dividend").value);
    const pricingMethod = document.getElementById("pricing-method").value;

    // Implement option pricing logic based on the selected pricing method
    let optionPrice = 0;
    let delta = 0;
    let gamma = 0;
    let theta = 0;
    let vega = 0;
    let rho = 0;

    switch (pricingMethod) {
        case "black-scholes-discrete":
            // Calculate option price and Greeks using Black-Scholes (Discrete)
            [optionPrice, delta, gamma, theta, vega, rho] = calculateBlackScholesDiscrete(optionType, stockPrice, strikePrice, timeToExpiration, volatility, interestRate, dividend);
            break;
        case "black-scholes-continuous":
            // Calculate option price and Greeks using Black-Scholes (Continuous)
            [optionPrice, delta, gamma, theta, vega, rho] = calculateBlackScholesContinuous(optionType, stockPrice, strikePrice, timeToExpiration, volatility, interestRate, dividend);
            break;
        default:
            optionPrice = "Invalid pricing method";
            break;
    }

    // Display the calculated option price and Greeks
    document.getElementById("option-price").textContent = optionPrice.toFixed(2);
    document.getElementById("delta").textContent = delta.toFixed(4);
    document.getElementById("gamma").textContent = gamma.toFixed(4);
    document.getElementById("theta").textContent = theta.toFixed(4);
    document.getElementById("vega").textContent = vega.toFixed(4);
    document.getElementById("rho").textContent = rho.toFixed(4);
});

// Calculate the cumulative distribution function (CDF) of the standard normal distribution
function normDist(x) {
    const a1 = 0.31938153;
    const a2 = -0.356563782;
    const a3 = 1.781477937;
    const a4 = -1.821255978;
    const a5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;

    if (x >= 0) {
        const k = 1.0 / (1.0 + p * x);
        return (1.0 - c * Math.exp(-x * x / 2.0) * k *
            (k * (k * (k * (k * a5 + a4) + a3) + a2) + a1));
    } else {
        return 1.0 - normDist(-x);
    }
}

function calculateBlackScholesDiscrete(optionType, stockPrice, strikePrice, timeToExpiration, volatility, interestRate, dividend) {
    // Calculate Black-Scholes (Discrete) option price, Delta, Gamma, Theta, Vega, and Rho
    const n = Math.floor(timeToExpiration * 365); // Number of time intervals
    const deltaT = 1.0 / 365.0; // Length of each time interval (assuming daily intervals)
    const discountFactor = Math.exp(-interestRate * deltaT);
    
    let optionPrice = 0;
    let delta = 0;
    let gamma = 0;
    let theta = 0;
    let vega = 0;
    let rho = 0;

    for (let i = 0; i <= n; i++) {
        const t = i * deltaT;
        const d1 = (Math.log(stockPrice / strikePrice) + ((interestRate - dividend + (Math.pow(volatility, 2) / 2)) * t)) / (volatility * Math.sqrt(t));
        const d2 = d1 - volatility * Math.sqrt(t);

        const optionValue = (optionType === "call") ? stockPrice * Math.exp(-dividend * t) * normDist(d1) - strikePrice * Math.exp(-interestRate * t) * normDist(d2)
            : strikePrice * Math.exp(-interestRate * t) * normDist(-d2) - stockPrice * Math.exp(-dividend * t) * normDist(-d1);

        optionPrice += optionValue;

        // Calculate Greeks
        const nd1 = normDist(d1);
        const nd2 = normDist(d2);

        delta += (optionType === "call") ? Math.exp(-dividend * t) * nd1 : -Math.exp(-dividend * t) * nd1;
        gamma += (nd1 * Math.exp(-dividend * t)) / (stockPrice * volatility * Math.sqrt(t));
        theta -= (0.5 * stockPrice * volatility * Math.exp(-dividend * t) * nd1) / Math.sqrt(t) - (interestRate * strikePrice * Math.exp(-interestRate * t) * nd2) + (dividend * stockPrice * Math.exp(-dividend * t) * nd1);
        vega += stockPrice * Math.exp(-dividend * t) * Math.sqrt(t) * nd1;
        rho += (optionType === "call") ? strikePrice * t * Math.exp(-interestRate * t) * nd2 : -strikePrice * t * Math.exp(-interestRate * t) * nd2;
    }

    optionPrice *= discountFactor;
    delta *= discountFactor;
    gamma *= discountFactor;
    theta *= discountFactor;
    vega *= discountFactor;
    rho *= discountFactor;

    return [optionPrice, delta, gamma, theta, vega, rho];
}

function calculateBlackScholesContinuous(optionType, stockPrice, strikePrice, timeToExpiration, volatility, interestRate, dividend) {
    // Calculate Black-Scholes (Continuous) option price, Delta, Gamma, Theta, Vega, and Rho
    const d1 = (Math.log(stockPrice / strikePrice) + ((interestRate - dividend + (Math.pow(volatility, 2) / 2)) * timeToExpiration)) / (volatility * Math.sqrt(timeToExpiration));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiration);

    let optionPrice = 0;
    let delta = 0;
    let gamma = 0;
    let theta = 0;
    let vega = 0;
    let rho = 0;

    if (optionType === "call") {
        optionPrice = stockPrice * Math.exp(-dividend * timeToExpiration) * normDist(d1) - strikePrice * Math.exp(-interestRate * timeToExpiration) * normDist(d2);
        delta = Math.exp(-dividend * timeToExpiration) * normDist(d1);
        gamma = Math.exp(-dividend * timeToExpiration) * normDist(d1) / (stockPrice * volatility * Math.sqrt(timeToExpiration));
        theta = (-0.5 * stockPrice * volatility * Math.exp(-dividend * timeToExpiration) * normDist(d1)) / Math.sqrt(timeToExpiration) - interestRate * strikePrice * Math.exp(-interestRate * timeToExpiration) * normDist(d2) + dividend * stockPrice * Math.exp(-dividend * timeToExpiration) * normDist(d1);
        vega = stockPrice * Math.exp(-dividend * timeToExpiration) * Math.sqrt(timeToExpiration) * normDist(d1);
        rho = strikePrice * timeToExpiration * Math.exp(-interestRate * timeToExpiration) * normDist(d2);
    } else if (optionType === "put") {
        const negD1 = -d1;
        const negD2 = -d2;

        optionPrice = strikePrice * Math.exp(-interestRate * timeToExpiration) * normDist(negD2) - stockPrice * Math.exp(-dividend * timeToExpiration) * normDist(negD1);
        delta = -Math.exp(-dividend * timeToExpiration) * normDist(negD1);
        gamma = Math.exp(-dividend * timeToExpiration) * normDist(negD1) / (stockPrice * volatility * Math.sqrt(timeToExpiration));
        theta = (-0.5 * stockPrice * volatility * Math.exp(-dividend * timeToExpiration) * normDist(negD1)) / Math.sqrt(timeToExpiration) + interestRate * strikePrice * Math.exp(-interestRate * timeToExpiration) * normDist(negD2) - dividend * stockPrice * Math.exp(-dividend * timeToExpiration) * normDist(negD1);
        vega = stockPrice * Math.exp(-dividend * timeToExpiration) * Math.sqrt(timeToExpiration) * normDist(negD1);
        rho = -strikePrice * timeToExpiration * Math.exp(-interestRate * timeToExpiration) * normDist(negD2);
    } else {
        return ["Invalid option type", 0, 0, 0, 0, 0];
    }

    return [optionPrice, delta, gamma, theta, vega, rho];
}
