//DATA CONTROLLER
var budgetController = (function() {
	
	//create function constructor for object
	var Expense = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome)*100);
		} else  {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function(totalIncome) {
		return this.percentage;
	};	

	var Income = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	//create calculatetotal variable
	var calculateTotal = function(type) {
		var sum = 0;
		for(i in data.allItems[type]) {
			sum+= data.allItems[type][i].value;
		}
		data.totals[type] = sum;
	};

	//create variable to store datas
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget:0,
		percentage:0
	};

	//create multiple returning methods to use in global controller
	return { 
		addItem: function(type,des,value) {
			var newItem,ID,dlength;
			length = data.allItems[type].length;

			//create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][length-1].id + 1;	
			} else {
				ID = 0;
			}			

			//create new item base on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID,des,value);	
			}
			else {
				newItem = new Income(ID,des,value);
			}

			//push on data structure
			data.allItems[type].push(newItem);

			//return new element
			return newItem;
		},

		deleteItem: function(type,id) {
			var itempos,newarr;
			itempos = data.allItems[type].findIndex(function(el){
				return el.id === id;
			});
			if(itempos !== -1) {
				data.allItems[type].splice(itempos,1);
			}
			/* another ways to loop
			 var ids,index;
			 ids = data.allItems[type].map(function(current){
			 	return current.id;
			 });
			 index = data.allItems[type].indexOf(ids);
			 if(index !== -1) {
				data.allItems[type].splice(index,1);
			}
			*/
		},
		testing: function() {
			return data.allItems;
		},
		calculateBudget: function() {
			//calculate total income and expense budget
			calculateTotal('inc');
			calculateTotal('exp');

			//calculate the budget = income - expense
			data.budget = data.totals.inc - data.totals.exp;

			//calculate the percentage of income that we spent
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage

			}
		},
		calculatePercentage: function() {
			data.allItems['exp'].forEach(function(el){
				el.calcPercentage(data.totals['inc']);
			});
		},
		getPercentage: function() {
			var allPerc = data.allItems['exp'].map(function(el){
				return el.getPercentage(data.totals['inc']);
			});
			return allPerc;
		},
		resetData: function() {
			data.allItems['exp'] = [];
			data.allItems['inc'] = [];
			data.totals.exp = 0;
			data.totals.inc = 0;
			data.budget = 0;
			data.percentage = 0;
		}
	}

})();

