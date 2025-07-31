namespace Backend.Core.WebUtility;

public class ApplicationResponseModel<T>
{
    public T Data { get; set; }
    public bool ErrorExist { get; set; }
    public string ErrorMessage { get; set; }
}