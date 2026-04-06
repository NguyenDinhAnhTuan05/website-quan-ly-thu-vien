# ============================================================
# deploy.ps1 — Upload toàn bộ project lên server và chạy
# CÁCH DÙNG:
#   1. Mở PowerShell trong thư mục project
#   2. Chạy: .\deploy.ps1
# YÊU CẦU: OpenSSH (có sẵn Windows 10/11)
# ============================================================

$SERVER = "root@36.50.135.61"
$REMOTE_DIR = "/opt/library-app"
$ARCHIVE = "library-app-deploy.tar.gz"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DEPLOY: Library Management System" -ForegroundColor Cyan
Write-Host "  Server: $SERVER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# Bước 1: Kiểm tra JWT_SECRET đã được đặt chưa
# ============================================================
Write-Host "[1/5] Kiểm tra cấu hình .env.example..." -ForegroundColor Yellow

if (-not (Test-Path ".env.example")) {
    Write-Host "  LOI: Không tìm thấy .env.example!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.example" -Raw
if ($envContent -match "JWT_SECRET=THAY_BANG" -or $envContent -match "JWT_SECRET=$") {
    Write-Host ""
    Write-Host "  CANH BAO: JWT_SECRET chưa được đặt trong .env.example!" -ForegroundColor Red
    Write-Host "  Tạo key bằng lệnh: openssl rand -hex 32" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "  OK" -ForegroundColor Green

# ============================================================
# Bước 2: Đóng gói source code
# ============================================================
Write-Host "[2/5] Đóng gói source code..." -ForegroundColor Yellow

if (Test-Path $ARCHIVE) {
    Remove-Item $ARCHIVE -Force
}

tar -czf $ARCHIVE `
    --exclude="./.git" `
    --exclude="./target" `
    --exclude="./frontend/node_modules" `
    --exclude="./uploads" `
    --exclude="./.env" `
    --exclude="./$ARCHIVE" `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "  LOI: Không thể tạo archive!" -ForegroundColor Red
    exit 1
}

$sizeKB = [math]::Round((Get-Item $ARCHIVE).Length / 1KB)
Write-Host "  Đã tạo $ARCHIVE ($sizeKB KB)" -ForegroundColor Green

# ============================================================
# Bước 3: Upload lên server
# ============================================================
Write-Host "[3/5] Upload lên server..." -ForegroundColor Yellow

ssh $SERVER "mkdir -p $REMOTE_DIR"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  LOI: Không thể kết nối SSH tới $SERVER" -ForegroundColor Red
    Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue
    exit 1
}

scp $ARCHIVE "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  LOI: Upload thất bại!" -ForegroundColor Red
    Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "  Upload thành công" -ForegroundColor Green

# ============================================================
# Bước 4: Giải nén và copy .env.example -> .env
# ============================================================
Write-Host "[4/5] Giải nén và chuẩn bị .env trên server..." -ForegroundColor Yellow

$setupScript = @"
set -e
cd $REMOTE_DIR
echo "  Giải nén..."
tar xzf $ARCHIVE
rm -f $ARCHIVE
if [ ! -f .env ]; then
    cp .env.example .env
    echo "  Da tao .env tu .env.example"
else
    echo "  .env da ton tai - giu nguyen (khong ghi de)"
fi
echo "  OK"
"@

ssh $SERVER $setupScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "  LOI: Giải nén thất bại!" -ForegroundColor Red
    Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue
    exit 1
}

# ============================================================
# Bước 5: Build Docker và khởi động
# ============================================================
Write-Host "[5/5] Build Docker image và khởi động containers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  >>> Lần đầu mất 10-20 phút (build React + Java)" -ForegroundColor Cyan
Write-Host ""

$startScript = @"
set -e
cd $REMOTE_DIR
echo "==> Dừng containers cũ (nếu có)..."
docker compose down --remove-orphans 2>/dev/null || true
echo "==> Build image mới và khởi động..."
docker compose up --build -d
echo ""
echo "==> Chờ app khởi động..."
sleep 15
for i in \$(seq 1 16); do
    if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
        echo ""
        echo "=== DEPLOY THANH CONG ==="
        echo "App chay tai: http://36.50.135.61:8080"
        echo ""
        docker compose ps
        exit 0
    fi
    echo "  Dang cho... (\$i/16)"
    sleep 10
done
echo ""
echo "WARNING: App chua respond sau 3 phut. Kiem tra logs:"
echo "  docker compose logs -f app"
docker compose ps
"@

ssh $SERVER $startScript

# Dọn dẹp local
Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Xem logs: ssh $SERVER" -ForegroundColor Cyan
Write-Host "  Sau đó: cd $REMOTE_DIR && docker compose logs -f app" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$SERVER = "root@36.50.135.61"
$REMOTE_DIR = "/opt/library-app"
$ARCHIVE = "library-app-deploy.tar.gz"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DEPLOY: Library Management System" -ForegroundColor Cyan
Write-Host "  Server: $SERVER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# Bước 1: Kiểm tra file .env.server đã được cấu hình chưa
# ============================================================
Write-Host "[1/5] Kiểm tra cấu hình..." -ForegroundColor Yellow

if (-not (Test-Path ".env.server")) {
    Write-Host "  LỖOI: Không tìm thấy file .env.server!" -ForegroundColor Red
    Write-Host "  Tạo file .env.server từ template và điền thông tin thật." -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.server" -Raw
if ($envContent -match "CHANGE_ME") {
    Write-Host ""
    Write-Host "  CẢNH BÁO: File .env.server vẫn còn giá trị 'CHANGE_ME'!" -ForegroundColor Red
    Write-Host "  Hãy chỉnh sửa .env.server trước khi deploy:" -ForegroundColor Red
    Write-Host "    - MYSQL_ROOT_PASSWORD" -ForegroundColor Red
    Write-Host "    - MYSQL_PASSWORD" -ForegroundColor Red
    Write-Host "    - REDIS_PASSWORD" -ForegroundColor Red
    Write-Host "    - JWT_SECRET (dùng: openssl rand -hex 32)" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "  Vẫn tiếp tục? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "  Đã hủy." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "  OK" -ForegroundColor Green

# ============================================================
# Bước 2: Đóng gói source code (bỏ qua target, node_modules, .git)
# ============================================================
Write-Host "[2/5] Đóng gói source code..." -ForegroundColor Yellow

if (Test-Path $ARCHIVE) {
    Remove-Item $ARCHIVE -Force
}

tar -czf $ARCHIVE `
    --exclude="./.git" `
    --exclude="./target" `
    --exclude="./frontend/node_modules" `
    --exclude="./uploads" `
    --exclude="./.env" `
    --exclude="./library-app-deploy.tar.gz" `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "  LỖOI: Không thể tạo archive!" -ForegroundColor Red
    exit 1
}

$sizeKB = [math]::Round((Get-Item $ARCHIVE).Length / 1024)
Write-Host "  Đã tạo $ARCHIVE ($sizeKB KB)" -ForegroundColor Green

# ============================================================
# Bước 3: Tạo thư mục trên server và upload
# ============================================================
Write-Host "[3/5] Upload lên server..." -ForegroundColor Yellow

ssh $SERVER "mkdir -p $REMOTE_DIR"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  LỖOI: Không thể kết nối SSH tới $SERVER" -ForegroundColor Red
    Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue
    exit 1
}

