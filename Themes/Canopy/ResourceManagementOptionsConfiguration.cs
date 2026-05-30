using Microsoft.Extensions.Options;
using OrchardCore.ResourceManagement;

namespace OrchardCore.Themes.Canopy;

public class ResourceManagementOptionsConfiguration : IConfigureOptions<ResourceManagementOptions>
{
    private static readonly ResourceManifest Manifest;

    static ResourceManagementOptionsConfiguration()
    {
        Manifest = new ResourceManifest();

        Manifest
            .DefineStyle("canopy")
            .SetUrl("~/Canopy/css/canopy.min.css")
            .SetVersion("1.8.3");

        Manifest
            .DefineScript("canopy")
            .SetUrl("~/Canopy/js/canopy.bundle.js")
            .SetVersion("1.8.3");
    }

    public void Configure(ResourceManagementOptions options)
    {
        options.ResourceManifests.Add(Manifest);
    }
}
