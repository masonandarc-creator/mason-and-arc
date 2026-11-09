# Mason & Arc Revit 2027 Connector — per-user installer, no administrator rights required.
# Close Revit before running the installer.
$ErrorActionPreference = 'Stop'
$version = '2027'
$manifestDir = Join-Path $env:APPDATA "Autodesk\Revit\Addins\$version"
$appDir = Join-Path $env:LOCALAPPDATA "MasonAndArc\Revit2027"
$source = Join-Path $PSScriptRoot 'bin'
$dll = Join-Path $source 'MasonArc.Revit2027.dll'
if (-not (Test-Path -LiteralPath $dll)) { throw "MasonArc.Revit2027.dll was not found under bin\. Download the compiled installer ZIP from the Revit Connector workflow artifacts." }
if (Get-Process -Name Revit -ErrorAction SilentlyContinue) { throw "Close Autodesk Revit before installing or updating this connector." }
New-Item -ItemType Directory -Force -Path $manifestDir,$appDir | Out-Null
Copy-Item -LiteralPath $dll -Destination $appDir -Force
Get-ChildItem -LiteralPath $source -Filter '*.dll' | Where-Object { $_.Name -ne 'MasonArc.Revit2027.dll' } | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $appDir -Force }
$assemblyPath = Join-Path $appDir 'MasonArc.Revit2027.dll'
$assemblyXml = [System.Security.SecurityElement]::Escape($assemblyPath)
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<RevitAddIns>
  <AddIn Type="Application">
    <Name>Mason &amp; Arc Revit Connector</Name>
    <Assembly>$assemblyXml</Assembly>
    <AddInId>A3E78A50-EC0F-46D8-8B5E-58A6B0072027</AddInId>
    <FullClassName>MasonArc.Revit2027.RibbonApp</FullClassName>
    <VendorId>MARC</VendorId>
    <VendorDescription>Mason &amp; Arc — Read-only BIM Quantity &amp; Cost Connector</VendorDescription>
  </AddIn>
</RevitAddIns>
"@
$manifestPath = Join-Path $manifestDir 'MasonArc2027.addin'
[System.IO.File]::WriteAllText($manifestPath, $manifest, [System.Text.UTF8Encoding]::new($false))
Write-Host "Installed Mason & Arc Revit 2027 Connector." -ForegroundColor Green
Write-Host "Manifest: $manifestPath"
Write-Host "Assembly: $assemblyPath"
Write-Host "Start Revit 2027 and look for the MASON & ARC tab."
