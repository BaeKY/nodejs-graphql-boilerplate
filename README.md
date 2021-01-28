# nodejs-graphql-boilerplate

GraphQL Boilerplate for Nodejs, typescript.

## Installation

```bash
git clone https://github.com/BaeKY/nodejs-graphql-boilerplate.git .
yarn
```

## Packagies
- [typescript](https://www.typescriptlang.org/)
- [type-graphql](https://typegraphql.com/)
- [type-graphql-filter](https://github.com/kontist/type-graphql-filter)
- [typedi](https://github.com/typestack/typedi)
- [typegoose](https://typegoose.github.io/typegoose/)
- [apollo-server-express](https://www.npmjs.com/package/apollo-server-express)
- [jest](https://jestjs.io/)
- [aws-sdk](https://github.com/aws/aws-sdk-js)
- [winston-cloudwatch](https://www.npmjs.com/package/winston-cloudwatch)

## Features
#### Define schema & API ([src/models/*](src/models/))
- type-graphql, typegoose의 모델 정의 방식을 따름. (자세한 내용은 type-graphql, typegoose 공식문서 참조)
- (중요) src/**/*.{resolver,interface,model,type}.{ts,js} 형식의 경로를 만족하는 파일들만 type-graphql이 인식함.
- (중요) [_exported.ts](src/models/_exported.ts)에서 export한 Model 들만 typegoose가 인식하여 DB 컬렉션으로 저장함.
- [CollectionData](src/helpers/CollectionData.type.ts) - typegoose.Base 클래스를 extends한 기본 class. 

#### Defined Models - src/models/

##### Abstract
- [Node](src/helpers/absModels/Base.interface.ts)
- [IUser](src/helpers/absModels/User.interface.ts)
- [IFile](src/helpers/absModels/File.interface.ts)

##### Object
- [User](src/models/User/User.type.ts)
- [File](src/models/File/File.type.ts)
#### BaseResponse for mutation API ([src/helpers/BaseResponse.type.ts](src/helpers/BaseResponse.type.ts))
- MutationPayload => Business level __"Mutation"__ response data
    - ok => query success? fail?
    - errors => Params validation errors.
#### Pagination - [Cursor](src/helpers/PaginationWithCursor.type.ts), [Offset](src/helpers/PaginationWithOffset.type.ts)
- 미완성(작성중)
#### Access & Error Logging ([src/middlewares/ErrorLoggerMiddleware.ts](src/middlewares/ErrorLoggerMiddleware.ts))
- Apollo Plugin을 통한 Access & Error Logging
- winston cloudwatch 라이브러리를 통해 Log들을 cloud-watch로 export 한다.
- access log는 다음과 같은 정보를 logging 한다. 
    - resTime -  쿼리 실행 시간. (milliseconds)
    - request -  headers, body, user(**ip**, **name**, _id, email, zoneinfo, role)
    - response - headers, data, errors
    - errorId - 존재하면 query level error 발생한거. 해당 Id로 cloud-watch에서 검색 ㄱ

## License
[MIT](https://choosealicense.com/licenses/mit/)
