// Calculator State
let currentInput = '0';
let previousInput = '';
let operator = '';
let shouldResetDisplay = false;
let memory = 0;
let history = [];

// Unit Converter Data
const unitConversions = {
    length: {
        units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
        names: ['Millimeter', 'Centimeter', 'Meter', 'Kilometer', 'Inch', 'Foot', 'Yard', 'Mile'],
        // Base unit: meter
        factors: [0.001, 0.01, 1, 1000, 0.0254, 0.3048, 0.9144, 1609.34]
    },
    weight: {
        units: ['mg', 'g', 'kg', 'oz', 'lb', 'ton'],
        names: ['Milligram', 'Gram', 'Kilogram', 'Ounce', 'Pound', 'Ton'],
        // Base unit: kilogram
        factors: [0.000001, 0.001, 1, 0.0283495, 0.453592, 1000]
    },
    temperature: {
        units: ['°C', '°F', 'K'],
        names: ['Celsius', 'Fahrenheit', 'Kelvin'],
        factors: [1, 1, 1] // Special handling for temperature
    },
    area: {
        units: ['mm²', 'cm²', 'm²', 'km²', 'in²', 'ft²', 'yd²', 'acre'],
        names: ['Square Millimeter', 'Square Centimeter', 'Square Meter', 'Square Kilometer', 'Square Inch', 'Square Foot', 'Square Yard', 'Acre'],
        // Base unit: square meter
        factors: [0.000001, 0.0001, 1, 1000000, 0.00064516, 0.092903, 0.836127, 4046.86]
    },
    volume: {
        units: ['ml', 'l', 'cm³', 'm³', 'in³', 'ft³', 'gal', 'qt'],
        names: ['Milliliter', 'Liter', 'Cubic Centimeter', 'Cubic Meter', 'Cubic Inch', 'Cubic Foot', 'Gallon', 'Quart'],
        // Base unit: liter
        factors: [0.001, 1, 0.001, 1000, 0.0163871, 28.3168, 3.78541, 0.946353]
    },
    time: {
        units: ['ms', 's', 'min', 'h', 'day', 'week', 'month', 'year'],
        names: ['Millisecond', 'Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'],
        // Base unit: second
        factors: [0.001, 1, 60, 3600, 86400, 604800, 2629746, 31556952]
    },
    speed: {
        units: ['m/s', 'km/h', 'mph', 'ft/s', 'knot'],
        names: ['Meter per Second', 'Kilometer per Hour', 'Mile per Hour', 'Foot per Second', 'Knot'],
        // Base unit: m/s
        factors: [1, 0.277778, 0.44704, 0.3048, 0.514444]
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeModeToggle();
    initializeUnitConverter();
    updateDisplay();
});

// Mode Toggle Functions
function initializeModeToggle() {
    const calculatorMode = document.getElementById('calculatorMode');
    const converterMode = document.getElementById('converterMode');
    const calculator = document.getElementById('calculator');
    const converter = document.getElementById('converter');

    calculatorMode.addEventListener('click', () => {
        calculatorMode.classList.add('active');
        converterMode.classList.remove('active');
        calculator.classList.add('active');
        converter.classList.remove('active');
    });

    converterMode.addEventListener('click', () => {
        converterMode.classList.add('active');
        calculatorMode.classList.remove('active');
        converter.classList.add('active');
        calculator.classList.remove('active');
    });
}

// Calculator Functions
function updateDisplay() {
    const currentElement = document.getElementById('current');
    const historyElement = document.getElementById('history');
    
    currentElement.textContent = formatNumber(currentInput);
    historyElement.textContent = history.length > 0 ? history[history.length - 1] : '';
}

function formatNumber(num) {
    if (num === 'Error') return num;
    
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    // Handle very large or very small numbers
    if (Math.abs(number) >= 1e15 || (Math.abs(number) < 1e-10 && number !== 0)) {
        return number.toExponential(6);
    }
    
    // Format with appropriate decimal places
    const formatted = number.toLocaleString('en-US', {
        maximumFractionDigits: 10,
        minimumFractionDigits: 0
    });
    
    return formatted;
}

function inputNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        currentInput = currentInput === '0' ? num : currentInput + num;
    }
    updateDisplay();
}

function inputDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0.';
        shouldResetDisplay = false;
    } else if (currentInput.indexOf('.') === -1) {
        currentInput += '.';
    }
    updateDisplay();
}

function inputOperator(op) {
    if (operator && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
    
    // Add to history
    history.push(`${formatNumber(previousInput)} ${op}`);
    updateDisplay();
}

function calculate() {
    if (!operator || shouldResetDisplay) return;
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) {
        currentInput = 'Error';
        updateDisplay();
        return;
    }
    
    let result;
    const historyEntry = `${formatNumber(previousInput)} ${operator} ${formatNumber(currentInput)} =`;
    
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                currentInput = 'Error';
                updateDisplay();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    currentInput = result.toString();
    operator = '';
    shouldResetDisplay = true;
    
    // Update history
    history[history.length - 1] = historyEntry;
    history.push(result.toString());
    
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    shouldResetDisplay = false;
    history = [];
    updateDisplay();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function backspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function scientificFunction(func) {
    const num = parseFloat(currentInput);
    if (isNaN(num)) {
        currentInput = 'Error';
        updateDisplay();
        return;
    }
    
    let result;
    let operation;
    
    switch (func) {
        case 'sqrt':
            if (num < 0) {
                currentInput = 'Error';
                updateDisplay();
                return;
            }
            result = Math.sqrt(num);
            operation = `√${formatNumber(currentInput)}`;
            break;
        case 'square':
            result = num * num;
            operation = `${formatNumber(currentInput)}²`;
            break;
        case 'percent':
            result = num / 100;
            operation = `${formatNumber(currentInput)}%`;
            break;
        case 'inverse':
            if (num === 0) {
                currentInput = 'Error';
                updateDisplay();
                return;
            }
            result = 1 / num;
            operation = `1/${formatNumber(currentInput)}`;
            break;
    }
    
    currentInput = result.toString();
    shouldResetDisplay = true;
    
    // Add to history
    history.push(`${operation} = ${formatNumber(currentInput)}`);
    updateDisplay();
}

function memoryFunction(func) {
    const num = parseFloat(currentInput);
    
    switch (func) {
        case 'MC': // Memory Clear
            memory = 0;
            break;
        case 'MR': // Memory Recall
            currentInput = memory.toString();
            shouldResetDisplay = true;
            updateDisplay();
            break;
        case 'M+': // Memory Add
            memory += num;
            break;
        case 'M-': // Memory Subtract
            memory -= num;
            break;
        case 'MS': // Memory Store
            memory = num;
            break;
    }
}

// Unit Converter Functions
function initializeUnitConverter() {
    changeCategory();
}

function changeCategory() {
    const category = document.getElementById('category').value;
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    
    // Clear existing options
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    // Add options for the selected category
    const units = unitConversions[category];
    units.units.forEach((unit, index) => {
        const option1 = new Option(`${units.names[index]} (${unit})`, unit);
        const option2 = new Option(`${units.names[index]} (${unit})`, unit);
        fromUnit.add(option1);
        toUnit.add(option2);
    });
    
    // Set default selections
    if (units.units.length > 1) {
        toUnit.selectedIndex = 1;
    }
    
    // Clear inputs
    document.getElementById('fromValue').value = '';
    document.getElementById('toValue').value = '';
    document.getElementById('conversionFormula').textContent = '';
}

function convert() {
    const category = document.getElementById('category').value;
    const fromValue = parseFloat(document.getElementById('fromValue').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    
    if (isNaN(fromValue) || fromValue === '') {
        document.getElementById('toValue').value = '';
        document.getElementById('conversionFormula').textContent = '';
        return;
    }
    
    const result = performConversion(fromValue, fromUnit, toUnit, category);
    document.getElementById('toValue').value = formatConversionResult(result);
    
    // Show conversion formula
    const formula = getConversionFormula(fromValue, fromUnit, toUnit, category);
    document.getElementById('conversionFormula').textContent = formula;
}

function performConversion(value, fromUnit, toUnit, category) {
    if (category === 'temperature') {
        return convertTemperature(value, fromUnit, toUnit);
    }
    
    const units = unitConversions[category];
    const fromIndex = units.units.indexOf(fromUnit);
    const toIndex = units.units.indexOf(toUnit);
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    // Convert to base unit, then to target unit
    const baseValue = value * units.factors[fromIndex];
    const result = baseValue / units.factors[toIndex];
    
    return result;
}

function convertTemperature(value, fromUnit, toUnit) {
    let celsius;
    
    // Convert to Celsius first
    switch (fromUnit) {
        case '°C':
            celsius = value;
            break;
        case '°F':
            celsius = (value - 32) * 5 / 9;
            break;
        case 'K':
            celsius = value - 273.15;
            break;
    }
    
    // Convert from Celsius to target unit
    switch (toUnit) {
        case '°C':
            return celsius;
        case '°F':
            return celsius * 9 / 5 + 32;
        case 'K':
            return celsius + 273.15;
    }
}

function formatConversionResult(result) {
    if (Math.abs(result) >= 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
        return result.toExponential(6);
    }
    
    // Round to appropriate decimal places
    const rounded = Math.round(result * 1e10) / 1e10;
    return rounded.toLocaleString('en-US', {
        maximumFractionDigits: 10,
        minimumFractionDigits: 0
    });
}

function getConversionFormula(value, fromUnit, toUnit, category) {
    if (category === 'temperature') {
        return getTemperatureFormula(value, fromUnit, toUnit);
    }
    
    const units = unitConversions[category];
    const fromIndex = units.units.indexOf(fromUnit);
    const toIndex = units.units.indexOf(toUnit);
    
    if (fromIndex === -1 || toIndex === -1) return '';
    
    const fromFactor = units.factors[fromIndex];
    const toFactor = units.factors[toIndex];
    
    if (fromFactor === toFactor) {
        return `${value} ${fromUnit} = ${value} ${toUnit} (same unit)`;
    }
    
    const conversionFactor = fromFactor / toFactor;
    return `${value} ${fromUnit} × ${conversionFactor.toFixed(6)} = ${formatConversionResult(value * conversionFactor)} ${toUnit}`;
}

function getTemperatureFormula(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return `${value} ${fromUnit} = ${value} ${toUnit} (same unit)`;
    }
    
    let formula = '';
    switch (fromUnit) {
        case '°C':
            if (toUnit === '°F') {
                formula = `${value}°C × 9/5 + 32 = ${formatConversionResult(value * 9/5 + 32)}°F`;
            } else if (toUnit === 'K') {
                formula = `${value}°C + 273.15 = ${formatConversionResult(value + 273.15)}K`;
            }
            break;
        case '°F':
            if (toUnit === '°C') {
                formula = `(${value}°F - 32) × 5/9 = ${formatConversionResult((value - 32) * 5/9)}°C`;
            } else if (toUnit === 'K') {
                formula = `(${value}°F - 32) × 5/9 + 273.15 = ${formatConversionResult((value - 32) * 5/9 + 273.15)}K`;
            }
            break;
        case 'K':
            if (toUnit === '°C') {
                formula = `${value}K - 273.15 = ${formatConversionResult(value - 273.15)}°C`;
            } else if (toUnit === '°F') {
                formula = `(${value}K - 273.15) × 9/5 + 32 = ${formatConversionResult((value - 273.15) * 9/5 + 32)}°F`;
            }
            break;
    }
    
    return formula;
}

function swapUnits() {
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    const fromValue = document.getElementById('fromValue');
    const toValue = document.getElementById('toValue');
    
    // Swap unit selections
    const tempIndex = fromUnit.selectedIndex;
    fromUnit.selectedIndex = toUnit.selectedIndex;
    toUnit.selectedIndex = tempIndex;
    
    // Swap values
    const tempValue = fromValue.value;
    fromValue.value = toValue.value;
    toValue.value = tempValue;
    
    // Convert with new arrangement
    convert();
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Prevent default for calculator keys
    if ('0123456789+-*/.=Enter'.includes(key) || key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
    }
    
    if ('0123456789'.includes(key)) {
        inputNumber(key);
    } else if (key === '.') {
        inputDecimal();
    } else if ('+-*/'.includes(key)) {
        inputOperator(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearAll();
    }
});
