/*
    TODO LIST

    * Add event handler
    * Get input values
    * Add the new item to our data structure
    * Add the new item to the UI
    * Calculate budget
    * Update the UI



*/

var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    var addItem = function(type, des, val) {
        var newItem, ID;

        //Create new ID
        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            ID = 0;
        }


        //Create new items based in 'inc' or 'exp'
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        } else {
            return false;
        }

        data.allItems[type].push(newItem);

        return newItem;

    };

    var calculateBudget = function() {

        // Calculate total income & expenses
        calculateTotal('exp');
        calculateTotal('inc');

        // Calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        // Calculate the percentage of income that we spent
        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        }
        else {
            data.percentage = -1;
        }

    };

    var getBudget = function() {
        return {
            budget: data.budget,
            totalIncome: data.totals.inc,
            totalExpenses: data.totals.exp,
            percentage: data.percentage
        }
    };


    return {
        addItem: addItem,
        testing: function() {
            console.log(data);
        },
        calculateBudget: calculateBudget,
        getBudget: getBudget
    };

})();



var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };

    var getInput = function() {
        var type = document.querySelector(DOMstrings.inputType).value;
        var description = document.querySelector(DOMstrings.inputDescription).value;
        var value = parseFloat(document.querySelector(DOMstrings.inputValue).value);

        return {
            type: type,
            description: description,
            value: value
        }
    };

    var addListItem = function(obj, type) {
        var html, newHtml, element;

         // Create HTML string with placeholder text
         if (type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
         }
         else if (type === 'exp'){
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
         }
         else {
             return false;
         }

         // Replace the placeholder text with some actual data
         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', obj.value);

         // Insert the HTML into the DOM
         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    };

    var clearFields = function() {
        var fields, fieldsArr;

        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current, index, array) {
            current.value = '';
        });

        fieldsArr[0].focus();
    };

    var displayBudget = function(obj) {

        document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
        document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalIncome;
        document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExpenses;

        if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        }
        else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '--';
        }

    };




    return {
        getInput: getInput,
        DOMstrings: function() {
            return DOMstrings;
        },
        addListItem: addListItem,
        clearFields: clearFields,
        displayBudget: displayBudget
    };

})();



var controller = (function(budgetCtrl, UICtrl) {



    /*
        Event Listeners
    */
    var setupEventListeners = function() {
        var DOM = UICtrl.DOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(e) {

            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function() {
        var budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== ''
                && !isNaN(input.value)
                && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        }
    };

    var ctrlDeleteItem = function(e) {
        var itemId;

        itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemId);

        if (itemId) {

        }
    };







    var init = function() {
        console.log('Application started');
        UICtrl.displayBudget({
            budget: 0,
            totalIncome: 0,
            totalExpenses: 0,
            percentage: -1
        });
        setupEventListeners();
    };



    return {
        init: init
    }

})(budgetController, UIController);

controller.init();





















//
