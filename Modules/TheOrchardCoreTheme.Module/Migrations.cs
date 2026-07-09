using OrchardCore.Data.Migration;
using OrchardCore.Recipes.Services;

namespace TheOrchardCoreTheme.Module;

/// <summary>
/// Bootstraps the site content when the module is first enabled. Because the theme depends on
/// this module, selecting the theme (the admin "use theme" action, or the AutoSetup recipe)
/// enables the module, which runs these recipes: the content model first, then the seed content.
/// Migrations run once per tenant, so on a fresh database it sets the site up automatically.
/// </summary>
public sealed class Migrations : DataMigration
{
    private readonly IRecipeMigrator _recipeMigrator;

    public Migrations(IRecipeMigrator recipeMigrator)
    {
        _recipeMigrator = recipeMigrator;
    }

    public async Task<int> CreateAsync()
    {
        // The content model is split one recipe per definition. `Shapes/core` runs first: it enables
        // the features and defines the shared Section / BlockActionsPart / CallToAction that the blocks
        // reference. The rest are order-independent (ReplaceContentDefinition just stores defs, and
        // LandingPage contains blocks by stereotype): the LandingPage container (ContentTypes), the
        // section blocks (Blocks), then the site chrome (Theme). Then the seed content and automation.
        await _recipeMigrator.ExecuteAsync("Shapes/core.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("ContentTypes/landing-page.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/hero-text.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/hero-event.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/logo-strip.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/statistics.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/card-grid-tabbed.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/card-grid.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/feature-explorer.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/comparison-table.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/showcase.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/get-started.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/event-promo.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/faqs.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/profiles.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/schedule.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/gallery.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Blocks/text-and-image.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Theme/site-statistics.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Theme/site-footer.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("Theme/site-header.recipe.json", this);

        await _recipeMigrator.ExecuteAsync("content.recipe.json", this);
        await _recipeMigrator.ExecuteAsync("automation.recipe.json", this);

        return 1;
    }
}
