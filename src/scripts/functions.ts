namespace ngSchedule.functions {

	import AdScheduleViewModel = models.AdScheduleViewModel;

	export interface IScheduleUtils {
		/**
		 * Creates an empty model with no values selected
		 */
		createAdScheduleViewModel(): AdScheduleViewModel[];
		/**
		 * Returns true if the schedule is empty. Useful for validation.
		 */
		scheduleIsEmpty(schedule: AdScheduleViewModel[]): boolean;
	}

	function scheduleUtils(): IScheduleUtils {
		return {
			createAdScheduleViewModel(): AdScheduleViewModel[] {
				let model = [];
				for (let i = 0; i < 7; i++) {
					model.push({
						day: <models.DayOfWeek>i,
						hours: []
					});
				};

				return model;
			},
			scheduleIsEmpty(schedule: AdScheduleViewModel[]): boolean {
				if (!schedule || !angular.isArray(schedule)) {
					return true;
				}

				return !schedule.some(day => !!day.hours.length);
			}
		};
	}

	export const ngScheduleFunctions = angular.module('ngSchedule.functions', []);

	ngScheduleFunctions.factory('scheduleUtils', scheduleUtils);
}