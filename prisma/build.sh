#!/bin/bash
# This script is kept for local development reference
# Vercel uses vercel.json's buildCommand instead

set -e

echo "🔧 Generating Prisma Client with rhel-openssl-3.0.x target..."
pnpm exec prisma generate

echo "✅ Prisma Client generated successfully"
echo "📦 Building Next.js..."
next build
