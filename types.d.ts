import { Session } from "next-auth"

export interface AuthSession extends Session {
  user: { role: "TEACHER" | "ADMIN" | "STUDENT";
    id:string;
  };
}
