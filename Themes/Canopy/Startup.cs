using Fluid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OrchardCore.BackgroundTasks;
using OrchardCore.Liquid;
using OrchardCore.Modules;
using OrchardCore.ResourceManagement;
using OrchardCore.Themes.Canopy.Filters;
using OrchardCore.Themes.Canopy.Services;

namespace OrchardCore.Themes.Canopy;

public class Startup : StartupBase
{
    public override void ConfigureServices(IServiceCollection services)
    {
        services.AddMemoryCache();
        services.AddHttpClient(TrustSignalsService.HttpClientName, client =>
        {
            client.DefaultRequestHeaders.UserAgent.ParseAdd("CanopyTheme/1.8.3");
            client.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
        });

        services.AddTransient<IConfigureOptions<ResourceManagementOptions>, ResourceManagementOptionsConfiguration>();
        services.Configure<TemplateOptions>(options => options.MemberAccessStrategy.Register<TrustSignals>());
        services.AddLiquidFilter<TrustSignalsLiquidFilter>("trust_signals");
        services.AddSingleton<ITrustSignalsService, TrustSignalsService>();
        services.AddSingleton<IBackgroundTask, TrustSignalsBackgroundTask>();
    }
}
