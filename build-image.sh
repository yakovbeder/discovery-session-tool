#!/bin/bash

# Build and push container image for the current architecture
# Run on RHEL/x86 to build amd64, on Mac/ARM to build arm64

set -e

IMAGE="quay.io/rh-ee-ybeder/discovery-session-tool"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status()  { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect architecture
SYSTEM_ARCH=$(uname -m)
case $SYSTEM_ARCH in
    x86_64)       ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *)
        print_error "Unsupported architecture: $SYSTEM_ARCH"
        exit 1
        ;;
esac

TAG="${IMAGE}:latest-${ARCH}"

# Detect container runtime
if command -v podman &>/dev/null; then
    RUNTIME="podman"
elif command -v docker &>/dev/null; then
    RUNTIME="docker"
else
    print_error "Neither podman nor docker found."
    exit 1
fi

echo ""
echo "=========================================="
echo "  Build Discovery Session Tool Image"
echo "=========================================="
echo ""
print_status "Architecture: ${SYSTEM_ARCH} (${ARCH})"
print_status "Runtime:      ${RUNTIME}"
print_status "Image tag:    ${TAG}"
echo ""

print_status "Building image..."
${RUNTIME} build -t "${TAG}" .

print_success "Image built: ${TAG}"

if [[ "${1}" == "--push" ]]; then
    print_status "Pushing to registry..."
    ${RUNTIME} push "${TAG}"
    print_success "Pushed: ${TAG}"
else
    echo ""
    print_status "To push to registry, run:"
    echo "  $0 --push"
    echo "  or: ${RUNTIME} push ${TAG}"
fi

echo ""
print_success "Done"
