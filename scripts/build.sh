#!/bin/bash
set -e

# Build site
cd client
npm run build
cd ..

# Build server
cd server
npm run build

# Copy site to server
cp -r ../client/build public