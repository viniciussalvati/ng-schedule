declare namespace ngSchedule.directives {
    const ngScheduleDirectives: ng.IModule;
}
declare namespace ngSchedule.functions {
    import AdScheduleViewModel = models.AdScheduleViewModel;
    interface IScheduleUtils {
        /**
         * Creates an empty model with no values selected
         */
        createAdScheduleViewModel(): AdScheduleViewModel[];
        /**
         * Returns true if the schedule is empty. Useful for validation.
         */
        scheduleIsEmpty(schedule: AdScheduleViewModel[]): boolean;
    }
    const ngScheduleFunctions: ng.IModule;
}
declare namespace ngSchedule.models {
    /**
     * Days of the week.
     * Goes from Sunday (0) to Saturday (6)
     * This was based from .NET's DayOfWeek enum.
     */
    enum DayOfWeek {
        Sunday = 0,
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6,
    }
    interface AdScheduleViewModel {
        day: DayOfWeek;
        hours: number[];
    }
}
declare namespace ngSchedule {
    const ngScheduleModule: ng.IModule;
}
