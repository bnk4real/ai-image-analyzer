import { isDemoMode } from "@/lib/demo";
import LoginForm from "./login-form";

export default function LoginPage() {
    return <LoginForm demo={isDemoMode()} />;
}
