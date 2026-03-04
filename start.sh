#!/bin/bash

# Discovery Session Tool - Container launcher
# Uses pre-built image from Quay.io

set -e

IMAGE_BASE="quay.io/rh-ee-ybeder/discovery-session-tool"
CONTAINER_NAME="discovery-session-tool"
PORT="8080"

# Detect architecture for correct image tag
SYSTEM_ARCH=$(uname -m)
case $SYSTEM_ARCH in
    x86_64)        ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *)             ARCH="amd64" ;;
esac
IMAGE_NAME="${IMAGE_BASE}:latest-${ARCH}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status()  { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

check_container_runtime() {
    if command -v podman &>/dev/null; then
        RUNTIME="podman"
    elif command -v docker &>/dev/null; then
        RUNTIME="docker"
    else
        print_error "Neither podman nor docker found."
        echo "  Install Podman:  sudo dnf install -y podman"
        echo "  Or use ./dev.sh to run with Node.js instead."
        exit 1
    fi
    print_success "Using $RUNTIME"
}

is_running() {
    $RUNTIME ps --format "{{.Names}}" 2>/dev/null | grep -q "^${CONTAINER_NAME}$"
}

get_host_ip() {
    hostname -I 2>/dev/null | awk '{print $1}'
}

do_start() {
    echo ""
    echo "=========================================="
    echo "  Discovery Session Tool"
    echo "=========================================="
    echo ""
    check_container_runtime

    if is_running; then
        print_warning "Already running. Use --restart to restart."
        do_status
        return
    fi

    $RUNTIME rm -f "${CONTAINER_NAME}" 2>/dev/null || true

    print_status "Pulling latest image..."
    if $RUNTIME pull "${IMAGE_NAME}" >/dev/null 2>&1; then
        print_success "Image up to date"
    else
        print_warning "Could not pull latest image, using cached version"
    fi

    print_status "Starting container..."
    $RUNTIME run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:8080" \
        "${IMAGE_NAME}" >/dev/null

    sleep 1

    if is_running; then
        do_status
    else
        print_error "Container failed to start"
        $RUNTIME logs "${CONTAINER_NAME}" 2>&1 | tail -5
        exit 1
    fi
}

do_stop() {
    check_container_runtime

    if is_running; then
        print_status "Stopping..."
        $RUNTIME stop -t 5 "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        $RUNTIME rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        print_success "Stopped"
    else
        print_warning "Not running"
        $RUNTIME rm -f "${CONTAINER_NAME}" 2>/dev/null || true
    fi
}

do_restart() {
    do_stop
    sleep 1
    do_start
}

do_status() {
    check_container_runtime 2>/dev/null || true

    local HOST_IP
    HOST_IP=$(get_host_ip)

    echo ""
    if is_running; then
        print_success "Discovery Session Tool is running"
    else
        print_error "Discovery Session Tool is not running"
        echo "  Start it with: $0 --start"
        return
    fi
    echo ""
    echo "  Local URL:    http://localhost:${PORT}"
    if [ -n "$HOST_IP" ]; then
    echo "  Network URL:  http://${HOST_IP}:${PORT}"
    fi
    echo ""
    echo "  Container:    ${CONTAINER_NAME}"
    echo "  Image:        ${IMAGE_NAME}"
    echo "  Runtime:      ${RUNTIME}"
    echo ""
    echo "  Commands:"
    echo "    Stop:       $0 --stop"
    echo "    Restart:    $0 --restart"
    echo "    Logs:       $0 --logs"
    echo ""
}

do_logs() {
    check_container_runtime
    $RUNTIME logs -f "${CONTAINER_NAME}"
}

show_help() {
    echo "Usage: $0 {--start|--stop|--restart|--status|--logs}"
    echo ""
    echo "Commands:"
    echo "  --start     Start the app (default)"
    echo "  --stop      Stop the app"
    echo "  --restart   Restart the app"
    echo "  --status    Show status and URLs"
    echo "  --logs      Tail container logs"
    echo "  --help      Show this help"
    echo ""
    echo "For local development with Node.js, use ./dev.sh instead."
}

CMD="${1:---start}"
CMD="${CMD#--}"

case "$CMD" in
    start)   do_start ;;
    stop)    do_stop ;;
    restart) do_restart ;;
    status)  do_status ;;
    logs)    do_logs ;;
    help|-h) show_help ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
