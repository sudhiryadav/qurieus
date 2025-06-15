#!/bin/bash
echo 'Removing migrations...'
rm -rf ./prisma/migrations

echo 'Removing prisma client...'
rm -rf ./node_modules/.prisma

echo "Resetting database..."
yarn prisma db push --force-reset

echo "Creating fresh migration..."
yarn prisma migrate dev --name init

echo 'Generating prisma client...'
yarn prisma generate

echo "Database reset and migration complete!" 