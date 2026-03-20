using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EditedFoodsandMeals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CaloriesKcal",
                table: "MealItem",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CarbsG",
                table: "MealItem",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "CarbsG100G",
                table: "MealItem",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "MealItem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EnergyKcal100G",
                table: "MealItem",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "FatG",
                table: "MealItem",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "FatG100G",
                table: "MealItem",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ProteinG",
                table: "MealItem",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ProteinG100G",
                table: "MealItem",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ServingSizeG",
                table: "MealItem",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ServingSizeG",
                table: "Food",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaloriesKcal",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "CarbsG",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "CarbsG100G",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "EnergyKcal100G",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "FatG",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "FatG100G",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "ProteinG",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "ProteinG100G",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "ServingSizeG",
                table: "MealItem");

            migrationBuilder.DropColumn(
                name: "ServingSizeG",
                table: "Food");
        }
    }
}
