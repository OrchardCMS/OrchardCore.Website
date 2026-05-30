using System.Threading.Tasks;
using Fluid;
using Fluid.Values;
using OrchardCore.Liquid;
using OrchardCore.Themes.Canopy.Services;

namespace OrchardCore.Themes.Canopy.Filters;

public class TrustSignalsLiquidFilter : ILiquidFilter
{
    private readonly ITrustSignalsService _trustSignalsService;

    public TrustSignalsLiquidFilter(ITrustSignalsService trustSignalsService)
    {
        _trustSignalsService = trustSignalsService;
    }

    public async ValueTask<FluidValue> ProcessAsync(FluidValue input, FilterArguments arguments, LiquidTemplateContext context)
    {
        var trustSignals = await _trustSignalsService.GetTrustSignalsAsync();
        return FluidValue.Create(trustSignals, context.Options);
    }
}
