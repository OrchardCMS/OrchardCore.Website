using System;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using OrchardCore.BackgroundTasks;

namespace OrchardCore.Themes.Canopy.Services;

public interface ITrustSignalsService
{
    Task<TrustSignals> GetTrustSignalsAsync(CancellationToken cancellationToken = default);
}

public record TrustSignals(long Stars, int Contributors, string LatestRelease, long NuGetDownloads, string LastCommitDate)
{
    public static TrustSignals Empty { get; } = new(0, 0, "Unavailable", 0, string.Empty);
}

public sealed class TrustSignalsService : ITrustSignalsService
{
    public const string HttpClientName = "Canopy.TrustSignals";

    private const string CacheKey = "Canopy.TrustSignals.Cache";
    private const string GitHubRepositoryUrl = "https://api.github.com/repos/OrchardCMS/OrchardCore";
    private const string GitHubLatestReleaseUrl = "https://api.github.com/repos/OrchardCMS/OrchardCore/releases/latest";
    private const string GitHubContributorsUrl = "https://api.github.com/repos/OrchardCMS/OrchardCore/contributors?per_page=1&anon=false";
    private const string GitHubCommitsUrl = "https://api.github.com/repos/OrchardCMS/OrchardCore/commits?per_page=1";
    private const string NuGetQueryUrl = "https://azuresearch-usnc.nuget.org/query?q=OrchardCore&prerelease=false";

    private readonly IMemoryCache _memoryCache;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TrustSignalsService> _logger;

    public TrustSignalsService(
        IMemoryCache memoryCache,
        IHttpClientFactory httpClientFactory,
        ILogger<TrustSignalsService> logger)
    {
        _memoryCache = memoryCache;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public Task<TrustSignals> GetTrustSignalsAsync(CancellationToken cancellationToken = default)
    {
        return _memoryCache.GetOrCreateAsync(CacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return await FetchTrustSignalsAsync(cancellationToken);
        })!;
    }

    private async Task<TrustSignals> FetchTrustSignalsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var client = _httpClientFactory.CreateClient(HttpClientName);

            var starsTask = GetStarsAsync(client, cancellationToken);
            var contributorsTask = GetContributorsAsync(client, cancellationToken);
            var latestReleaseTask = GetLatestReleaseAsync(client, cancellationToken);
            var nuGetDownloadsTask = GetNuGetDownloadsAsync(client, cancellationToken);
            var lastCommitDateTask = GetLastCommitDateAsync(client, cancellationToken);

            await Task.WhenAll(starsTask, contributorsTask, latestReleaseTask, nuGetDownloadsTask, lastCommitDateTask);

            return new TrustSignals(
                await starsTask,
                await contributorsTask,
                await latestReleaseTask,
                await nuGetDownloadsTask,
                await lastCommitDateTask);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Unable to refresh Canopy trust signals.");
            return TrustSignals.Empty;
        }
    }

    private static async Task<long> GetStarsAsync(HttpClient client, CancellationToken cancellationToken)
    {
        using var document = await GetJsonDocumentAsync(client, GitHubRepositoryUrl, cancellationToken);
        return document.RootElement.TryGetProperty("stargazers_count", out var stars) ? stars.GetInt64() : 0;
    }

    private static async Task<string> GetLatestReleaseAsync(HttpClient client, CancellationToken cancellationToken)
    {
        using var document = await GetJsonDocumentAsync(client, GitHubLatestReleaseUrl, cancellationToken);

        if (document.RootElement.TryGetProperty("name", out var name) && !string.IsNullOrWhiteSpace(name.GetString()))
        {
            return name.GetString()!;
        }

        return document.RootElement.TryGetProperty("tag_name", out var tagName)
            ? tagName.GetString() ?? TrustSignals.Empty.LatestRelease
            : TrustSignals.Empty.LatestRelease;
    }

    private static async Task<int> GetContributorsAsync(HttpClient client, CancellationToken cancellationToken)
    {
        using var response = await client.GetAsync(GitHubContributorsUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        if (TryGetContributorCount(response.Headers, out var contributorCount))
        {
            return contributorCount;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        return document.RootElement.ValueKind == JsonValueKind.Array ? document.RootElement.GetArrayLength() : 0;
    }

    private static async Task<long> GetNuGetDownloadsAsync(HttpClient client, CancellationToken cancellationToken)
    {
        using var document = await GetJsonDocumentAsync(client, NuGetQueryUrl, cancellationToken);
        long totalDownloads = 0;

        if (document.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
        {
            foreach (var package in data.EnumerateArray())
            {
                if (package.TryGetProperty("totalDownloads", out var downloads) && downloads.TryGetInt64(out var value))
                {
                    totalDownloads += value;
                }
            }
        }

        return totalDownloads;
    }

    private static async Task<string> GetLastCommitDateAsync(HttpClient client, CancellationToken cancellationToken)
    {
        using var document = await GetJsonDocumentAsync(client, GitHubCommitsUrl, cancellationToken);

        if (document.RootElement.ValueKind != JsonValueKind.Array || document.RootElement.GetArrayLength() == 0)
        {
            return string.Empty;
        }

        var commit = document.RootElement[0];
        if (commit.TryGetProperty("commit", out var commitElement) &&
            commitElement.TryGetProperty("author", out var authorElement) &&
            authorElement.TryGetProperty("date", out var dateElement) &&
            DateTimeOffset.TryParse(dateElement.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var commitDate))
        {
            return commitDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        return string.Empty;
    }

    private static async Task<JsonDocument> GetJsonDocumentAsync(HttpClient client, string url, CancellationToken cancellationToken)
    {
        using var response = await client.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
    }

    private static bool TryGetContributorCount(HttpResponseHeaders headers, out int contributorCount)
    {
        contributorCount = 0;

        if (!headers.TryGetValues("Link", out var values))
        {
            return false;
        }

        foreach (var value in values)
        {
            var segments = value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var segment in segments)
            {
                if (!segment.Contains("rel=\"last\"", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var pageToken = "page=";
                var pageIndex = segment.IndexOf(pageToken, StringComparison.OrdinalIgnoreCase);
                if (pageIndex < 0)
                {
                    continue;
                }

                pageIndex += pageToken.Length;
                var endIndex = segment.IndexOf('>', pageIndex);
                var pageValue = endIndex >= 0 ? segment[pageIndex..endIndex] : segment[pageIndex..];

                if (int.TryParse(pageValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out contributorCount))
                {
                    return true;
                }
            }
        }

        return false;
    }
}

public abstract class BackgroundTask : IBackgroundTask
{
    public abstract Task DoWorkAsync(IServiceProvider serviceProvider, CancellationToken cancellationToken);
}

[global::OrchardCore.BackgroundTasks.BackgroundTaskAttribute(
    Title = "Canopy Trust Signals Refresh",
    Schedule = "0 * * * *",
    Description = "Refreshes GitHub and NuGet trust signals for the Canopy theme.")]
public sealed class TrustSignalsBackgroundTask : BackgroundTask
{
    private readonly ITrustSignalsService _trustSignalsService;
    private readonly ILogger<TrustSignalsBackgroundTask> _logger;

    public TrustSignalsBackgroundTask(
        ITrustSignalsService trustSignalsService,
        ILogger<TrustSignalsBackgroundTask> logger)
    {
        _trustSignalsService = trustSignalsService;
        _logger = logger;
    }

    public override async Task DoWorkAsync(IServiceProvider serviceProvider, CancellationToken cancellationToken)
    {
        try
        {
            await _trustSignalsService.GetTrustSignalsAsync(cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Unable to warm the Canopy trust signals cache.");
        }
    }
}