//UI CONTROLLER
var UIController = (function() {

	//create class selectors variable
	var DOMString = {
		inputType: '.add__type',
		inputDes: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		inputBtn_reset: '.add__btn_reset',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetvalue:'.budget__value',
		budget_inc_value:'.budget__income--value',
		budget_exp_value:'.budget__expenses--value',
		budget_exp_percentage:'.budget__expenses--percentage',
		container:'.container',
		expensesPercentage:'.item__percentage'
	}

	//return multiple methods for use
	return {
		//get input data from user
		getinput: function() {
			return {
				type: document.querySelector(DOMString.inputType).value,
				description: document.querySelector(DOMString.inputDes).value,
				value: parseInt(document.querySelector(DOMString.inputValue).value)
			}
		},

		//format numbers
		formatNumber: function(num,type) {
			var numSplit,int,dec;
			num = Math.abs(num);
			num = num.toFixed(2);
			numSplit = num.split('.');
			int = numSplit[0];
			dec = numSplit[1];
			//option 1
			// if(int.length > 3) {
			// 	int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
			// } 
			//option 2
			int = Math.round(int).toLocaleString();
			//return result
			return (type === 'exp' ? '-' : '+') + " " + int + "." + dec;
		},

		//change focus ouline of either inc or exp
		changeType: function() {
			var fields = document.querySelectorAll(DOMString.inputType + ',' + DOMString.inputDes + ',' + DOMString.inputValue);
			fields = Array.from(fields);
			for (i in fields) {
				fields[i].classList.toggle('red-focus');
			}
			document.querySelector(DOMString.inputBtn).classList.toggle('red');
		},

		//get dom string
		getDOMString: function() {
			return DOMString;
		},

		//clear fields
		clearFields: function() {
			fields = document.querySelectorAll(DOMString.inputDes + ', ' + DOMString.inputValue);
			fields = Array.from(fields);
			for (i in fields) {
				fields[i].value = "";
			}
			fields[0].focus();
		},

		//add list items
		addListItem: function(obj,type) {
			var html,newhtml,element;

			// Create HTML String with placeholder text		
			if(type === 'inc') {
				element = DOMString.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else {
				element = DOMString.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//Relace placeholder text with actual data
			newhtml = html.replace('%id%',obj.id);
			newhtml = newhtml.replace('%description%',obj.description);
			newhtml = newhtml.replace('%value%',this.formatNumber(obj.value,type));

			//Insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
		},

		//delete list items
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		//display budget
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMString.budgetvalue).innerHTML = this.formatNumber(obj.budget,type);
			document.querySelector(DOMString.budget_inc_value).innerHTML = this.formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMString.budget_exp_value).innerHTML = this.formatNumber(obj.totalExp,'exp');
			if(obj.percentage > 0) {
				document.querySelector(DOMString.budget_exp_percentage).innerHTML = obj.percentage + "% spent";	
			} else  {
				document.querySelector(DOMString.budget_exp_percentage).innerHTML = "---";	
			}
		},

		//display percentage
		displayPercentage: function(percentage) {
			var label = document.querySelectorAll(DOMString.expensesPercentage);
			label = Array.from(label);
			for(i in percentage) {
				if(percentage[i] > 0) {
					label[i].innerHTML = percentage[i] + " %";
				} else {
					label[i].innerHTML = "---";
				}
			}
		},

		//reset all data
		resetData: function() {
			document.querySelector(DOMString.incomeContainer).innerHTML = "";
			document.querySelector(DOMString.expenseContainer).innerHTML = "";
			document.querySelector(DOMString.budgetvalue).innerHTML = "+ " + 0;
			document.querySelector(DOMString.budget_inc_value).innerHTML = "+ " + 0;
			document.querySelector(DOMString.budget_exp_value).innerHTML = "- " + 0;
			document.querySelector(DOMString.budget_exp_percentage).innerHTML = "---";
		}
	}
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl) {
	var updateBudget = function() {

		//1.Calculate the budget
		budgetCtrl.calculateBudget();

		//2.Return the budget
		var budget = budgetCtrl.getBudget();

		//3.Display on UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentage = function() {

		//1. calculate the percentage
		budgetCtrl.calculatePercentage();

		//2. read percentage from budget controller
		var percentage = budgetCtrl.getPercentage();

		//3. update the UI
		UICtrl.displayPercentage(percentage);
	}

	//control add item function
	var ctrlAddItem = function() {
		var input,newItem;

		//1. Get the field input data
		input = UICtrl.getinput();

		if(input.description !=="" && !isNaN(input.value) && input.value > 0) {

		//2.Add item to budget controller 
		newItem = budgetCtrl.addItem(input.type,input.description,input.value);

		//3.Add item to UI
		UICtrl.addListItem(newItem,input.type);

		//5.Clear fields
		UICtrl.clearFields();

		//4.Calculate and update the budget
		updateBudget();

		//5.Calculate and update the percentage
		updatePercentage();
		
	}
};

	//control delete item function
	var ctrlDeleteItem = function(event) {
		if(event.target.parentNode.nodeName === 'BUTTON') {
			itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;	
		}
		if(itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
		}
		//1. delete item from data structure
		budgetCtrl.deleteItem(type,ID);

		//2. delete item from UI
		UICtrl.deleteListItem(itemID);

		//3. update then show new result
		updateBudget();

		//4.Calculate and update the percentage
		updatePercentage();
		
	};

	//reset function
	var resetAll = function() {
		budgetCtrl.resetData();
		UICtrl.clearFields();
		UICtrl.resetData();
	};

	//create variable to handle event handler
	var setupEventListeners = function() {
		document.querySelector(UICtrl.getDOMString().inputBtn).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',function(e){
			if(event.keycode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});	
		document.querySelector(UICtrl.getDOMString().container).addEventListener('click',ctrlDeleteItem);
		document.querySelector(UICtrl.getDOMString().inputBtn_reset).addEventListener('click',resetAll);
		document.querySelector(UICtrl.getDOMString().inputType).addEventListener('change',UICtrl.changeType);
		getmonth();
	};

	var getmonth = function() {
		var d = new Date();
		var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		var n = month[d.getMonth()];
		document.querySelector('.budget__title--month').innerHTML = n + " - " + d.getFullYear() + " :";
	}

	//app initialization
	return {
		initFunction : function() {
			console.log("Application is activated!");
			setupEventListeners();
		}
	}

})(budgetController,UIController);
controller.initFunction();