scp $ARCHIVE "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  LỖOI: Upload thất bại!" -ForegroundColor Red
    Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "  Upload thành công" -ForegroundColor Green

# ============================================================
# Bước 4: Giải nén và chuẩn bị .env trên server
# ============================================================
Write-Host "[4/5] Giải nén trên server..." -ForegroundColor Yellow

$setupScript = @"
set -e
cd $REMOTE_DIR
echo "  Giải nén..."
tar xzf $ARCHIVE
rm -f $ARCHIVE
echo "  Kiểm tra file .env..."
if [ ! -f .env ]; then
    cp .env.server .env
    echo "  Đã tạo .env từ .env.server"
else
    echo "  File .env đã tồn tại - giữ nguyên"
fi
echo "  OK"
"@

ssh $SERVER $setupScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "  LỖOI: Giải nén thất bại!" -ForegroundColor Red
    Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue
    exit 1
}

# ============================================================
# Bước 5: Build Docker image và khởi động
# ============================================================
Write-Host "[5/5] Build và khởi động containers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  >>> Đây là bước lâu nhất (10-20 phút lần đầu)" -ForegroundColor Cyan
Write-Host "  >>> Build React frontend + compile Java backend..." -ForegroundColor Cyan
Write-Host ""

$startScript = @"
set -e
cd $REMOTE_DIR
echo "==> Dừng containers cũ (nếu có)..."
docker compose -f docker-compose.server.yml down --remove-orphans 2>/dev/null || true
echo "==> Build image mới và khởi động..."
docker compose -f docker-compose.server.yml up --build -d
echo ""
echo "==> Đang chờ app khởi động (tối đa 2 phút)..."
sleep 10
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
    if docker compose -f docker-compose.server.yml exec -T app curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
        echo ""
        echo "=== DEPLOY THÀNH CÔNG! ==="
        echo "App chạy tại: http://36.50.135.61:8080"
        break
    fi
    echo "  Đang chờ... ($i/12)"
    sleep 10
done
echo ""
echo "Trạng thái containers:"
docker compose -f docker-compose.server.yml ps
"@

ssh $SERVER $startScript

# ============================================================
# Dọn dẹp local
# ============================================================
Remove-Item $ARCHIVE -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Xem logs: ssh $SERVER 'cd $REMOTE_DIR && docker compose -f docker-compose.server.yml logs -f app'" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
