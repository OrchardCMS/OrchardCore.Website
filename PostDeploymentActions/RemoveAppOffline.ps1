$wwwrootPath = '../../../wwwroot'
$appOfflinePath = $wwwrootPath + '/app_offline.htm'
$markerFilePath = $wwwrootPath + '/app_offline was last deployment.txt'

if (Test-Path -Path $markerFilePath)
{
    Remove-Item -Path $markerFilePath
    Remove-Item -Path $appOfflinePath
}
elseif (Test-Path -Path $appOfflinePath)
{
    New-Item -Path $markerFilePath -ItemType File -Force
}
