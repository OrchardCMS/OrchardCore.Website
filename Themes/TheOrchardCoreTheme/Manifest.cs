using OrchardCore.DisplayManagement.Manifest;

[assembly: Theme(
    Name = "TheOrchardCoreTheme",
    Author = "Orchard Core",
    Website = "https://orchardcore.net",
    Version = "0.0.1",
    Description = "The theme for the orchardcore.net website.",
    Dependencies =
    [
        "TheOrchardCoreTheme.Module",
        "OrchardCore.Flows",
        "OrchardCore.Menu",
        "OrchardCore.ContentFields",
        "OrchardCore.Title",
        "OrchardCore.Autoroute",
        "OrchardCore.Html",
        "OrchardCore.Media",
        "OrchardCore.Seo",
        "OrchardCore.Liquid",
        "OrchardCore.Shortcodes"
    ]
)]
