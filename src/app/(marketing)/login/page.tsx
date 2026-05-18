"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { cn } from "@/lib/utils";
import { login, register, storeAuthSession } from "@/lib/auth-api";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import { PageLoading } from "@/components/shared/loading/PageLoading";
import { useRouteLoading } from "@/components/shared/routing/RouteLoadingProvider";

type AuthMode = "login" | "register";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VIETNAMESE_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const { startRouteLoading } = useRouteLoading();

  const [mode, setMode] = useState<AuthMode>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    const requestedRedirect = searchParams.get("redirect");
    if (requestedRedirect && requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")) {
      startRouteLoading();
      router.replace(requestedRedirect);
      return;
    }

    const isAdmin = user?.role === "ADMIN";
    startRouteLoading();
    router.replace(isAdmin ? "/dashboard" : "/");
  }, [isAuthLoading, isAuthenticated, router, searchParams, startRouteLoading, user?.role]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage(null);
  }

  function validateLogin() {
    if (!loginEmail.trim()) {
      return "Vui lòng nhập email.";
    }

    if (!EMAIL_REGEX.test(loginEmail.trim())) {
      return "Email không hợp lệ.";
    }

    if (!loginPassword.trim()) {
      return "Vui lòng nhập mật khẩu.";
    }

    return null;
  }

  function validateRegister() {
    if (!fullName.trim()) {
      return "Vui lòng nhập họ và tên.";
    }

    if (!registerEmail.trim()) {
      return "Vui lòng nhập email.";
    }

    if (!EMAIL_REGEX.test(registerEmail.trim())) {
      return "Email không hợp lệ.";
    }

    if (!phone.trim()) {
      return "Vui lòng nhập số điện thoại.";
    }

    if (!VIETNAMESE_PHONE_REGEX.test(phone.trim())) {
      return "Số điện thoại không hợp lệ.";
    }

    if (!registerPassword.trim()) {
      return "Vui lòng nhập mật khẩu.";
    }

    if (!confirmPassword.trim()) {
      return "Vui lòng xác nhận mật khẩu.";
    }

    if (registerPassword !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }

    return null;
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);

    const validationError = validateLogin();
    if (validationError) {
      setErrorMessage(validationError);
      showToast(validationError, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await login({
        email: loginEmail,
        password: loginPassword,
      });

      storeAuthSession(authData);
      showToast("Đăng nhập thành công.", "success");
      const redirectPath = searchParams.get("redirect");
      if (redirectPath && redirectPath.startsWith("/") && !redirectPath.startsWith("//")) {
        startRouteLoading();
        router.push(redirectPath);
        return;
      }

      const isAdmin = authData.user.role === "ADMIN";
      startRouteLoading();
      router.push(isAdmin ? "/dashboard" : "/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);

    const validationError = validateRegister();
    if (validationError) {
      setErrorMessage(validationError);
      showToast(validationError, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await register({
        fullName,
        email: registerEmail,
        phone,
        password: registerPassword,
        confirmPassword,
      });

      storeAuthSession(authData);

      setFullName("");
      setRegisterEmail("");
      setPhone("");
      setRegisterPassword("");
      setConfirmPassword("");

      showToast("Đăng ký thành công.", "success");
      startRouteLoading();
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || isAuthenticated) {
    return (
      <main className="py-24 px-6">
        <section className="max-w-[1280px] mx-auto">
          <div className="mx-auto max-w-[620px] rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-xl">
            <PageLoading message="Đang tải..." className="min-h-[180px]" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="py-24 px-6">
      <section className="max-w-[1280px] mx-auto">
        <div className="max-w-[620px] mx-auto bg-white p-10 md:p-12 rounded-2xl border border-outline-variant/30 shadow-xl">
          <div className="flex flex-col gap-3 mb-8">
            <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">
              Tài khoản khách hàng
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-primary">
              {mode === "login" ? "Đăng Nhập" : "Tạo Tài Khoản"}
            </h1>
            <p className="text-on-surface-variant leading-relaxed">
              {mode === "login"
                ? "Đăng nhập để theo dõi đơn hàng và mua sắm nhanh hơn."
                : "Tạo tài khoản để lưu thông tin và nhận ưu đãi dành cho khách hàng thân thiết."}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-2 bg-surface-container-low rounded-xl p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "h-11 rounded-lg text-xs font-bold tracking-widest uppercase transition-all",
                mode === "login"
                  ? "bg-white text-primary shadow"
                  : "text-on-surface-variant hover:text-primary"
              )}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "h-11 rounded-lg text-xs font-bold tracking-widest uppercase transition-all",
                mode === "register"
                  ? "bg-white text-primary shadow"
                  : "text-on-surface-variant hover:text-primary"
              )}
            >
              Đăng ký
            </button>
          </div>

          {mode === "login" ? (
            <form className="flex flex-col gap-8" onSubmit={handleLoginSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="ban@email.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                    Mật khẩu
                  </label>
                  <Link
                    href="#"
                    className="text-[11px] font-bold tracking-[0.12em] uppercase text-secondary hover:opacity-70 transition-opacity"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-primary text-on-primary h-14 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center justify-center",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-8" onSubmit={handleRegisterSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="ban@email.com"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-primary text-on-primary h-14 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center justify-center",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Đang đăng ký..." : "Tạo tài khoản"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
