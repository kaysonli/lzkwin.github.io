(function() {
	window.onload = function() {
		var stepOption = ['Open Case', 'Default Workspace', 'Optimiaztion Workspace',
			'Efficient Frontier', 'Switch Input', 'Historical Return'
		];
		var stepNav = new StepNavigation(stepOption);
		var btn = document.getElementById('go');
		btn.addEventListener('click', function() {
			stepNav.stepForward();
		});
	}
})();

function addClass(dom, className) {
	var cls = dom.className;
	cls += ' ' + className;
	dom.className = cls;
}

function removeClass(dom, className) {
	var cls = dom.className;
	var newCls = cls.replace(className, '');
	dom.className = newCls;
}

function StepNavigation(steps) {
	this.steps = steps;
	this.currentStep = -1;
	this.el = document.getElementById('steps');
	for (var i = 0; i < this.steps.length; i++) {
		var step = this.steps[i];
		var li = document.createElement('li');
		if (i == 0) {
			li.innerHTML = this.steps[i] || ('Steps ' + (i + 1));
		} else {
			li.innerHTML = (this.steps[i] || ('Steps ' + (i + 1))) + '<span></span>';
		}
		if (i == this.steps.length - 1) {
			addClass(li, 'last');
		}
		this.el.appendChild(li);
	};
}
StepNavigation.prototype.stepForward = function() {
	var preStep = this.currentStep;
	++this.currentStep;
	if (this.currentStep > this.steps.length) {
		return;
	}
	var stepItems = this.el.getElementsByTagName('li');
	var currentItem = stepItems[this.currentStep],
		prevItem = stepItems[preStep];
	if (currentItem) {
		addClass(currentItem, 'inprogress')
		if (this.currentStep == this.steps.length - 1) {
			addClass(currentItem, 'lastinprogress');
		}
	}
	if (prevItem) {
		addClass(prevItem, 'done');
	}
	if (this.currentStep == 0) {
		addClass(currentItem, 'first')
	}
	if (preStep == 0) {
		addClass(prevItem, 'fdone');
	}
	if (preStep == this.steps.length - 1) {
		addClass(prevItem, 'ldone');
	}
	if (this.currentStep == this.steps.length) {
		currentItem && addClass(currentItem, 'lastinprogress');
	}
}