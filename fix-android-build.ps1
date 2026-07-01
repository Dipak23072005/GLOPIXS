$ErrorActionPreference = "Stop"

$Project = "C:\Users\sawan\OneDrive\Desktop\GLOPIXS-AndroidStudio"
$Android = Join-Path $Project "android"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Set-Location $Android
.\gradlew.bat --stop

$folders = @(
  "android\app\build\intermediates\project_dex_archive\debug",
  "android\app\build\intermediates\desugar_graph\debug",
  "android\app\build\intermediates\dex\debug",
  "android\app\build\intermediates\merged_res_blame_folder\debug",
  "android\app\build\intermediates\packaged_res\debug",
  "android\app\build\intermediates\incremental\debug",
  "android\app\build\intermediates\apk\debug",
  "android\app\build\outputs\apk\debug",
  "node_modules\@react-native\gradle-plugin\settings-plugin\build",
  "node_modules\@react-native\gradle-plugin\shared\build",
  "node_modules\@react-native\gradle-plugin\react-native-gradle-plugin\build",
  "node_modules\expo-modules-autolinking\android\expo-gradle-plugin\expo-autolinking-settings-plugin\build",
  "node_modules\expo-modules-autolinking\android\expo-gradle-plugin\expo-autolinking-plugin-shared\build"
)

$root = (Resolve-Path $Project).Path
$moduleBuildFolders = Get-ChildItem -LiteralPath (Join-Path $Project "node_modules") -Directory -Recurse -Filter build -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match "\\android\\build$|\\gradle-plugin\\[^\\]+\\build$" } |
  ForEach-Object { $_.FullName.Substring($Project.Length + 1) }
$folders = @($folders + $moduleBuildFolders | Select-Object -Unique)

foreach ($relative in $folders) {
  $full = Join-Path $Project $relative
  if (Test-Path -LiteralPath $full) {
    $resolved = (Resolve-Path -LiteralPath $full).Path
    if ($resolved.StartsWith($root)) {
      attrib -R -S -H "$resolved\*" /S /D 2>$null
      Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
}

Set-Location $Android
.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand -PreactNativeArchitectures=arm64-v8a --no-daemon --no-build-cache
