#!/bin/bash
set -e

echo "🔧 Generating Prisma Client for all platforms..."
PRISMA_CLI_BINARY_TARGETS="rhel-openssl-3.0.x" npx prisma generate --skip-engine-validation

echo "✅ Prisma Client generated successfully"
echo "📦 Building Next.js..."
next build
