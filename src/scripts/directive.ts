namespace ngSchedule.directives {

	import AdScheduleViewModel = models.AdScheduleViewModel;

	/**
	 * Data about the mouse movement. It records the element where the user started selecting the schedule, and the current/last element.
	 */
	interface DragData {
		start: Element;
		end: Element;
	}

	interface ISchedulePickerScope extends ng.IScope {
		days: string[];
		timeFormat: string;
	}

	interface ISchedulePickerAttributes extends ng.IAttributes {
		days: string;
	}

	/**
	 * The data set in the <td> by the jQuery `data` method. It contains the day and hour the cell represents.
	 */
	interface CellData {
		day: number;
		hour: number;
	}

	schedulePicker.$inject = ['scheduleUtils', '$log'];
	function schedulePicker(scheduleUtils: functions.IScheduleUtils, logger: ng.ILogService): ng.IDirective {

		/**
		 * Detect the cells the user has draged the mouse over.
		 */
		function detectCells(data: DragData, body: HTMLTableSectionElement, allCells: JQuery) {

			const start = angular.element(data.start);
			const startData = <CellData>start.data();

			const end = angular.element(data.end);
			const endData = <CellData>end.data();

			let startPoint = startData.hour;
			let endPoint = endData.hour;

			if (startPoint > endPoint) {
				startPoint = endPoint;
				endPoint = startData.hour;
			}

			var selectedRows: HTMLTableRowElement[] = [];
			selectedRows.push.apply(selectedRows, body.rows);

			selectedRows = selectedRows.slice(startPoint, endPoint + 1);

			var selectedCells: HTMLTableCellElement[] = [];
			selectedRows.forEach(tr => selectedCells.push.apply(selectedCells, tr.cells));

			var selectedCells = selectedCells.filter((el) => {

				var index = el.cellIndex - 1;
				//var index = angular.element(el).parent().find('td').index(el);

				let startPoint = startData.day;
				let endPoint = endData.day;

				if (startPoint > endPoint) {
					startPoint = endPoint;
					endPoint = startData.day;
				}

				return startPoint <= index && index <= endPoint;
			});

			return selectedCells;
		}

		/**
		 * Replaces all the `selecting` classes in the cells by the `selected` class (or removes it, if the user is removing selections) and process and returns a new model.
		 * NOTE: The model returned won't be the same as the last one!
		 */
		function doneDrag(data: DragData, allCells: JQuery) {

			var arrayCells: HTMLTableCellElement[] = [];

			arrayCells.push.apply(arrayCells, allCells);

			var selected = arrayCells.filter(td => {
				var isSelecting = td.classList.contains('selecting');

				td.classList.remove('selecting');

				return isSelecting;
			});
			//selected.removeClass('selecting');

			//if (angular.element(data.start).hasClass('selected')) {
			if (data.start.classList.contains('selected')) {
				//selected.removeClass('selected');
				selected.forEach(td => td.classList.remove('selected'))
			} else {
				selected.forEach(td => td.classList.add('selected'))
				//selected.addClass('selected');
			}

			let model = scheduleUtils.createAdScheduleViewModel();
			arrayCells.forEach(el => {
				if (el.classList.contains('selected')) {
					let data: CellData = angular.element(el).data();

					model[data.day].hours.push(data.hour);
				}
			});
			// allCells.filter('.selected').each((index, el) => {
			// 	let data: CellData = angular.element(el).data();

			// 	model[data.day].hours.push(data.hour);
			// });

			return model;
		}

		/**
		 * Function that gets called when the user is draging the mouse around.
		 * It adds the selecting class to the cells, so it can be styled by CSS.
		 */
		function dragMove(data: DragData, body: HTMLTableSectionElement, allCells: JQuery) {
			allCells.removeClass('selecting');
			detectCells(data, body, allCells).forEach(td => td.classList.add('selecting'));
		}

		/**
		 * Gets the table body for the specified hour strings
		 */
		function getTableBody(hours: string[], model: AdScheduleViewModel[]): DocumentFragment {
			let bodyFragment = document.createDocumentFragment();
			hours.forEach((hour, index) => {
				let rowFragment = document.createDocumentFragment();
				let row = angular.element(`<tr data-hour="${index}"></tr>`);

				row.append(`<th>${hour}</th>`);

				model.forEach((day, i) => {
					let td = angular.element('<td></td>')
						.data({ day: i, hour: index });

					if (day.hours.indexOf(index) > -1) {
						td.addClass('selected');
					}

					row.append(td);
				});

				rowFragment.appendChild(row[0]);
				bodyFragment.appendChild(rowFragment);
			});

			return bodyFragment;
		}


		return {
			restrict: 'E',
			require: 'ngModel',
			link: link,
			scope: {
				timeFormat: '@'
			},
			template: `
<table>
	<thead>
		<tr>
			<th></th>
			<th ng-repeat="day in days track by $index">{{::day}}</th>
		</tr>
	</thead>
	<!--<tbody>
	</tbody>-->
</table>`
		};

		function link(scope: ISchedulePickerScope, element: JQuery, attrs: ISchedulePickerAttributes, ngModel: ng.INgModelController) {

			const el: Element = element[0];

			const table = <HTMLTableElement>el.querySelector('table');

			var timeFormat = scope.timeFormat || 'H\\h';

			if (attrs.days) {
				let days = <string[]>scope.$parent.$eval(attrs.days);
				if (angular.isArray(days))
					if (days.length === 7) {
						scope.days = days;
					} else {
						logger.warn(`ngScheduler - the days array contains ${scope.days.length} entries. The default value will be used.`);
						scope.days = null;
					}
			}

			if (!scope.days) {
				scope.days = moment.weekdaysShort();
			}

			let start = moment().startOf('day'),
				hours: string[] = [];
			for (let i = 0; i < 24; i++) {

				hours.push(start.format(timeFormat));

				start.add(1, 'hour');
			}

			let capturing: DragData = null;
			let model: AdScheduleViewModel[] = [];
			//let allCells //element.find("table > tbody td");

			ngModel.$isEmpty = scheduleUtils.scheduleIsEmpty;

			ngModel.$render = function () {

				if (angular.isArray(ngModel.$modelValue)) {
					model = ngModel.$modelValue;
				} else {
					model = scheduleUtils.createAdScheduleViewModel();
					ngModel.$setViewValue(model);
				}

				let body = <HTMLTableSectionElement>table.tBodies[0];

				// do not use body.remove() because it doesn't work on IE11-
				body && body.parentNode.removeChild(body);

				body = table.createTBody();

				body.appendChild(getTableBody(hours, model));

				capturing = null;
				let allCells = angular.element(body).find('td');

				body.addEventListener('mousedown', e => {
					let target = <Element>e.target;
					if (!target || target.nodeName !== 'TD') {
						return;
					}

					e.preventDefault();

					if (capturing) {
						done(e);
					} else {

						capturing = {
							start: target,
							end: target
						};

						dragMove(capturing, body, allCells);
					}
				})

				//body.on('mousedown', 'td', );

				function done(e: Event) {

					if (!capturing) return;

					let target = <Element>e.target
					if (!target || target.nodeName !== 'TD') {
						return;
					}


					capturing.end = target;

					model = doneDrag(capturing, allCells);

					ngModel.$setViewValue(model, e.type);

					capturing = null;
				}

				body.addEventListener('mouseup', done);

				body.addEventListener('mousemove', e => {
					let target = <Element>e.target
					if (!target || target.nodeName !== 'TD') {
						return;
					}

					e.preventDefault();

					if (!capturing) return;

					capturing.end = target;

					dragMove(capturing, body, allCells);
				});

				//body.on('mouseup', 'td', done);

				//body.on('mousemove', 'td', );
			};
		}
	}

	export const ngScheduleDirectives = angular.module('ngSchedule.directives', ['ngSchedule.functions'])
		.directive('schedulePicker', schedulePicker);
}
