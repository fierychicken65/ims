# Config
$endpoint = "http://localhost:3000/signal"
$components = @(
    "CACHE_CLUSTER_01",
    "CACHE_CLUSTER_02",
    "DB_PRIMARY",
    "DB_REPLICA",
    "API_GATEWAY"
)

# Total requests to send
$totalRequests = 200

for ($i = 1; $i -le $totalRequests; $i++) {

    # Pick random component
    $component = Get-Random -InputObject $components

    # Random severity
    $severityOptions = @("P0", "P1", "P2")
    $severity = Get-Random -InputObject $severityOptions

    # Payload
    $body = @{
        component_id = $component
        error        = "Timeout"
        severity     = $severity
    } | ConvertTo-Json

    # Send request (non-blocking style)
    Start-Job -ScriptBlock {
        param($endpoint, $body)

        try {
            Invoke-RestMethod -Uri $endpoint `
                              -Method POST `
                              -Body $body `
                              -ContentType "application/json" `
                              -TimeoutSec 2 | Out-Null
        } catch {}
    } -ArgumentList $endpoint, $body | Out-Null

    # Random delay (simulate bursty traffic)
    Start-Sleep -Milliseconds (Get-Random -Minimum 10 -Maximum 200)
}

Write-Host "Requests dispatched..."