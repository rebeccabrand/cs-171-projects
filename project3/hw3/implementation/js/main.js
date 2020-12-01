// DATASETS

// Global variable with 1198 pizza deliveries
// console.log(deliveryData);

// Global variable with 200 customer feedbacks
// console.log(feedbackData.length);

// Write the variables to the web console and inspect them.


// FILTER DATA, THEN DISPLAY SUMMARY OF DATA & BAR CHART

createVisualization();

// Include array function trigger

function areaManipulation() {
    let selectBox = document.getElementById("area-category");
    let areaType = selectBox.options[selectBox.selectedIndex].value;
    return areaType;
}

document.getElementById("area-category").onchange = function() {createVisualization()};

function orderManipulation() {
    let selectBox = document.getElementById("order-category");
    let orderType = selectBox.options[selectBox.selectedIndex].value;
    return orderType;
}

document.getElementById("order-category").onchange = function() {createVisualization()};
document.getElementById("area-category").onchange = function() {createVisualization()};

function createVisualization() {

    // Call data manipulation function
    let areaType = areaManipulation();
    let orderType = orderManipulation();

    // Filter data based on 2 type categories selected in website
    let filteredAreaData = deliveryData.filter((value, index, deliveryData) => {
        if (areaType != "all") {
            return (value.area === areaType);
        } else {
            return true
        }
    });

    let filteredAllData = filteredAreaData.filter((value, index, filteredAreaDeliveries) => {
        if (orderType !== "all") {
            return (value.order_type === orderType);
        } else {
            return true
        }
    });
    console.log(filteredAllData);

    // Duplicate the delivery data for joining onto feedback data
    let joinedData = deliveryData;

    for (let i = 0; i < joinedData.length; i++) {
        for (let j = 0; j < feedbackData.length; j++) {
            if (feedbackData[j].delivery_id === joinedData[i].delivery_id)
            {
                joinedData[i]["quality"] = feedbackData[j].quality;
                joinedData[i]["punctuality"] = feedbackData[j].punctuality;
                joinedData[i]["wrong_pizza"] = feedbackData[j].wrong_pizza;
            }
        }
    }
    // console.log(joinedData);

    let areaJoinedData = joinedData.filter((value, index, deliveryData) => {
        if (areaType != "all") {
            return (value.area === areaType);
        } else {
            return true
        }
    });

    let filteredJoinedData = areaJoinedData.filter((value, index, filteredAreaDeliveries) => {
        if (orderType !== "all") {
            return (value.order_type === orderType);
        } else {
            return true
        }
    });

    /* let filteredFeedback = joinedData.filter((value) => {
        if (areaType === "all" )
        {
            return (value.order_type === orderType);
        }
        else if (orderType === "all")
        {
            return (value.area === areaType);
        }
        else
        {
            return (value.area === areaType) && (value.order_type === orderType);
        }
    });
    // console.log(filteredFeedback); */

    if (orderType === "all" && areaType === "all") {
        createTable(deliveryData, feedbackData);
        renderBarChart(deliveryData);
    } else {
        createTable(filteredAllData, filteredJoinedData);
        renderBarChart(filteredAllData);
    }

    function createTable(datasetOne, datasetTwo) {

        var totalDeliveries = 0, totalPizzas = 0, avgDeliveryTime = 0, totalSales = 0;
        var totalFeedback = 0, lowFeedback = 0, mediumFeedback = 0, highFeedback = 0;

        for (let i = 0; i < datasetOne.length; i++) {
            totalDeliveries++;
            totalPizzas += datasetOne[i].count;
            avgDeliveryTime += datasetOne[i].delivery_time;
            totalSales += datasetOne[i].price;
        }

        // document.getElementById("tb-total-deliveries").innerHTML = totalDeliveries;
        // document.getElementById("tb-total-pizzas").innerHTML = totalPizzas;
        // document.getElementById("tb-avg-time").innerHTML = avgDeliveryTime;
        // document.getElementById("tb-total-sales").innerHTML = totalSales;

        // Locate HTML elements to populate
        // const pizzaDiv = document.getElementById("pizza-table");
        // const pizzaTable = document.createElement("table");

        // Define object to hold summary statistics
        /* let pizzaResult = {
            "Total Deliveries:": totalDeliveries,
            "Total Pizzas:": totalPizzas,
            "Average Time:": Math.round(avgDeliveryTime / totalDeliveries) + " minutes",
            "Total Sales:": totalSales
        }; */

        document.getElementById("tb-total-deliveries").innerHTML = totalDeliveries.toString();
        document.getElementById("tb-total-pizzas").innerHTML = totalPizzas.toString();
        document.getElementById("tb-avg-time").innerHTML = avgDeliveryTime.toString();
        document.getElementById("tb-total-sales").innerHTML = totalSales.toString();

        /* let rows = pizzaResult.map(function (value, index) {
            return '<tr><td>' + value.delivery_id + '</td>' +
                '<td>' + value.area + '</td>' +
                '<td>' + value.delivery_time + '</td>' +
                '<td>' + value.driver + '</td>' +
                '<td>' + value.count + '</td>' +
                '<td>' + value.punctuality + '</td>' +
                '<td>' + value.quality + '</td>' +
                '<td>' + value.wrong_pizza + '</td>' +
                '</tr>';
        }); */
        // document.getElementById("table-body") = rows.join('');

        // Iterate over object and populate table in HTML file
        /* for (let key in pizzaResult) {
            if (pizzaResult.hasOwnProperty(key)) {
                const val = pizzaResult[key];
                // console.log(key);
                // console.log(val);
                // Insert a row in the table at the last row
                let newRow = pizzaTable.insertRow();
                // Insert a cell in the row at index 0
                let newCell1 = newRow.insertCell(0);
                let newCell2 = newRow.insertCell(1);
                // Append a text node to the cell
                let newText1 = document.createTextNode(key);
                newCell1.appendChild(newText1);
                let newText2 = document.createTextNode(val);
                newCell2.appendChild(newText2);
            }
        }
        pizzaDiv.appendChild(pizzaTable); */

        // Perform same set of instructions for the feedback table
        // const feedbackDiv = document.getElementById("feedback-table")
        // const feedbackTable = document.createElement("table");

        for (let i = 0; i < datasetTwo.length; i++) {

            totalFeedback++;

            if (datasetTwo[i].quality === "low") {
                lowFeedback++;
            } else if (datasetTwo[i].quality === "medium") {
                mediumFeedback++;
            } else {
                highFeedback++;
            }
        }

        document.getElementById("tb-total-feedback").innerHTML = totalFeedback.toString();
        document.getElementById("tb-high-feedback").innerHTML = highFeedback.toString();
        document.getElementById("tb-med-feedback").innerHTML = mediumFeedback.toString();
        document.getElementById("tb-low-feedback").innerHTML = lowFeedback.toString();

        // document.getElementById("tb-total-feedback").innerHTML = totalFeedback;
        // document.getElementById("tb-med-quality-time").innerHTML = mediumFeedback;
        // document.getElementById("tb-low-quality-sales").innerHTML = lowFeedback;

        // Define object to hold feedback statistics
        /* let feedbackResult = {
            "Total Entries:": totalFeedback,
            "Low Quality:": lowFeedback,
            "Medium Quality:": mediumFeedback,
            "High Quality:": highFeedback
        };

        // Iterate over object and populate table in HTML file
        for (let key in feedbackResult) {
            if (feedbackResult.hasOwnProperty(key)) {
                const val = feedbackResult[key];
                console.log(key);
                console.log(val);
                // Insert a row in the table at the last row
                let feedbackRow = feedbackTable.insertRow();
                // Insert a cell in the row at index 0
                let feedbackCell1 = feedbackRow.insertCell(0);
                let feedbackCell2 = feedbackRow.insertCell(1);
                // Append a text node to the cell
                let feedbackText1 = document.createTextNode(key);
                feedbackCell1.appendChild(feedbackText1);
                let feedbackText2 = document.createTextNode(val);
                feedbackCell2.appendChild(feedbackText2);
            }
        }
        feedbackDiv.appendChild(feedbackTable); */
    }

    let rows = filteredJoinedData.map(function (value, index) {
        return '<tr><td>' + value.delivery_id + '</td>' +
            '<td>' + value.area + '</td>' +
            '<td>' + value.delivery_time + '</td>' +
            '<td>' + value.driver + '</td>' +
            '<td>' + value.count + '</td>' +
            '<td>' + value.punctuality + '</td>' +
            '<td>' + value.quality + '</td>' +
            '<td>' + value.wrong_pizza + '</td>' +
            '</tr>';
    });
    document.getElementById("table-body").innerHTML = rows.join('');
}
    /* var rows = $.map(filteredJoinedData, function(value, index) {
        return '<tr><td>' + value.delivery_id + '</td><td>' +
            '<tr><td>' + value.area + '</td><td>' +
            '<tr><td>' + value.delivery_time + '</td><td>' +
            '<tr><td>' + value.driver + '</td><td>' +
            '<tr><td>' + value.count + '</td><td>' +
            '<tr><td>' + value.punctuality + '</td><td>' +
            '<tr><td>' + value.quality + '</td><td>' +
            '<tr><td>' + value.wrong_pizza + '</td><td>' +
            '</td></tr>';
    });
    $('#products-table tbody').html(rows.join(''));
} */
