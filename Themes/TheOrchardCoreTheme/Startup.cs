using Microsoft.Extensions.DependencyInjection;
using OrchardCore.Modules;

namespace TheOrchardCoreTheme;

public sealed class Startup : StartupBase
{
    public override void ConfigureServices(IServiceCollection services)
    {
        services.AddResourceConfiguration<ResourceManagementOptionsConfiguration>();
    }
}
