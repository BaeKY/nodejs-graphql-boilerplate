import { UserModel } from "../modules/User/User.service";
import { VerificationModel } from "../modules/Verification/Verification.service";

// DB에 정의해야 하는 Schema 클래스들 목록을 집어넣는다.
export default [UserModel, VerificationModel] as any[];
