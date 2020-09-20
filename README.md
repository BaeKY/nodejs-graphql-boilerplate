# nodejs-graphql-boilerplate

GraphQL Boilerplate for Nodejs, typescript. Please check basic usage in type-graphql.

## Installation

```bash
git clone https://github.com/BaeKY/nodejs-graphql-boilerplate.git .
yarn
```

## Packagies
[typescript](https://www.typescriptlang.org/)
[type-graphql](https://typegraphql.com/)
[typegoose](https://typegoose.github.io/typegoose/)
[apollo-server-express](https://www.npmjs.com/package/apollo-server-express)
[jest](https://jestjs.io/)
[aws-sdk](https://github.com/aws/aws-sdk-js)
[winston-cloudwatch](https://www.npmjs.com/package/winston-cloudwatch)

## Feature
#### Define schema & API ([src/models/*](src/models/))
- mongodb, graphql schema를 하나의 class에 정의함. 클래스 필드의 데코레이터를 통해 필드들이 어떻게 표시되는지 정의함. (자세한 내용은 typegoose, type-graphql 공식문서 참조)
- GraphQL Schema에 표시되는 모델은 *.type.ts 방식으로 파일이름을 설정한다.
- [_exported.ts](src/models/_exported.ts): MongoDB 컬렉션을 생성할 목록들. 생성한 typegoose model들 추가

#### Defined Models - src/models/
- [User](src/models/User/User.type.ts)
- [File](src/models/File/File.type.ts)
#### BaseResponse for mutation API ([src/helpers/BaseResponse.type.ts](src/helpers/BaseResponse.type.ts))
- PlainResponse => Business level response data
    - ok => query success? fail?
    - errors => Business level errors. ex) User input validation error
#### Pagination - [Cursor](src/helpers/PaginationWithCursor.type.ts), [Offset](src/helpers/PaginationWithOffset.type.ts)
- 사용법 설명 ㄱㄱ
#### Access & Error Logging ([src/middlewares/ErrorLoggerMiddleware.ts](src/middlewares/ErrorLoggerMiddleware.ts))
- TypeGraphQL Global middleware를 통한 Logging
- winston cloudwatch 라이브러리를 통해 Log들을 cloud-watch로 export 한다.
- access log는 다음과 같은 정볼르 logging 한다. 
    - resTime -  쿼리 실행 시간. (milliseconds)
    - request -  headers, body, user(**ip**, **name**, _id, email, zoneinfo, role)
    - response - headers, data, errors

## License
[MIT](https://choosealicense.com/licenses/mit/)