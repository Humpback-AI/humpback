# Humpback Marketplace Server

## Description

This is the backend server for Humpback Marketplace, built with [NestJS](https://github.com/nestjs/nest). It provides the core API infrastructure for our marketplace, handling:

- Content indexing and search
- Credit system and transactions
- Content access control
- Usage analytics and reporting

## Project Setup

1. Install dependencies:

```bash
$ npm install
```

2. Set up your environment variables:

```bash
$ cp .env.example .env.local
```

Required environment variables:

```
# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=<your_qdrant_api_key>
```

## Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

- Development: http://localhost:3000/api/docs
- Production: https://api.humpback.ai/docs

Key API endpoints:

```
POST    /search              # search
```

## Architecture Overview

The server follows a modular architecture with the following key components:

- **SearchModule**: Manages content indexing and search functionality

## Contributing

Please read our [CONTRIBUTING.md](../CONTRIBUTING.md) guide for details on our development process and coding standards.

Key areas for server contributions:

- Performance optimizations
- New API endpoints
- Test coverage improvements
- Documentation updates

## License

The Humpback server is [MIT licensed](LICENSE).

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## TODO

- Create background job and API to fetch a modified content (created, updated, deleted) from Supabase and update Qdrant
- Backfill results with Tavily search
- MCP package
- Hybrid search using sparse vectors
