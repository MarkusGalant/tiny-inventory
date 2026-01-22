.PHONY: help build up down restart logs clean seed test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker compose build

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

postgres-up: ## Start postgres database
	docker compose up -d postgres

postgres-down: ## Stop postgres database
	docker compose down postgres

restart: ## Restart all services
	docker compose restart

logs: ## Show logs from all services
	docker compose logs -f

clean: ## Stop and remove all containers, volumes, and images
	docker compose down -v --rmi all

test-unit: ## Run unit tests
	cd apps/server && npm test
	cd apps/web && npm test

test-e2e: ## Run e2e tests (requires services to be running)
	cd apps/e2e && npm test

test-e2e-ui: ## Run e2e tests with UI mode
	cd apps/e2e && npm run test:ui

test-e2e-debug: ## Run e2e tests in debug mode
	cd apps/e2e && npm run test:debug

test-e2e-report: ## Show e2e test report
	cd apps/e2e && npm run test:report

dev-backend: ## Run backend in development mode
	cd apps/server && npm run start:dev

dev-frontend: ## Run frontend in development mode
	cd apps/web && npm run dev

install: ## Install dependencies for both frontend and backend
	cd apps/server && npm install
	cd apps/web && npm install
	cd apps/e2e && npm install