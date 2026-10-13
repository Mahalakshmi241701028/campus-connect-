$port = 5173
$distPath = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $distPath)) {
    Write-Host "Error: dist folder not found at $distPath" -ForegroundColor Red
    exit 1
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "   REC Campus Connect is running!" -ForegroundColor Green
    Write-Host "   URL: http://localhost:$port/" -ForegroundColor Yellow
    Write-Host "   Serving: $distPath" -ForegroundColor Gray
    Write-Host "   Close this window or press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host "==========================================" -ForegroundColor Cyan

    Start-Process "http://localhost:$port/"

    $mimeTypes = @{
        ".html"        = "text/html; charset=utf-8"
        ".js"          = "application/javascript; charset=utf-8"
        ".mjs"         = "application/javascript; charset=utf-8"
        ".css"         = "text/css; charset=utf-8"
        ".json"        = "application/json; charset=utf-8"
        ".webmanifest" = "application/manifest+json; charset=utf-8"
        ".png"         = "image/png"
        ".jpg"         = "image/jpeg"
        ".jpeg"        = "image/jpeg"
        ".svg"         = "image/svg+xml"
        ".ico"         = "image/x-icon"
        ".woff"        = "font/woff"
        ".woff2"       = "font/woff2"
        ".ttf"         = "font/ttf"
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        $decodedUrl = [System.Uri]::UnescapeDataString($rawUrl).TrimStart('/')
        $decodedUrl = $decodedUrl -replace '/', '\'
        $filePath = Join-Path $distPath $decodedUrl

        # SPA fallback: if not an existing file, fallback to index.html
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $distPath "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.Headers.Add("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Host "Server Error: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
