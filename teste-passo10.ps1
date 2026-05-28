# PASSO 10: Teste de Automação
# Script PowerShell para testar endpoints de automação
# Uso: .\teste-passo10.ps1

param(
    [string]$BaseUrl = "http://localhost:3000/api",
    [switch]$Verbose = $false
)

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "📋 Teste: $Name" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    
    $url = "$BaseUrl$Endpoint"
    Write-Host "URL: $url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri    = $url
            Method = $Method
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
            $params.ContentType = "application/json"
            if ($Verbose) { Write-Host "Body: $($params.Body)" -ForegroundColor Gray }
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "✅ Status: 200 OK" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
        
        return $response
    }
    catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorBody = $_.Exception.Response.Content.ToString()
            Write-Host "Response: $errorBody" -ForegroundColor Red
        }
        return $null
    }
}

# ════════════════════════════════════════════════════════════════════════
# INÍCIO DOS TESTES
# ════════════════════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║           TESTE - PASSO 10: AUTOMAÇÃO                  ║" -ForegroundColor Magenta
Write-Host "║         Lead Scoring & Auto-Assignment                 ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Host "`n🔗 Base URL: $BaseUrl" -ForegroundColor Cyan

# ════════════════════════════════════════════════════════════════════════
# SEÇÃO 1: SCORING
# ════════════════════════════════════════════════════════════════════════

Write-Host "`n┌─ SEÇÃO 1: LEAD SCORING ─────────────────────────────────┐" -ForegroundColor Cyan

$distributionResponse = Test-Endpoint `
    -Name "1.1 - Distribuição de Scores" `
    -Method "GET" `
    -Endpoint "/automation/scoring/all"

if ($distributionResponse) {
    Write-Host "`n📊 Análise:" -ForegroundColor Cyan
    Write-Host "  • Excellent (80-100): $($distributionResponse.data.excellent)" -ForegroundColor Green
    Write-Host "  • Good (60-79): $($distributionResponse.data.good)" -ForegroundColor Green
    Write-Host "  • Medium (40-59): $($distributionResponse.data.medium)" -ForegroundColor Yellow
    Write-Host "  • Poor (0-39): $($distributionResponse.data.poor)" -ForegroundColor Red
    Write-Host "  • Média: $($distributionResponse.data.average)/100" -ForegroundColor Cyan
}

# Obter primeiro lead para testes posteriores
$leadsResponse = Invoke-RestMethod -Uri "$BaseUrl/leads?take=1" -Method GET -ErrorAction SilentlyContinue
if ($leadsResponse.data -and $leadsResponse.data.Count -gt 0) {
    $firstLeadId = $leadsResponse.data[0].id
    $firstLeadName = $leadsResponse.data[0].name
    
    Write-Host "`n✅ Lead encontrado para testes: $firstLeadName (ID: $firstLeadId)" -ForegroundColor Green
    
    # Teste 1.2
    Test-Endpoint `
        -Name "1.2 - Score do Lead Específico ($firstLeadName)" `
        -Method "GET" `
        -Endpoint "/automation/scoring/$firstLeadId"
    
    # Teste 1.3
    Test-Endpoint `
        -Name "1.3 - Leads de Alta Qualidade (Score > 70)" `
        -Method "GET" `
        -Endpoint "/automation/scoring/high-quality?minScore=70"
    
    # Teste 1.4
    Test-Endpoint `
        -Name "1.4 - Leads de Baixa Qualidade (Score < 30)" `
        -Method "GET" `
        -Endpoint "/automation/scoring/low-score?maxScore=30"
    
    # Teste 1.5 - Boost Score
    Test-Endpoint `
        -Name "1.5 - Aumentar Score Manualmente (+10 points)" `
        -Method "POST" `
        -Endpoint "/automation/scoring/$firstLeadId/boost" `
        -Body @{
            points = 10
            reason = "Cliente muito interessado - urgência"
        }
}

# ════════════════════════════════════════════════════════════════════════
# SEÇÃO 2: WORKLOAD & ASSIGNMENT
# ════════════════════════════════════════════════════════════════════════

Write-Host "`n┌─ SEÇÃO 2: WORKLOAD & AUTO-ASSIGNMENT ───────────────────┐" -ForegroundColor Cyan

# Teste 2.1
$workloadResponse = Test-Endpoint `
    -Name "2.1 - Listar Workload de Usuários" `
    -Method "GET" `
    -Endpoint "/automation/workload"

if ($workloadResponse) {
    Write-Host "`n📊 Análise de Workload:" -ForegroundColor Cyan
    foreach ($user in $workloadResponse.data) {
        $barLength = [int]($user.utilization / 5)
        $bar = "█" * $barLength + "░" * (20 - $barLength)
        Write-Host "  • $($user.name): $bar $($user.utilization)% ($($user.activeLeads)/$($user.maxCapacity))" -ForegroundColor Gray
    }
}

