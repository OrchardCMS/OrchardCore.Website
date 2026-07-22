using Microsoft.Extensions.Options;
using OrchardCore.ResourceManagement;

namespace TheOrchardCoreTheme;

public sealed class ResourceManagementOptionsConfiguration : IConfigureOptions<ResourceManagementOptions>
{
    private static readonly ResourceManifest _manifest;

    static ResourceManagementOptionsConfiguration()
    {
        _manifest = new ResourceManifest();

        // The Tailwind output, compiled from Assets/Styles/site.css by Lombiq.Tailwind.Targets on build.
        _manifest
            .DefineStyle("TheOrchardCoreTheme")
            .SetUrl("~/TheOrchardCoreTheme/css/site.css")
            .SetVersion("1.0.0");

        // Theme chrome behaviour (dark-mode toggle, sticky header, mobile menu).
        _manifest
            .DefineScript("TheOrchardCoreTheme")
            .SetUrl("~/TheOrchardCoreTheme/js/theme.js")
            .SetVersion("1.0.0");
    }

    public void Configure(ResourceManagementOptions options)
    {
        options.ResourceManifests.Add(_manifest);
    }
}
