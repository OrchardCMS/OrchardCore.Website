using OrchardCore.ContentFields.Fields;
using OrchardCore.ContentManagement;
using OrchardCore.ContentManagement.Records;
using OrchardCore.Data.Migration;
using OrchardCore.Flows.Models;
using OrchardCore.Recipes.Services;
using YesSql;

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
    private readonly IContentManager _contentManager;
    private readonly ISession _session;

    public Migrations(IRecipeMigrator recipeMigrator, IContentManager contentManager, ISession session)
    {
        _recipeMigrator = recipeMigrator;
        _contentManager = contentManager;
        _session = session;
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

        await _recipeMigrator.ExecuteAsync("legal.recipe.json", this);

        return 2;
    }

    // Adds the /privacy and /terms pages, and their footer links, to sites created before they existed.
    // Fresh sites get the links from content.recipe.json instead.
    public async Task<int> UpdateFrom1Async()
    {
        await _recipeMigrator.ExecuteAsync("legal.recipe.json", this);
        await AddLegalFooterLinksAsync();

        return 2;
    }

    private async Task AddLegalFooterLinksAsync()
    {
        var columns = await _session
            .Query<ContentItem, ContentItemIndex>(index => index.ContentType == "LinkColumn" && index.Published)
            .ListAsync();

        var project = columns.FirstOrDefault(column => column.DisplayText == "Project");
        if (project is null)
        {
            return;
        }

        var existing = project.Get<BagPart>("Links")?.ContentItems ?? [];

        foreach (var (text, url) in new[] { ("Privacy Policy", "~/privacy"), ("Terms of Service", "~/terms") })
        {
            if (existing.Any(item => item.Get<ContentPart>("Link")?.Get<LinkField>("Link")?.Url == url))
            {
                continue;
            }

            var link = await _contentManager.NewAsync("Link");
            link.DisplayText = text;
            link.Latest = true;
            link.Published = true;
            link.Alter<ContentPart>("Link", part => part.Alter<LinkField>("Link", field =>
            {
                field.Url = url;
                field.Text = text;
                field.Target = string.Empty;
            }));

            project.Alter<BagPart>("Links", bag => bag.ContentItems.Add(link));
        }

        await _contentManager.UpdateAsync(project);
    }
}
