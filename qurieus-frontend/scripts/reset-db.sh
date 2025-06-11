#!/bin/bash

echo "Resetting database..."
yarn prisma db push --force-reset

echo "Creating fresh migration..."
yarn prisma migrate dev --name init

echo "Database reset and migration complete!" 