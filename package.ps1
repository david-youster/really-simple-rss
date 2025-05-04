# package.ps1
param (
    [string]$version
)

# Ensure a version was provided
if (-not $version) {
    Write-Host "Usage: ./package.ps1 <version>"
    exit 1
}

# Set paths
$srcDir = "src"
$baseName = "rss-sidebar-$version"
$zipName = "$baseName.zip"
$xpiName = "$baseName.xpi"

# Change to the 'src' directory
Push-Location -Path $srcDir

# Create the ZIP archive
Compress-Archive -Path * -DestinationPath "..\$zipName" -Force

# Return the the root directory
Pop-Location

# Rename the ZIP to XPI
Rename-Item -Path $zipName -NewName $xpiName -Force

Write-Host "Extension packaged successfully: $xpiName"