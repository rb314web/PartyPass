# Script to convert @import to @use in SCSS files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.scss"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Replace @import with @use for mixins
    if ($content -match "@import '(.*)mixins';") {
        $content = $content -replace "@import '(.*)mixins';", "@use '`$1mixins' as *;"
        $modified = $true
    }
    
    # Replace @import with @use for index
    if ($content -match "@import '(.*)index(.scss)?';") {
        $content = $content -replace "@import '(.*)index(.scss)?';", "@use '`$1index' as *;"
        $modified = $true
    }
    
    # Replace @import with @use for variables
    if ($content -match "@import '(.*)variables';") {
        $content = $content -replace "@import '(.*)variables';", "@use '`$1variables' as *;"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nConversion complete!"
