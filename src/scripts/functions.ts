module ngSchedule {
	/**
	 * Creates an empty model with no values selected
	 */
	export function createAdScheduleViewModel(): AdScheduleViewModel[] {
		let model = [];
		for (let i = 0; i < 7; i++) {
			model.push({
				day: <DayOfWeek>i,
				hours: []
			});
		};

		return model;
	}

	/**
	 * Returns true if the schedule is empty. Useful for validation.
	 */
	export function scheduleIsEmpty(schedule: AdScheduleViewModel[]) {
		if (!schedule || !angular.isArray(schedule)) {
			return true;
		}

		for (let i = 0; i < 7; i++) {
			let day = schedule[i];

			for (let j = 0; j < 24; j++) {
				if (day.hours[j]) {
					return false;
				}
			}
		}

		return true;
	}
}