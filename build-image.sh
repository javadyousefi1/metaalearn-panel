#!/usr/bin/env bash

set -e

IMAGE_NAME="metaalearn-web-panel"
IMAGE_TAG="latest"
PLATFORM="linux/amd64"

TMP_TAR="${IMAGE_NAME}.tar"
OUTPUT_NAME="${IMAGE_NAME}.tar.gz"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "❌ ERROR: $1"
  exit 1
}

log "🚀 Starting build & export process..."

# Check docker
if ! command -v docker >/dev/null 2>&1; then
  error "Docker is not installed or not in PATH"
fi

# Show system arch
ARCH=$(uname -m)
log "🖥️  Detected system architecture: $ARCH"

# Build image
log "🐳 Building Docker image for platform: $PLATFORM"
log "📦 Image: ${IMAGE_NAME}:${IMAGE_TAG}"

docker buildx build \
  --platform "$PLATFORM" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  --load \
  . || error "Docker build failed"

log "✅ Build finished successfully"

# Check image exists
if ! docker images | grep -q "${IMAGE_NAME}"; then
  error "Image was not found after build"
fi

# Export image
log "💾 Saving image to tar: $TMP_TAR"
docker save "${IMAGE_NAME}:${IMAGE_TAG}" > "$TMP_TAR" || error "docker save failed"

# Compress
log "🗜️  Compressing image to $OUTPUT_NAME"
gzip -f "$TMP_TAR" || error "gzip failed"

# Final check
if [ ! -f "$OUTPUT_NAME" ]; then
  error "Output file not found after compression"
fi

FILE_SIZE=$(du -h "$OUTPUT_NAME" | cut -f1)

log "🎉 Done!"
log "📁 Output file: $(pwd)/${OUTPUT_NAME}"
log "📏 File size: ${FILE_SIZE}"
log "➡️  Copy this file to your server and run:"
log "    docker load < ${OUTPUT_NAME}"
