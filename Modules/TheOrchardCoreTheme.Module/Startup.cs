using Microsoft.Extensions.DependencyInjection;
using OrchardCore.Data.Migration;
using OrchardCore.Modules;

namespace TheOrchardCoreTheme.Module;

public sealed class Startup : StartupBase
{
    public override void ConfigureServices(IServiceCollection services)
    {
        // Runs the content model + content recipes the first time this module is enabled
        // (i.e. when the theme is selected, since the theme depends on this module).
        services.AddDataMigration<Migrations>();
    }
}
