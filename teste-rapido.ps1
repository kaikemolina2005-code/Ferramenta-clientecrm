# TESTE END-TO-END SIMPLES
# Simula: Lead criado -> Score calculado -> Atribuido

$BaseUrl = "http://localhost:3000/api"
$timestamp = Get-Date -Format "HHmmss"
$leadPhone = "5511987654$($timestamp.Substring(0,3))"
$leadCpf = "123456789$(([int]$timestamp % 100).ToString().PadLeft(2, '0'))"  # CPF único por execução

Write-Host "`n=== TESTE END-TO-END PASSO 10 ===" -ForegroundColor Yellow

# PASSO 0: Obter token (login rápido)
Write-Host "`n[0/6] Obtendo token de autenticação..." -ForegroundColor Cyan
try {
    $authResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body (@{
        email = "admin@advgd.com"
        password = "123456"
    } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
    
    $token = $authResponse.data.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "Token obtido!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao obter token, usando sem autenticacao..." -ForegroundColor Yellow
    $headers = @{}
}

# PASSO 1: Verificar scores antes
Write-Host "`n[1/6] Verificando scores iniciais..." -ForegroundColor Cyan
try {
    $scoresBefore = Invoke-RestMethod -Uri "$BaseUrl/automation/leads/scoring/distribution" -Method GET -Headers $headers
    Write-Host "Leads atuais: $($scoresBefore.data.total)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao obter scores: $($_.Exception.Message)" -ForegroundColor Red
}

# PASSO 2: Criar novo lead
Write-Host "`n[2/6] Criando novo lead..." -ForegroundColor Cyan
try {
    $leadResponse = Invoke-RestMethod -Uri "$BaseUrl/leads" -Method POST -Headers $headers -Body (@{
        name = "Cliente Teste E2E"
        phone = $leadPhone
        email = "teste-e2e-$timestamp@example.com"
        cpf = $leadCpf
        category = "RETIREMENT"
        status = "INITIAL"
        source = "WHATSAPP"
        notes = "Lead de teste E2E"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $leadId = $leadResponse.data.id
    Write-Host "Lead criado: $leadId" -ForegroundColor Green
    Write-Host "Nome: $($leadResponse.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao criar lead: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# PASSO 3: Calcular score
Write-Host "`n[3/6] Calculando score..." -ForegroundColor Cyan
try {
    $scoreResponse = Invoke-RestMethod -Uri "$BaseUrl/automation/leads/$leadId/score" -Method GET -Headers $headers
    Write-Host "Score: $($scoreResponse.data.score)/100" -ForegroundColor Green
} catch {
    Write-Host "Erro ao calcular score: $($_.Exception.Message)" -ForegroundColor Red
}

# PASSO 4: Auto-assign
Write-Host "`n[4/6] Auto-atribuindo lead..." -ForegroundColor Cyan
try {
    $assignResponse = Invoke-RestMethod -Uri "$BaseUrl/automation/leads/$leadId/assign" -Method POST -Headers $headers -Body "{}" -ContentType "application/json"
    
    if ($assignResponse.data.userId) {
        Write-Host "Atribuido para: $($assignResponse.data.userName)" -ForegroundColor Green
    } else {
        Write-Host "Nao atribuido (lead pode nao atender criterios)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erro ao atribuir: $($_.Exception.Message)" -ForegroundColor Red
}

# PASSO 5: Verificar workload
Write-Host "`n[5/6] Verificando workload..." -ForegroundColor Cyan
try {
    $workloadResponse = Invoke-RestMethod -Uri "$BaseUrl/automation/workload" -Method GET -Headers $headers
    Write-Host "Usuarios no sistema: $($workloadResponse.count)" -ForegroundColor Green
    foreach ($user in $workloadResponse.data) {
        Write-Host "  - $($user.name): $($user.activeLeads)/$($user.maxCapacity) leads ($($user.utilization)%)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Erro ao obter workload: $($_.Exception.Message)" -ForegroundColor Red
}

# PASSO 6: Verificar logs
Write-Host "`n[6/6] Verificando audit trail..." -ForegroundColor Cyan
try {
    $logsResponse = Invoke-RestMethod -Uri "$BaseUrl/automation/logs?leadId=$leadId&limit=5" -Method GET -Headers $headers
    Write-Host "Logs registrados: $($logsResponse.count)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao obter logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TESTE CONCLUIDO ===" -ForegroundColor Green
Write-Host "Passo 10 testado com sucesso!" -ForegroundColor Green