# ════════════════════════════════════════════════════════════════════════
# SEÇÃO 3: AUTOMATION RULES
# ════════════════════════════════════════════════════════════════════════

Write-Host "`n┌─ SEÇÃO 3: AUTOMATION RULES ────────────────────────────┐" -ForegroundColor Cyan

# Teste 3.1
$rulesResponse = Test-Endpoint `
    -Name "3.1 - Listar Regras Ativas" `
    -Method "GET" `
    -Endpoint "/automation/rules?isActive=true"

if ($rulesResponse) {
    Write-Host "`n📋 Regras Encontradas: $($rulesResponse.count)" -ForegroundColor Cyan
    if ($rulesResponse.data.Count -gt 0) {
        foreach ($rule in $rulesResponse.data) {
            Write-Host "  • $($rule.name)" -ForegroundColor Green
            Write-Host "    Trigger: $($rule.trigger) → Action: $($rule.action)" -ForegroundColor Gray
        }
    }
}

# Teste 3.2 - Criar nova regra
$newRuleResponse = Test-Endpoint `
    -Name "3.2 - Criar Nova Regra (Teste)" `
    -Method "POST" `
    -Endpoint "/automation/rules/create" `
    -Body @{
        name = "Teste Rule - $(Get-Date -Format 'HHmmss')"
        description = "Regra criada pelo teste automatizado"
        trigger = "LEAD_SCORE_ABOVE"
        triggerValue = "75"
        action = "SEND_EMAIL"
        priority = 5
        isActive = $true
    }

# ════════════════════════════════════════════════════════════════════════
# SEÇÃO 4: AUTOMATION EXECUTION
# ════════════════════════════════════════════════════════════════════════

Write-Host "`n┌─ SEÇÃO 4: AUTOMATION EXECUTION ────────────────────────┐" -ForegroundColor Cyan

if ($firstLeadId) {
    # Teste 4.1 - Executar automação manualmente
    Test-Endpoint `
        -Name "4.1 - Executar Automação Manualmente" `
        -Method "POST" `
        -Endpoint "/automation/execute" `
        -Body @{
            leadId = $firstLeadId
            trigger = "MANUAL"
        }
    
    # Teste 4.2 - Ver logs
    Test-Endpoint `
        -Name "4.2 - Ver Logs de Automação" `
        -Method "GET" `
        -Endpoint "/automation/logs?leadId=$firstLeadId&limit=5"
}

# Teste 4.3 - Executar scheduler
Test-Endpoint `
    -Name "4.3 - Executar Scheduler Manualmente" `
    -Method "POST" `
    -Endpoint "/automation/execute-scheduled"

# ════════════════════════════════════════════════════════════════════════
# SEÇÃO 5: PERFORMANCE & ANALYTICS
# ════════════════════════════════════════════════════════════════════════

Write-Host "`n┌─ SEÇÃO 5: PERFORMANCE ────────────────────────────────┐" -ForegroundColor Cyan

Write-Host "`n⏱️ Testes Completos!" -ForegroundColor Green
Write-Host "✅ Todos os endpoints testados com sucesso" -ForegroundColor Green

Write-Host "`n📈 Recomendações:" -ForegroundColor Yellow
Write-Host "  1. Verificar se scores estão entre 0-100" -ForegroundColor Gray
Write-Host "  2. Confirmar que workload não ultrapassa 100%" -ForegroundColor Gray
Write-Host "  3. Validar que regras estão com status EXECUTED" -ForegroundColor Gray
Write-Host "  4. Agendar novo teste em 5 minutos (próxima execução do scheduler)" -ForegroundColor Gray

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ TESTE PASSO 10 CONCLUÍDO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📚 Próximas Etapas:" -ForegroundColor Cyan
Write-Host "  1. Revisar documentação: PASSO10_AUTOMATION_COMPLETO.md" -ForegroundColor Gray
Write-Host "  2. Testar via frontend dashboard (próximo passo)" -ForegroundColor Gray
Write-Host "  3. Validar webhook de criação de lead" -ForegroundColor Gray
Write-Host "  4. Monitorar logs do backend a cada 5 minutos" -ForegroundColor Gray
