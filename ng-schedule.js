var ngSchedule;
(function (ngSchedule) {
    var directives;
    (function (directives) {
        schedulePicker.$inject = ['scheduleUtils', '$log'];
        function schedulePicker(scheduleUtils, logger) {
            /**
             * Detect the cells the user has draged the mouse over.
             */
            function detectCells(data, body, allCells) {
                var start = angular.element(data.start);
                var startData = start.data();
                var end = angular.element(data.end);
                var endData = end.data();
                var startPoint = startData.hour;
                var endPoint = endData.hour;
                if (startPoint > endPoint) {
                    startPoint = endPoint;
                    endPoint = startData.hour;
                }
                var selectedRows = [];
                selectedRows.push.apply(selectedRows, body.rows);
                selectedRows = selectedRows.slice(startPoint, endPoint + 1);
                var selectedCells = [];
                selectedRows.forEach(function (tr) { return selectedCells.push.apply(selectedCells, tr.cells); });
                var selectedCells = selectedCells.filter(function (el) {
                    var index = el.cellIndex - 1;
                    //var index = angular.element(el).parent().find('td').index(el);
                    var startPoint = startData.day;
                    var endPoint = endData.day;
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
            function doneDrag(data, allCells) {
                var arrayCells = [];
                arrayCells.push.apply(arrayCells, allCells);
                var selected = arrayCells.filter(function (td) {
                    var isSelecting = td.classList.contains('selecting');
                    td.classList.remove('selecting');
                    return isSelecting;
                });
                //selected.removeClass('selecting');
                //if (angular.element(data.start).hasClass('selected')) {
                if (data.start.classList.contains('selected')) {
                    //selected.removeClass('selected');
                    selected.forEach(function (td) { return td.classList.remove('selected'); });
                }
                else {
                    selected.forEach(function (td) { return td.classList.add('selected'); });
                }
                var model = scheduleUtils.createAdScheduleViewModel();
                arrayCells.forEach(function (el) {
                    if (el.classList.contains('selected')) {
                        var data_1 = angular.element(el).data();
                        model[data_1.day].hours.push(data_1.hour);
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
            function dragMove(data, body, allCells) {
                allCells.removeClass('selecting');
                detectCells(data, body, allCells).forEach(function (td) { return td.classList.add('selecting'); });
            }
            /**
             * Gets the table body for the specified hour strings
             */
            function getTableBody(hours, model) {
                var bodyFragment = document.createDocumentFragment();
                hours.forEach(function (hour, index) {
                    var rowFragment = document.createDocumentFragment();
                    var row = angular.element("<tr data-hour=\"" + index + "\"></tr>");
                    row.append("<th>" + hour + "</th>");
                    model.forEach(function (day, i) {
                        var td = angular.element('<td></td>')
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
                scope: {},
                template: "\n<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th></th>\n\t\t\t<th ng-repeat=\"day in days track by $index\">{{::day}}</th>\n\t\t</tr>\n\t</thead>\n\t<!--<tbody>\n\t</tbody>-->\n</table>"
            };
            function link(scope, element, attrs, ngModel) {
                var el = element[0];
                var table = el.querySelector('table');
                if (attrs.days) {
                    var days = scope.$parent.$eval(attrs.days);
                    if (angular.isArray(days))
                        if (days.length === 7) {
                            scope.days = days;
                        }
                        else {
                            logger.warn("ngScheduler - the days array contains " + scope.days.length + " entries. The default value will be used.");
                            scope.days = null;
                        }
                }
                if (!scope.days) {
                    scope.days = moment.weekdaysShort();
                }
                var start = moment().startOf('day'), hours = [];
                for (var i = 0; i < 24; i++) {
                    hours.push(start.format('H:mma'));
                    start.add(1, 'hour');
                }
                var capturing = null;
                var model = [];
                //let allCells //element.find("table > tbody td");
                ngModel.$isEmpty = scheduleUtils.scheduleIsEmpty;
                ngModel.$render = function () {
                    if (angular.isArray(ngModel.$modelValue)) {
                        model = ngModel.$modelValue;
                    }
                    else {
                        model = scheduleUtils.createAdScheduleViewModel();
                        ngModel.$setViewValue(model);
                    }
                    var body = table.tBodies[0];
                    body && body.remove();
                    body = table.createTBody();
                    body.appendChild(getTableBody(hours, model));
                    capturing = null;
                    var allCells = angular.element(body).find('td');
                    body.addEventListener('mousedown', function (e) {
                        var target = e.target;
                        if (!target || target.nodeName !== 'TD') {
                            return;
                        }
                        e.preventDefault();
                        if (capturing) {
                            done(e);
                        }
                        else {
                            capturing = {
                                start: target,
                                end: target
                            };
                            dragMove(capturing, body, allCells);
                        }
                    });
                    //body.on('mousedown', 'td', );
                    function done(e) {
                        if (!capturing)
                            return;
                        var target = e.target;
                        if (!target || target.nodeName !== 'TD') {
                            return;
                        }
                        capturing.end = target;
                        model = doneDrag(capturing, allCells);
                        ngModel.$setViewValue(model, e.type);
                        capturing = null;
                    }
                    body.addEventListener('mouseup', done);
                    body.addEventListener('mousemove', function (e) {
                        var target = e.target;
                        if (!target || target.nodeName !== 'TD') {
                            return;
                        }
                        e.preventDefault();
                        if (!capturing)
                            return;
                        capturing.end = target;
                        dragMove(capturing, body, allCells);
                    });
                    //body.on('mouseup', 'td', done);
                    //body.on('mousemove', 'td', );
                };
            }
        }
        directives.ngScheduleDirectives = angular.module('ngSchedule.directives', ['ngSchedule.functions'])
            .directive('schedulePicker', schedulePicker);
    })(directives = ngSchedule.directives || (ngSchedule.directives = {}));

    var functions;
    (function (functions) {
        function scheduleUtils() {
            return {
                createAdScheduleViewModel: function () {
                    var model = [];
                    for (var i = 0; i < 7; i++) {
                        model.push({
                            day: i,
                            hours: []
                        });
                    }
                    ;
                    return model;
                },
                scheduleIsEmpty: function (schedule) {
                    if (!schedule || !angular.isArray(schedule)) {
                        return true;
                    }
                    for (var i = 0; i < 7; i++) {
                        var day = schedule[i];
                        for (var j = 0; j < 24; j++) {
                            if (day.hours[j]) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            };
        }
        functions.ngScheduleFunctions = angular.module('ngSchedule.functions', []);
        functions.ngScheduleFunctions.factory('scheduleUtils', scheduleUtils);
    })(functions = ngSchedule.functions || (ngSchedule.functions = {}));

    var models;
    (function (models) {
        /**
         * Days of the week.
         * Goes from Sunday (0) to Saturday (6)
         * This was based from .NET's DayOfWeek enum.
         */
        (function (DayOfWeek) {
            DayOfWeek[DayOfWeek["Sunday"] = 0] = "Sunday";
            DayOfWeek[DayOfWeek["Monday"] = 1] = "Monday";
            DayOfWeek[DayOfWeek["Tuesday"] = 2] = "Tuesday";
            DayOfWeek[DayOfWeek["Wednesday"] = 3] = "Wednesday";
            DayOfWeek[DayOfWeek["Thursday"] = 4] = "Thursday";
            DayOfWeek[DayOfWeek["Friday"] = 5] = "Friday";
            DayOfWeek[DayOfWeek["Saturday"] = 6] = "Saturday";
        })(models.DayOfWeek || (models.DayOfWeek = {}));
        var DayOfWeek = models.DayOfWeek;
    })(models = ngSchedule.models || (ngSchedule.models = {}));

    ngSchedule.ngScheduleModule = angular.module('ngSchedule', ['ngSchedule.functions', 'ngSchedule.directives']);
})(ngSchedule || (ngSchedule = {}));
