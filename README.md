# nodejs-graphql-boilerplate

GraphQL Boilerplate based on [type-graphql](https://typegraphql.com/) & [typegoose](https://typegoose.github.io/typegoose/) library.

## Installation

```bash
git clone https://github.com/BaeKY/nodejs-graphql-boilerplate.git .
yarn
```

## Installed Packagies
- [typescript](https://www.typescriptlang.org/)
- [type-graphql](https://typegraphql.com/)
- [type-graphql-filter](https://github.com/kontist/type-graphql-filter)
- [typedi](https://github.com/typestack/typedi)
- [typegoose](https://typegoose.github.io/typegoose/)
- [apollo-server-express](https://www.npmjs.com/package/apollo-server-express)
- [jest](https://jestjs.io/)
- [aws-sdk](https://github.com/aws/aws-sdk-js)
- [winston-cloudwatch](https://www.npmjs.com/package/winston-cloudwatch)

## Modules
---
Include files like *.interface.ts, *.type.ts, *.service.ts, *.resolver.ts
### `*.interface.ts`
- Abstract class for inheritance(e.g. [User.interface.ts](src/modules/User/User.interface.ts)) and present at GraphQL API as an `Interface`.
### `*.type.ts`
- Model! Present at GraphQL API as an `Type`.
### `*.service.ts`
- Service as you defined. Use DI.
## Handle Error
---
There are two kinds of error, System error and Business logic error.

### System error
- System Error is handled on [ErrorLoggingMiddleware](src\middlewares\errorLogging.ts)
- [ErrorLoggingMiddleware](src\middlewares\errorLogging.ts) use as a global-middleware.

### Business logic error
- BusinessUser Logic

## BaseResponse for mutation API ([src/helpers/BaseResponse.type.ts](src/helpers/BaseResponse.type.ts))
---
- MutationPayload => Business level __"Mutation"__ response data
    - ok => query success? fail?
    - errors => Params validation errors.
## Pagination - [Cursor](src/helpers/PaginationWithCursor.type.ts), [Offset](src/helpers/PaginationWithOffset.type.ts)
---
- 미완성(작성중)
## Access & Error Logging ([src/middlewares/ErrorLoggerMiddleware.ts](src/middlewares/ErrorLoggerMiddleware.ts))
---
- Apollo Plugin을 통한 Access & Error Logging
- winston cloudwatch 라이브러리를 통해 Log들을 cloud-watch로 export 한다.
- access log는 다음과 같은 정보를 logging 한다. 
    - resTime -  쿼리 실행 시간. (milliseconds)
    - request -  headers, body, user(**ip**, **name**, _id, email, zoneinfo, role)
    - response - headers, data, errors
    - errorId - 존재하면 query level error 발생한거. 해당 Id로 cloud-watch에서 검색 ㄱ


## License
---
[MIT](https://choosealicense.com/licenses/mit/)
