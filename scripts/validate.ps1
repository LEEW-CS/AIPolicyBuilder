# Pre-push validation for index.html (Windows PowerShell version)
# See scripts/validate.sh for the bash equivalent and full docs.
# Mirrors the validator used in the Cloudstaff Client Research Tool.
# Usage:  .\scripts\validate.ps1  [path\to\index.html]
#         (defaults to scripts\..\index.html)

param(
  [string]$IndexPath = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrEmpty($IndexPath)) {
  $repoRoot = Split-Path -Parent $PSScriptRoot
  $index    = Join-Path $repoRoot "index.html"
} else {
  $index = $IndexPath
}

if (-not (Test-Path $index)) {
  Write-Host "X index.html not found at $index" -ForegroundColor Red
  exit 1
}

$tmpJs = Join-Path $env:TEMP ("index-script-" + [System.Guid]::NewGuid().ToString() + ".js")

# 1. Extract main <script> block. Use .NET ReadAllText rather than
# Get-Content -Raw because some PowerShell host configs (e.g.
# powershell.exe -File) truncate -Raw output at the first chunk
# boundary, giving incorrect div counts later in the script.
$content = [System.IO.File]::ReadAllText($index)
$match = [regex]::Match($content, '(?s)<script>(.*?)</script>')
if (-not $match.Success) {
  Write-Host "X Could not locate main <script> block in index.html" -ForegroundColor Red
  exit 1
}
# If multiple inline <script> blocks exist, concatenate them.
$scriptBlocks = [regex]::Matches($content, '(?s)<script>(.*?)</script>')
$joined = ($scriptBlocks | ForEach-Object { $_.Groups[1].Value }) -join "`n"
$joined | Out-File -FilePath $tmpJs -Encoding utf8

# 2. node --check
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "! node not found in PATH - skipping JS syntax check." -ForegroundColor Yellow
} else {
  $nodeOutput = & node --check $tmpJs 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "X JS syntax error in index.html - fix before pushing." -ForegroundColor Red
    Write-Host $nodeOutput
    Remove-Item $tmpJs -ErrorAction SilentlyContinue
    exit 1
  }
  $lines = (Get-Content $tmpJs | Measure-Object -Line).Lines
  Write-Host "OK JS syntax check passed ($lines lines)" -ForegroundColor Green
}
Remove-Item $tmpJs -ErrorAction SilentlyContinue

# 3. Div nesting balance
$opens  = ([regex]::Matches($content, '<div[\s>]')).Count
$closes = ([regex]::Matches($content, '</div>')).Count
if ($opens -ne $closes) {
  $diff = $opens - $closes
  Write-Host "X Div nesting unbalanced: $opens opens vs $closes closes (diff: $diff)" -ForegroundColor Red
  Write-Host "  Look for a stray <div> or </div>."
  exit 2
}
Write-Host "OK Div nesting balanced ($opens opens / $closes closes)" -ForegroundColor Green

Write-Host ""
Write-Host "All checks passed. Safe to push." -ForegroundColor Green
