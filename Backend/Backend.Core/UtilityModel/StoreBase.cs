using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.API.WebUtility;

namespace Backend.Core.UtilityModel;

public abstract class StoreBase
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public int Id { get; set; }

    public IsActive IsActive { get; set; }
    public IsDeleted IsDeleted { get; set; }
}