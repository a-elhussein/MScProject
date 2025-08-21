namespace Backend.API.WebUtility
{
    public enum IsDeleted
    {
        Deleted = 1,
        NotDeleted = 0
    }

    public enum IsActive
    {
        Inactive = 1,
        Active = 0
    }

    public enum ActivityLevel
    {
        Sedentary = 0,
        Light = 1,
        Moderate = 2,
        Active = 3,
        Athlete = 4
    }

    public enum Goal
    {
        Cut = 0,
        Maintain = 1,
        Bulk = 2
    }

    public enum UnitSystem
    {
        Metric = 0,
        Imperial = 1
    }

    public enum Sex
    {
        Male = 0,
        Female = 1
    }

    public enum MealType
    {
        Breakfast = 0,
        Lunch = 1,
        Dinner = 2,
    }
}