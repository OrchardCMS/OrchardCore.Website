using OrchardCore.Modules.Manifest;

[assembly: Module(
    Id = "TheOrchardCoreTheme.Module",
    Name = "Orchard Core Website",
    Author = "Orchard Core",
    Website = "https://orchardcore.net",
    Version = "0.0.1",
    Description = "Companion module for TheOrchardCoreTheme: editor layout (tabs) and the content model + seed content (run on first enable).",
    Category = "Content",
    // These must be enabled (and their schema migrated) before this module's migration runs the
    // content recipes — declaring them as dependencies guarantees that ordering.
    Dependencies =
    [
        "OrchardCore.Contents",
        "OrchardCore.ContentTypes",
        "OrchardCore.ContentFields",
        "OrchardCore.Flows",
        "OrchardCore.Title",
        "OrchardCore.Autoroute",
        // Content localization: cultures, per-culture content variants (LocalizationPart), and the
        // front-end culture switcher — enabled with the theme so the fr homepage + language picker work.
        "OrchardCore.Localization",
        "OrchardCore.ContentLocalization",
        "OrchardCore.ContentLocalization.ContentCulturePicker",
        "OrchardCore.Html",
        "OrchardCore.Media",
        "OrchardCore.Seo",
        "OrchardCore.Liquid",
        "OrchardCore.Menu",
        // Composable, per-culture footer: widgets placed in the "Footer Top" / "Footer Bottom" zones via
        // Layers, with English/French culture-rule layers driving localization.
        "OrchardCore.Widgets",
        "OrchardCore.Layers",
        "OrchardCore.Templates",
        "OrchardCore.Workflows",
        "OrchardCore.Workflows.Timers",
        "OrchardCore.Workflows.Http",
        "OrchardCore.Shortcodes",
        "OrchardCore.Shortcodes.Templates",
        // Gzip/Brotli response compression (compresses site.css / JS / HTML) — enabled with the theme.
        "OrchardCore.ResponseCompression"
    ]
)]
