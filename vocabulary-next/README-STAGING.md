# Staging Environment for Vocabulary Next

This README explains how to use the staging environment for testing changes before they go to production.

## About the Staging Environment

The staging environment allows you to test changes on GitHub Pages without affecting the production deployment. It uses a separate branch (`staging`) and deploys to a different GitHub Pages branch (`gh-pages-staging`).

## How to Use Staging

1. Make your changes on a feature branch
2. When ready to test, merge your changes into the `staging` branch:
   ```bash
   git checkout staging
   git merge your-feature-branch
   git push origin staging
   ```

3. GitHub Actions will automatically build and deploy your changes to the staging environment
4. View your staging site at: https://YOUR-USERNAME.github.io/practice-staging/

## Workflow

The typical workflow is:

1. Develop on feature branches
2. Test on the staging environment by merging to the `staging` branch
3. Once verified on staging, merge to `main` for production deployment

## Switching Between Environments

### Staging Environment
- Branch: `staging`
- Deployment: Triggered on push to `staging` branch
- URL Path: `/practice-staging/`

### Production Environment
- Branch: `main`
- Deployment: Triggered on push to `main` branch 
- URL Path: `/practice/`

## Configuration

The staging environment is configured in:
- `.github/workflows/deploy-staging.yml` - GitHub Actions workflow
- `next.config.js` - Next.js configuration with environment-specific settings 